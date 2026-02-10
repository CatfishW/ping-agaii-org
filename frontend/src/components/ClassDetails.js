import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Activity,
  Copy,
  RefreshCw,
  Trash2,
  UserPlus,
  BookOpen,
  ExternalLink,
  ArrowRightLeft
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ClassDetails.css';

const ClassDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState('');
  const [transferMessage, setTransferMessage] = useState('');

  const canTransfer = user?.role === 'org_admin' || user?.role === 'platform_admin';

  useEffect(() => {
    fetchClassDetails();
    fetchStudents();
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `/api/classes/${classId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setClassData(response.data);
      if (canTransfer) {
        setTeacherId(String(response.data.teacher_id || ''));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching class details:', error);
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    setTransferMessage('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const all = response.data || [];
      const teacherRows = all
        .filter((u) => u.role === 'teacher' && u.is_active)
        .sort((a, b) => String(a.full_name || a.email || '').localeCompare(String(b.full_name || b.email || '')));
      setTeachers(teacherRows);
    } catch (error) {
      setTransferMessage(error.response?.data?.detail || 'Failed to load teachers.');
    }
  };

  useEffect(() => {
    if (!canTransfer || !showTransfer) return;
    fetchTeachers();
  }, [canTransfer, showTransfer]);

  const submitTransfer = async () => {
    if (!teacherId) {
      setTransferMessage('Select a teacher.');
      return;
    }
    if (!window.confirm('Transfer this class to the selected teacher?')) {
      return;
    }
    setTransferMessage('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put(
        `/api/classes/${classId}/teacher`,
        { teacher_id: Number(teacherId) },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setClassData((prev) => ({
        ...prev,
        teacher_id: response.data.teacher_id,
        teacher_name: response.data.teacher_name,
        teacher_email: response.data.teacher_email
      }));
      setShowTransfer(false);
    } catch (error) {
      setTransferMessage(error.response?.data?.detail || 'Failed to transfer class.');
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `/api/classes/${classId}/students`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCopyJoinCode = () => {
    navigator.clipboard.writeText(classData.join_code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleRegenerateCode = async () => {
    if (!window.confirm('Are you sure you want to regenerate the join code? The old code will no longer work.')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `/api/classes/${classId}/regenerate-code`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setClassData(response.data);
      alert('Join code regenerated successfully!');
    } catch (error) {
      console.error('Error regenerating join code:', error);
      alert('Failed to regenerate join code');
    }
  };

  const handleDeleteClass = async () => {
    if (!window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `/api/classes/${classId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert('Class deleted successfully');
      navigate('/teaching');
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class');
    }
  };

  if (loading) {
    return (
      <div className="class-details-container">
        <div className="loading">Loading class details...</div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="class-details-container">
        <div className="error-state">Class not found</div>
      </div>
    );
  }

  return (
    <div className="class-details-container">
      {/* Header */}
      <div className="class-details-header">
        <Link to="/teaching" className="back-button">
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>

        <div className="class-title-section">
          <h1>{classData.name}</h1>
          {classData.description && <p>{classData.description}</p>}
          {classData.teacher_name && (
            <p className="class-teacher">Teacher: {classData.teacher_name}</p>
          )}
        </div>

        <div className="class-actions">
          <button className="btn-icon" onClick={handleDeleteClass} title="Delete Class">
            <Trash2 size={20} />
          </button>
          {canTransfer && (
            <button className="btn-icon" onClick={() => setShowTransfer(true)} title="Transfer Class">
              <ArrowRightLeft size={20} />
            </button>
          )}
        </div>
      </div>

      {showTransfer && (
        <div className="transfer-modal-overlay" onMouseDown={() => setShowTransfer(false)}>
          <div className="transfer-modal" onMouseDown={(e) => e.stopPropagation()}>
            <h3>Transfer Class</h3>
            <p>Select a teacher in this organization.</p>
            {transferMessage && <div className="transfer-message">{transferMessage}</div>}
            <label>
              Teacher
              <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                <option value="">Select teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.full_name || t.email} (#{t.id})</option>
                ))}
              </select>
            </label>
            <div className="transfer-actions">
              <button className="btn-secondary" type="button" onClick={() => setShowTransfer(false)}>
                Cancel
              </button>
              <button className="btn-primary" type="button" onClick={submitTransfer}>
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="class-stats-overview">
        <div className="stat-box">
          <Users size={32} color="#7b1fa2" />
          <div>
            <div className="stat-number">{classData.student_count + classData.guest_count}</div>
            <div className="stat-label">Total Participants</div>
          </div>
        </div>

        <div className="stat-box">
          <UserPlus size={32} color="#1976d2" />
          <div>
            <div className="stat-number">{classData.student_count}</div>
            <div className="stat-label">Registered Students</div>
          </div>
        </div>

        <div className="stat-box">
          <Activity size={32} color="#388e3c" />
          <div>
            <div className="stat-number">{classData.total_sessions}</div>
            <div className="stat-label">Total Sessions</div>
          </div>
        </div>

        <div className="stat-box">
          <BookOpen size={32} color="#f57c00" />
          <div>
            <div className="stat-number">{classData.module_count || 0}</div>
            <div className="stat-label">Assigned Modules</div>
          </div>
        </div>
      </div>

      {/* Join Code Card */}
      <div className="join-code-card">
        <h3>Class Join Code</h3>
        <p>Share this code with your students to join the class</p>
        
        <div className="join-code-display">
          <code className="join-code-large">{classData.join_code}</code>
          <div className="join-code-actions">
            <button 
              className="btn-secondary" 
              onClick={handleCopyJoinCode}
            >
              <Copy size={18} />
              {copySuccess ? 'Copied!' : 'Copy Code'}
            </button>
            <button 
              className="btn-secondary" 
              onClick={handleRegenerateCode}
            >
              <RefreshCw size={18} />
              Regenerate
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={18} />
            Students ({students.length})
          </button>
          <button 
            className={`tab ${activeTab === 'modules' ? 'active' : ''}`}
            onClick={() => setActiveTab('modules')}
          >
            <BookOpen size={18} />
            Modules ({classData.module_count || 0})
          </button>
          <button 
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <Activity size={18} />
            Analytics
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'students' && (
            <StudentsTab classId={classId} students={students} onRefresh={fetchStudents} />
          )}
          {activeTab === 'modules' && (
            <ModulesTab classId={classId} joinCode={classData.join_code} totalStudents={students.length} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab classId={classId} students={students} />
          )}
        </div>
      </div>
    </div>
  );
};

const StudentsTab = ({ classId, students, onRefresh }) => {
  const { user } = useAuth();
  const canManage = user?.role === 'teacher' || user?.role === 'org_admin' || user?.role === 'platform_admin';
  const [adding, setAdding] = useState(false);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const addStudent = async () => {
    if (!email.trim()) {
      setMsg('Enter a student email.');
      return;
    }
    setAdding(true);
    setMsg('');
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `/api/classes/${classId}/students`,
        { email: email.trim() },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setEmail('');
      onRefresh();
    } catch (error) {
      setMsg(error.response?.data?.detail || 'Failed to add student.');
    } finally {
      setAdding(false);
    }
  };

  const removeStudent = async (student) => {
    if (!window.confirm(`Remove ${student.name} from this class?`)) {
      return;
    }
    setMsg('');
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `/api/classes/${classId}/students/${student.user_id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      onRefresh();
    } catch (error) {
      setMsg(error.response?.data?.detail || 'Failed to remove student.');
    }
  };

  if (students.length === 0) {
    return (
      <div className="empty-tab-state">
        <Users size={64} color="#ccc" />
        <h3>No students yet</h3>
        <p>Students will appear here once they join using the class code</p>
        {canManage && (
          <div className="student-manage">
            <h4>Add Student</h4>
            <div className="student-manage-row">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@email.com"
              />
              <button className="btn-primary" type="button" onClick={addStudent} disabled={adding}>
                {adding ? 'Adding...' : 'Add'}
              </button>
            </div>
            {msg && <div className="student-manage-msg">{msg}</div>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="students-list">
      {canManage && (
        <div className="student-manage">
          <h4>Add Student</h4>
          <div className="student-manage-row">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@email.com"
            />
            <button className="btn-primary" type="button" onClick={addStudent} disabled={adding}>
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>
          {msg && <div className="student-manage-msg">{msg}</div>}
        </div>
      )}
      <div className="students-table">
        <div className="table-header">
          <div>Student</div>
          <div>Sessions</div>
          <div>Events</div>
          <div>Last Active</div>
          {canManage && <div></div>}
        </div>
        
        {students.map((student, index) => (
          <div key={index} className="table-row">
            <div className="student-info">
              <div className="student-avatar">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="student-name">{student.name}</div>
                {student.email && (
                  <div className="student-email">{student.email}</div>
                )}
              </div>
            </div>
            <div>{student.total_sessions}</div>
            <div>{student.total_events}</div>
            <div>
              {student.last_active 
                ? new Date(student.last_active).toLocaleDateString()
                : 'Never'}
            </div>
            {canManage && (
              <div>
                <button className="btn-secondary btn-danger-inline" type="button" onClick={() => removeStudent(student)}>
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ModulesTab = ({ classId, joinCode, totalStudents }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [expandedId, setExpandedId] = useState('');
  const [studentRows, setStudentRows] = useState({});

  const loadTasks = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `/api/classes/${classId}/module-tasks`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { only_active: showActiveOnly ? true : undefined }
        }
      );
      setModules(response.data || []);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to load class module tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!classId) return;
    loadTasks();
  }, [classId, showActiveOnly]);

  const copyModuleLink = async (moduleId) => {
    try {
      const url = `${window.location.origin}/game/${moduleId}`;
      await navigator.clipboard.writeText(url);
      setCopiedId(moduleId);
      setTimeout(() => setCopiedId(''), 1800);
    } catch (error) {
      setMessage('Copy failed. Please copy the link manually.');
    }
  };

  const openModule = (moduleId) => {
    const url = `/game/${moduleId}`;
    window.open(url, '_blank');
  };

  const toggleActive = async (mod, nextActive) => {
    setMessage('');
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(
        `/api/classes/${classId}/module-tasks/${mod.module_id}`,
        { is_active: nextActive },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setModules((prev) => prev.map((m) => (m.module_id === mod.module_id ? { ...m, is_active: nextActive } : m)));
      if (showActiveOnly && !nextActive) {
        await loadTasks();
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to update task status.');
    }
  };

  const loadStudentStatus = async (moduleId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `/api/classes/${classId}/module-tasks/${moduleId}/students`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setStudentRows((prev) => ({ ...prev, [moduleId]: response.data || [] }));
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to load student activity.');
    }
  };

  const toggleExpand = async (moduleId) => {
    const next = expandedId === moduleId ? '' : moduleId;
    setExpandedId(next);
    if (next && !studentRows[next]) {
      await loadStudentStatus(next);
    }
  };

  if (loading) {
    return <div className="empty-tab-state"><p>Loading modules...</p></div>;
  }

  return (
    <div className="modules-tab">
      <div className="modules-tab-head">
        <div>
          <h3>Class Tasks</h3>
          <p>Students should join this class first using code <strong>{joinCode}</strong>.</p>
        </div>
        <div className="modules-tab-controls">
          <label className="toggle">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
            />
            <span>Active only</span>
          </label>
        </div>
      </div>

      {message && <div className="modules-message">{message}</div>}

      {!modules.length ? (
        <div className="empty-tab-state">
          <BookOpen size={64} color="#ccc" />
          <h3>No modules found</h3>
          <p>Enable published modules for this organization first.</p>
        </div>
      ) : (
        <div className="modules-grid">
          {modules.map((mod) => (
            <div key={mod.module_id} className="module-card">
              <div className="module-card-top">
                <div className="module-title">{mod.title}</div>
                <div className="module-meta">{mod.subject}</div>
              </div>

              <div className="module-row">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={!!mod.is_active}
                    onChange={(e) => toggleActive(mod, e.target.checked)}
                  />
                  <span>Active</span>
                </label>
                <div className="module-progress">
                  Played {mod.played_students} / {mod.total_students || totalStudents}
                </div>
              </div>

              <div className="module-actions">
                <button className="btn-secondary" type="button" onClick={() => copyModuleLink(mod.module_id)}>
                  <Copy size={16} />
                  {copiedId === mod.module_id ? 'Copied' : 'Copy Link'}
                </button>
                <button className="btn-secondary" type="button" onClick={() => toggleExpand(mod.module_id)}>
                  <Users size={16} />
                  {expandedId === mod.module_id ? 'Hide Students' : 'View Students'}
                </button>
                <button className="btn-primary" type="button" onClick={() => openModule(mod.module_id)}>
                  <ExternalLink size={16} /> Open
                </button>
              </div>

              {expandedId === mod.module_id && (
                <div className="module-students">
                  <div className="module-students-head">
                    <span>Student</span>
                    <span>Played</span>
                    <span>Sessions</span>
                    <span>Events</span>
                    <span>Last Active</span>
                  </div>
                  {(studentRows[mod.module_id] || []).map((s) => (
                    <div key={s.user_id} className="module-students-row">
                      <span>{s.name}</span>
                      <span>{s.played ? 'Yes' : 'No'}</span>
                      <span>{s.total_sessions}</span>
                      <span>{s.total_events}</span>
                      <span>{s.last_active ? new Date(s.last_active).toLocaleDateString() : '—'}</span>
                    </div>
                  ))}
                  {studentRows[mod.module_id] && studentRows[mod.module_id].length === 0 && (
                    <div className="module-students-empty">No students in this class yet.</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AnalyticsTab = ({ classId, students }) => {
  const totalSessions = students.reduce((sum, s) => sum + s.total_sessions, 0);
  const totalEvents = students.reduce((sum, s) => sum + s.total_events, 0);
  const avgSessionsPerStudent = students.length > 0 
    ? (totalSessions / students.length).toFixed(1) 
    : 0;

  return (
    <div className="analytics-content">
      <h3>Class Analytics</h3>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-number">{totalSessions}</div>
          <div className="analytics-label">Total Sessions</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-number">{totalEvents.toLocaleString()}</div>
          <div className="analytics-label">Total Events Collected</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-number">{avgSessionsPerStudent}</div>
          <div className="analytics-label">Avg Sessions/Student</div>
        </div>

        <div className="analytics-card">
          <div className="analytics-number">
            {students.filter(s => s.last_active).length}
          </div>
          <div className="analytics-label">Active Students</div>
        </div>
      </div>

      <div className="analytics-notice">
        <p>
          📊 Detailed analytics dashboard with charts and engagement metrics 
          will be available in a future update.
        </p>
      </div>
    </div>
  );
};

export default ClassDetails;
