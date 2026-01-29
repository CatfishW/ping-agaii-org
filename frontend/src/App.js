import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import Initiatives from './components/Initiatives';
import Dashboard from './components/Dashboard';
import './App.css';

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
            <Route path="/teaching" element={<TeacherDashboard />} />
            <Route path="/teaching/classes/:classId" element={<ClassDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/research" element={<div className="container"><h1>Research</h1></div>} />
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
