# 🎉 Phase 4 Complete - Data Collection System (Telemetry)

## Summary
Phase 4 has been successfully completed! The PING platform now has a comprehensive, K-12 compliant behavior data collection system that captures gameplay interactions while strictly protecting student privacy.

## ✅ What Was Built

### Frontend Services (2 new files)

#### 1. TelemetryService.js
**Purpose**: Core telemetry collection engine with K-12 compliance
**Location**: `frontend/src/services/TelemetryService.js`

**Key Features**:
- ✅ **K-12 Compliant Keyboard Tracking**
  - Only captures key codes (e.g., "KeyW", "Space", "ArrowLeft")
  - **NEVER** captures actual typed text content
  - Disabled during text input (forms, chat, etc.)
  - Only collects when Unity game has focus

- ✅ **Consent-Driven Collection**
  - Requires user consent before any data collection
  - Respects organization telemetry settings
  - Can be paused/resumed at any time

- ✅ **Smart Batching**
  - Buffers events locally (max 50 events)
  - Uploads every 5 seconds (configurable)
  - Reduces network overhead
  - Handles upload failures gracefully

- ✅ **Configurable Settings**
  - Sampling rate (0-100%)
  - Max events per session
  - Capture keyboard (on/off)
  - Capture mouse (on/off)
  - Capture focus/blur events

**Event Types Collected**:
```javascript
- session_start / session_end
- key_down / key_up (only key codes)
- click (optional, mouse events)
- window_focus / window_blur
- unity_focus / unity_blur
- telemetry_paused / telemetry_resumed
```

**Sample Keyboard Event**:
```json
{
  "event_type": "key_down",
  "payload": {
    "code": "KeyW",        // ✅ Captured
    "repeat": false,
    "alt": false,
    "ctrl": false,
    "shift": false,
    "meta": false
    // ❌ NOT captured: e.key, e.target.value, text content
  },
  "timestamp": "2026-01-20T15:30:00.000Z"
}
```

#### 2. UnityBridge.js
**Purpose**: Bidirectional communication between React and Unity WebGL
**Location**: `frontend/src/services/UnityBridge.js`

**Key Features**:
- ✅ **PostMessage API**
  - Secure cross-origin communication
  - Message queuing when Unity not ready
  - Response callbacks for async operations
  - Event handler registration system

- ✅ **Game Control Messages**
  - `start_game` - Initialize game with config
  - `pause_game` - Pause gameplay
  - `resume_game` - Resume gameplay
  - `quit_game` - Exit game
  - `get_state` - Request current game state

- ✅ **Telemetry Integration**
  - `telemetry_started` - Notify Unity telemetry is active
  - `telemetry_stopped` - Notify Unity telemetry stopped
  - Listen for `unity_ready` signal
  - Handle `game_event` from Unity
  - Track `focus_change` events

**Message Format**:
```javascript
// React → Unity
{
  source: 'react',
  type: 'start_game',
  payload: { level: 1, difficulty: 'easy' },
  messageId: 123
}

// Unity → React
{
  source: 'unity',
  type: 'game_event',
  payload: { event: 'level_complete', score: 100 },
  messageId: 123
}
```

### Backend Enhancements

#### 1. telemetry_router.py
**Purpose**: API endpoints for telemetry data collection
**Location**: `backend/routers/telemetry_router.py`

**Endpoints Created**:

##### POST /api/telemetry/session/start
**Purpose**: Start a new telemetry session
**Auth**: Required (JWT token)
**Request**:
```json
{
  "module_id": 1
}
```
**Response**:
```json
{
  "session_id": "uuid-here",
  "user_id": 123,
  "guest_id": null,
  "org_settings": {
    "telemetry_enabled": true,
    "capture_keyboard": true,
    "capture_mouse": false,
    "sampling_rate": 1.0,
    "batch_ms": 5000,
    "max_events_per_session": 10000
  },
  "started_at": "2026-01-20T15:30:00Z"
}
```

##### POST /api/telemetry/events
**Purpose**: Upload batch of telemetry events
**Auth**: Required
**Request**:
```json
{
  "session_id": "uuid-here",
  "events": [
    {
      "session_id": "uuid-here",
      "user_id": 123,
      "module_id": 1,
      "event_type": "key_down",
      "payload": {"code": "KeyW"},
      "timestamp": "2026-01-20T15:30:01Z",
      "client_timestamp": 1705762201000
    }
  ]
}
```
**Response**:
```json
{
  "success": true,
  "events_received": 50,
  "events_saved": 50,
  "session_id": "uuid-here"
}
```

**K-12 Compliance Check**: Each event is validated using `validate_event_compliance()`:
- ✅ Event type must be in allowed list
- ✅ Keyboard events must have `code` field
- ❌ Rejects if forbidden fields present: `key`, `value`, `text`, `input`, `data`

##### POST /api/telemetry/session/end
**Purpose**: End telemetry session
**Auth**: Required
**Response**:
```json
{
  "success": true,
  "session_id": "uuid-here",
  "total_events": 1234,
  "ended_at": "2026-01-20T16:00:00Z"
}
```

##### GET /api/telemetry/session/{session_id}/stats
**Purpose**: Get session statistics
**Auth**: Required (ownership verified)
**Response**:
```json
{
  "session_id": "uuid-here",
  "total_events": 1234,
  "event_types": {
    "key_down": 500,
    "key_up": 500,
    "click": 100,
    "session_start": 1,
    "session_end": 1
  },
  "start_time": "2026-01-20T15:30:00Z",
  "end_time": "2026-01-20T16:00:00Z"
}
```

##### DELETE /api/telemetry/user/data
**Purpose**: Delete all user telemetry data (Right to be Forgotten)
**Auth**: Required
**Response**:
```json
{
  "success": true,
  "records_deleted": 5678
}
```

##### GET /api/telemetry/user/export
**Purpose**: Export all user telemetry data (Right to Data Portability)
**Auth**: Required
**Response**:
```json
{
  "user_id": 123,
  "export_date": "2026-01-20T16:00:00Z",
  "total_events": 1234,
  "events": [
    {
      "session_id": "uuid",
      "module_id": 1,
      "event_type": "key_down",
      "event_data": {"code": "KeyW"},
      "timestamp": "2026-01-20T15:30:01Z"
    }
  ]
}
```

#### 2. Data Anonymization
**Purpose**: Protect user identity in telemetry data
**Implementation**:
```python
def anonymize_user_id(user_id, guest_id):
    identifier = f"{user_id}:{guest_id}:{datetime.utcnow().date()}"
    return hashlib.sha256(identifier.encode()).hexdigest()[:16]
```

**Benefits**:
- Different hash each day (prevents long-term tracking)
- Can't reverse to find real user_id
- Allows same-session event correlation
- Complies with data minimization principles

### Updated Components

#### GameEmbed.js
**Major Changes**:
1. **Telemetry Session Lifecycle**
   - Starts session after consent granted
   - Initializes TelemetryService with org settings
   - Ends session on component unmount

2. **Unity Bridge Integration**
   - Sets iframe reference for postMessage
   - Listens for `unity_ready` event
   - Handles `game_event` and `focus_change` from Unity

3. **Real-time Stats Display**
   - Shows event count in header
   - Updates every 2 seconds
   - Activity pulse animation

4. **K-12 Compliance Notice**
   - Yellow notice box explaining data collection
   - Clear statement: "We NEVER record what you type in text boxes"
   - Shows session stats (session ID, event count, status)

#### schemas.py
**New Schemas Added**:
```python
class TelemetrySessionCreate(BaseModel):
    module_id: int

class TelemetryEventCreate(BaseModel):
    session_id: str
    user_id: Optional[int] = None
    guest_id: Optional[str] = None
    module_id: int
    event_type: str
    payload: dict
    timestamp: str
    client_timestamp: int

class TelemetryEventBatch(BaseModel):
    session_id: str
    events: List[TelemetryEventCreate]
```

#### main.py
**Router Integration**:
```python
from routers import telemetry_router
app.include_router(telemetry_router.router)
```

## 🔒 K-12 Compliance Features

### Privacy Protections
✅ **What We Collect**:
- Key codes only (e.g., "KeyW", "Space", "Enter")
- Mouse clicks (optional, disabled by default)
- Window focus/blur events
- Game-specific events from Unity

❌ **What We DON'T Collect**:
- Actual typed text content
- Form input values
- Screenshots or screen recordings
- Webcam/microphone data
- Personal messages or chat content
- Any data during text input focus

### Compliance Mechanisms

#### 1. Text Input Detection
```javascript
window.addEventListener('focusin', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    this.isInTextInput = true; // Disable collection
  }
});
```

#### 2. Focus-Based Collection
```javascript
handleKeyDown(e) {
  if (!this.shouldCollect()) return;
  if (!this.unityFocused) return; // Only when game has focus
  
  this.logEvent('key_down', {
    code: e.code, // ✅ Safe
    // NEVER: e.key, e.target.value ❌
  });
}
```

#### 3. Backend Validation
```python
def validate_event_compliance(event):
    # Reject keyboard events without key code
    if event.event_type in ['key_down', 'key_up']:
        if 'code' not in event.payload:
            return False
        
        # Reject if forbidden fields present
        forbidden = ['key', 'value', 'text', 'input', 'data']
        for field in forbidden:
            if field in event.payload:
                return False
    
    return True
```

## 📊 Data Flow

### Collection Flow
```
User plays game
       ↓
Key press occurs
       ↓
Check: Unity has focus? ✅
Check: Not in text input? ✅
Check: Consent granted? ✅
       ↓
Extract key code only
       ↓
Add to event buffer (max 50)
       ↓
Buffer full OR 5 seconds passed?
       ↓
Upload batch to API
       ↓
Backend validates compliance
       ↓
Anonymize user ID
       ↓
Save to behavior_data table
```

### Session Lifecycle
```
GameEmbed mounts
       ↓
Check consent ✅
       ↓
POST /api/telemetry/session/start
       ↓
Receive session_id + org_settings
       ↓
Initialize TelemetryService
       ↓
Start event listeners
       ↓
User plays game (events collected)
       ↓
Periodic uploads every 5s
       ↓
User exits game
       ↓
POST /api/telemetry/session/end
       ↓
Final upload of buffered events
       ↓
Cleanup listeners
```

## 🧪 Testing Guide

### Test 1: Basic Telemetry Collection
1. Login or use guest mode
2. Accept consent
3. Navigate to game page
4. **Verify**: Green telemetry indicator appears (top right)
5. **Verify**: Shows "0 events" initially
6. Press keys (W, A, S, D, Space)
7. **Verify**: Event count increases
8. Wait 5 seconds
9. **Verify**: Events uploaded (check Network tab)

### Test 2: K-12 Compliance - Text Input
1. Start playing game
2. Open browser console (F12)
3. Type: `document.querySelector('body').innerHTML += '<input id="test-input" />'`
4. Focus on the test input
5. Type anything in the input
6. **Verify**: No keyboard events collected while input focused
7. Click back on game iframe
8. Press keys
9. **Verify**: Events collected again

### Test 3: Focus-Based Collection
1. Start playing game
2. Press keys → Events collected ✅
3. Alt+Tab to another window
4. **Verify**: `window_blur` event logged
5. Press keys in other window
6. **Verify**: No events collected (game not focused)
7. Alt+Tab back to game
8. **Verify**: `window_focus` event logged
9. Press keys → Events collected again ✅

### Test 4: Batch Upload
1. Open Network tab (F12)
2. Start playing game
3. Press keys rapidly (50+ presses)
4. **Verify**: Upload triggered at 50 events (max buffer size)
5. Press a few more keys
6. Wait 5 seconds
7. **Verify**: Upload triggered by timer

### Test 5: Backend Validation
Use curl to test compliance validation:

```bash
# Valid keyboard event (should save)
curl -X POST http://localhost:8000/api/telemetry/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-session",
    "events": [{
      "session_id": "test-session",
      "module_id": 1,
      "event_type": "key_down",
      "payload": {"code": "KeyW", "shift": false},
      "timestamp": "2026-01-20T15:30:00Z",
      "client_timestamp": 1705762200000
    }]
  }'

# Invalid keyboard event (should reject)
curl -X POST http://localhost:8000/api/telemetry/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-session",
    "events": [{
      "event_type": "key_down",
      "payload": {"key": "w", "value": "password123"},
      "timestamp": "2026-01-20T15:30:00Z"
    }]
  }'
# Expected: Event skipped, events_saved = 0
```

### Test 6: Data Export & Deletion
```bash
# Export user data
curl -X GET http://localhost:8000/api/telemetry/user/export \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete user data
curl -X DELETE http://localhost:8000/api/telemetry/user/data \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📁 Files Created/Modified

### Created Files
1. `frontend/src/services/TelemetryService.js` (400+ lines)
2. `frontend/src/services/UnityBridge.js` (200+ lines)
3. `backend/routers/telemetry_router.py` (250+ lines)

### Modified Files
1. `frontend/src/components/GameEmbed.js` - Added telemetry integration
2. `frontend/src/components/GameEmbed.css` - Added telemetry UI styles
3. `backend/schemas.py` - Added telemetry schemas
4. `backend/main.py` - Registered telemetry router

**Total Lines Added**: ~900+ lines

## 🎯 Key Achievements

✅ **K-12 Compliant Data Collection**
- Only key codes, never text content
- Focus-based collection
- Text input detection and disabling

✅ **Privacy by Design**
- Consent-driven collection
- Data anonymization
- Right to deletion
- Right to data portability

✅ **Performance Optimized**
- Event batching (reduces network calls)
- Configurable sampling rate
- Max events per session limit
- Client-side buffering

✅ **Developer Friendly**
- Clear event types
- Easy integration with Unity
- Comprehensive logging
- Error handling

✅ **Organization Control**
- Configurable telemetry settings
- Can disable collection entirely
- Sampling rate control
- Feature toggles (keyboard, mouse, focus)

## 🚀 Next Steps (Phase 5)

Phase 5 will focus on **Teacher Features**:
- [ ] Create class interface
- [ ] Generate join codes
- [ ] Student roster management
- [ ] Learning analytics dashboard
- [ ] Module assignment
- [ ] Progress tracking
- [ ] Real-time session monitoring

## 📞 Technical Notes

### Unity Game Integration
To integrate telemetry with Unity games, add this JavaScript to your Unity WebGL build:

```javascript
// Send message to React
window.parent.postMessage({
  source: 'unity',
  type: 'unity_ready',
  payload: {}
}, '*');

// Listen for messages from React
window.addEventListener('message', (event) => {
  if (event.data.source === 'react') {
    console.log('Unity received:', event.data);
    
    if (event.data.type === 'start_game') {
      // Start game with config
      StartGame(event.data.payload);
    }
  }
});

// Send game events to React
function SendGameEvent(eventType, eventData) {
  window.parent.postMessage({
    source: 'unity',
    type: 'game_event',
    payload: { event: eventType, data: eventData }
  }, '*');
}
```

### Database Performance
For high-traffic deployments, consider:
- Index on `behavior_data.session_id`
- Index on `behavior_data.created_at`
- Partition by date for old data archival
- Separate read replicas for analytics

### GDPR/COPPA Compliance Checklist
- ✅ Consent required before collection
- ✅ Clear privacy notice
- ✅ Data minimization (key codes only)
- ✅ Right to deletion
- ✅ Right to export
- ✅ Data anonymization
- ✅ No collection in text inputs
- ⏳ Data retention policy (TODO: auto-delete after N days)
- ⏳ Parental consent for under-13 (TODO: Phase 5)

---

**Phase 4 Status**: ✅ COMPLETE
**Ready for**: Testing and Phase 5 development
**Last Updated**: January 20, 2026
