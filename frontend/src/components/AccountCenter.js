import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, ShieldCheck, Trash2, Mail, Gamepad2, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AccountCenter.css';

const AccountCenter = () => {
  const { user, logout, updateUser } = useAuth();
  const isAdmin = user?.role === 'org_admin' || user?.role === 'platform_admin';
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
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [newSubject, setNewSubject] = useState({
    key: '',
    name: '',
    sort_order: 0,
    is_active: true
  });
  const [newModule, setNewModule] = useState({
    module_id: '',
    title: '',
    subject: 'physics',
    subject_id: null,
    build_path: ''
  });

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

  useEffect(() => {
    if (isAdmin) {
      fetchTemplates();
      fetchModules();
      fetchSubjects();
    }
  }, [isAdmin]);

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const response = await axios.get('/api/admin/email-templates', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const fetchModules = async () => {
    setModulesLoading(true);
    try {
      const response = await axios.get('/api/admin/modules', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setModules(response.data || []);
    } catch (error) {
      console.error('Failed to load modules:', error);
    } finally {
      setModulesLoading(false);
    }
  };

  const fetchSubjects = async () => {
    setSubjectsLoading(true);
    try {
      const response = await axios.get('/api/admin/subjects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setSubjects(response.data || []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleSubjectChange = (id, field, value) => {
    setSubjects((prev) => prev.map((subject) => (
      subject.id === id ? { ...subject, [field]: value } : subject
    )));
  };

  const saveSubject = async (subject) => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put(`/api/admin/subjects/${subject.id}`, {
        name: subject.name,
        sort_order: subject.sort_order,
        is_active: subject.is_active
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setMessage({ type: 'success', text: `Subject ${subject.key} saved.` });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to save subject.' });
    } finally {
      setSaving(false);
    }
  };

  const createSubject = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await axios.post('/api/admin/subjects', {
        key: newSubject.key,
        name: newSubject.name,
        sort_order: Number(newSubject.sort_order) || 0,
        is_active: newSubject.is_active
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setSubjects((prev) => [response.data, ...prev]);
      setNewSubject({ key: '', name: '', sort_order: 0, is_active: true });
      setMessage({ type: 'success', text: 'Subject created.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to create subject.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateChange = (id, field, value) => {
    setTemplates((prev) => prev.map((tmpl) => (
      tmpl.id === id ? { ...tmpl, [field]: value } : tmpl
    )));
  };

  const saveTemplate = async (template) => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put(`/api/admin/email-templates/${template.key}`, {
        name: template.name,
        subject: template.subject,
        body: template.body,
        is_active: template.is_active
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setMessage({ type: 'success', text: `Template ${template.key} saved.` });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to save template.' });
    } finally {
      setSaving(false);
    }
  };

  const handleModuleChange = (id, field, value) => {
    setModules((prev) => prev.map((module) => (
      module.id === id ? { ...module, [field]: value } : module
    )));
  };

  const saveModule = async (module) => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put(`/api/admin/modules/${module.module_id}`, {
        title: module.title,
        description: module.description,
        subject: module.subject,
        subject_id: module.subject_id,
        build_path: module.build_path,
        is_published: module.is_published,
        version: module.version
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setMessage({ type: 'success', text: `Module ${module.module_id} saved.` });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to save module.' });
    } finally {
      setSaving(false);
    }
  };

  const createModule = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await axios.post('/api/admin/modules', {
        module_id: newModule.module_id,
        title: newModule.title,
        subject: newModule.subject,
        subject_id: newModule.subject_id,
        build_path: newModule.build_path,
        description: ''
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setModules((prev) => [response.data, ...prev]);
      setNewModule({ module_id: '', title: '', subject: 'physics', subject_id: null, build_path: '' });
      setMessage({ type: 'success', text: 'Module created.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to create module.' });
    } finally {
      setSaving(false);
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
          {isAdmin && (
            <>
              <button
                className={`sidebar-item ${activeSection === 'templates' ? 'active' : ''}`}
                onClick={() => setActiveSection('templates')}
              >
                <Mail size={16} /> Email Templates
              </button>
              <button
                className={`sidebar-item ${activeSection === 'modules' ? 'active' : ''}`}
                onClick={() => setActiveSection('modules')}
              >
                <Gamepad2 size={16} /> Game Modules
              </button>
            </>
          )}
        </aside>

        <div className="account-content">
          {activeSection === 'profile' && (
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

          {isAdmin && activeSection === 'templates' && (
            <section className="account-card">
              <h2><Mail size={18} /> Email Templates</h2>
              {templatesLoading ? (
                <p>Loading templates...</p>
              ) : (
                <div className="admin-grid">
                  {templates.map((template) => (
                    <div key={template.id} className="admin-card">
                      <div className="admin-card-header">
                        <strong>{template.key}</strong>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={template.is_active}
                            onChange={(event) => handleTemplateChange(template.id, 'is_active', event.target.checked)}
                          />
                          <span>Active</span>
                        </label>
                      </div>
                      <label>
                        Name
                        <input
                          value={template.name}
                          onChange={(event) => handleTemplateChange(template.id, 'name', event.target.value)}
                        />
                      </label>
                      <label>
                        Subject
                        <input
                          value={template.subject}
                          onChange={(event) => handleTemplateChange(template.id, 'subject', event.target.value)}
                        />
                      </label>
                      <label>
                        Body
                        <textarea
                          rows="4"
                          value={template.body}
                          onChange={(event) => handleTemplateChange(template.id, 'body', event.target.value)}
                        />
                      </label>
                      <button className="btn-primary" disabled={saving} onClick={() => saveTemplate(template)}>
                        Save Template
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {isAdmin && activeSection === 'modules' && (
            <section className="account-card">
              <h2><Gamepad2 size={18} /> Game Modules</h2>
              <div className="admin-grid">
                <div className="admin-card">
                  <h3>Subjects</h3>
                  <label>
                    Key
                    <input
                      value={newSubject.key}
                      onChange={(event) => setNewSubject({ ...newSubject, key: event.target.value })}
                      placeholder="physics"
                    />
                  </label>
                  <label>
                    Name
                    <input
                      value={newSubject.name}
                      onChange={(event) => setNewSubject({ ...newSubject, name: event.target.value })}
                      placeholder="Physics"
                    />
                  </label>
                  <label>
                    Sort Order
                    <input
                      type="number"
                      value={newSubject.sort_order}
                      onChange={(event) => setNewSubject({ ...newSubject, sort_order: event.target.value })}
                    />
                  </label>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={newSubject.is_active}
                      onChange={(event) => setNewSubject({ ...newSubject, is_active: event.target.checked })}
                    />
                    <span>Active</span>
                  </label>
                  <button className="btn-primary" disabled={saving} onClick={createSubject}>Create Subject</button>
                </div>

                {subjectsLoading ? (
                  <p>Loading subjects...</p>
                ) : (
                  subjects.map((subject) => (
                    <div key={subject.id} className="admin-card">
                      <div className="admin-card-header">
                        <strong>{subject.key}</strong>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={subject.is_active}
                            onChange={(event) => handleSubjectChange(subject.id, 'is_active', event.target.checked)}
                          />
                          <span>Active</span>
                        </label>
                      </div>
                      <label>
                        Name
                        <input
                          value={subject.name}
                          onChange={(event) => handleSubjectChange(subject.id, 'name', event.target.value)}
                        />
                      </label>
                      <label>
                        Sort Order
                        <input
                          type="number"
                          value={subject.sort_order}
                          onChange={(event) => handleSubjectChange(subject.id, 'sort_order', event.target.value)}
                        />
                      </label>
                      <button className="btn-primary" disabled={saving} onClick={() => saveSubject(subject)}>
                        Save Subject
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="admin-grid">
                <div className="admin-card">
                  <h3>Create Module</h3>
                  <label>
                    Module ID
                    <input
                      value={newModule.module_id}
                      onChange={(event) => setNewModule({ ...newModule, module_id: event.target.value })}
                    />
                  </label>
                  <label>
                    Title
                    <input
                      value={newModule.title}
                      onChange={(event) => setNewModule({ ...newModule, title: event.target.value })}
                    />
                  </label>
                  <label>
                    Subject
                    {subjects.length ? (
                      <select
                        value={newModule.subject_id || ''}
                        onChange={(event) => {
                          const selectedId = Number(event.target.value) || null;
                          const selected = subjects.find((subject) => subject.id === selectedId);
                          setNewModule({
                            ...newModule,
                            subject_id: selectedId,
                            subject: selected ? selected.key : ''
                          });
                        }}
                      >
                        <option value="">Select subject</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={newModule.subject}
                        onChange={(event) => setNewModule({ ...newModule, subject: event.target.value })}
                        placeholder="physics"
                      />
                    )}
                  </label>
                  <label>
                    Build Path
                    <input
                      value={newModule.build_path}
                      onChange={(event) => setNewModule({ ...newModule, build_path: event.target.value })}
                      placeholder="/games/Force&Motion/index.html"
                    />
                  </label>
                  <button className="btn-primary" disabled={saving} onClick={createModule}>Create Module</button>
                </div>

                {modulesLoading ? (
                  <p>Loading modules...</p>
                ) : (
                  modules.map((module) => (
                    <div key={module.id} className="admin-card">
                      <h3>{module.title}</h3>
                      <label>
                        Title
                        <input
                          value={module.title}
                          onChange={(event) => handleModuleChange(module.id, 'title', event.target.value)}
                        />
                      </label>
                      <label>
                        Subject
                        {subjects.length ? (
                          <select
                            value={module.subject_id || ''}
                            onChange={(event) => {
                              const selectedId = Number(event.target.value) || null;
                              const selected = subjects.find((subject) => subject.id === selectedId);
                              handleModuleChange(module.id, 'subject_id', selectedId);
                              handleModuleChange(module.id, 'subject', selected ? selected.key : '');
                            }}
                          >
                            <option value="">Select subject</option>
                            {subjects.map((subject) => (
                              <option key={subject.id} value={subject.id}>{subject.name}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={module.subject}
                            onChange={(event) => handleModuleChange(module.id, 'subject', event.target.value)}
                          />
                        )}
                      </label>
                      <label>
                        Build Path
                        <input
                          value={module.build_path || ''}
                          onChange={(event) => handleModuleChange(module.id, 'build_path', event.target.value)}
                        />
                      </label>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={module.is_published}
                          onChange={(event) => handleModuleChange(module.id, 'is_published', event.target.checked)}
                        />
                        <span>Published</span>
                      </label>
                      <button className="btn-primary" disabled={saving} onClick={() => saveModule(module)}>
                        Save Module
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountCenter;
