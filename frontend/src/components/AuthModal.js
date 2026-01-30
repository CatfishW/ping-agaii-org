import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, defaultMode = 'login', redirectUrl = '' }) => {
  const [mode, setMode] = useState(defaultMode); // 'login', 'register', or 'reset'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    confirmPassword: '',
    invite_code: ''
  });
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [overlayClick, setOverlayClick] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const { login, register } = useAuth();

  useEffect(() => {
    if (defaultMode) {
      setMode(defaultMode);
    }
  }, [defaultMode, isOpen]);



  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const result = await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        invite_code: formData.invite_code
      });

      if (result.success) {
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }
        onClose();
      } else {
        setError(result.error);
      }
    } else if (mode === 'login') {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }
        onClose();
      } else {
        setError(result.error);
      }
    }

    setLoading(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetMessage('');

    try {
      await axios.post('/api/auth/password-reset', { email: resetEmail });
      setResetMessage('A new password has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };


  const handleOverlayMouseDown = (event) => {
    setOverlayClick(event.target === event.currentTarget);
  };

  const handleOverlayMouseUp = (event) => {
    if (overlayClick && event.target === event.currentTarget) {
      onClose();
    }
    setOverlayClick(false);
  };

  return (
    <div
      className="auth-modal-overlay"
      onMouseDown={handleOverlayMouseDown}
      onMouseUp={handleOverlayMouseUp}
    >
      <div className="auth-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="auth-modal-header">
          <h2>{mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}</h2>
          <p>{mode === 'login' ? 'Sign in to continue' : mode === 'register' ? 'Join PING today' : 'We will email you a new password'}</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {resetMessage && <div className="auth-success">{resetMessage}</div>}

        {mode === 'reset' ? (
          <form onSubmit={handleResetSubmit} className="auth-form">
            <div className="form-group">
              <label>
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                name="reset_email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send New Password'}
            </button>
            <div className="auth-footer">
              <button type="button" onClick={() => setMode('login')}>Back to sign in</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label>
                <User size={18} />
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>
              <Mail size={18} />
              {mode === 'login' ? 'Email or Username' : 'Email'}
            </label>
            <input
              type={mode === 'login' ? 'text' : 'email'}
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={mode === 'login' ? 'Email or username' : 'Enter your email'}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>
                <Lock size={18} />
                Invite Code
              </label>
              <input
                type="text"
                name="invite_code"
                value={formData.invite_code}
                onChange={handleChange}
                placeholder="Enter your invite code"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>
              <Lock size={18} />
              Password
            </label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {mode === 'register' && (
              <small>Password must be at least 8 characters</small>
            )}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>
                <Lock size={18} />
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        )}

        {mode !== 'reset' && (
          <div className="auth-footer">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button onClick={() => setMode('register')}>Sign up</button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button onClick={() => setMode('login')}>Sign in</button>
              </p>
            )}
            {mode === 'login' && (
              <button className="forgot-link" onClick={() => setMode('reset')}>
                Forgot password?
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
