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
  const [subjects, setSubjects] = useState([]);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const subject = searchParams.get('subject');
    if (subject) {
      setSelectedSubject(subject);
      setActiveTab('filter');
    }
  }, [searchParams]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/api/subjects');
      setSubjects(response.data || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

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
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchSimulations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, searchQuery]);

  const subjectOptions = [
    { key: 'all', name: 'All Subjects' },
    ...subjects
  ];

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
                {subjectOptions.map((subject) => (
                  <option key={subject.key} value={subject.key}>{subject.name}</option>
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
              const simUrl = `/game/${sim.module_id}`;
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
                  <Link to={simUrl} className="sim-btn">
                    Launch Simulation
                  </Link>
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
