import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, BookOpen, Activity, TrendingUp, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'org_admin' || user?.role === 'platform_admin';
  const isTeacher = user?.role === 'teacher' || isAdmin;
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [invites, setInvites] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(true);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [copiedInviteId, setCopiedInviteId] = useState(null);
  const [teacherInviteForm, setTeacherInviteForm] = useState({
    maxUses: '',
    expiresAt: '',
    notes: ''
  });
  const [studentInviteForm, setStudentInviteForm] = useState({
    classId: '',
    maxUses: '',
    expiresAt: '',
    notes: ''
  });
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalSessions: 0,
    activeToday: 0
  });

  useEffect(() => {
    if (!user) {
      return;
    }
    fetchClasses();
    if (isTeacher) {
      fetchInvites();
    }
  }, [user]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('/api/classes/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setClasses(response.data);

      if (response.data.length) {
        setStudentInviteForm((prev) => ({
          ...prev,
          classId: prev.classId || response.data[0].id
        }));
      }
      
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

  const fetchInvites = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('/api/invites/mine', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setInvites(response.data || []);
      setInviteLoading(false);
    } catch (error) {
      console.error('Error fetching invites:', error);
      setInviteError('Unable to load invite codes');
      setInviteLoading(false);
    }
  };

  const buildInvitePayload = (form) => {
    const payload = {};
    if (form.maxUses) {
      payload.max_uses = Number(form.maxUses);
    }
    if (form.expiresAt) {
      payload.expires_at = new Date(`${form.expiresAt}T23:59:59Z`).toISOString();
    }
    if (form.notes?.trim()) {
      payload.notes = form.notes.trim();
    }
    return payload;
  };

  const handleCreateTeacherInvite = async (event) => {
    event.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    try {
      const token = localStorage.getItem('access_token');
      const payload = buildInvitePayload(teacherInviteForm);
      const response = await axios.post('/api/invites/teachers', payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setInvites((prev) => [response.data, ...prev]);
      setTeacherInviteForm({ maxUses: '', expiresAt: '', notes: '' });
      setInviteSuccess('Teacher invite created');
    } catch (error) {
      setInviteError(error.response?.data?.detail || 'Failed to create teacher invite');
    }
  };

  const handleCreateStudentInvite = async (event) => {
    event.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    if (!studentInviteForm.classId) {
      setInviteError('Select a class for student invite');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const payload = buildInvitePayload(studentInviteForm);
      payload.class_id = Number(studentInviteForm.classId);
      const response = await axios.post('/api/invites/students', payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setInvites((prev) => [response.data, ...prev]);
      setStudentInviteForm((prev) => ({
        ...prev,
        maxUses: '',
        expiresAt: '',
        notes: ''
      }));
      setInviteSuccess('Student invite created');
    } catch (error) {
      setInviteError(error.response?.data?.detail || 'Failed to create student invite');
    }
  };

  const handleToggleInvite = async (inviteId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `/api/invites/${inviteId}/toggle`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setInvites((prev) => prev.map((invite) => (
        invite.id === inviteId ? response.data : invite
      )));
    } catch (error) {
      setInviteError(error.response?.data?.detail || 'Unable to update invite');
    }
  };

  const handleCopyInvite = (code, inviteId) => {
    navigator.clipboard.writeText(code);
    setCopiedInviteId(inviteId);
    setTimeout(() => setCopiedInviteId(null), 1500);
  };

  const getClassLabel = (classId) => {
    if (!classId) {
      return '—';
    }
    const match = classes.find((cls) => cls.id === classId);
    return match ? match.name : `Class ${classId}`;
  };

  const formatExpiry = (expiresAt) => {
    if (!expiresAt) {
      return 'No expiry';
    }
    return new Date(expiresAt).toLocaleDateString();
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

      {isTeacher && (
        <div className="invites-section">
          <div className="invites-header">
            <div>
              <h2>Invite Codes</h2>
              <p>Create teacher or student invites with limits and expiration.</p>
            </div>
          </div>

          <div className="invites-grid">
            {isAdmin && (
              <div className="invite-card">
                <h3>Teacher Invites</h3>
                <p>Admins generate teacher invite codes for onboarding.</p>
                <form className="invite-form" onSubmit={handleCreateTeacherInvite}>
                  <div className="invite-form-grid">
                    <div className="form-group">
                      <label>Max Uses</label>
                      <input
                        type="number"
                        min="1"
                        value={teacherInviteForm.maxUses}
                        onChange={(event) => setTeacherInviteForm({
                          ...teacherInviteForm,
                          maxUses: event.target.value
                        })}
                        placeholder="Unlimited"
                      />
                    </div>
                    <div className="form-group">
                      <label>Expires On</label>
                      <input
                        type="date"
                        value={teacherInviteForm.expiresAt}
                        onChange={(event) => setTeacherInviteForm({
                          ...teacherInviteForm,
                          expiresAt: event.target.value
                        })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <input
                      type="text"
                      value={teacherInviteForm.notes}
                      onChange={(event) => setTeacherInviteForm({
                        ...teacherInviteForm,
                        notes: event.target.value
                      })}
                      placeholder="Optional notes"
                    />
                  </div>
                  <button className="btn-primary" type="submit">Create Teacher Invite</button>
                </form>
              </div>
            )}

            <div className="invite-card">
              <h3>Student Invites</h3>
              <p>Generate student invites tied to a class join.</p>
              <form className="invite-form" onSubmit={handleCreateStudentInvite}>
                <div className="invite-form-grid">
                  <div className="form-group">
                    <label>Class</label>
                    <select
                      value={studentInviteForm.classId}
                      onChange={(event) => setStudentInviteForm({
                        ...studentInviteForm,
                        classId: event.target.value
                      })}
                    >
                      <option value="">Select class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Max Uses</label>
                    <input
                      type="number"
                      min="1"
                      value={studentInviteForm.maxUses}
                      onChange={(event) => setStudentInviteForm({
                        ...studentInviteForm,
                        maxUses: event.target.value
                      })}
                      placeholder="Unlimited"
                    />
                  </div>
                </div>
                <div className="invite-form-grid">
                  <div className="form-group">
                    <label>Expires On</label>
                    <input
                      type="date"
                      value={studentInviteForm.expiresAt}
                      onChange={(event) => setStudentInviteForm({
                        ...studentInviteForm,
                        expiresAt: event.target.value
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <input
                      type="text"
                      value={studentInviteForm.notes}
                      onChange={(event) => setStudentInviteForm({
                        ...studentInviteForm,
                        notes: event.target.value
                      })}
                      placeholder="Optional notes"
                    />
                  </div>
                </div>
                <button className="btn-primary" type="submit">Create Student Invite</button>
              </form>
            </div>
          </div>

          {inviteError && <div className="invite-message error">{inviteError}</div>}
          {inviteSuccess && <div className="invite-message success">{inviteSuccess}</div>}

          <div className="invite-list">
            {inviteLoading ? (
              <div className="loading">Loading invites...</div>
            ) : invites.length === 0 ? (
              <div className="empty-state small">
                <Users size={48} color="#ccc" />
                <h3>No invites yet</h3>
                <p>Create your first invite to onboard teachers or students.</p>
              </div>
            ) : (
              <div className="invite-table">
                <div className="invite-row header">
                  <span>Code</span>
                  <span>Role</span>
                  <span>Class</span>
                  <span>Uses</span>
                  <span>Expires</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {invites.map((invite) => {
                  const isExpired = invite.expires_at && new Date(invite.expires_at) < new Date();
                  const statusLabel = !invite.is_active
                    ? 'Disabled'
                    : isExpired
                      ? 'Expired'
                      : 'Active';
                  return (
                    <div key={invite.id} className={`invite-row ${!invite.is_active || isExpired ? 'inactive' : ''}`}>
                      <div className="invite-code">
                        <code>{invite.code}</code>
                        <button
                          className="btn-icon"
                          type="button"
                          onClick={() => handleCopyInvite(invite.code, invite.id)}
                          title="Copy invite code"
                        >
                          {copiedInviteId === invite.id ? 'Copied' : <Copy size={16} />}
                        </button>
                      </div>
                      <span className="invite-role">{invite.role.toUpperCase()}</span>
                      <span>{getClassLabel(invite.class_id)}</span>
                      <span>{invite.uses}/{invite.max_uses ?? '∞'}</span>
                      <span>{formatExpiry(invite.expires_at)}</span>
                      <span className={`invite-status ${statusLabel.toLowerCase()}`}>{statusLabel}</span>
                      <div className="invite-actions">
                        <button
                          className="btn-secondary"
                          type="button"
                          onClick={() => handleToggleInvite(invite.id)}
                        >
                          {invite.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

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
