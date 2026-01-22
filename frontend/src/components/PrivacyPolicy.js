import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Database, Mail } from 'lucide-react';
import './PolicyPage.css';

const PrivacyPolicy = () => {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <div className="policy-header">
          <Lock size={48} className="policy-icon" />
          <h1>Privacy Policy</h1>
          <p className="policy-date">Last Updated: January 20, 2026</p>
        </div>

        <div className="policy-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              PING (Personalized Instruction and Need-aware Gamification) is committed to protecting 
              your privacy. This Privacy Policy explains how we collect, use, and safeguard your 
              information when you use our educational platform.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Account Information</h3>
            <ul>
              <li>Email address</li>
              <li>Full name</li>
              <li>Username</li>
              <li>Password (encrypted)</li>
              <li>Organization affiliation</li>
            </ul>

            <h3>2.2 Learning Data</h3>
            <ul>
              <li>Modules accessed and completed</li>
              <li>Time spent on activities</li>
              <li>Progress and performance metrics</li>
              <li>Quiz and assessment results</li>
            </ul>

            <h3>2.3 Behavior Data</h3>
            <ul>
              <li><strong>Keyboard Events:</strong> Key codes only (e.g., "W", "Space") - NOT text content</li>
              <li><strong>Mouse Events:</strong> Click positions and timing</li>
              <li><strong>Game Events:</strong> Objectives completed, items collected</li>
              <li><strong>Session Data:</strong> Login times, session duration</li>
            </ul>

            <h3>2.4 Technical Data</h3>
            <ul>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device type</li>
              <li>Operating system</li>
            </ul>
          </section>

          <section>
            <h2>3. What We DO NOT Collect</h2>
            <div className="highlight-box">
              <ul>
                <li>❌ Text content you type (e.g., passwords, messages)</li>
                <li>❌ Keystroke logging of actual characters</li>
                <li>❌ Screenshots or screen recordings</li>
                <li>❌ Precise geolocation data</li>
                <li>❌ Social Security Numbers or financial information</li>
                <li>❌ Personal conversations or communications</li>
              </ul>
            </div>
          </section>

          <section>
            <h2>4. How We Use Your Information</h2>
            <ul>
              <li>Provide and improve educational services</li>
              <li>Personalize learning experiences</li>
              <li>Generate progress reports for teachers</li>
              <li>Conduct educational research (anonymized)</li>
              <li>Ensure platform security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2>5. K-12 Student Privacy</h2>
            <div className="k12-box">
              <Shield size={24} />
              <div>
                <h3>Special Protections for Students</h3>
                <p>
                  We comply with FERPA, COPPA, and other student privacy laws. For students under 18:
                </p>
                <ul>
                  <li>Minimal data collection (only what's necessary for education)</li>
                  <li>No advertising or marketing</li>
                  <li>No data sales to third parties</li>
                  <li>Parental consent required where applicable</li>
                  <li>Data deletion upon request</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2>6. Data Sharing and Disclosure</h2>
            
            <h3>6.1 We Share Data With:</h3>
            <ul>
              <li><strong>Teachers/Instructors:</strong> Your progress and performance</li>
              <li><strong>Organization Admins:</strong> Aggregated, anonymized data</li>
              <li><strong>Service Providers:</strong> Cloud hosting, analytics (under strict agreements)</li>
            </ul>

            <h3>6.2 We DO NOT:</h3>
            <ul>
              <li>Sell your data to third parties</li>
              <li>Use your data for advertising</li>
              <li>Share personally identifiable information publicly</li>
            </ul>
          </section>

          <section>
            <h2>7. Data Security</h2>
            <ul>
              <li>🔒 Encryption in transit (HTTPS/TLS)</li>
              <li>🔒 Encryption at rest (database encryption)</li>
              <li>🔒 Password hashing (bcrypt)</li>
              <li>🔒 Regular security audits</li>
              <li>🔒 Access controls and authentication</li>
            </ul>
          </section>

          <section>
            <h2>8. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide services. 
              Default retention periods:
            </p>
            <ul>
              <li><strong>Account Data:</strong> Until account deletion</li>
              <li><strong>Learning Data:</strong> 1-3 years (configurable by organization)</li>
              <li><strong>Behavior Data:</strong> 1 year (anonymized after 6 months)</li>
              <li><strong>Guest Data:</strong> 90 days</li>
            </ul>
          </section>

          <section>
            <h2>9. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>✓ Access your personal data</li>
              <li>✓ Correct inaccurate data</li>
              <li>✓ Request data deletion</li>
              <li>✓ Export your data</li>
              <li>✓ Opt-out of optional data collection</li>
              <li>✓ Withdraw consent at any time</li>
            </ul>
            <p>
              To exercise these rights, contact us at <a href="mailto:privacy@ping.agaii.org">privacy@ping.agaii.org</a>
            </p>
          </section>

          <section>
            <h2>10. Cookies and Tracking</h2>
            <p>
              We use cookies for authentication and essential functionality. See our{' '}
              <Link to="/cookie-policy">Cookie Policy</Link> for details.
            </p>
          </section>

          <section>
            <h2>11. Third-Party Services</h2>
            <p>We may use the following third-party services:</p>
            <ul>
              <li>Cloud hosting (AWS, Google Cloud, etc.)</li>
              <li>Analytics (Google Analytics with IP anonymization)</li>
              <li>Authentication (Google OAuth)</li>
            </ul>
            <p>These services have their own privacy policies and data practices.</p>
          </section>

          <section>
            <h2>12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant 
              changes via email or platform notification. Your continued use after changes indicates 
              acceptance.
            </p>
          </section>

          <section>
            <h2>13. Contact Us</h2>
            <div className="contact-box">
              <Mail size={24} />
              <div>
                <p><strong>Privacy Questions?</strong></p>
                <p>Email: <a href="mailto:privacy@ping.agaii.org">privacy@ping.agaii.org</a></p>
                <p>Address: Rowan University, Glassboro, NJ 08028</p>
              </div>
            </div>
          </section>
        </div>

        <div className="policy-footer">
          <Link to="/" className="back-link">← Back to Home</Link>
          <div className="policy-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookie-policy">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
