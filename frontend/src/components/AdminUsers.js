import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Save } from 'lucide-react';
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
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

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
          <span>Org ID</span>
          <span>Save</span>
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
            <input
              type="number"
              value={userRow.organization_id || ''}
              onChange={(event) => handleUserChange(userRow.id, 'organization_id', event.target.value ? Number(event.target.value) : null)}
            />
            <button className="btn-primary" onClick={() => saveUser(userRow)}>
              <Save size={16} /> Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
