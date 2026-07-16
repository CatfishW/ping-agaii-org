import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeft, Lock, Activity } from 'lucide-react';
import { ChartIcon, CheckIcon, PauseIcon } from './icons/SketchIcons';
import { useAuth } from '../context/AuthContext';
import ConsentModal from './ConsentModal';
import telemetryService from '../services/TelemetryService';
import unityBridge from '../services/UnityBridge';
import { buildAuthContext, normalizeGameEvent } from '../services/GameBridgeProtocol';
import { resolveUnityBuildConfig } from '../services/UnityBuildConfig';
import { hasAnonymousConsent, readConsentHandoff } from '../services/ConsentHandoff';
import axios from 'axios';
import './GameEmbed.css';

const unityScriptCache = {};

const loadUnityScript = (url) => {
  if (unityScriptCache[url]) {
    return unityScriptCache[url];
  }
  unityScriptCache[url] = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-unity-loader="${url}"]`);
    if (existing) {
      if (existing.dataset.unityLoaded === 'true' || existing.readyState === 'complete') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Unity loader')));
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.dataset.unityLoader = url;
    script.onload = () => {
      script.dataset.unityLoaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Unity loader'));
    document.body.appendChild(script);
  });
  return unityScriptCache[url];
};

const GameEmbed = ({
  embedded = false,
  gameIdOverride,
  onUnityLoadStart,
  onUnityLoaded,
  onUnityLoadError,
  onUnityGameEvent,
  storyContext = null
}) => {
  const { gameId: routeGameId } = useParams();
  const gameId = gameIdOverride || routeGameId;
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
  const unityLoadTokenRef = useRef(0);
  const telemetrySessionRef = useRef(null);
  const unityLoadStartRef = useRef(null);
  const authContextRef = useRef(null);
  const bridgeCleanupRef = useRef(null);

  useEffect(() => {
    telemetrySessionRef.current = telemetrySession;
  }, [telemetrySession]);

  const getModuleId = useCallback(() => moduleInfo?.module_id || gameId, [gameId, moduleInfo?.module_id]);

  const refreshAuthContext = useCallback((sessionData = telemetrySessionRef.current) => {
    const context = buildAuthContext({
      user,
      sessionData,
      moduleId: getModuleId(),
      consentGranted: hasConsent,
      storyContext
    });
    authContextRef.current = context;
    return context;
  }, [getModuleId, hasConsent, storyContext, user]);

  const sendAuthContext = useCallback((message = {}) => {
    const context = authContextRef.current || refreshAuthContext();
    if (!context?.sessionId) return;

    const options = message.messageId ? { messageId: message.messageId } : {};
    unityBridge.sendToGame('auth_context', context, options);
    telemetryService.logFrontendRouteEvent('auth_context_sent', {
      gameId,
      phase: 'bridge',
      status: 'sent'
    });
  }, [gameId, refreshAuthContext]);

  const handleBridgeGameEvent = useCallback((eventData = {}) => {
    const moduleId = getModuleId();
    const normalized = normalizeGameEvent(eventData, { moduleId });

    telemetryService.logBridgeEvent(normalized);
    onUnityGameEvent?.({
      ...normalized,
      gameId,
      moduleId
    });
  }, [gameId, getModuleId, onUnityGameEvent]);

  const handleScoreUpdate = useCallback((payload = {}) => {
    handleBridgeGameEvent({
      ...payload,
      event_name: payload.event_name || 'score_update'
    });
  }, [handleBridgeGameEvent]);

  const handleLevelComplete = useCallback((payload = {}) => {
    handleBridgeGameEvent({
      ...payload,
      event_name: payload.event_name || 'level_complete',
      completed: true
    });
  }, [handleBridgeGameEvent]);

  const handleModuleComplete = useCallback((payload = {}) => {
    handleBridgeGameEvent({
      ...payload,
      event_name: payload.event_name || 'module_complete',
      completed: true
    });
  }, [handleBridgeGameEvent]);

  const handleAuthRequest = useCallback((payload, message = {}) => {
    sendAuthContext(message);
  }, [sendAuthContext]);

  const handleGameReady = useCallback(() => {
    const session = telemetrySessionRef.current;
    console.log('[GameEmbed] Game is ready');
    if (session?.session_id) {
      unityBridge.telemetryStarted(session.session_id);
    }
    sendAuthContext();
  }, [sendAuthContext]);

  const handleFocusChange = useCallback((focused) => {
    telemetryService.setUnityFocus(focused);
  }, []);

  const registerBridgeHandlers = useCallback(() => {
    bridgeCleanupRef.current?.();

    unityBridge.on('game_ready', handleGameReady);
    unityBridge.on('auth_request', handleAuthRequest);
    unityBridge.on('game_event', handleBridgeGameEvent);
    unityBridge.on('score_update', handleScoreUpdate);
    unityBridge.on('level_complete', handleLevelComplete);
    unityBridge.on('module_complete', handleModuleComplete);
    unityBridge.on('focus_change', handleFocusChange);

    bridgeCleanupRef.current = () => {
      unityBridge.off('game_ready', handleGameReady);
      unityBridge.off('auth_request', handleAuthRequest);
      unityBridge.off('game_event', handleBridgeGameEvent);
      unityBridge.off('score_update', handleScoreUpdate);
      unityBridge.off('level_complete', handleLevelComplete);
      unityBridge.off('module_complete', handleModuleComplete);
      unityBridge.off('focus_change', handleFocusChange);
      bridgeCleanupRef.current = null;
    };
  }, [
    handleAuthRequest,
    handleBridgeGameEvent,
    handleFocusChange,
    handleGameReady,
    handleLevelComplete,
    handleModuleComplete,
    handleScoreUpdate
  ]);

  const destroyUnityInstance = async () => {
    const instance = unityInstanceRef.current;
    if (!instance || typeof instance.Quit !== 'function') {
      unityInstanceRef.current = null;
      if (typeof window !== 'undefined') {
        delete window.unityInstance;
      }
      return;
    }

    try {
      await instance.Quit();
    } catch (error) {
      console.warn('[GameEmbed] Failed to quit Unity instance cleanly:', error);
    } finally {
      if (typeof window !== 'undefined' && window.unityInstance === instance) {
        delete window.unityInstance;
      }
      unityInstanceRef.current = null;
    }
  };

  useEffect(() => {
    checkConsent();
    fetchModule();

    return () => {
      endTelemetrySession();
      unityLoadTokenRef.current += 1;
      destroyUnityInstance();
    };
  }, [user, gameId]);

  const fetchModule = async () => {
    try {
      const response = await axios.get(`/api/simulations/${gameId}`);
      setModuleInfo(response.data);
    } catch (error) {
      console.error('Error loading module info:', error);
    }
  };

  useEffect(() => {
    // Start telemetry per module entry (prevents stale session reuse)
    if (hasConsent && !telemetrySession) {
      startTelemetrySession();
    }
  }, [hasConsent, telemetrySession, gameId, moduleInfo?.module_id]);

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
      setHasConsent(hasAnonymousConsent());
      setIsCheckingConsent(false);
      return;
    }

    const continueWithRecentConsent = async () => {
      const handoff = readConsentHandoff();
      if (!handoff) return false;

      try {
        await axios.post('/api/auth/consent', handoff, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        // The player already consented in this browser session. Keep the game moving
        // and let a later consent check retry the authenticated persistence.
        console.warn('Could not sync recent consent yet:', error);
      }

      setHasConsent(true);
      return true;
    };

    // Logged-in user - check backend
    try {
      const response = await axios.get('/api/auth/consent/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.has_consent) {
        setHasConsent(true);
      } else if (!await continueWithRecentConsent()) {
        setHasConsent(false);
      }
    } catch (error) {
      console.error('Error checking consent:', error);
      if (!await continueWithRecentConsent()) {
        setHasConsent(false);
      }
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

  const getUnityBuildConfig = useCallback(() => {
    return resolveUnityBuildConfig({ gameId, moduleInfo });
  }, [gameId, moduleInfo?.build_path, moduleInfo?.updated_at, moduleInfo?.version]);

  const logFrontendRoute = useCallback((eventName, details = {}) => {
    telemetryService.logFrontendRouteEvent(eventName, {
      gameId,
      ...details
    });
  }, [gameId]);

  const isGeotech = ['geotech-game', 'geotech-lab1', 'geotech-lab2'].includes(gameId);
  const isRaceGame = gameId === 'race-game';
  const isMobileRaceViewport = isRaceGame && (
    window.matchMedia?.('(max-width: 768px)').matches
    || /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent)
  );
  const targetDevicePixelRatio = isMobileRaceViewport
    ? 1
    : isGeotech
      ? Math.min(window.devicePixelRatio || 1, 3)
      : Math.min(window.devicePixelRatio || 1, 2);

  const handleFullscreen = () => {
    if (unityInstanceRef.current && typeof unityInstanceRef.current.SetFullscreen === 'function') {
      unityInstanceRef.current.SetFullscreen(1);
      return;
    }
    if (unityCanvasRef.current && unityCanvasRef.current.requestFullscreen) {
      unityCanvasRef.current.requestFullscreen();
    }
  };

  useEffect(() => {
    if (!hasConsent || isCheckingConsent) return;
    if (!telemetrySession) return;
    if (!unityCanvasRef.current) return;

    const buildConfig = getUnityBuildConfig();
    if (!buildConfig) {
      setUnityStatus({ loading: false, progress: 0, error: 'Unity build not configured.' });
      return;
    }

    let cancelled = false;
    const loadToken = ++unityLoadTokenRef.current;

    setUnityStatus({ loading: true, progress: 0, error: '' });
    onUnityLoadStart?.({ gameId });
    unityLoadStartRef.current = Date.now();
    logFrontendRoute('unity_load_started', {
      phase: 'loading',
      status: 'started'
    });

    destroyUnityInstance()
      .then(() => loadUnityScript(buildConfig.loaderUrl))
      .then(() => {
        if (cancelled || loadToken !== unityLoadTokenRef.current) {
          return null;
        }
        if (typeof window.createUnityInstance !== 'function') {
          throw new Error('Unity loader missing');
        }

        const canvas = unityCanvasRef.current;
        if (!canvas) {
          return null;
        }

        if (!canvas.id) {
          canvas.id = `unity-canvas-${gameId}`;
        }

        return window.createUnityInstance(
          canvas,
          {
            dataUrl: buildConfig.dataUrl,
            frameworkUrl: buildConfig.frameworkUrl,
            codeUrl: buildConfig.codeUrl,
            streamingAssetsUrl: buildConfig.streamingAssetsUrl,
            companyName: 'PING',
            productName: moduleInfo?.title || gameId,
            productVersion: moduleInfo?.version || '1.0.0',
            devicePixelRatio: targetDevicePixelRatio,
            matchWebGLToCanvasSize: true,
            autoSyncPersistentDataPath: true
          },
          (progress) => {
            setUnityStatus((prev) => ({ ...prev, progress }));
          }
        );
      })
      .then((instance) => {
        if (!instance) {
          return;
        }

        if (cancelled || loadToken !== unityLoadTokenRef.current) {
          instance.Quit().catch(() => {});
          return;
        }

        unityInstanceRef.current = instance;
        window.unityInstance = instance;
        setUnityStatus({ loading: false, progress: 1, error: '' });
        onUnityLoaded?.({
          gameId,
          moduleId: moduleInfo?.module_id || gameId
        });
        unityBridge.setUnityWindow(window);
        logFrontendRoute('unity_load_completed', {
          phase: 'loading',
          status: 'completed',
          completed: true,
          duration_ms: unityLoadStartRef.current ? Date.now() - unityLoadStartRef.current : undefined
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        console.error('[GameEmbed] Unity load failed:', error);
        setUnityStatus({ loading: false, progress: 0, error: 'Failed to load Unity build.' });
        onUnityLoadError?.({ gameId, error });
        logFrontendRoute('unity_load_failed', {
          phase: 'loading',
          status: 'failed',
          success: false,
          duration_ms: unityLoadStartRef.current ? Date.now() - unityLoadStartRef.current : undefined
        });
      });

    return () => {
      cancelled = true;
      unityLoadTokenRef.current += 1;
      destroyUnityInstance();
    };
  }, [hasConsent, isCheckingConsent, telemetrySession, gameId, moduleInfo?.build_path, moduleInfo?.module_id, moduleInfo?.title, moduleInfo?.version, getUnityBuildConfig, logFrontendRoute, onUnityLoadError, onUnityLoadStart, onUnityLoaded, targetDevicePixelRatio]);

  useEffect(() => {
    if (!telemetrySession) return;

    logFrontendRoute('game_view_opened', {
      phase: 'frontend',
      status: 'opened'
    });

    return () => {
      logFrontendRoute('game_view_closed', {
        phase: 'frontend',
        status: 'closed'
      });
    };
  }, [telemetrySession, gameId, logFrontendRoute]);

  const handleCanvasPointerDown = (event) => {
    telemetryService.recordGameCanvasClick(event, event.currentTarget, {
      gameId,
      phase: unityStatus.loading ? 'loading' : 'gameplay'
    });
  };


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

      refreshAuthContext(sessionData);

      // Set up Unity bridge
      unityBridge.setUnityWindow(window);
      registerBridgeHandlers();
      sendAuthContext();

      console.log('[GameEmbed] Telemetry session started:', sessionData.session_id);
    } catch (error) {
      console.error('[GameEmbed] Failed to start telemetry session:', error);
    }
  };

  useEffect(() => () => {
    bridgeCleanupRef.current?.();
  }, []);

  const endTelemetrySession = async () => {
    const session = telemetrySessionRef.current;
    if (!session) return;

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
          params: { session_id: session.session_id },
          headers
        }
      );

      console.log('[GameEmbed] Telemetry session ended');
      setTelemetrySession(null);
    } catch (error) {
      console.error('[GameEmbed] Failed to end telemetry session:', error);
    }
  };


    // Render embedded player view
  return (
    <div className={`game-embed-container${embedded ? ' embedded' : ''}`}>
      {!embedded && (
        <div className="game-header">
          <Link to="/" className="back-button">
            <ArrowLeft size={20} />
            <span>Back to Simulations</span>
          </Link>
          <h2 className="game-title">{moduleInfo?.title || 'Interactive Simulation'}</h2>
          <Button className="fullscreen-btn" onClick={handleFullscreen}>
            Fullscreen
          </Button>

          {telemetryStats && (
            <div className="telemetry-indicator">
              <Activity size={16} />
              <span>{telemetryStats.totalEvents} events</span>
            </div>
          )}
        </div>
      )}

      <div className={`game-iframe-wrapper${isGeotech ? ' geotech-layout' : ''}${isRaceGame ? ' race-game-layout' : ''}`}>
        {hasConsent && !isCheckingConsent ? (
          <div className="unity-container">
            <canvas
              ref={unityCanvasRef}
              id={`unity-canvas-${gameId}`}
              className="unity-canvas"
              onPointerDown={handleCanvasPointerDown}
            />
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
                    <Button type="primary" onClick={handleOpenConsent}>Review and Agree</Button>
                    {!embedded && <Link to="/" className="btn-secondary">Back</Link>}
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

      {!embedded && (
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
              <strong>F1:</strong> Controls Menu
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
            <h4 className="notice-title"><ChartIcon size={18} className="li-ico" />Data Collection Notice</h4>
            <p>
              <strong>K-12 Student Privacy:</strong> We collect keyboard inputs and the text you enter
              during gameplay to understand learning interactions. We do not record your screen.
            </p>
            {telemetryStats && (
              <p className="telemetry-stats">
                Session: {telemetryStats.sessionId?.slice(0, 8)}... |
                Events: {telemetryStats.totalEvents} |
                Status: {telemetryStats.isEnabled
                  ? (<span className="status-chip"><CheckIcon size={14} className="li-ico li-ico-green" />Active</span>)
                  : (<span className="status-chip"><PauseIcon size={14} className="li-ico" />Paused</span>)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

};

export default GameEmbed;
