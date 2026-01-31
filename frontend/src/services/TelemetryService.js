/**
 * TelemetryService.js
 * 
 * Handles behavior data collection with K-12 compliance:
 * - Only captures key codes (e.g., "KeyW", "Space"), NOT text content
 * - Only collects when Unity game has focus
 * - Disabled during form input
 * - Batch uploads to reduce network overhead
 * - Respects user consent and organization settings
 */

class TelemetryService {
  constructor() {
    this.isEnabled = false;
    this.isConsentGranted = false;
    this.sessionId = null;
    this.userId = null;
    this.moduleId = null;
    this.unityFocused = false;
    this.eventBuffer = [];
    this.maxBufferSize = 50; // Max events before forced upload
    this.uploadInterval = 5000; // Upload every 5 seconds
    this.uploadTimer = null;
    this.eventListeners = new Map();
    this.beforeUnloadHandler = null;
    this.pageHideHandler = null;
    this.visibilityHandler = null;
    this.sessionEnded = false;
    
    // K-12 Compliance: Track if we're in a text input to disable collection
    this.isInTextInput = false;
  }

  /**
   * Initialize telemetry session
   * @param {Object} config - Configuration object
   * @param {string} config.sessionId - Unique session identifier
   * @param {number} config.userId - User ID (null for guests)
   * @param {string} config.guestId - Guest ID (null for registered users)
   * @param {number} config.moduleId - Module being played
   * @param {boolean} config.consentGranted - User consent status
   * @param {Object} config.orgSettings - Organization telemetry settings
   */
  initialize({ sessionId, userId, guestId, moduleId, consentGranted, orgSettings = {} }) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.guestId = guestId;
    this.moduleId = moduleId;
    this.isConsentGranted = consentGranted;
    
    // Apply organization settings
    this.isEnabled = orgSettings.telemetry_enabled !== false && consentGranted;
    this.captureKeyboard = orgSettings.capture_keyboard !== false;
    this.captureMouse = orgSettings.capture_mouse === true;
    this.captureFocusBlur = orgSettings.capture_focus_blur !== false;
    this.samplingRate = orgSettings.sampling_rate || 1.0;
    this.maxEventsPerSession = orgSettings.max_events_per_session || 10000;
    this.batchMs = orgSettings.batch_ms || 5000;
    
    this.uploadInterval = this.batchMs;
    this.totalEventsCollected = 0;
    this.sessionStartTime = Date.now();
    this.sessionEnded = false;
    
    if (this.isEnabled) {
      this.startListening();
      this.startUploadTimer();
      this.logEvent('session_start', { module_id: moduleId });
      console.log('[Telemetry] Session started:', sessionId);
    } else {
      console.log('[Telemetry] Disabled - consent not granted or org settings disabled');
    }
  }

  /**
   * Check if we should collect this event (sampling)
   */
  shouldCollect() {
    if (!this.isEnabled || !this.isConsentGranted) return false;
    if (this.totalEventsCollected >= this.maxEventsPerSession) return false;
    if (this.isInTextInput) return false; // K-12 Compliance: No collection in text inputs
    return Math.random() < this.samplingRate;
  }

  /**
   * Start listening to browser events
   */
  startListening() {
    // Keyboard events (K-12 compliant - only key codes)
    if (this.captureKeyboard) {
      const keyDownHandler = (e) => this.handleKeyDown(e);
      const keyUpHandler = (e) => this.handleKeyUp(e);
      
      window.addEventListener('keydown', keyDownHandler);
      window.addEventListener('keyup', keyUpHandler);
      
      this.eventListeners.set('keydown', keyDownHandler);
      this.eventListeners.set('keyup', keyUpHandler);
    }

    // Mouse events (optional)
    if (this.captureMouse) {
      const clickHandler = (e) => this.handleClick(e);
      window.addEventListener('click', clickHandler);
      this.eventListeners.set('click', clickHandler);
    }

    // Focus/Blur events (to know when Unity has focus)
    if (this.captureFocusBlur) {
      const focusHandler = () => this.handleFocus();
      const blurHandler = () => this.handleBlur();
      
      window.addEventListener('focus', focusHandler);
      window.addEventListener('blur', blurHandler);
      
      this.eventListeners.set('focus', focusHandler);
      this.eventListeners.set('blur', blurHandler);
    }

    // Track text input focus (K-12 Compliance)
    const inputFocusHandler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        this.isInTextInput = true;
      }
    };
    const inputBlurHandler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        this.isInTextInput = false;
      }
    };
    
    window.addEventListener('focusin', inputFocusHandler, true);
    window.addEventListener('focusout', inputBlurHandler, true);
    
    this.eventListeners.set('focusin', inputFocusHandler);
    this.eventListeners.set('focusout', inputBlurHandler);
  }

    // Flush telemetry on exit
    this.beforeUnloadHandler = () => this.flushOnExit();
    this.pageHideHandler = () => this.flushOnExit();
    this.visibilityHandler = () => {
      if (document.visibilityState === 'hidden') {
        this.flushOnExit();
      }
    };

    window.addEventListener('beforeunload', this.beforeUnloadHandler);
    window.addEventListener('pagehide', this.pageHideHandler);
    document.addEventListener('visibilitychange', this.visibilityHandler);

  /**
   * Handle keyboard key down
   * K-12 COMPLIANCE: Only captures key code, NOT the actual text typed
   */
  handleKeyDown(e) {
    if (!this.shouldCollect()) return;
    if (!this.unityFocused) return; // Only collect when Unity has focus

    this.logEvent('key_down', {
      code: e.code,          // e.g., "KeyW", "Space", "ArrowLeft"
      // NEVER capture: e.key (actual character), e.target.value (text content)
      repeat: e.repeat,
      alt: e.altKey,
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      meta: e.metaKey
    });
  }

  /**
   * Handle keyboard key up
   */
  handleKeyUp(e) {
    if (!this.shouldCollect()) return;
    if (!this.unityFocused) return;

    this.logEvent('key_up', {
      code: e.code,
      alt: e.altKey,
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      meta: e.metaKey
    });
  }

  /**
   * Handle mouse click
   */
  handleClick(e) {
    if (!this.shouldCollect()) return;
    if (!this.unityFocused) return;

    this.logEvent('click', {
      button: e.button, // 0=left, 1=middle, 2=right
      x: e.clientX,
      y: e.clientY,
      target: e.target.tagName
    });
  }

  /**
   * Handle window focus
   */
  handleFocus() {
    this.unityFocused = true;
    if (this.isEnabled) {
      this.logEvent('window_focus', {});
    }
  }

  /**
   * Handle window blur
   */
  handleBlur() {
    this.unityFocused = false;
    if (this.isEnabled) {
      this.logEvent('window_blur', {});
    }
  }

  /**
   * Set Unity focus state (called from Unity game)
   */
  setUnityFocus(focused) {
    this.unityFocused = focused;
    if (this.isEnabled) {
      this.logEvent(focused ? 'unity_focus' : 'unity_blur', {});
    }
  }

  /**
   * Log a custom event
   * @param {string} eventType - Type of event
   * @param {Object} payload - Event data
   */
  logEvent(eventType, payload = {}) {
    if (!this.isEnabled) return;
    if (this.totalEventsCollected >= this.maxEventsPerSession) return;

    const event = {
      session_id: this.sessionId,
      user_id: this.userId,
      guest_id: this.guestId,
      module_id: this.moduleId,
      event_type: eventType,
      payload: payload,
      timestamp: new Date().toISOString(),
      client_timestamp: Date.now()
    };

    this.eventBuffer.push(event);
    this.totalEventsCollected++;

    // Upload if buffer is full
    if (this.eventBuffer.length >= this.maxBufferSize) {
      this.uploadEvents();
    }
  }

  /**
   * Start periodic upload timer
   */
  startUploadTimer() {
    if (this.uploadTimer) {
      clearInterval(this.uploadTimer);
    }

    this.uploadTimer = setInterval(() => {
      if (this.eventBuffer.length > 0) {
        this.uploadEvents();
      }
    }, this.uploadInterval);
  }

  /**
   * Upload buffered events to backend
   */
  async uploadEvents() {
    if (this.eventBuffer.length === 0) return;

    const eventsToUpload = [...this.eventBuffer];
    this.eventBuffer = []; // Clear buffer

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/telemetry/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          events: eventsToUpload
        })
      });

      if (response.ok) {
        console.log(`[Telemetry] Uploaded ${eventsToUpload.length} events`);
      } else {
        console.error('[Telemetry] Upload failed:', response.statusText);
        // Re-add failed events to buffer (with limit)
        this.eventBuffer.unshift(...eventsToUpload.slice(0, this.maxBufferSize - this.eventBuffer.length));
      }
    } catch (error) {
      console.error('[Telemetry] Upload error:', error);
      // Re-add failed events to buffer
      this.eventBuffer.unshift(...eventsToUpload.slice(0, this.maxBufferSize - this.eventBuffer.length));
    }
  }

  /**
   * End telemetry session and upload remaining events
   */
  async endSession() {
    if (!this.isEnabled) return;

    if (!this.sessionEnded) {
      this.logEvent('session_end', {
        total_events: this.totalEventsCollected,
        duration_ms: Date.now() - this.sessionStartTime
      });
      this.sessionEnded = true;
    }

    // Stop listening
    this.stopListening();

    // Stop upload timer
    if (this.uploadTimer) {
      clearInterval(this.uploadTimer);
      this.uploadTimer = null;
    }

    // Upload remaining events
    await this.uploadEvents();

    console.log('[Telemetry] Session ended:', this.sessionId);
  }

  /**
   * Stop all event listeners
   */
  stopListening() {
    this.eventListeners.forEach((handler, eventType) => {
      if (eventType === 'focusin' || eventType === 'focusout') {
        window.removeEventListener(eventType, handler, true);
      } else {
        window.removeEventListener(eventType, handler);
      }
    });
    this.eventListeners.clear();

    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
      this.beforeUnloadHandler = null;
    }
    if (this.pageHideHandler) {
      window.removeEventListener('pagehide', this.pageHideHandler);
      this.pageHideHandler = null;
    }
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  /**
   * Pause telemetry collection (e.g., when game is paused)
   */
  pause() {
    this.isEnabled = false;
    this.logEvent('telemetry_paused', {});
  }

  /**
   * Resume telemetry collection
   */
  resume() {
    if (this.isConsentGranted) {
      this.isEnabled = true;
      this.logEvent('telemetry_resumed', {});
    }
  }

  /**
   * Get current session stats
   */
  getStats() {
    return {
      sessionId: this.sessionId,
      totalEvents: this.totalEventsCollected,
      bufferedEvents: this.eventBuffer.length,
      isEnabled: this.isEnabled,
      unityFocused: this.unityFocused
    };
  }
}

// Singleton instance
const telemetryService = new TelemetryService();

export default telemetryService;
