import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import './PolicyPage.css';

const TermsOfService = () => {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <div className="policy-header">
          <Shield size={48} className="policy-icon" />
          <h1>Terms of Service</h1>
          <p className="policy-date">Last Updated: January 20, 2026</p>
        </div>

        <div className="policy-content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using PING (Personalized Instruction and Need-aware Gamification), 
              you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.
            </p>
          </section>

          <section>
            <h2>2. Account Types and Eligibility</h2>
            
            <h3>2.1 Guest Users</h3>
            <ul>
              <li>Can access modules without registration</li>
              <li>Limited data persistence (90 days)</li>
              <li>Must accept consent agreements</li>
            </ul>

            <h3>2.2 Student Accounts</h3>
            <ul>
              <li>Minimum age: 13 years (or with parental consent)</li>
              <li>Valid email address required</li>
              <li>Access to full learning features</li>
            </ul>

            <h3>2.3 Teacher Accounts</h3>
            <ul>
              <li>Must be affiliated with an educational institution</li>
              <li>Can create classes and view student data</li>
              <li>Responsible for student privacy</li>
            </ul>

            <h3>2.4 Organization Admins</h3>
            <ul>
              <li>Authorized by organization</li>
              <li>Configure organization settings</li>
              <li>Manage users and data policies</li>
            </ul>
          </section>

          <section>
            <h2>3. Acceptable Use</h2>
            
            <div className="highlight-box">
              <h3 style={{margin: 0, marginBottom: '1rem'}}>✅ You MAY:</h3>
              <ul>
                <li>Use the platform for educational purposes</li>
                <li>Share your progress with teachers</li>
                <li>Collaborate with classmates as instructed</li>
                <li>Provide feedback and suggestions</li>
              </ul>
            </div>

            <div className="highlight-box" style={{background: '#fee', borderLeft: '4px solid #c00'}}>
              <h3 style={{margin: 0, marginBottom: '1rem', color: '#c00'}}>❌ You MAY NOT:</h3>
              <ul>
                <li>Share your account credentials</li>
                <li>Attempt to hack, breach, or abuse the system</li>
                <li>Upload malicious code or viruses</li>
                <li>Harass, bully, or threaten other users</li>
                <li>Cheat or use unauthorized tools</li>
                <li>Impersonate others</li>
                <li>Use the platform for commercial purposes</li>
                <li>Scrape or extract data without permission</li>
              </ul>
            </div>
          </section>

          <section>
            <h2>4. User Responsibilities</h2>
            
            <h3>4.1 Account Security</h3>
            <ul>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>You are responsible for all activities under your account</li>
            </ul>

            <h3>4.2 Accurate Information</h3>
            <ul>
              <li>Provide truthful registration information</li>
              <li>Keep your profile information up-to-date</li>
              <li>Use your real name (not for guest users)</li>
            </ul>

            <h3>4.3 Appropriate Behavior</h3>
            <ul>
              <li>Respect other users and staff</li>
              <li>Follow academic integrity policies</li>
              <li>Report violations to administrators</li>
            </ul>
          </section>

          <section>
            <h2>5. Intellectual Property</h2>
            
            <h3>5.1 Platform Content</h3>
            <p>
              All content on PING (modules, games, graphics, text, code) is owned by PING or its licensors 
              and protected by copyright and other intellectual property laws.
            </p>

            <h3>5.2 User-Generated Content</h3>
            <p>
              By submitting content (feedback, assignments), you grant PING a non-exclusive license to use, 
              modify, and display that content for educational and research purposes.
            </p>

            <h3>5.3 Restrictions</h3>
            <ul>
              <li>Do not copy, modify, or distribute platform content without permission</li>
              <li>Do not reverse engineer or decompile our software</li>
              <li>Do not remove copyright or proprietary notices</li>
            </ul>
          </section>

          <section>
            <h2>6. Data and Privacy</h2>
            <p>
              Your use of PING is also governed by our <Link to="/privacy">Privacy Policy</Link>. 
              By using the platform, you consent to our data collection and use practices as described in that policy.
            </p>

            <h3>K-12 Student Data</h3>
            <div className="k12-box">
              <Shield size={24} />
              <div>
                <p>
                  We comply with FERPA, COPPA, and other student privacy laws. Student data is used 
                  solely for educational purposes and is never sold or used for advertising.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2>7. Termination</h2>
            
            <h3>7.1 By You</h3>
            <p>You may terminate your account at any time through account settings or by contacting support.</p>

            <h3>7.2 By Us</h3>
            <p>We may suspend or terminate your account if you:</p>
            <ul>
              <li>Violate these Terms of Service</li>
              <li>Engage in fraudulent or illegal activities</li>
              <li>Pose a security or legal risk</li>
              <li>Have been inactive for an extended period</li>
            </ul>

            <h3>7.3 Effects of Termination</h3>
            <ul>
              <li>Your access to the platform will be revoked</li>
              <li>Your data may be retained according to our Privacy Policy</li>
              <li>You may request data deletion</li>
            </ul>
          </section>

          <section>
            <h2>8. Disclaimers</h2>
            
            <h3>8.1 Service Availability</h3>
            <p>
              PING is provided "as is" without warranties. We do not guarantee uninterrupted or error-free service.
            </p>

            <h3>8.2 Educational Content</h3>
            <p>
              While we strive for accuracy, we do not warrant that all educational content is complete, 
              accurate, or suitable for all purposes.
            </p>

            <h3>8.3 Third-Party Links</h3>
            <p>
              Our platform may contain links to third-party websites. We are not responsible for their 
              content or practices.
            </p>
          </section>

          <section>
            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, PING and its affiliates shall not be liable for:
            </p>
            <ul>
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of data, profits, or academic standing</li>
              <li>Technical malfunctions or data breaches</li>
              <li>Actions of other users</li>
            </ul>
            <p>
              Our total liability shall not exceed the amount you paid to use the platform (if any).
            </p>
          </section>

          <section>
            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Significant changes will be 
              communicated via email or platform notification. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2>11. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of New Jersey, USA, without regard to 
              conflict of law principles.
            </p>
          </section>

          <section>
            <h2>12. Contact Information</h2>
            <div className="contact-box">
              <Shield size={24} />
              <div>
                <p><strong>Questions about these Terms?</strong></p>
                <p>Email: <a href="mailto:legal@ping.agaii.org">legal@ping.agaii.org</a></p>
                <p>Address: Rowan University, Glassboro, NJ 08028</p>
              </div>
            </div>
          </section>
        </div>

        <div className="policy-footer">
          <Link to="/" className="back-link">← Back to Home</Link>
          <div className="policy-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/cookie-policy">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
