import React, { useState } from 'react';
import { Alert, Button, Checkbox, Modal, Tag } from 'antd';
import { Shield, Lock, Cookie, Database, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveConsentHandoff } from '../services/ConsentHandoff';
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

    const consentData = {
      terms_accepted: consents.terms,
      privacy_accepted: consents.privacy,
      data_collection_accepted: consents.dataCollection,
      cookie_accepted: consents.cookies
    };

    // Anonymous users: save consent to localStorage
    if (!user) {
      const anonymousConsent = {
        ...consentData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('anonymousConsent', JSON.stringify(anonymousConsent));
      saveConsentHandoff(consentData);
      setLoading(false);
      if (onConsent) onConsent();
      if (onConsentComplete) onConsentComplete();
      return;
    }
    
    // Logged-in users: submit to backend
    const result = await submitConsent(consentData);

    setLoading(false);

    if (result.success) {
      saveConsentHandoff(consentData);
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

  const renderConsentItem = (key, label, badgeType, icon) => (
    <div className="consent-item" key={key}>
      <div className="consent-checkbox-row">
        <Checkbox
          id={`consent-${key}`}
          checked={consents[key]}
          onChange={() => handleConsentChange(key)}
        >
          <span className="consent-checkbox-label">
            {icon}
            <span>{label}</span>
            <Tag color={badgeType === 'required' ? 'red' : 'default'}>
              {badgeType === 'required' ? 'Required' : 'Optional'}
            </Tag>
          </span>
        </Checkbox>
        <Button
          type="link"
          onClick={() => setShowDetails(showDetails === key ? null : key)}
        >
          {showDetails === key ? 'Hide' : 'Details'}
        </Button>
      </div>
      {showDetails === key && (
        <div className="consent-details">
          {detailsContent[key].content}
        </div>
      )}
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onCancel={required ? undefined : onClose}
      closable={!required}
      maskClosable={!required}
      footer={null}
      centered
      width={720}
      className="consent-modal-antd"
    >
        <div className="consent-header">
          <Shield size={48} className="consent-icon" />
          <h2>Consent & Privacy Agreement</h2>
          <p>Before you continue, please review and accept our policies</p>
        </div>

        {error && (
          <Alert type="error" showIcon message={error} className="consent-alert" />
        )}

        <div className="consent-items">
          {renderConsentItem('terms', <>I accept the <strong>Terms of Service</strong></>, 'required', <Shield size={20} />)}
          {renderConsentItem('privacy', <>I accept the <strong>Privacy Policy</strong></>, 'required', <Lock size={20} />)}
          {renderConsentItem('dataCollection', <>I consent to <strong>Behavior Data Collection</strong></>, 'required', <Database size={20} />)}
          {renderConsentItem('cookies', <>I accept <strong>Cookie Usage</strong></>, 'optional', <Cookie size={20} />)}
        </div>

        <div className="consent-footer">
          <p className="consent-footnote">
            <AlertCircle size={16} />
            By continuing, you acknowledge that you have read and understood our policies.
            {required && ' These consents are required to use the platform.'}
          </p>
          
          <Button
            type="primary"
            size="large"
            block
            onClick={handleSubmit}
            loading={loading}
            disabled={!consents.terms || !consents.privacy || !consents.dataCollection}
          >
            {loading ? 'Submitting...' : 'Accept & Continue'}
          </Button>
          
          {!required && (
            <Button block className="btn-consent-cancel" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
    </Modal>
  );
};

export default ConsentModal;
