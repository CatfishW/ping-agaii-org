import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminTelemetry.css';

const AdminTelemetry = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'org_admin' || user?.role === 'platform_admin';

  const [modules, setModules] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [moduleId, setModuleId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 50;

  useEffect(() => {
    if (!isAdmin) return;
    const loadModules = async () => {
      try {
        const response = await axios.get('/api/admin/modules', {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        setModules(response.data || []);
      } catch (error) {
        setMessage('Failed to load modules.');
      }
    };
    loadModules();
  }, [isAdmin]);

  const fetchSessions = async (nextOffset = 0) => {
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.get('/api/admin/telemetry/sessions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        params: {
          module_id: moduleId || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          limit,
          offset: nextOffset
        }
      });
      setSessions(response.data.sessions || []);
      setTotal(response.data.total || 0);
      setOffset(nextOffset);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to load telemetry sessions.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSession = async (session) => {
    try {
      const response = await axios.get(`/api/admin/telemetry/sessions/${session.session_id}/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        params: { module_id: session.module_id },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${session.module_id}-${session.session_id}.jsonl.zst`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setMessage('Failed to download session file.');
    }
  };

  const downloadAll = async () => {
    if (!moduleId) {
      setMessage('Select a module to export.');
      return;
    }
    try {
      const response = await axios.get('/api/admin/telemetry/exports', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        params: {
          module_id: moduleId,
          start_date: startDate || undefined,
          end_date: endDate || undefined
        },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${moduleId}-telemetry.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setMessage('Failed to export telemetry files.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="telemetry-page">
        <div className="telemetry-card">
          <h2>Admin Access Required</h2>
          <p>Please sign in with an administrator account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="telemetry-page">
      <div className="telemetry-header">
        <div>
          <h1><Database size={20} /> Telemetry Data</h1>
          <p>Export per-game session files for model training.</p>
        </div>
        <button className="btn-primary" onClick={downloadAll}>
          <Download size={16} /> Export All
        </button>
      </div>

      <div className="telemetry-filters">
        <label>
          Module
          <select value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
            <option value="">All Modules</option>
            {modules.map((mod) => (
              <option key={mod.id} value={mod.module_id}>{mod.title}</option>
            ))}
          </select>
        </label>
        <label>
          Start Date
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button className="btn-secondary" onClick={() => fetchSessions(0)} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {message && <div className="telemetry-message">{message}</div>}

      <div className="telemetry-table">
        <div className="telemetry-row telemetry-head">
          <span>Module</span>
          <span>Session</span>
          <span>Events</span>
          <span>Text Inputs</span>
          <span>Started</span>
          <span>Ended</span>
          <span>File</span>
        </div>
        {sessions.map((session) => (
          <div key={session.session_id} className="telemetry-row">
            <span>{session.module_id}</span>
            <span className="telemetry-session">{session.session_id}</span>
            <span>{session.event_count}</span>
            <span>{session.text_input_count}</span>
            <span>{session.started_at ? new Date(session.started_at).toLocaleString() : '-'}</span>
            <span>{session.ended_at ? new Date(session.ended_at).toLocaleString() : '-'}</span>
            <span>
              <button className="btn-link" onClick={() => downloadSession(session)} disabled={!session.file_exists}>
                Download
              </button>
            </span>
          </div>
        ))}
        {!sessions.length && !loading && (
          <div className="telemetry-empty">No sessions found.</div>
        )}
      </div>

      <div className="telemetry-pagination">
        <button
          className="btn-secondary"
          onClick={() => fetchSessions(Math.max(offset - limit, 0))}
          disabled={offset == 0 || loading}
        >
          Previous
        </button>
        <span>{Math.min(offset + limit, total)} of {total}</span>
        <button
          className="btn-secondary"
          onClick={() => fetchSessions(offset + limit)}
          disabled={offset + limit >= total || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminTelemetry;
