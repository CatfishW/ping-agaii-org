import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, CheckCircle, XCircle, Settings } from 'lucide-react';
import './PolicyPage.css';

const CookiePolicy = () => {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <div className="policy-header">
          <Cookie size={48} className="policy-icon" />
          <h1>Cookie Policy</h1>
          <p className="policy-date">Last Updated: January 20, 2026</p>
        </div>

        <div className="policy-content">
          <section>
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit websites. They help 
              websites remember your preferences and improve your experience.
            </p>
          </section>

          <section>
            <h2>2. How We Use Cookies</h2>
            <p>
              PING uses cookies to provide essential functionality and improve the learning experience. 
              We use minimal cookies and focus only on what's necessary for the platform to work.
            </p>
          </section>

          <section>
            <h2>3. Types of Cookies We Use</h2>

            <div className="highlight-box">
              <h3 style={{margin: 0, marginBottom: '1rem'}}>🔒 Essential Cookies (Required)</h3>
              <p>These cookies are necessary for the platform to function and cannot be disabled.</p>
              
              <table className="cookie-table">
                <thead>
                  <tr>
                    <th>Cookie Name</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>access_token</code></td>
                    <td>Authenticates your session and keeps you logged in</td>
                    <td>30 minutes</td>
                  </tr>
                  <tr>
                    <td><code>session_id</code></td>
                    <td>Maintains your current session</td>
                    <td>Session (deleted when browser closes)</td>
                  </tr>
                  <tr>
                    <td><code>consent_preferences</code></td>
                    <td>Remembers your consent choices</td>
                    <td>1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="highlight-box" style={{background: '#f0f9ff', borderLeft: '4px solid #0284c7'}}>
              <h3 style={{margin: 0, marginBottom: '1rem', color: '#0284c7'}}>📊 Analytics Cookies (Optional)</h3>
              <p>These cookies help us understand how users interact with the platform to improve it.</p>
              
              <table className="cookie-table">
                <thead>
                  <tr>
                    <th>Cookie Name</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>_analytics_session</code></td>
                    <td>Tracks page visits and feature usage (anonymized)</td>
                    <td>24 hours</td>
                  </tr>
                  <tr>
                    <td><code>_learning_progress</code></td>
                    <td>Monitors learning patterns to improve recommendations</td>
                    <td>30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="highlight-box" style={{background: '#fef3c7', borderLeft: '4px solid #f59e0b'}}>
              <h3 style={{margin: 0, marginBottom: '1rem', color: '#d97706'}}>⚙️ Preference Cookies (Optional)</h3>
              <p>These cookies remember your settings and preferences.</p>
              
              <table className="cookie-table">
                <thead>
                  <tr>
                    <th>Cookie Name</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>theme_preference</code></td>
                    <td>Remembers your UI theme choice (light/dark mode)</td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td><code>language_preference</code></td>
                    <td>Stores your language selection</td>
                    <td>1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>4. Cookies We DO NOT Use</h2>
            <div className="highlight-box" style={{background: '#fee', borderLeft: '4px solid #c00'}}>
              <h3 style={{margin: 0, marginBottom: '1rem', color: '#c00'}}>❌ What We DON'T Use:</h3>
              <ul>
                <li><strong>Advertising Cookies:</strong> We never use cookies for targeted advertising</li>
                <li><strong>Third-Party Tracking:</strong> No cookies from social media or ad networks</li>
                <li><strong>Cross-Site Tracking:</strong> We don't track you across other websites</li>
                <li><strong>Persistent Identifiers:</strong> No long-term tracking IDs</li>
              </ul>
            </div>
          </section>

          <section>
            <h2>5. K-12 Student Privacy</h2>
            <div className="k12-box">
              <Cookie size={24} />
              <div>
                <p>
                  <strong>For K-12 Students:</strong> We use minimal cookies and never use them for 
                  advertising or cross-site tracking. All cookies comply with COPPA and FERPA requirements.
                </p>
                <ul>
                  <li>Only essential cookies are used for students under 13</li>
                  <li>Analytics cookies require parental/teacher consent</li>
                  <li>All student data is protected and never sold</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2>6. Managing Your Cookie Preferences</h2>
            
            <h3>6.1 In-Platform Controls</h3>
            <p>
              You can manage optional cookies through your account settings or the consent modal 
              when you first visit the platform.
            </p>

            <h3>6.2 Browser Controls</h3>
            <p>Most browsers allow you to control cookies through settings:</p>
            <ul>
              <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>

            <div className="warning-box">
              <strong>⚠️ Warning:</strong> Blocking essential cookies may prevent the platform from 
              working properly. You may not be able to log in or access certain features.
            </div>
          </section>

          <section>
            <h2>7. Local Storage and Session Storage</h2>
            <p>
              In addition to cookies, we use browser storage technologies:
            </p>
            
            <h3>localStorage</h3>
            <ul>
              <li><code>user_preferences</code> - UI settings and preferences</li>
              <li><code>auth_token</code> - Authentication token backup</li>
              <li>Data persists until manually cleared</li>
            </ul>

            <h3>sessionStorage</h3>
            <ul>
              <li><code>module_state</code> - Current module progress</li>
              <li><code>game_session</code> - Active game session data</li>
              <li>Data cleared when tab/browser closes</li>
            </ul>

            <p>
              These storage mechanisms follow the same privacy principles as our cookies. 
              You can clear them through your browser's developer tools or privacy settings.
            </p>
          </section>

          <section>
            <h2>8. Third-Party Services</h2>
            <p>
              We may use third-party services that set their own cookies:
            </p>
            
            <h3>Current Third-Party Services:</h3>
            <ul>
              <li><strong>None:</strong> We currently do not use any third-party services that set cookies</li>
            </ul>

            <p>
              If we add third-party services in the future, we will:
            </p>
            <ul>
              <li>Update this Cookie Policy</li>
              <li>Request your consent for non-essential third-party cookies</li>
              <li>Provide opt-out mechanisms</li>
              <li>Ensure all services comply with student privacy laws</li>
            </ul>
          </section>

          <section>
            <h2>9. Cookie Consent</h2>
            <p>
              When you first visit PING, you'll see a consent modal explaining our cookie usage. 
              You can choose to:
            </p>
            <ul>
              <li>Accept all cookies (essential + optional)</li>
              <li>Accept only essential cookies</li>
              <li>Customize your preferences for each type</li>
            </ul>

            <p>
              You can change your consent preferences at any time through Account Settings.
            </p>
          </section>

          <section>
            <h2>10. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy as we add new features or change how we use cookies. 
              We will notify you of significant changes via:
            </p>
            <ul>
              <li>Email notification</li>
              <li>Platform notification banner</li>
              <li>Updated "Last Updated" date at the top of this page</li>
            </ul>
          </section>

          <section>
            <h2>11. Contact Us</h2>
            <div className="contact-box">
              <Settings size={24} />
              <div>
                <p><strong>Questions about our cookie usage?</strong></p>
                <p>Email: <a href="mailto:privacy@ping.agaii.org">privacy@ping.agaii.org</a></p>
                <p>Address: Rowan University, Glassboro, NJ 08028</p>
              </div>
            </div>
          </section>
        </div>

        <div className="policy-footer">
          <Link to="/" className="back-link">← Back to Home</Link>
          <div className="policy-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
