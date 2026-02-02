import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConsentModal from './ConsentModal';
import telemetryService from '../services/TelemetryService';
import unityBridge from '../services/UnityBridge';
import axios from 'axios';
import './GameEmbed.css';

const UNITY_BUILD_MAP = {
  'forces-motion-basics': {
    basePath: '/games/Force&Motion',
    buildName: ''
  }
};

const unityScriptCache = {};

const loadUnityScript = (url) => {
  if (unityScriptCache[url]) {
    return unityScriptCache[url];
  }
  unityScriptCache[url] = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-unity-loader="${url}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Unity loader')));
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.dataset.unityLoader = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Unity loader'));
    document.body.appendChild(script);
  });
  return unityScriptCache[url];
};

const GameEmbed = () => {
  const { gameId } = useParams();
  const { user } = useAuth();
  const [hasConsent, setHasConsent] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [isCheckingConsent, setIsCheckingConsent] = useState(true);
  const [telemetrySession, setTelemetrySession] = useState(null);
  const [telemetryStats, setTelemetryStats] = useState(null);
  const [moduleInfo, setModuleInfo] = useState(null);
  const [unityStatus, setUnityStatus] = useState({ loading: false, progress: 0, error: '' });
  const unityCanvasRef = useRef(null);
  const unityInstanceRef = useRef(null);

  useEffect(() => {
    checkConsent();
    fetchModule();
    
    // Cleanup on unmount
    return () => {
      endTelemetrySession();
    };
  }, [user]);

  const fetchModule = async () => {
    try {
      const response = await axios.get(`/api/simulations/${gameId}`);
      setModuleInfo(response.data);
    } catch (error) {
      console.error('Error loading module info:', error);
    }
  };

  useEffect(() => {
    // Start telemetry when consent is granted and game loads
    if (hasConsent && !telemetrySession) {
      startTelemetrySession();
    }
  }, [hasConsent]);

  // Update stats periodically
  useEffect(() => {
    if (telemetrySession) {
      const interval = setInterval(() => {
        const stats = telemetryService.getStats();
        setTelemetryStats(stats);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [telemetrySession]);

  const checkConsent = async () => {
    const token = localStorage.getItem('access_token');
    
    if (!user || !token) {
      // Not logged in - check localStorage for anonymous consent
      const anonymousConsent = localStorage.getItem('anonymousConsent');
      if (anonymousConsent) {
        setHasConsent(true);
      } else {
        setHasConsent(false);
      }
      setIsCheckingConsent(false);
      return;
    }

    // Logged-in user - check backend
    try {
      const response = await axios.get('/api/auth/consent/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.has_consent) {
        setHasConsent(true);
      } else {
        setHasConsent(false);
      }
    } catch (error) {
      console.error('Error checking consent:', error);
      setHasConsent(false);
    } finally {
      setIsCheckingConsent(false);
    }
  };

  const handleConsentComplete = () => {
    setHasConsent(true);
    setShowConsentDialog(false);
  };

  const handleOpenConsent = () => {
    setShowConsentDialog(true);
  };

  useEffect(() => {
    if (!hasConsent || isCheckingConsent) return;
    let cancelled = false;
    if (!unityCanvasRef.current) return;
    if (unityInstanceRef.current) return;

    setUnityStatus({ loading: true, progress: 0, error: '' });

    resolveUnityBuildConfig()
      .then((buildConfig) => {
        if (cancelled) return null;
        if (!buildConfig) {
          setUnityStatus({ loading: false, progress: 0, error: 'Unity build not configured.' });
          return null;
        }
        return loadUnityScript(buildConfig.loaderUrl).then(() => buildConfig);
      })
      .then((buildConfig) => {
        if (!buildConfig) return null;
        if (typeof window.createUnityInstance !== 'function') {
          throw new Error('Unity loader missing');
        }
        if (!unityCanvasRef.current.id) {
          unityCanvasRef.current.id = `unity-canvas-${gameId}`;
        }
        return window.createUnityInstance(
          unityCanvasRef.current,
          {
            dataUrl: buildConfig.dataUrl,
            frameworkUrl: buildConfig.frameworkUrl,
            codeUrl: buildConfig.codeUrl,
            streamingAssetsUrl: buildConfig.streamingAssetsUrl,
            companyName: 'PING',
            productName: moduleInfo?.title || gameId,
            productVersion: moduleInfo?.version || '1.0.0'
          },
          (progress) => {
            setUnityStatus((prev) => ({ ...prev, progress }));
          }
        );
      })
      .then((instance) => {
        unityInstanceRef.current = instance;
        setUnityStatus({ loading: false, progress: 1, error: '' });
        unityBridge.setUnityWindow(window);
      })
      .catch((error) => {
        console.error('[GameEmbed] Unity load failed:', error);
        setUnityStatus({ loading: false, progress: 0, error: 'Failed to load Unity build.' });
      });

    return () => {
      if (unityInstanceRef.current && typeof unityInstanceRef.current.Quit === 'function') {
        unityInstanceRef.current.Quit().catch(() => {});
        unityInstanceRef.current = null;
      }
    };
  }, [hasConsent, isCheckingConsent, gameId]);


  const startTelemetrySession = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const moduleId = moduleInfo?.module_id || gameId;
      const response = await axios.post(
        '/api/telemetry/session/start',
        { module_id: moduleId },
        { headers }
      );

      const sessionData = response.data;
      setTelemetrySession(sessionData);

      // Initialize telemetry service
      telemetryService.initialize({
        sessionId: sessionData.session_id,
        userId: sessionData.user_id,
        guestId: sessionData.guest_id,
        moduleId,
        consentGranted: true,
        orgSettings: sessionData.org_settings
      });

      // Set up Unity bridge
      unityBridge.setUnityWindow(window);
      unityBridge.on('unity_ready', () => {
        console.log('[GameEmbed] Unity is ready');
        unityBridge.telemetryStarted(sessionData.session_id);
      });

      unityBridge.on('game_event', (eventData) => {
        telemetryService.logEvent('game_event', eventData);
      });

      unityBridge.on('focus_change', (focused) => {
        telemetryService.setUnityFocus(focused);
      });

      console.log('[GameEmbed] Telemetry session started:', sessionData.session_id);
    } catch (error) {
      console.error('[GameEmbed] Failed to start telemetry session:', error);
    }
  };

  const endTelemetrySession = async () => {
    if (!telemetrySession) return;

    try {
      await telemetryService.endSession();
      
      const token = localStorage.getItem('access_token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await axios.post(
        '/api/telemetry/session/end',
        null,
        {
          params: { session_id: telemetrySession.session_id },
          headers
        }
      );

      console.log('[GameEmbed] Telemetry session ended');
      setTelemetrySession(null);
    } catch (error) {
      console.error('[GameEmbed] Failed to end telemetry session:', error);
    }
  };


  const resolveBuildNameFromIndex = async (rootPath) => {
    try {
      const response = await fetch(`${rootPath}/index.html`, { cache: 'no-store' });
      if (!response.ok) return null;
      const html = await response.text();
      const match = html.match(/Build\/([^"']+)\.loader\.js/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  };

  const resolveUnityBuildConfig = async () => {
    const rawPath = moduleInfo?.build_path;
    let baseRoot = '';
    let buildName = '';

    if (rawPath) {
      if (rawPath.endsWith('.loader.js')) {
        const base = rawPath.slice(0, -'.loader.js'.length);
        const lastSlash = base.lastIndexOf('/');
        if (lastSlash !== -1) {
          baseRoot = base.slice(0, lastSlash);
          buildName = base.slice(lastSlash + 1);
        }
      } else if (rawPath.includes('/Build/')) {
        const parts = rawPath.split('/Build/');
        baseRoot = parts[0];
        buildName = parts[1] || '';
        buildName = buildName.split('.')[0];
      } else {
        baseRoot = rawPath;
      }
    } else if (UNITY_BUILD_MAP[gameId]) {
      baseRoot = UNITY_BUILD_MAP[gameId].basePath;
      buildName = UNITY_BUILD_MAP[gameId].buildName || '';
    }

    if (!baseRoot) return null;
    if (!buildName) {
      buildName = await resolveBuildNameFromIndex(baseRoot);
    }
    if (!buildName) return null;

    const buildBase = `${baseRoot}/Build/${buildName}`;
    return {
      loaderUrl: `${buildBase}.loader.js`,
      dataUrl: `${buildBase}.data`,
      frameworkUrl: `${buildBase}.framework.js`,
      codeUrl: `${buildBase}.wasm`,
      streamingAssetsUrl: `${baseRoot}/StreamingAssets`
    };
  };

  // Render embedded player view
  return (
    <div className="game-embed-container">
      <div className="game-header">
        <Link to="/" className="back-button">
          <ArrowLeft size={20} />
          <span>Back to Simulations</span>
        </Link>
        <h2 className="game-title">Forces and Motion: Basics</h2>

        {telemetryStats && (
          <div className="telemetry-indicator">
            <Activity size={16} />
            <span>{telemetryStats.totalEvents} events</span>
          </div>
        )}
      </div>

      <div className="game-iframe-wrapper">
        {hasConsent && !isCheckingConsent ? (
          <div className="unity-container">
            <canvas ref={unityCanvasRef} id={`unity-canvas-${gameId}`} className="unity-canvas" />
            {unityStatus.loading && (
              <div className="unity-loading">
                <div className="unity-progress">
                  <div className="unity-progress-bar" style={{ width: `${Math.round(unityStatus.progress * 100)}%` }} />
                </div>
                <p>Loading {Math.round(unityStatus.progress * 100)}%</p>
              </div>
            )}
            {unityStatus.error && (
              <div className="unity-error">{unityStatus.error}</div>
            )}
          </div>
        ) : (
          <div className="game-consent-overlay">
            <div className="game-consent-card">
              {isCheckingConsent ? (
                <p>Loading...</p>
              ) : (
                <>
                  <Lock size={48} />
                  <h3>Consent Required</h3>
                  <p>
                    Before accessing the game, you must review and accept our terms,
                    privacy policy, and data collection practices.
                  </p>
                  <div className="game-consent-actions">
                    <button className="btn-primary" onClick={handleOpenConsent}>Review and Agree</button>
                    <Link to="/" className="btn-secondary">Back</Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <ConsentModal
        isOpen={showConsentDialog}
        onClose={() => setShowConsentDialog(false)}
        onConsentComplete={handleConsentComplete}
      />

      <div className="game-instructions">
        <h3>How to Play</h3>
        <div className="instruction-grid">
          <div className="instruction-item">
            <strong>WASD:</strong> Move character
          </div>
          <div className="instruction-item">
            <strong>F:</strong> Get on/off car
          </div>
          <div className="instruction-item">
            <strong>Tab:</strong> Hide/Show Cursor
          </div>
          <div className="instruction-item">
            <strong>V:</strong> Voice Chat
          </div>
          <div className="instruction-item">
            <strong>J:</strong> Objective List
          </div>
          <div className="instruction-item">
            <strong>K:</strong> Objective Track
          </div>
        </div>

        <div className="telemetry-notice">
          <h4>📊 Data Collection Notice</h4>
          <p>
            <strong>K-12 Student Privacy:</strong> We collect keyboard inputs and the text you enter
            during gameplay to understand learning interactions. We do not record your screen.
          </p>
          {telemetryStats && (
            <p className="telemetry-stats">
              Session: {telemetryStats.sessionId?.slice(0, 8)}... |
              Events: {telemetryStats.totalEvents} |
              Status: {telemetryStats.isEnabled ? '✅ Active' : '⏸️ Paused'}
            </p>
          )}
        </div>
      </div>
    </div>
  );

};

export default GameEmbed;
