# Phase 3 Testing Guide - Compliance and Consent System

## Prerequisites
1. Backend server running: `http://localhost:8000`
2. Frontend server running: `http://localhost:3000`
3. PostgreSQL database configured and running
4. Phase 2 authentication working (can register/login)

## Test Suite

### Test 1: Guest User Consent Flow
**Objective**: Verify guest users must consent before playing games

**Steps**:
1. Open browser in incognito mode
2. Navigate to `http://localhost:3000`
3. Click "Play" on any simulation card
4. **Expected**: Should be redirected to `/game/forces-motion-basics`
5. **Expected**: See lock icon and "Consent Required" message
6. **Expected**: ConsentModal appears automatically

**Verify ConsentModal**:
- [ ] Title: "Consent Agreement"
- [ ] 4 checkboxes visible:
  - [ ] Terms of Service (Required badge)
  - [ ] Privacy Policy (Required badge)
  - [ ] Data Collection (Required badge)
  - [ ] Cookies (Optional badge)
- [ ] K-12 compliance yellow box visible
- [ ] "View Details" buttons expandable
- [ ] "I Agree" button disabled initially

**Test Validation**:
1. Check only "Terms of Service"
2. Click "I Agree"
3. **Expected**: Error message "Terms, Privacy Policy, and Data Collection consent are required"
4. Check all 3 required consents (leave cookies unchecked)
5. Click "I Agree"
6. **Expected**: ConsentModal closes
7. **Expected**: Game iframe loads
8. **Expected**: Can see Unity game loading

**Database Verification**:
```sql
SELECT * FROM consent_records ORDER BY consented_at DESC LIMIT 1;
```
**Expected**:
- `guest_session_id` is populated
- `terms_accepted = true`
- `privacy_accepted = true`
- `data_collection_accepted = true`
- `cookie_accepted = false`

---

### Test 2: Registered User Consent Flow
**Objective**: Verify registered users also require consent

**Steps**:
1. Logout if logged in
2. Register new account: `test@example.com` / `Password123`
3. After registration, click "Play" on any simulation
4. **Expected**: ConsentModal appears
5. Accept all 4 consents (including cookies)
6. Click "I Agree"
7. **Expected**: Game loads immediately

**Database Verification**:
```sql
SELECT u.email, c.* 
FROM consent_records c 
JOIN users u ON c.user_id = u.id 
WHERE u.email = 'test@example.com';
```
**Expected**:
- `user_id` matches the test user
- `guest_session_id = NULL`
- All 4 consents = `true`

---

### Test 3: Consent Persistence
**Objective**: Verify consent is remembered across sessions

**Steps**:
1. Using the registered user from Test 2 (who already consented)
2. Navigate to home page
3. Click "Play" on any simulation
4. **Expected**: Game loads IMMEDIATELY without ConsentModal
5. Refresh the page (F5)
6. **Expected**: Game still loads without consent prompt
7. Close browser completely
8. Reopen browser and login
9. Navigate to game
10. **Expected**: No ConsentModal (consent persists)

**API Test**:
```bash
# Get access token from login
curl -X POST http://localhost:8000/api/auth/login-json \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Use token to check consent
curl -X GET http://localhost:8000/api/auth/consent/check \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
**Expected Response**:
```json
{
  "has_consent": true,
  "consent_date": "2026-01-20T...",
  "terms_accepted": true,
  "privacy_accepted": true,
  "data_collection_accepted": true,
  "cookie_accepted": true
}
```

---

### Test 4: Privacy Policy Page
**Objective**: Verify privacy policy is accessible and complete

**Steps**:
1. Navigate to `http://localhost:3000/privacy`
2. **Expected**: See Privacy Policy page

**Verify Content**:
- [ ] Page title: "Privacy Policy"
- [ ] Last Updated date visible
- [ ] Shield icon displayed
- [ ] 13 sections present:
  1. Introduction
  2. What Data We Collect
  3. What We DON'T Collect (with ❌ symbols)
  4. How We Use Data
  5. K-12 Student Privacy (yellow box)
  6. Data Sharing
  7. Data Security
  8. Data Retention
  9. Your Rights
  10. Cookies and Tracking
  11. Third-Party Services
  12. Changes to Policy
  13. Contact Information

**Verify Links**:
- [ ] "Back to Home" → Returns to homepage
- [ ] "Terms of Service" link → Opens `/terms`
- [ ] "Cookie Policy" link → Opens `/cookie-policy`
- [ ] Email link: `privacy@ping.agaii.org` (opens email client)

**Mobile Test**:
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro"
4. **Expected**: Policy content is readable and scrollable
5. **Expected**: No horizontal scroll
6. **Expected**: Text size appropriate

---

### Test 5: Terms of Service Page
**Objective**: Verify terms of service content and functionality

**Steps**:
1. Navigate to `http://localhost:3000/terms`

**Verify Content**:
- [ ] Page title: "Terms of Service"
- [ ] 12 sections present:
  1. Acceptance of Terms
  2. Account Types (Guest, Student, Teacher, Org Admin)
  3. Acceptable Use (✅ You MAY / ❌ You MAY NOT boxes)
  4. User Responsibilities
  5. Intellectual Property
  6. Data and Privacy (with link to Privacy Policy)
  7. Termination
  8. Disclaimers
  9. Limitation of Liability
  10. Changes to Terms
  11. Governing Law
  12. Contact Information

**Verify Highlight Boxes**:
- [ ] Green box: "✅ You MAY" list
- [ ] Red box: "❌ You MAY NOT" list
- [ ] Yellow box: K-12 student data protection notice

**Verify Links**:
- [ ] Privacy Policy link → Opens `/privacy` in same tab
- [ ] Cookie Policy link → Opens `/cookie-policy`
- [ ] Back to Home link works

---

### Test 6: Cookie Policy Page
**Objective**: Verify cookie policy explains cookie usage clearly

**Steps**:
1. Navigate to `http://localhost:3000/cookie-policy`

**Verify Content**:
- [ ] Page title: "Cookie Policy"
- [ ] 11 sections present
- [ ] Cookie tables visible and properly formatted

**Verify Cookie Tables**:
Essential Cookies table:
- [ ] `access_token` - 30 minutes
- [ ] `session_id` - Session
- [ ] `consent_preferences` - 1 year

Analytics Cookies table (blue box):
- [ ] `_analytics_session` - 24 hours
- [ ] `_learning_progress` - 30 days

Preference Cookies table (yellow box):
- [ ] `theme_preference` - 1 year
- [ ] `language_preference` - 1 year

**Verify "What We DON'T Use" Section**:
- [ ] Red box with ❌ symbols
- [ ] No advertising cookies
- [ ] No third-party tracking
- [ ] No cross-site tracking

**Verify Browser Instructions**:
- [ ] Chrome settings path listed
- [ ] Firefox settings path listed
- [ ] Safari settings path listed
- [ ] Edge settings path listed

---

### Test 7: ConsentModal Details Expansion
**Objective**: Verify expandable detail sections work

**Steps**:
1. Logout (if logged in)
2. Navigate to any game page to trigger ConsentModal
3. Click "View Details" for Terms of Service
4. **Expected**: Terms section expands showing summary
5. Click "View Details" again
6. **Expected**: Section collapses
7. Repeat for Privacy Policy details
8. **Expected**: Privacy section expands independently
9. Expand all 4 detail sections simultaneously
10. **Expected**: All can be open at the same time

**Verify Detail Content**:
- [ ] Terms: Mentions acceptable use, account types
- [ ] Privacy: Mentions data collection, K-12 compliance
- [ ] Data Collection: Lists keyboard tracking details
- [ ] Cookies: Mentions essential vs. optional cookies

---

### Test 8: Consent API Endpoint
**Objective**: Test backend consent checking API

**Setup**:
1. Register a new user: `consent-test@example.com` / `Test1234`
2. Get access token from login response

**Test Case A - No Consent Yet**:
```bash
curl -X GET http://localhost:8000/api/auth/consent/check \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected Response**:
```json
{
  "has_consent": false,
  "message": "No consent record found"
}
```

**Test Case B - Submit Consent**:
```bash
curl -X POST http://localhost:8000/api/auth/consent \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "terms_accepted": true,
    "privacy_accepted": true,
    "data_collection_accepted": true,
    "cookie_accepted": false
  }'
```
**Expected Response**:
```json
{
  "id": 123,
  "user_id": 456,
  "terms_accepted": true,
  "privacy_accepted": true,
  "data_collection_accepted": true,
  "cookie_accepted": false,
  "consented_at": "2026-01-20T..."
}
```

**Test Case C - Check Consent Again**:
```bash
curl -X GET http://localhost:8000/api/auth/consent/check \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected Response**:
```json
{
  "has_consent": true,
  "consent_date": "2026-01-20T...",
  "terms_accepted": true,
  "privacy_accepted": true,
  "data_collection_accepted": true,
  "cookie_accepted": false
}
```

---

### Test 9: Guest Session Consent
**Objective**: Verify guest sessions can consent and play games

**Steps**:
1. Open incognito browser window
2. Navigate to `http://localhost:3000`
3. Click "Guest Login" button
4. **Expected**: Logged in as guest (see "Guest" in header)
5. Click "Play" on simulation
6. **Expected**: ConsentModal appears
7. Accept all required consents
8. **Expected**: Game loads

**Verify Guest Token**:
1. Open DevTools (F12) → Application → Local Storage
2. Check `access_token`
3. Decode JWT token at https://jwt.io
4. **Expected Payload**:
```json
{
  "guest_id": "guest_abc123...",
  "user_id": 789,
  "role": "guest"
}
```

**Database Check**:
```sql
SELECT * FROM consent_records WHERE guest_session_id IS NOT NULL;
```
**Expected**: Guest consent record exists

---

### Test 10: Error Handling
**Objective**: Test error scenarios

**Test Case A - Missing Required Consent**:
1. Open ConsentModal
2. Check only "Cookies" (optional)
3. Click "I Agree"
4. **Expected**: Error message appears
5. **Expected**: Modal stays open
6. **Expected**: Game does NOT load

**Test Case B - Network Error**:
1. Stop backend server
2. Open ConsentModal as guest
3. Accept all consents
4. Click "I Agree"
5. **Expected**: Error message "Failed to submit consent. Please try again."
6. Restart backend server
7. Click "I Agree" again
8. **Expected**: Consent saves successfully

**Test Case C - Invalid Token**:
```bash
curl -X GET http://localhost:8000/api/auth/consent/check \
  -H "Authorization: Bearer INVALID_TOKEN"
```
**Expected Response**: 401 Unauthorized

---

### Test 11: Navigation from ConsentModal
**Objective**: Verify policy links work from ConsentModal

**Steps**:
1. Open ConsentModal
2. In "Terms of Service" details, find link to full terms
3. Click "View Full Terms" (if implemented) or manually navigate
4. **Expected**: Opens `/terms` page in new tab OR same tab
5. Return to ConsentModal page
6. **Expected**: ConsentModal still open
7. Accept consents and verify game loads

---

### Test 12: Responsive Design
**Objective**: Test UI on different screen sizes

**Desktop (1920x1080)**:
- [ ] ConsentModal centered, max-width respected
- [ ] Policy pages readable, sections well-spaced
- [ ] Tables fit within viewport

**Tablet (768x1024)**:
- [ ] ConsentModal scales appropriately
- [ ] Cookie policy tables stack vertically if needed
- [ ] Text remains readable

**Mobile (375x667)**:
- [ ] ConsentModal full-width with padding
- [ ] Checkboxes large enough to tap
- [ ] Policy pages scrollable
- [ ] Tables responsive (single column on mobile)
- [ ] "I Agree" button accessible

---

## Automated Testing (Optional)

### Jest Test Example
```javascript
// ConsentModal.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import ConsentModal from './ConsentModal';

test('shows error when required consents not checked', () => {
  render(<ConsentModal isOpen={true} />);
  
  const agreeButton = screen.getByText('I Agree');
  fireEvent.click(agreeButton);
  
  expect(screen.getByText(/required to continue/i)).toBeInTheDocument();
});
```

### API Test with Python
```python
import requests

# Test consent check endpoint
def test_consent_check():
    # Login first
    login_response = requests.post(
        'http://localhost:8000/api/auth/login-json',
        json={'email': 'test@example.com', 'password': 'Test1234'}
    )
    token = login_response.json()['access_token']
    
    # Check consent
    response = requests.get(
        'http://localhost:8000/api/auth/consent/check',
        headers={'Authorization': f'Bearer {token}'}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert 'has_consent' in data
```

---

## Bug Report Template

If you find issues during testing, report them with:

```markdown
**Bug Title**: [Brief description]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Screenshots**:
[Attach if applicable]

**Environment**:
- Browser: Chrome 120 / Firefox 115 / Safari 17
- OS: Windows 11 / macOS / Linux
- Screen size: 1920x1080 / 768x1024 / 375x667

**Console Errors**:
[Paste any console errors]
```

---

## Success Criteria

Phase 3 is complete when:
- ✅ All 12 test cases pass
- ✅ Guest users can consent and play games
- ✅ Registered users can consent and play games
- ✅ Consent persists across sessions
- ✅ All 3 policy pages accessible and complete
- ✅ ConsentModal blocks game access until consent given
- ✅ API endpoints return correct data
- ✅ Database stores consent records properly
- ✅ Mobile responsive on all pages
- ✅ No console errors during normal flow

---

## Next Phase Preparation

After Phase 3 testing is complete:
1. Fix any bugs found
2. Review and update documentation
3. Prepare for Phase 4 planning
4. Consider additional features:
   - User account settings page
   - Consent management (withdraw/update)
   - Data export functionality
   - Teacher dashboard
   - Class management UI
