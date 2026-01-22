import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        // 如果有 token，获取用户信息
        fetchUserInfo();
      } else {
        // 没有 token，保持未登录状态
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post('/api/auth/login', formData);
      const { access_token } = response.data;

      localStorage.setItem('access_token', access_token);
      setToken(access_token);
      
      // Fetch user info
      const userResponse = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      setUser(userResponse.data);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      await axios.post('/api/auth/register', userData);
      // Auto-login after registration
      return await login(userData.email, userData.password);
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed'
          }
  };

  const loginAsGuest = async () => {
    try {
      const sessionId = `session_${Date.now()}`;
      const response = await axios.post('/api/auth/guest', { session_id: sessionId });
      const { access_token, guest_id } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('guest_id', guest_id);
      setToken(access_token);

      // Fetch guest user info
      const userResponse = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      setUser(userResponse.data);

      return { success: true, guest_id };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Guest login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('guest_id');
    setToken(null);
    setUser(null);
  };

  const submitConsent = async (consentData) => {
    try {
      await axios.post('/api/auth/consent', consentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Consent submission failed'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    loginAsGuest,
    logout,
    submitConsent,
    isAuthenticated: !!user,
    isGuest: user?.role === 'guest'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
