import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Database, FileJson, Table2 } from 'lucide-react';
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
  const [summary, setSummary] = useState(null);
  const [catalog, setCatalog] = useState([]);
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

  useEffect(() => {
    if (!isAdmin) return;
    const loadCatalog = async () => {
      try {
        const response = await axios.get('/api/admin/telemetry/event-catalog', {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        setCatalog(response.data.events || []);
      } catch (error) {
        setCatalog([]);
      }
    };
    loadCatalog();
  }, [isAdmin]);

  const fetchSummary = async () => {
    try {
      const response = await axios.get('/api/admin/telemetry/summary', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        params: {
          module_id: moduleId || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined
        }
      });
      setSummary(response.data);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to load telemetry summary.');
    }
  };

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
      if (nextOffset === 0) {
        await fetchSummary();
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to load telemetry sessions.');
    } finally {
      setLoading(false);
    }
  };

  const downloadStandard = async (format) => {
    try {
      const response = await axios.get('/api/admin/telemetry/exports/standard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        params: {
          module_id: moduleId || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          format
        },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const scope = moduleId || 'all-modules';
      link.href = url;
      link.setAttribute('download', `${scope}-telemetry-standard.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setMessage(`Failed to export ${format.toUpperCase()} telemetry.`);
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

      {summary && (
        <div className="telemetry-summary">
          <div className="telemetry-metric">
            <span>Total Events</span>
            <strong>{summary.total_events}</strong>
          </div>
          <div className="telemetry-metric">
            <span>Sessions</span>
            <strong>{summary.total_sessions}</strong>
          </div>
          <div className="telemetry-metric">
            <span>Modules</span>
            <strong>{summary.total_modules}</strong>
          </div>
          <div className="telemetry-metric">
            <span>Text Inputs</span>
            <strong>{summary.text_input_events}</strong>
          </div>
          <div className="telemetry-actions">
            <button className="btn-secondary" onClick={() => downloadStandard('json')}>
              <FileJson size={16} /> xAPI JSON
            </button>
            <button className="btn-secondary" onClick={() => downloadStandard('csv')}>
              <Table2 size={16} /> CSV
            </button>
          </div>
        </div>
      )}

      {summary && (
        <div className="telemetry-breakdown">
          <div className="telemetry-panel">
            <h3>Event Types</h3>
            {(summary.event_types || []).slice(0, 8).map((item) => (
              <div className="telemetry-stat-row" key={item.event_type}>
                <span>{item.event_type}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
          <div className="telemetry-panel">
            <h3>Modules</h3>
            {(summary.modules || []).slice(0, 8).map((item) => (
              <div className="telemetry-stat-row" key={item.module_id}>
                <span>{item.module_id}</span>
                <strong>{item.events} events / {item.sessions} sessions</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {!!catalog.length && (
        <div className="telemetry-catalog">
          <h3>Collected Data Plan</h3>
          {catalog.map((item) => (
            <div className="telemetry-catalog-row" key={item.event_type}>
              <strong>{item.event_type}</strong>
              <span>{item.description}</span>
              <em>{item.privacy}</em>
            </div>
          ))}
        </div>
      )}

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
          disabled={offset === 0 || loading}
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
