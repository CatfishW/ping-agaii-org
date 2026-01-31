import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConsentModal from './ConsentModal';
import telemetryService from '../services/TelemetryService';
import unityBridge from '../services/UnityBridge';
import axios from 'axios';
import './GameEmbed.css';

const GameEmbed = () => {
  const { gameId } = useParams();
  const { user } = useAuth();
  const [hasConsent, setHasConsent] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [isCheckingConsent, setIsCheckingConsent] = useState(true);
  const [telemetrySession, setTelemetrySession] = useState(null);
  const [telemetryStats, setTelemetryStats] = useState(null);
  const [moduleInfo, setModuleInfo] = useState(null);
  const iframeRef = useRef(null);

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
      if (iframeRef.current) {
        unityBridge.setIframe(iframeRef.current);
        
        // Listen for Unity events
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
      }

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


  const getGameUrl = () => {
    if (moduleInfo?.build_path) {
      return moduleInfo.build_path;
    }
    if (gameId === 'forces-motion-basics') {
      return '/games/Force&Motion/index.html';
    }
    return '#';
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
          <iframe
            ref={iframeRef}
            src={getGameUrl()}
            title={gameId}
            className="game-iframe"
            frameBorder="0"
            allowFullScreen
          />
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
            <strong>K-12 Student Privacy:</strong> We only collect keyboard button presses
            (like "W", "Space", "Arrow keys") to understand game interactions.
            We <strong>NEVER</strong> record what you type in text boxes or capture your screen.
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
