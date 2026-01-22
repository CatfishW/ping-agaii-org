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
            simulations.map((sim) => (
              <div key={sim.id} className="sim-card">
                {sim.badge && (
                  <span className={`sim-badge ${getBadgeClass(sim.badge)}`}>
                    {sim.badge}
                  </span>
                )}
                <div className="sim-image-container">
                  <img src={sim.image} alt={sim.title} className="sim-image" />
                </div>
                <div className="sim-info">
                  <h3 className="sim-title">{sim.title}</h3>
                  <p className="sim-description">{sim.description}</p>
                  <div className="sim-tags">
                    {sim.tags.map((tag, index) => (
                      <span key={index} className="sim-tag">{tag}</span>
                    ))}
                  </div>
                  {sim.url.startsWith('/game/') ? (
                    <Link to={sim.url} className="sim-btn">
                      Launch Simulation
                    </Link>
                  ) : (
                    <a
                      href={sim.url}
                      className="sim-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Launch Simulation
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default SimulationBrowser;
