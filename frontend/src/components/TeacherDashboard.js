import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, BookOpen, Activity, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalSessions: 0,
    activeToday: 0
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('/api/classes/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setClasses(response.data);
      
      // Calculate stats
      const totalStudents = response.data.reduce((sum, cls) => sum + (cls.student_count || 0), 0);
      const totalSessions = response.data.reduce((sum, cls) => sum + (cls.total_sessions || 0), 0);
      
      setStats({
        totalClasses: response.data.length,
        totalStudents,
        totalSessions,
        activeToday: response.data.filter(cls => cls.is_active).length
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Teacher Dashboard</h1>
          <p>Welcome back, {user?.full_name || user?.username}!</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={20} />
          <span>Create Class</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3f2fd' }}>
            <BookOpen size={24} color="#1976d2" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalClasses}</div>
            <div className="stat-label">Total Classes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e5f5' }}>
            <Users size={24} color="#7b1fa2" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalStudents}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e9' }}>
            <Activity size={24} color="#388e3c" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalSessions}</div>
            <div className="stat-label">Total Sessions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff3e0' }}>
            <TrendingUp size={24} color="#f57c00" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeToday}</div>
            <div className="stat-label">Active Classes</div>
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="classes-section">
        <h2>My Classes</h2>
        
        {classes.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={64} color="#ccc" />
            <h3>No classes yet</h3>
            <p>Create your first class to get started</p>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={20} />
              <span>Create Class</span>
            </button>
          </div>
        ) : (
          <div className="classes-grid">
            {classes.map(cls => (
              <ClassCard key={cls.id} classData={cls} onUpdate={fetchClasses} />
            ))}
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <CreateClassModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchClasses();
          }}
        />
      )}
    </div>
  );
};

const ClassCard = ({ classData, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="class-card">
      <div className="class-card-header">
        <h3>{classData.name}</h3>
        <span className={`class-status ${classData.is_active ? 'active' : 'inactive'}`}>
          {classData.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {classData.description && (
        <p className="class-description">{classData.description}</p>
      )}

      <div className="class-stats">
        <div className="class-stat-item">
          <Users size={16} />
          <span>{classData.student_count || 0} students</span>
        </div>
        <div className="class-stat-item">
          <Activity size={16} />
          <span>{classData.total_sessions || 0} sessions</span>
        </div>
      </div>

      <div className="class-join-code">
        <label>Join Code:</label>
        <code className="join-code">{classData.join_code}</code>
      </div>

      <div className="class-card-actions">
        <Link to={`/teaching/classes/${classData.id}`} className="btn-secondary">
          View Details
        </Link>
      </div>
    </div>
  );
};

const CreateClassModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Class name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        '/api/classes/',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create class');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Create New Class</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Class Name *</label>
            <input
              type="text"
              placeholder="e.g., Physics 101, Grade 5 Math"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              placeholder="Brief description of the class"
              rows="3"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherDashboard;
