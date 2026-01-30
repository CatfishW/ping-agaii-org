import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import SimulationBrowser from './components/SimulationBrowser';
import GameEmbed from './components/GameEmbed';
import AuthModal from './components/AuthModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import CookiePolicy from './components/CookiePolicy';
import TeacherDashboard from './components/TeacherDashboard';
import ClassDetails from './components/ClassDetails';
import TeachingPublic from './components/TeachingPublic';
import Initiatives from './components/Initiatives';
import Dashboard from './components/Dashboard';
import AccountCenter from './components/AccountCenter';
import ResearchHub from './components/ResearchHub';
import './App.css';

const TeachingGate = ({ onLoginClick, children }) => {
  const { isAuthenticated, user } = useAuth();
  const isTeacher = isAuthenticated && user && (
    user.role === 'teacher' ||
    user.role === 'org_admin' ||
    user.role === 'platform_admin'
  );

  if (!isTeacher) {
    return <TeachingPublic onLoginClick={onLoginClick} />;
  }

  return children;
};

function App() {
  const [currentPage, setCurrentPage] = useState('simulations');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            setSearchQuery={setSearchQuery}
            onLoginClick={() => setShowAuthModal(true)}
          />
          <Routes>
            <Route path="/" element={
              <>
                <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <SimulationBrowser searchQuery={searchQuery} />
              </>
            } />
            <Route path="/game/:gameId" element={<GameEmbed />} />
            <Route path="/studio" element={<div className="container"><h1>Studio</h1></div>} />
            <Route
              path="/teaching"
              element={
                <TeachingGate onLoginClick={() => setShowAuthModal(true)}>
                  <TeacherDashboard />
                </TeachingGate>
              }
            />
            <Route
              path="/teaching/classes/:classId"
              element={
                <TeachingGate onLoginClick={() => setShowAuthModal(true)}>
                  <ClassDetails />
                </TeachingGate>
              }
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/account" element={<AccountCenter />} />
            <Route path="/research" element={<ResearchHub />} />
            <Route path="/initiatives" element={<Initiatives />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
          </Routes>
          
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)} 
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
