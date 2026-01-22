import React from 'react';
import './Initiatives.css';

const Initiatives = () => {
  return (
    <div className="initiatives-page">
      <div className="container">
        <header className="initiatives-header">
          <h1>Research Initiatives</h1>
          <p className="subtitle">
            Advancing STEM education through innovative research and collaboration
          </p>
        </header>

        <section className="initiative-section">
          <h2>Current Projects</h2>
          <div className="initiatives-grid">
            
            <div className="initiative-card">
              <div className="initiative-icon">🎓</div>
              <h3>Personalized Learning Pathways</h3>
              <p>
                Developing adaptive learning algorithms that customize educational 
                experiences based on individual student needs and learning styles.
              </p>
              <ul className="initiative-details">
                <li>Machine learning-based content recommendation</li>
                <li>Real-time difficulty adjustment</li>
                <li>Learning style detection and adaptation</li>
              </ul>
            </div>

            <div className="initiative-card">
              <div className="initiative-icon">🎮</div>
              <h3>Gamification in STEM Education</h3>
              <p>
                Researching the impact of game mechanics and interactive simulations 
                on student engagement and learning outcomes in science education.
              </p>
              <ul className="initiative-details">
                <li>Behavioral data collection and analysis</li>
                <li>Engagement metrics development</li>
                <li>Game design best practices for education</li>
              </ul>
            </div>

            <div className="initiative-card">
              <div className="initiative-icon">📊</div>
              <h3>Learning Analytics</h3>
              <p>
                Building comprehensive analytics tools to help educators understand 
                student progress and identify areas needing intervention.
              </p>
              <ul className="initiative-details">
                <li>Predictive models for student success</li>
                <li>Real-time performance dashboards</li>
                <li>Intervention recommendation systems</li>
              </ul>
            </div>

            <div className="initiative-card">
              <div className="initiative-icon">🤝</div>
              <h3>Collaborative Learning Environments</h3>
              <p>
                Designing and testing collaborative features that enhance peer 
                learning and group problem-solving in virtual environments.
              </p>
              <ul className="initiative-details">
                <li>Multi-user simulation frameworks</li>
                <li>Peer assessment tools</li>
                <li>Communication pattern analysis</li>
              </ul>
            </div>

            <div className="initiative-card">
              <div className="initiative-icon">🌍</div>
              <h3>Accessibility in STEM</h3>
              <p>
                Ensuring equitable access to quality STEM education through inclusive 
                design and accessibility research.
              </p>
              <ul className="initiative-details">
                <li>Universal design principles</li>
                <li>Assistive technology integration</li>
                <li>Multilingual content support</li>
              </ul>
            </div>

            <div className="initiative-card">
              <div className="initiative-icon">🔬</div>
              <h3>Virtual Laboratory Development</h3>
              <p>
                Creating immersive virtual lab experiences that provide hands-on 
                learning opportunities for students without physical lab access.
              </p>
              <ul className="initiative-details">
                <li>Physics and chemistry simulations</li>
                <li>Safety training modules</li>
                <li>Experiment design tools</li>
              </ul>
            </div>

          </div>
        </section>

        <section className="collaboration-section">
          <h2>Partnerships & Collaborations</h2>
          <div className="collaboration-grid">
            <div className="collaboration-card">
              <h4>Educational Institutions</h4>
              <p>Partnering with K-12 schools and universities to pilot and evaluate new learning technologies.</p>
            </div>
            <div className="collaboration-card">
              <h4>Research Organizations</h4>
              <p>Collaborating with educational research institutions to advance the science of learning.</p>
            </div>
            <div className="collaboration-card">
              <h4>Technology Partners</h4>
              <p>Working with EdTech companies to integrate cutting-edge tools and platforms.</p>
            </div>
          </div>
        </section>

        <section className="publications-section">
          <h2>Recent Publications</h2>
          <div className="publications-list">
            <div className="publication-item">
              <h4>Adaptive Difficulty in Educational Games: A Meta-Analysis</h4>
              <p className="publication-meta">Journal of Educational Technology • 2025</p>
              <p className="publication-abstract">
                Analysis of how dynamic difficulty adjustment impacts learning outcomes 
                and engagement across different STEM domains.
              </p>
            </div>
            <div className="publication-item">
              <h4>Behavioral Patterns in Interactive Physics Simulations</h4>
              <p className="publication-meta">Science Education Research • 2025</p>
              <p className="publication-abstract">
                Large-scale study of student interaction patterns in physics simulations 
                and their correlation with conceptual understanding.
              </p>
            </div>
            <div className="publication-item">
              <h4>Privacy-Preserving Learning Analytics in K-12 Education</h4>
              <p className="publication-meta">International Conference on Learning Analytics • 2024</p>
              <p className="publication-abstract">
                Framework for collecting and analyzing student data while maintaining 
                FERPA and COPPA compliance.
              </p>
            </div>
          </div>
        </section>

        <section className="get-involved-section">
          <h2>Get Involved</h2>
          <p>
            Interested in collaborating on educational research or implementing PING 
            in your institution? We'd love to hear from you.
          </p>
          <div className="cta-buttons">
            <button className="btn-primary">Contact Research Team</button>
            <button className="btn-secondary">Join Mailing List</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Initiatives;
