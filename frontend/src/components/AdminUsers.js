import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Users, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminUsers.css';

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'org_admin', label: 'Org Admin' },
  { value: 'platform_admin', label: 'Platform Admin' }
];

const AdminUsers = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'org_admin' || user?.role === 'platform_admin';
  const isPlatformAdmin = user?.role === 'platform_admin';
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const orgNameById = useMemo(() => {
    const map = new Map();
    (organizations || []).forEach((org) => {
      map.set(org.id, org.name);
    });
    return map;
  }, [organizations]);

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get('/api/admin/organizations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setOrganizations(response.data || []);
    } catch (error) {
      // Non-blocking: user list can still load.
      console.error('Failed to load organizations', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        params: query ? { q: query } : undefined
      });
      setUsers(response.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to load users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchOrganizations();
      fetchUsers();
    }
  }, [isAdmin]);

  const handleUserChange = (id, field, value) => {
    setUsers((prev) => prev.map((item) => (
      item.id === id ? { ...item, [field]: value } : item
    )));
  };

  const saveUser = async (userRow) => {
    setMessage({ type: '', text: '' });
    try {
      await axios.put(`/api/admin/users/${userRow.id}`, {
        role: userRow.role,
        is_active: userRow.is_active,
        is_verified: userRow.is_verified,
        organization_id: userRow.organization_id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setMessage({ type: 'success', text: `Saved user ${userRow.email || userRow.username}` });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to update user.' });
    }
  };

  const deactivateUser = async (userRow) => {
    setMessage({ type: '', text: '' });
    const label = userRow.email || userRow.username || `User ${userRow.id}`;
    if (!window.confirm(`Deactivate ${label}? This will disable login for this user.`)) {
      return;
    }

    try {
      const response = await axios.delete(`/api/admin/users/${userRow.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      const updated = response.data;
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setMessage({ type: 'success', text: `Deactivated ${label}` });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to deactivate user.' });
    }
  };

  const hardDeleteUser = async (userRow) => {
    setMessage({ type: '', text: '' });
    const label = userRow.email || userRow.username || `User ${userRow.id}`;
    if (!window.confirm(`PERMANENTLY delete ${label}? This cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${userRow.id}/hard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setUsers((prev) => prev.filter((item) => item.id !== userRow.id));
      setMessage({ type: 'success', text: `Deleted ${label}` });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to delete user.' });
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-users">
        <div className="admin-users-card">
          <h2>Admin access required.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="admin-users-header">
        <div>
          <h1><Users size={20} /> User Management</h1>
          <p>View and manage all users in the system.</p>
        </div>
      </div>

      <div className="admin-users-toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email"
        />
        <button className="btn-secondary" onClick={fetchUsers} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {message.text && (
        <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
          {message.text}
        </div>
      )}

      <div className="admin-users-table">
        <div className="admin-users-row admin-users-head">
          <span>User</span>
          <span>Role</span>
          <span>Active</span>
          <span>Verified</span>
          <span>Organization</span>
          <span>Actions</span>
        </div>
        {users.map((userRow) => (
          <div key={userRow.id} className="admin-users-row">
            <div>
              <strong>{userRow.full_name || userRow.username || 'Unknown'}</strong>
              <div className="admin-users-email">{userRow.email || '—'}</div>
            </div>
            <select
              value={userRow.role}
              onChange={(event) => handleUserChange(userRow.id, 'role', event.target.value)}
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            <label className="toggle">
              <input
                type="checkbox"
                checked={userRow.is_active}
                onChange={(event) => handleUserChange(userRow.id, 'is_active', event.target.checked)}
              />
              <span>Active</span>
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={userRow.is_verified}
                onChange={(event) => handleUserChange(userRow.id, 'is_verified', event.target.checked)}
              />
              <span>Verified</span>
            </label>
            <div>
              {isPlatformAdmin ? (
                <select
                  value={userRow.organization_id || ''}
                  onChange={(event) => handleUserChange(userRow.id, 'organization_id', event.target.value ? Number(event.target.value) : null)}
                >
                  <option value="">—</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name} (#{org.id})</option>
                  ))}
                </select>
              ) : (
                <div className="admin-users-org">
                  {orgNameById.get(userRow.organization_id) || (userRow.organization_id ? `Org #${userRow.organization_id}` : '—')}
                </div>
              )}
            </div>

            <div className="admin-users-actions">
              <button className="btn-primary" onClick={() => saveUser(userRow)}>
                <Save size={16} /> Save
              </button>
              <button className="btn-danger" type="button" onClick={() => deactivateUser(userRow)}>
                <Trash2 size={16} /> Deactivate
              </button>
              {isPlatformAdmin && (
                <button className="btn-danger" type="button" onClick={() => hardDeleteUser(userRow)}>
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
