import React from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './StoryMode.css';

const StoryMode = () => {
  const { token } = useAuth();

  const handleLaunchSparc = () => {
    const baseUrl = 'https://game.agaii.org';
    const url = token ? `${baseUrl}/?token=${encodeURIComponent(token)}` : baseUrl;
    window.open(url, '_blank');
  };

  return (
    <section className="story-mode container">
      <div className="story-header">
        <div>
          <span className="story-pill">Story Mode</span>
          <h2>Guided Experiences</h2>
          <p>A curated path. Less browsing, more momentum.</p>
        </div>
      </div>

      <div className="story-strip" role="group" aria-label="Story mode experiences">
        <div className="story-strip-left">
          <div className="story-icon" aria-hidden="true">
            <BookOpen size={20} />
          </div>
          <div>
            <h3>SPARC</h3>
            <p>Learning through play in the SPARC environment.</p>
          </div>
        </div>

        <div className="story-strip-right">
          <button className="btn-primary" type="button" onClick={handleLaunchSparc}>
            Open SPARC <ExternalLink size={16} />
          </button>
          {!token && <div className="story-note">Sign in to auto-login.</div>}
        </div>
      </div>
    </section>
  );
};

export default StoryMode;
