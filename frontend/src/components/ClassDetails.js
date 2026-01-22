import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, Activity, Copy, RefreshCw, 
  Settings, Trash2, UserPlus, BookOpen 
} from 'lucide-react';
import axios from 'axios';
import './ClassDetails.css';

const ClassDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [copySuccess, setCopySuccess] = useState(false);

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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching class details:', error);
      setLoading(false);
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
        </div>

        <div className="class-actions">
          <button className="btn-icon" onClick={handleDeleteClass} title="Delete Class">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

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
            <StudentsTab students={students} />
          )}
          {activeTab === 'modules' && (
            <ModulesTab classId={classId} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab classId={classId} students={students} />
          )}
        </div>
      </div>
    </div>
  );
};

const StudentsTab = ({ students }) => {
  if (students.length === 0) {
    return (
      <div className="empty-tab-state">
        <Users size={64} color="#ccc" />
        <h3>No students yet</h3>
        <p>Students will appear here once they join using the class code</p>
      </div>
    );
  }

  return (
    <div className="students-list">
      <div className="students-table">
        <div className="table-header">
          <div>Student</div>
          <div>Sessions</div>
          <div>Events</div>
          <div>Last Active</div>
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
          </div>
        ))}
      </div>
    </div>
  );
};

const ModulesTab = ({ classId }) => {
  return (
    <div className="empty-tab-state">
      <BookOpen size={64} color="#ccc" />
      <h3>Module assignment coming soon</h3>
      <p>Assign learning modules to your class</p>
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
