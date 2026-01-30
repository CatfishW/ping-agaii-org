import React from 'react';
import { GraduationCap, Users, ClipboardList, ShieldCheck } from 'lucide-react';
import './TeachingPublic.css';

const TeachingPublic = ({ onLoginClick }) => {
  return (
    <div className="teaching-public">
      <div className="teaching-public-hero">
        <div className="teaching-public-content">
          <span className="teaching-pill">For Educators</span>
          <h1>Teaching Hub</h1>
          <p>
            Create classes, invite students, and review learning progress in one secure space.
            Access is limited to verified teachers and administrators.
          </p>
          <button className="btn-primary" onClick={onLoginClick}>
            Sign in to access teaching tools
          </button>
        </div>
        <div className="teaching-public-card">
          <h3>What you can do</h3>
          <ul>
            <li><Users size={18} />Create and manage classes</li>
            <li><ClipboardList size={18} />Issue invite codes</li>
            <li><ShieldCheck size={18} />Monitor consent and safety</li>
            <li><GraduationCap size={18} />Review student progress</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeachingPublic;
