import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './SimulationBrowser.css';

const SimulationBrowser = ({ searchQuery }) => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const subject = searchParams.get('subject');
    if (subject) {
      setSelectedSubject(subject);
      setActiveTab('filter');
    }
  }, [searchParams]);

  const fetchSimulations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSubject !== 'all') params.subject = selectedSubject;
      if (searchQuery) params.search = searchQuery;

      const response = await axios.get('/api/simulations', { 
        params,
        timeout: 10000 // 10秒超时
      });
      setSimulations(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load simulations');
      console.error('Error fetching simulations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, searchQuery]);

  const subjects = {
    'all': 'All Subjects',
    'physics': 'Physics',
    'math': 'Math & Statistics',
    'chemistry': 'Chemistry',
    'biology': 'Biology',
    'earth-science': 'Earth & Space'
  };

  const getBadgeClass = (badge) => {
    if (!badge) return '';
    const badgeLower = badge.toLowerCase();
    if (badgeLower === 'featured') return 'badge-featured';
    if (badgeLower === 'new') return 'badge-new';
    if (badgeLower === 'hot') return 'badge-hot';
    if (badgeLower === 'updated') return 'badge-updated';
    return 'badge-classic';
  };

  const subjectImages = {
    physics: '/images/force_motion_cover.png',
    math: '/images/math_thumb.png',
    chemistry: '/images/chemistry_thumb.png',
    biology: '/images/biology_thumb.png',
    'earth-science': '/images/earth_science_thumb.png'
  };

  if (loading) {
    return <div className="loading">Loading simulations...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <section className="sim-browser container">
      <div className="sim-content">
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse
          </button>
          <button
            className={`tab-btn ${activeTab === 'filter' ? 'active' : ''}`}
            onClick={() => setActiveTab('filter')}
          >
            Filter
          </button>
        </div>

        {activeTab === 'filter' && (
          <div className="filter-controls">
            <div className="filter-group">
              <label>Subject:</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                {Object.entries(subjects).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="sim-grid">
          {simulations.length === 0 ? (
            <div className="no-results">No simulations found</div>
          ) : (
            simulations.map((sim) => {
              const simUrl = sim.build_path || `/game/${sim.module_id}`;
              const simImage = sim.image || subjectImages[sim.subject] || '/images/force_motion_cover.png';
              const simTags = sim.tags && sim.tags.length ? sim.tags : [sim.subject];
              return (
              <div key={sim.id} className="sim-card">
                {sim.badge && (
                  <span className={`sim-badge ${getBadgeClass(sim.badge)}`}>
                    {sim.badge}
                  </span>
                )}
                <div className="sim-image-container">
                  <img src={simImage} alt={sim.title} className="sim-image" />
                </div>
                <div className="sim-info">
                  <h3 className="sim-title">{sim.title}</h3>
                  <p className="sim-description">{sim.description}</p>
                  <div className="sim-tags">
                    {simTags.map((tag, index) => (
                      <span key={index} className="sim-tag">{tag}</span>
                    ))}
                  </div>
                  {simUrl.startsWith('/game/') ? (
                    <Link to={simUrl} className="sim-btn">
                      Launch Simulation
                    </Link>
                  ) : (
                    <a
                      href={simUrl}
                      className="sim-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Launch Simulation
                    </a>
                  )}
                </div>
              </div>
            )})
          )}
        </div>
      </div>
    </section>
  );
};

export default SimulationBrowser;
