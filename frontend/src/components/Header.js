import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ChevronDown, Sparkles, LogOut, Settings, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = ({ currentPage, setCurrentPage, setSearchQuery, onLoginClick }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const { user, isAuthenticated, isGuest, logout } = useAuth();
  const isAdmin = isAuthenticated && user && (user.role === 'org_admin' || user.role === 'platform_admin');
  const userMenuRef = useRef(null);

  // 点击外部关闭用户菜单
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subjects');
        if (!response.ok) return;
        const data = await response.json();
        setSubjects(data || []);
      } catch (error) {
        // ignore errors for nav list
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleNavClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <header className="header">
      <nav className="container nav-container">
        <div className="logo">
          <img src="/images/logo.png" alt="PING Logo" className="main-logo" />
          <div className="brand-divider"></div>
          <div className="brand-info">
            <span className="brand-title">
              Personalized Instruction and<br />Need-aware Gamification
            </span>
          </div>
        </div>
        
        <ul className="nav-links">
          <li className="dropdown">
            <Link to="/" className={currentPage === 'simulations' ? 'active' : ''}>
              MODULES <ChevronDown size={16} />
            </Link>
            <div className="dropdown-content">
              <Link to="/?subject=all">All Sims</Link>
              <hr />
              {subjects.map((subject) => (
                <Link key={subject.key} to={`/?subject=${subject.key}`}>{subject.name}</Link>
              ))}
            </div>
          </li>
          <li>
            <Link to="/studio" className="nav-studio">
              STUDIO <Sparkles size={16} className="icon-spark" />
            </Link>
          </li>
          <li><Link to="/teaching">TEACHING</Link></li>
          {isAdmin && (
            <li><Link to="/dashboard">DASHBOARD</Link></li>
          )}
          <li><Link to="/research">RESEARCH</Link></li>
          <li className="dropdown">
            <Link to="/initiatives">
              INITIATIVES <ChevronDown size={16} />
            </Link>
          </li>
        </ul>

        <div className="nav-actions">
          <button 
            className="icon-btn" 
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search size={20} />
          </button>
          
          {isAuthenticated ? (
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button 
                className="user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <User size={20} />
                <span className="user-name">{user?.full_name || user?.email || 'Login'}</span>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <p className="user-email">{user?.email || 'Not logged in'}</p>
                    {user && <p className="user-role">{user?.role}</p>}
                  </div>
                  <hr />
                  {user ? (
                    <>
                      <Link to="/account" onClick={() => setShowUserMenu(false)}>
                        <Settings size={16} />
                        Account Center
                      </Link>
                      {isAdmin && (
                        <Link to="/admin/telemetry" onClick={() => setShowUserMenu(false)}>
                          <Database size={16} />
                          Telemetry Data
                        </Link>
                      )}
                      <button onClick={() => { logout(); setShowUserMenu(false); }}>
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { setShowUserMenu(false); onLoginClick(); }}>
                      <User size={16} />
                      Login / Sign Up
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button className="user-actions" onClick={onLoginClick}>
              <User size={20} />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
