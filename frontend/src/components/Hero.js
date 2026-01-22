import React from 'react';
import { Search } from 'lucide-react';
import './Hero.css';

const Hero = ({ searchQuery, setSearchQuery }) => {
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by parent component
  };

  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="container hero-content">
        <h1>Interactive Learning for all subjects</h1>
        <p>Engage with premium educational tools designed for exploration and discovery.</p>
        
        <form className="hero-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search simulations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-search">
            <Search size={20} />
          </button>
        </form>

        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-num">80+</span>
            <span className="stat-label">Research-Backed Modules</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-num">15+</span>
            <span className="stat-label">Educational Partners</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
