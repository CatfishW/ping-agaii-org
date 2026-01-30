import React from 'react';
import { ExternalLink, FlaskConical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ResearchHub.css';

const ResearchHub = () => {
  const { token } = useAuth();

  const handleSparcLaunch = () => {
    const baseUrl = 'https://game.agaii.org';
    if (token) {
      const url = `${baseUrl}/?token=${encodeURIComponent(token)}`;
      window.open(url, '_blank');
    } else {
      window.open(baseUrl, '_blank');
    }
  };

  return (
    <div className="research-hub">
      <div className="research-hero">
        <div>
          <span className="research-pill">Research Hub</span>
          <h1>Research Programs</h1>
          <p>Explore ongoing research initiatives and connected environments.</p>
        </div>
      </div>

      <div className="research-grid">
        <div className="research-card">
          <div className="research-card-header">
            <FlaskConical size={24} />
            <div>
              <h2>SPARC</h2>
              <p>Learning through play in the SPARC environment.</p>
            </div>
          </div>
          <button className="btn-primary" onClick={handleSparcLaunch}>
            Open SPARC <ExternalLink size={16} />
          </button>
          {!token && (
            <p className="research-note">Sign in to auto-login.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearchHub;
