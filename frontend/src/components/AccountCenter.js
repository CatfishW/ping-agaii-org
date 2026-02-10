import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, ShieldCheck, Trash2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AccountCenter.css';

const AccountCenter = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [profile, setProfile] = useState({
    full_name: '',
    school: '',
    course: '',
    bio: ''
  });
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinMessage, setJoinMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name || '',
        school: user.school || '',
        course: user.course || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleJoinClass = async () => {
    if (!joinCode.trim()) {
      setJoinMessage({ type: 'error', text: 'Enter a class join code.' });
      return;
    }
    try {
      const token = localStorage.getItem('access_token');
      await axios.post('/api/classes/join', { join_code: joinCode.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJoinMessage({ type: 'success', text: 'Joined class successfully.' });
      setJoinCode('');
    } catch (error) {
      setJoinMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to join class.' });
    }
  };

  const handleProfileChange = (event) => {
    setProfile({ ...profile, [event.target.name]: event.target.value });
  };

  const handlePasswordChange = (event) => {
    setPasswords({ ...passwords, [event.target.name]: event.target.value });
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await axios.put('/api/auth/me', profile, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      updateUser(response.data);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put('/api/auth/password', passwords, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setPasswords({ current_password: '', new_password: '' });
      setMessage({ type: 'success', text: 'Password updated.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to update password.' });
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Deactivate your account? You can contact support to restore it.')) {
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.delete('/api/auth/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      logout();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to deactivate account.' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="account-center">
        <div className="account-header">
          <h1>Account Center</h1>
          <p>Please sign in to manage your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-center">
      <div className="account-header">
        <h1>Account Center</h1>
        <p>Manage your profile, security, and account settings.</p>
      </div>

      {message.text && (
        <div className={`account-message ${message.type}`}>{message.text}</div>
      )}

      <div className="account-layout">
        <aside className="account-sidebar">
          <button
            className={`sidebar-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <User size={16} /> Profile
          </button>
          <button
            className={`sidebar-item ${activeSection === 'security' ? 'active' : ''}`}
            onClick={() => setActiveSection('security')}
          >
            <ShieldCheck size={16} /> Security
          </button>
        </aside>

        <div className="account-content">
          {activeSection === 'profile' && (
            <>
              <section className="account-card">
                <h2><User size={18} /> Profile</h2>
                <label>
                  Full name
                  <input name="full_name" value={profile.full_name} onChange={handleProfileChange} />
                </label>
                <label>
                  School
                  <input name="school" value={profile.school} onChange={handleProfileChange} />
                </label>
                <label>
                  Course
                  <input name="course" value={profile.course} onChange={handleProfileChange} />
                </label>
                <label>
                  Bio
                  <textarea name="bio" value={profile.bio} onChange={handleProfileChange} rows="3" />
                </label>
                <button className="btn-primary" disabled={saving} onClick={saveProfile}>
                  Save profile
                </button>
              </section>

              {user?.role === 'student' && (
                <section className="account-card">
                  <h2><Users size={18} /> Join a Class</h2>
                  <p className="muted">Enter the join code your teacher gave you to join a class.</p>
                  <form
                    className="form-row"
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleJoinClass();
                    }}
                  >
                    <input
                      value={joinCode}
                      onChange={(event) => {
                        setJoinCode(event.target.value);
                        if (joinMessage.text) setJoinMessage({ type: '', text: '' });
                      }}
                      placeholder="Class join code"
                      autoComplete="off"
                    />
                    <button className="btn-primary" type="submit" disabled={saving}>
                      Join
                    </button>
                  </form>
                  {joinMessage.text && (
                    <div className={joinMessage.type === 'success' ? 'success-message' : 'error-message'}>
                      {joinMessage.text}
                    </div>
                  )}
                </section>
              )}
            </>
          )}

          

          {activeSection === 'security' && (
            <section className="account-card">
              <h2><ShieldCheck size={18} /> Security</h2>
              <label>
                Current password
                <input type="password" name="current_password" value={passwords.current_password} onChange={handlePasswordChange} />
              </label>
              <label>
                New password
                <input type="password" name="new_password" value={passwords.new_password} onChange={handlePasswordChange} />
              </label>
              <button className="btn-primary" disabled={saving} onClick={updatePassword}>
                Update password
              </button>
              <div className="account-divider"></div>
              <button className="btn-danger" disabled={saving} onClick={deleteAccount}>
                <Trash2 size={16} /> Deactivate account
              </button>
              <p className="account-note">Email: {user?.email || '—'}</p>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default AccountCenter;
