import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Database,
  Globe,
  ShieldCheck,
  ServerCog,
  Signal,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/dashboard/overview', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        if (!response.ok) {
          throw new Error('Unable to load dashboard data');
        }

        const data = await response.json();
        setOverview(data);
      } catch (err) {
        setError(err.message || 'Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const trend = overview?.trend || [];
  const maxEvents = useMemo(() => {
    if (!trend.length) return 1;
    return Math.max(...trend.map(point => point.events), 1);
  }, [trend]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">{error}</div>
      </div>
    );
  }

  const generatedAt = overview?.generated_at
    ? new Date(overview.generated_at).toLocaleString()
    : '—';

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="hero-tag">
            <Signal size={18} />
            Unified Observability
          </div>
          <h1>Networked Learning Dashboard</h1>
          <p>
            One read-only control plane for PING and SPARC Web. Monitor sessions,
            engagement, and data health without touching production workloads.
          </p>
          <div className="hero-meta">
            <div>
              <span>Signed in as</span>
              <strong>{user?.full_name || user?.email || 'Administrator'}</strong>
            </div>
            <div>
              <span>Read replica</span>
              <strong>{overview?.read_replica ? 'Enabled' : 'Primary only'}</strong>
            </div>
            <div>
              <span>Generated</span>
              <strong>{generatedAt}</strong>
            </div>
          </div>
        </div>
        <div className="dashboard-hero-panel">
          <div className="panel-card">
            <span>Total Apps</span>
            <strong>{overview?.totals?.apps ?? 0}</strong>
          </div>
          <div className="panel-card">
            <span>Users</span>
            <strong>{overview?.totals?.users ?? 0}</strong>
          </div>
          <div className="panel-card">
            <span>Sessions</span>
            <strong>{overview?.totals?.sessions ?? 0}</strong>
          </div>
          <div className="panel-card">
            <span>Events</span>
            <strong>{overview?.totals?.events ?? 0}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Data Pipeline</h2>
            <p>Aligned with the production architecture for safe, read-only analytics.</p>
          </div>
          <span className="section-badge">Read Only</span>
        </div>
        <div className="pipeline-grid">
          <div className="pipeline-node">
            <Globe size={20} />
            <div>
              <h3>Ingress</h3>
              <p>NGINX TLS + routing</p>
            </div>
          </div>
          <div className="pipeline-node">
            <ServerCog size={20} />
            <div>
              <h3>Core Data Service</h3>
              <p>Single-writer API</p>
            </div>
          </div>
          <div className="pipeline-node">
            <Database size={20} />
            <div>
              <h3>Primary + Replica</h3>
              <p>Write + reporting store</p>
            </div>
          </div>
          <div className="pipeline-node">
            <Activity size={20} />
            <div>
              <h3>Dashboard UI</h3>
              <p>Read-only analytics</p>
            </div>
          </div>
          <div className="pipeline-node">
            <ShieldCheck size={20} />
            <div>
              <h3>Observability</h3>
              <p>Prometheus + Grafana</p>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Usage Trend</h2>
            <p>Event volume over the last two weeks.</p>
          </div>
        </div>
        <div className="trend-card">
          <div className="trend-chart">
            {trend.map((point) => (
              <div
                className="trend-bar"
                key={point.date}
                title={`${point.date}: ${point.events} events`}
                style={{ height: `${(point.events / maxEvents) * 100}%` }}
              />
            ))}
          </div>
          <div className="trend-footer">
            <span>{trend.length ? trend[0].date : ''}</span>
            <span>{trend.length ? trend[trend.length - 1].date : ''}</span>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Connected Apps</h2>
            <p>Live health and usage across each property.</p>
          </div>
        </div>
        <div className="apps-grid">
          {(overview?.apps || []).map((app) => (
            <div className={`app-card ${app.connected ? 'connected' : 'pending'}`} key={app.slug}>
              <div className="app-card-header">
                <div>
                  <span className="app-pill">{app.slug.toUpperCase()}</span>
                  <h3>{app.name}</h3>
                  <p>{app.base_url || 'No base URL set'}</p>
                </div>
                <span className={`app-status ${app.connected ? 'live' : 'idle'}`}>
                  {app.connected ? 'Connected' : 'Pending'}
                </span>
              </div>
              <div className="app-metrics">
                <div>
                  <span>Users</span>
                  <strong>{app.users}</strong>
                </div>
                <div>
                  <span>Sessions</span>
                  <strong>{app.sessions}</strong>
                </div>
                <div>
                  <span>Events</span>
                  <strong>{app.events}</strong>
                </div>
              </div>
              <div className="app-footer">
                <div>
                  <span>Last activity</span>
                  <strong>
                    {app.last_event_at ? new Date(app.last_event_at).toLocaleString() : 'No data'}
                  </strong>
                </div>
                <ArrowUpRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
