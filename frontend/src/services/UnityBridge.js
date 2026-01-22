/**
 * UnityBridge.js
 * 
 * Handles bidirectional communication between React and Unity WebGL
 * using postMessage API
 */

class UnityBridge {
  constructor() {
    this.unityIframe = null;
    this.messageHandlers = new Map();
    this.isReady = false;
    this.messageQueue = [];
    this.responseCallbacks = new Map();
    this.messageId = 0;
    
    // Listen for messages from Unity
    window.addEventListener('message', (event) => this.handleMessage(event));
  }

  /**
   * Set Unity iframe reference
   * @param {HTMLIFrameElement} iframe - Unity iframe element
   */
  setIframe(iframe) {
    this.unityIframe = iframe;
    console.log('[UnityBridge] Iframe set');
  }

  /**
   * Handle incoming messages from Unity
   */
  handleMessage(event) {
    // Security: Verify origin (in production, check against your domain)
    // if (event.origin !== window.location.origin) return;

    const data = event.data;
    
    // Check if message is from Unity
    if (data && data.source === 'unity') {
      console.log('[UnityBridge] Received from Unity:', data.type, data.payload);

      // Handle Unity ready signal
      if (data.type === 'unity_ready') {
        this.isReady = true;
        this.flushMessageQueue();
        this.notifyHandlers('unity_ready', data.payload);
        return;
      }

      // Handle response to a sent message
      if (data.messageId && this.responseCallbacks.has(data.messageId)) {
        const callback = this.responseCallbacks.get(data.messageId);
        callback(data.payload);
        this.responseCallbacks.delete(data.messageId);
        return;
      }

      // Notify registered handlers
      this.notifyHandlers(data.type, data.payload);
    }
  }

  /**
   * Notify all handlers for a message type
   */
  notifyHandlers(type, payload) {
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type);
      handlers.forEach(handler => handler(payload));
    }
  }

  /**
   * Register a message handler
   * @param {string} type - Message type to listen for
   * @param {Function} handler - Handler function
   */
  on(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);
  }

  /**
   * Unregister a message handler
   */
  off(type, handler) {
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Send message to Unity
   * @param {string} type - Message type
   * @param {Object} payload - Message data
   * @param {Function} callback - Optional callback for response
   */
  sendToUnity(type, payload = {}, callback = null) {
    const messageId = this.messageId++;
    const message = {
      source: 'react',
      type,
      payload,
      messageId
    };

    if (callback) {
      this.responseCallbacks.set(messageId, callback);
    }

    if (!this.isReady || !this.unityIframe) {
      // Queue message if Unity not ready
      this.messageQueue.push(message);
      console.log('[UnityBridge] Message queued (Unity not ready):', type);
      return;
    }

    // Send message
    try {
      this.unityIframe.contentWindow.postMessage(message, '*');
      console.log('[UnityBridge] Sent to Unity:', type, payload);
    } catch (error) {
      console.error('[UnityBridge] Failed to send message:', error);
    }
  }

  /**
   * Flush queued messages when Unity becomes ready
   */
  flushMessageQueue() {
    console.log('[UnityBridge] Flushing message queue:', this.messageQueue.length);
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.unityIframe.contentWindow.postMessage(message, '*');
    }
  }

  /**
   * Game event handlers
   */
  
  // Notify Unity when player starts game
  startGame(config) {
    this.sendToUnity('start_game', config);
  }

  // Notify Unity when player pauses
  pauseGame() {
    this.sendToUnity('pause_game');
  }

  // Notify Unity when player resumes
  resumeGame() {
    this.sendToUnity('resume_game');
  }

  // Notify Unity when player quits
  quitGame() {
    this.sendToUnity('quit_game');
  }

  // Send configuration to Unity
  sendConfig(config) {
    this.sendToUnity('config', config);
  }

  // Request game state from Unity
  requestGameState(callback) {
    this.sendToUnity('get_state', {}, callback);
  }

  /**
   * Telemetry integration
   */
  
  // Notify Unity that telemetry started
  telemetryStarted(sessionId) {
    this.sendToUnity('telemetry_started', { sessionId });
  }

  // Notify Unity that telemetry stopped
  telemetryStopped() {
    this.sendToUnity('telemetry_stopped');
  }

  /**
   * Clean up
   */
  destroy() {
    window.removeEventListener('message', this.handleMessage);
    this.messageHandlers.clear();
    this.responseCallbacks.clear();
    this.messageQueue = [];
    this.unityIframe = null;
    this.isReady = false;
  }
}

// Singleton instance
const unityBridge = new UnityBridge();

export default unityBridge;
