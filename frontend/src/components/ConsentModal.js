import React, { useState } from 'react';
import { X, Shield, Lock, Cookie, Database, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ConsentModal.css';

const ConsentModal = ({ isOpen, onClose, onConsent, onConsentComplete, required = true }) => {
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    dataCollection: false,
    cookies: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(null);

  const { user, submitConsent } = useAuth();

  if (!isOpen) return null;

  const handleConsentChange = (type) => {
    setConsents({ ...consents, [type]: !consents[type] });
    setError('');
  };

  const handleSubmit = async () => {
    // Validate required consents
    if (!consents.terms || !consents.privacy || !consents.dataCollection) {
      setError('Terms, Privacy Policy, and Data Collection consent are required to continue.');
      return;
    }

    setLoading(true);
    
    // Anonymous users: save consent to localStorage
    if (!user) {
      const consentData = {
        terms_accepted: consents.terms,
        privacy_accepted: consents.privacy,
        data_collection_accepted: consents.dataCollection,
        cookie_accepted: consents.cookies,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('anonymousConsent', JSON.stringify(consentData));
      setLoading(false);
      if (onConsent) onConsent();
      if (onConsentComplete) onConsentComplete();
      return;
    }
    
    // Logged-in users: submit to backend
    const result = await submitConsent({
      terms_accepted: consents.terms,
      privacy_accepted: consents.privacy,
      data_collection_accepted: consents.dataCollection,
      cookie_accepted: consents.cookies
    });

    setLoading(false);

    if (result.success) {
      // Call both callbacks if provided
      if (onConsent) onConsent();
      if (onConsentComplete) onConsentComplete();
    } else {
      setError(result.error || 'Failed to submit consent. Please try again.');
    }
  };

  const detailsContent = {
    terms: {
      title: 'Terms of Service',
      icon: <Shield size={24} />,
      content: (
        <div className="consent-details-text">
          <p><strong>By accepting, you agree to:</strong></p>
          <ul>
            <li>Use the platform for educational purposes only</li>
            <li>Not share your account credentials</li>
            <li>Follow community guidelines and respect others</li>
            <li>Not attempt to hack or abuse the system</li>
          </ul>
          <p className="consent-note">
            These terms protect both you and the PING community.
          </p>
        </div>
      )
    },
    privacy: {
      title: 'Privacy Policy',
      icon: <Lock size={24} />,
      content: (
        <div className="consent-details-text">
          <p><strong>We collect and protect:</strong></p>
          <ul>
            <li>Account information (email, name)</li>
            <li>Learning progress and performance data</li>
            <li>Usage patterns and interaction data</li>
            <li>Device and browser information</li>
          </ul>
          <p><strong>We DO NOT collect:</strong></p>
          <ul>
            <li>Personal conversations</li>
            <li>Location data beyond IP address</li>
          </ul>
          <p className="consent-note">
            Your data is encrypted and never sold to third parties.
          </p>
        </div>
      )
    },
    dataCollection: {
      title: 'Behavior Data Collection',
      icon: <Database size={24} />,
      content: (
        <div className="consent-details-text">
          <p><strong>What we collect during gameplay:</strong></p>
          <ul>
            <li><strong>Key presses</strong>: Key codes (e.g., "W", "Space", "ArrowUp")</li>
            <li><strong>Text input</strong>: The text you enter during gameplay</li>
            <li><strong>Mouse clicks</strong>: Click positions and timing</li>
            <li><strong>Game events</strong>: Objectives completed, items collected, etc.</li>
            <li><strong>Session data</strong>: Time spent, levels completed</li>
          </ul>
          
          <div className="k12-notice">
            <AlertCircle size={18} />
            <div>
              <strong>K-12 Compliance:</strong> We follow strict data minimization principles. 
              Keyboard tracking is limited to key codes only and does NOT capture any text input.
            </div>
          </div>
          
          <p><strong>Why we collect this data:</strong></p>
          <ul>
            <li>Improve game difficulty and pacing</li>
            <li>Provide personalized feedback to teachers</li>
            <li>Research learning patterns (anonymized)</li>
          </ul>
          
          <p className="consent-note">
            You can request data deletion at any time through your account settings.
          </p>
        </div>
      )
    },
    cookies: {
      title: 'Cookie Usage',
      icon: <Cookie size={24} />,
      content: (
        <div className="consent-details-text">
          <p><strong>Essential Cookies (Required):</strong></p>
          <ul>
            <li>Authentication tokens (keeps you logged in)</li>
            <li>Session management</li>
            <li>Security features</li>
          </ul>
          
          <p><strong>Optional Cookies:</strong></p>
          <ul>
            <li>Analytics (understand how you use the platform)</li>
            <li>Preferences (remember your settings)</li>
          </ul>
          
          <p className="consent-note">
            Essential cookies are required for the platform to function. 
            Optional cookies can be disabled in your browser settings.
          </p>
        </div>
      )
    }
  };

  return (
    <div className="consent-modal-overlay">
      <div className="consent-modal">
        {!required && (
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        )}

        <div className="consent-header">
          <Shield size={48} className="consent-icon" />
          <h2>Consent & Privacy Agreement</h2>
          <p>Before you continue, please review and accept our policies</p>
        </div>

        {error && (
          <div className="consent-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="consent-items">
          {/* Terms of Service */}
          <div className="consent-item">
            <div className="consent-checkbox-row">
              <input
                type="checkbox"
                id="consent-terms"
                checked={consents.terms}
                onChange={() => handleConsentChange('terms')}
              />
              <label htmlFor="consent-terms">
                <Shield size={20} />
                <span>
                  I accept the <strong>Terms of Service</strong>
                  <span className="required-badge">Required</span>
                </span>
              </label>
              <button
                className="details-btn"
                onClick={() => setShowDetails(showDetails === 'terms' ? null : 'terms')}
              >
                {showDetails === 'terms' ? 'Hide' : 'Details'}
              </button>
            </div>
            {showDetails === 'terms' && (
              <div className="consent-details">
                {detailsContent.terms.content}
              </div>
            )}
          </div>

          {/* Privacy Policy */}
          <div className="consent-item">
            <div className="consent-checkbox-row">
              <input
                type="checkbox"
                id="consent-privacy"
                checked={consents.privacy}
                onChange={() => handleConsentChange('privacy')}
              />
              <label htmlFor="consent-privacy">
                <Lock size={20} />
                <span>
                  I accept the <strong>Privacy Policy</strong>
                  <span className="required-badge">Required</span>
                </span>
              </label>
              <button
                className="details-btn"
                onClick={() => setShowDetails(showDetails === 'privacy' ? null : 'privacy')}
              >
                {showDetails === 'privacy' ? 'Hide' : 'Details'}
              </button>
            </div>
            {showDetails === 'privacy' && (
              <div className="consent-details">
                {detailsContent.privacy.content}
              </div>
            )}
          </div>

          {/* Data Collection */}
          <div className="consent-item">
            <div className="consent-checkbox-row">
              <input
                type="checkbox"
                id="consent-data"
                checked={consents.dataCollection}
                onChange={() => handleConsentChange('dataCollection')}
              />
              <label htmlFor="consent-data">
                <Database size={20} />
                <span>
                  I consent to <strong>Behavior Data Collection</strong>
                  <span className="required-badge">Required</span>
                </span>
              </label>
              <button
                className="details-btn"
                onClick={() => setShowDetails(showDetails === 'dataCollection' ? null : 'dataCollection')}
              >
                {showDetails === 'dataCollection' ? 'Hide' : 'Details'}
              </button>
            </div>
            {showDetails === 'dataCollection' && (
              <div className="consent-details">
                {detailsContent.dataCollection.content}
              </div>
            )}
          </div>

          {/* Cookies */}
          <div className="consent-item">
            <div className="consent-checkbox-row">
              <input
                type="checkbox"
                id="consent-cookies"
                checked={consents.cookies}
                onChange={() => handleConsentChange('cookies')}
              />
              <label htmlFor="consent-cookies">
                <Cookie size={20} />
                <span>
                  I accept <strong>Cookie Usage</strong>
                  <span className="optional-badge">Optional</span>
                </span>
              </label>
              <button
                className="details-btn"
                onClick={() => setShowDetails(showDetails === 'cookies' ? null : 'cookies')}
              >
                {showDetails === 'cookies' ? 'Hide' : 'Details'}
              </button>
            </div>
            {showDetails === 'cookies' && (
              <div className="consent-details">
                {detailsContent.cookies.content}
              </div>
            )}
          </div>
        </div>

        <div className="consent-footer">
          <p className="consent-footnote">
            <AlertCircle size={16} />
            By continuing, you acknowledge that you have read and understood our policies.
            {required && ' These consents are required to use the platform.'}
          </p>
          
          <button
            className="btn-consent-submit"
            onClick={handleSubmit}
            disabled={loading || !consents.terms || !consents.privacy || !consents.dataCollection}
          >
            {loading ? 'Submitting...' : 'Accept & Continue'}
          </button>
          
          {!required && (
            <button className="btn-consent-cancel" onClick={onClose}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
