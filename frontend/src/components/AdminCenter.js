import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Shield,
  Users,
  Database,
  Mail,
  Gamepad2,
  Building2,
  Save,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminUsers from './AdminUsers';
import AdminTelemetry from './AdminTelemetry';
import './AdminCenter.css';
import './AccountCenter.css';

const slugify = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '');

const AdminCenter = ({ defaultSection = 'overview' }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'org_admin' || user?.role === 'platform_admin';
  const isPlatformAdmin = user?.role === 'platform_admin';

  const [activeSection, setActiveSection] = useState(defaultSection);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  // Email templates (platform admin only)
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // Modules + subjects (platform admin only)
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '' });
  const [newModule, setNewModule] = useState({
    module_id: '',
    title: '',
    subject: 'physics',
    subject_id: null,
    build_path: ''
  });

  // Organizations (platform admin only)
  const [organizations, setOrganizations] = useState([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', domain: '' });

  const authHeaders = useMemo(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
  }), []);

  const visibleSubjects = useMemo(() => subjects.filter((subject) => subject.is_active), [subjects]);

  useEffect(() => {
    setActiveSection(defaultSection);
  }, [defaultSection]);

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const response = await axios.get('/api/admin/email-templates', authHeaders);
      setTemplates(response.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load email templates.' });
    } finally {
      setTemplatesLoading(false);
    }
  };

  const fetchModules = async () => {
    setModulesLoading(true);
    try {
      const response = await axios.get('/api/admin/modules', authHeaders);
      setModules(response.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load modules.' });
    } finally {
      setModulesLoading(false);
    }
  };

  const fetchSubjects = async () => {
    setSubjectsLoading(true);
    try {
      const response = await axios.get('/api/admin/subjects', authHeaders);
      setSubjects(response.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load subjects.' });
    } finally {
      setSubjectsLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    setOrgLoading(true);
    try {
      const response = await axios.get('/api/admin/organizations', authHeaders);
      setOrganizations(response.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load organizations.' });
    } finally {
      setOrgLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    if (isPlatformAdmin) {
      fetchOrganizations();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    // lazy-load big sections
    if (isPlatformAdmin) {
      if (activeSection === 'templates') fetchTemplates();
      if (activeSection === 'modules') {
        fetchSubjects();
        fetchModules();
      }
    }
  }, [activeSection, isAdmin]);

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
      }, authHeaders);
      setMessage({ type: 'success', text: `Template ${template.key} saved.` });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to save template.' });
    } finally {
      setSaving(false);
    }
  };

  const removeSubject = async (subject) => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put(`/api/admin/subjects/${subject.id}`, { is_active: false }, authHeaders);
      setSubjects((prev) => prev.map((item) => (item.id === subject.id ? { ...item, is_active: false } : item)));
      setMessage({ type: 'success', text: 'Subject removed.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to remove subject.' });
    } finally {
      setSaving(false);
    }
  };

  const createSubject = async () => {
    const trimmed = newSubject.name.trim();
    if (!trimmed) return;

    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        key: slugify(trimmed),
        name: trimmed,
        sort_order: subjects.length * 10,
        is_active: true
      };
      const response = await axios.post('/api/admin/subjects', payload, authHeaders);
      setSubjects((prev) => [response.data, ...prev]);
      setNewSubject({ name: '' });
      setMessage({ type: 'success', text: 'Subject created.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to create subject.' });
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
      }, authHeaders);
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
      }, authHeaders);
      setModules((prev) => [response.data, ...prev]);
      setNewModule({ module_id: '', title: '', subject: 'physics', subject_id: null, build_path: '' });
      setMessage({ type: 'success', text: 'Module created.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to create module.' });
    } finally {
      setSaving(false);
    }
  };

  const handleOrgChange = (id, field, value) => {
    setOrganizations((prev) => prev.map((org) => (
      org.id === id ? { ...org, [field]: value } : org
    )));
  };

  const saveOrg = async (org) => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await axios.put(`/api/admin/organizations/${org.id}`, {
        name: org.name,
        domain: org.domain,
        is_active: org.is_active,
        data_collection_enabled: org.data_collection_enabled
      }, authHeaders);
      setOrganizations((prev) => prev.map((item) => (item.id === org.id ? response.data : item)));
      setMessage({ type: 'success', text: `Organization ${org.name} saved.` });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to save organization.' });
    } finally {
      setSaving(false);
    }
  };

  const createOrg = async () => {
    const name = newOrg.name.trim();
    if (!name) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await axios.post('/api/admin/organizations', {
        name,
        domain: newOrg.domain.trim() || null
      }, authHeaders);
      setOrganizations((prev) => [response.data, ...prev]);
      setNewOrg({ name: '', domain: '' });
      setMessage({ type: 'success', text: 'Organization created.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to create organization.' });
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="account-center">
        <div className="account-header">
          <h1>Admin Center</h1>
          <p>Admin access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-center admin-center">
      <div className="account-header">
        <h1>Admin Center</h1>
        <p>Manage users, modules, data exports, templates, and organizations.</p>
      </div>

      {message.text && (
        <div className={`account-message ${message.type}`}>{message.text}</div>
      )}

      <div className="account-layout">
        <aside className="account-sidebar">
          <button
            className={`sidebar-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            <Shield size={16} /> Overview
          </button>
          <button
            className={`sidebar-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <Users size={16} /> Users
          </button>
          {isPlatformAdmin && (
            <button
              className={`sidebar-item ${activeSection === 'telemetry' ? 'active' : ''}`}
              onClick={() => setActiveSection('telemetry')}
            >
              <Database size={16} /> Data
            </button>
          )}
          {isPlatformAdmin && (
            <button
              className={`sidebar-item ${activeSection === 'templates' ? 'active' : ''}`}
              onClick={() => setActiveSection('templates')}
            >
              <Mail size={16} /> Email Templates
            </button>
          )}
          {isPlatformAdmin && (
            <button
              className={`sidebar-item ${activeSection === 'modules' ? 'active' : ''}`}
              onClick={() => setActiveSection('modules')}
            >
              <Gamepad2 size={16} /> Game Modules
            </button>
          )}
          {isPlatformAdmin && (
            <button
              className={`sidebar-item ${activeSection === 'orgs' ? 'active' : ''}`}
              onClick={() => setActiveSection('orgs')}
            >
              <Building2 size={16} /> Organizations
            </button>
          )}
        </aside>

        <div className="account-content">
          {activeSection === 'overview' && (
            <section className="account-card">
              <h2><Shield size={18} /> Quick Actions</h2>
              <div className="admin-center-cards">
                <button className="admin-center-card" type="button" onClick={() => setActiveSection('users')}>
                  <Users size={18} />
                  <div>
                    <strong>User Management</strong>
                    <div className="muted">Search, deactivate, or delete users.</div>
                  </div>
                </button>
                {isPlatformAdmin && (
                  <button className="admin-center-card" type="button" onClick={() => setActiveSection('telemetry')}>
                    <Database size={18} />
                    <div>
                      <strong>Telemetry Exports</strong>
                      <div className="muted">Download session files or export ZIPs.</div>
                    </div>
                  </button>
                )}
                {isPlatformAdmin && (
                  <button className="admin-center-card" type="button" onClick={() => setActiveSection('modules')}>
                    <Gamepad2 size={18} />
                    <div>
                      <strong>Modules + Subjects</strong>
                      <div className="muted">Publish modules and manage categories.</div>
                    </div>
                  </button>
                )}
                {isPlatformAdmin && (
                  <button className="admin-center-card" type="button" onClick={() => setActiveSection('templates')}>
                    <Mail size={18} />
                    <div>
                      <strong>Email Templates</strong>
                      <div className="muted">Welcome and password reset templates.</div>
                    </div>
                  </button>
                )}
                {isPlatformAdmin && (
                  <button className="admin-center-card" type="button" onClick={() => setActiveSection('orgs')}>
                    <Building2 size={18} />
                    <div>
                      <strong>Organizations</strong>
                      <div className="muted">Create and maintain organization records.</div>
                    </div>
                  </button>
                )}
              </div>
            </section>
          )}

          {activeSection === 'users' && <AdminUsers />}

          {activeSection === 'telemetry' && (
            isPlatformAdmin
              ? <AdminTelemetry />
              : <section className="account-card"><h2>Platform Admin Only</h2><p>You do not have access to data exports.</p></section>
          )}

          {activeSection === 'templates' && (
            isPlatformAdmin ? (
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
                        <Save size={16} /> Save Template
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
            ) : (
              <section className="account-card"><h2>Platform Admin Only</h2><p>You do not have access to email templates.</p></section>
            )
          )}

          {activeSection === 'modules' && (
            isPlatformAdmin ? (
            <section className="account-card">
              <h2><Gamepad2 size={18} /> Game Modules</h2>
              <div className="admin-grid">
                <div className="admin-card subject-manager">
                  <h3>Category Manager</h3>
                  <p className="subject-helper">Add or remove subject tags that modules can use.</p>
                  <div className="subject-input-row">
                    <input
                      value={newSubject.name}
                      onChange={(event) => setNewSubject({ name: event.target.value })}
                      placeholder="Add a subject"
                    />
                    <button className="btn-secondary" disabled={saving} onClick={createSubject}>Add</button>
                  </div>
                  {subjectsLoading ? (
                    <p>Loading subjects...</p>
                  ) : (
                    <div className="subject-list">
                      {visibleSubjects.map((subject) => (
                        <div key={subject.id} className="subject-pill">
                          <span>{subject.name}</span>
                          <button className="btn-secondary" onClick={() => removeSubject(subject)} disabled={saving}>
                            Remove
                          </button>
                        </div>
                      ))}
                      {!visibleSubjects.length && <p className="subject-empty">No subjects configured yet.</p>}
                    </div>
                  )}
                  <p className="subject-footnote">Use these names in module subject fields. Frontend filters use this list.</p>
                </div>
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
                      disabled={!subjects.length}
                    >
                      <option value="">{subjects.length ? 'Select subject' : 'No subjects configured'}</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Build Prefix
                    <input
                      value={newModule.build_path}
                      onChange={(event) => setNewModule({ ...newModule, build_path: event.target.value })}
                      placeholder="/games/Force&Motion/Build/20251122DrivingBuild"
                    />
                  </label>
                  <button className="btn-primary" disabled={saving} onClick={createModule}>
                    <Plus size={16} /> Create Module
                  </button>
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
                        <select
                          value={module.subject_id || ''}
                          onChange={(event) => {
                            const selectedId = Number(event.target.value) || null;
                            const selected = subjects.find((subject) => subject.id === selectedId);
                            handleModuleChange(module.id, 'subject_id', selectedId);
                            handleModuleChange(module.id, 'subject', selected ? selected.key : '');
                          }}
                          disabled={!subjects.length}
                        >
                          <option value="">{subjects.length ? 'Select subject' : 'No subjects configured'}</option>
                          {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>{subject.name}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Build Prefix
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
                        <Save size={16} /> Save Module
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
            ) : (
              <section className="account-card"><h2>Platform Admin Only</h2><p>You do not have access to module management.</p></section>
            )
          )}

          {activeSection === 'orgs' && (
            isPlatformAdmin ? (
            <section className="account-card">
              <h2><Building2 size={18} /> Organizations</h2>

              {isPlatformAdmin && (
                <div className="admin-grid">
                  <div className="admin-card">
                    <h3>Create Organization</h3>
                    <label>
                      Name
                      <input value={newOrg.name} onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })} />
                    </label>
                    <label>
                      Domain (optional)
                      <input value={newOrg.domain} onChange={(e) => setNewOrg({ ...newOrg, domain: e.target.value })} placeholder="school.edu" />
                    </label>
                    <button className="btn-primary" disabled={saving} onClick={createOrg}>
                      <Plus size={16} /> Create
                    </button>
                  </div>
                </div>
              )}

              {orgLoading ? (
                <p>Loading organizations...</p>
              ) : (
                <div className="admin-grid">
                  {organizations.map((org) => (
                    <div key={org.id} className="admin-card">
                      <h3>{org.name} (#{org.id})</h3>
                      <label>
                        Name
                        <input
                          value={org.name}
                          onChange={(e) => handleOrgChange(org.id, 'name', e.target.value)}
                          disabled={!isPlatformAdmin}
                        />
                      </label>
                      <label>
                        Domain
                        <input
                          value={org.domain || ''}
                          onChange={(e) => handleOrgChange(org.id, 'domain', e.target.value)}
                          disabled={!isPlatformAdmin}
                        />
                      </label>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={!!org.is_active}
                          onChange={(e) => handleOrgChange(org.id, 'is_active', e.target.checked)}
                          disabled={!isPlatformAdmin}
                        />
                        <span>Active</span>
                      </label>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={!!org.data_collection_enabled}
                          onChange={(e) => handleOrgChange(org.id, 'data_collection_enabled', e.target.checked)}
                          disabled={!isPlatformAdmin}
                        />
                        <span>Data collection</span>
                      </label>
                      {isPlatformAdmin && (
                        <button className="btn-primary" disabled={saving} onClick={() => saveOrg(org)}>
                          <Save size={16} /> Save
                        </button>
                      )}
                    </div>
                  ))}
                  {!organizations.length && <p>No organizations found.</p>}
                </div>
              )}
            </section>
            ) : (
              <section className="account-card"><h2>Platform Admin Only</h2><p>You do not have access to organization management.</p></section>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCenter;
