// WebSocket service for real-time Jive WebRTC call events
class WebRTCWebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.callbacks = new Map();
    this.isConnected = false;
  }

  // Connect to WebSocket server
  connect() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/jive-webrtc/ws`;
      
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.triggerCallbacks('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data);
          this.handleMessage(data);
        } catch (error) {
          console.error('❌ WebSocket message parsing error:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.triggerCallbacks('disconnected');
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.triggerCallbacks('error', error);
      };

    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      this.triggerCallbacks('error', error);
    }
  }

  // Attempt to reconnect
  attemptReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Handle incoming messages
  handleMessage(data) {
    switch (data.type) {
      case 'connection':
        console.log('🔌 WebSocket connection established:', data.message);
        break;
      case 'call_event':
        this.handleCallEvent(data);
        break;
      case 'subscribed':
        console.log('📞 Subscribed to call events:', data.callId);
        break;
      case 'pong':
        console.log('🏓 Pong received');
        break;
      case 'error':
        console.error('❌ WebSocket error:', data.message);
        break;
      default:
        console.log('📨 Unknown message type:', data.type);
    }
  }

  // Handle call events
  handleCallEvent(data) {
    const { callId, data: eventData } = data;
    
    // Trigger specific call event callbacks
    if (callId) {
      this.triggerCallbacks(`call_${callId}`, eventData);
    }
    
    // Trigger general call event callbacks
    this.triggerCallbacks('call_event', { callId, ...eventData });
    
    // Trigger specific event type callbacks
    if (eventData.type) {
      this.triggerCallbacks(eventData.type, { callId, ...eventData });
    }
  }

  // Subscribe to specific call events
  subscribeToCall(callId) {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        callId: callId
      }));
    } else {
      console.warn('⚠️ WebSocket not connected, cannot subscribe to call');
    }
  }

  // Send ping to keep connection alive
  ping() {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'ping',
        timestamp: new Date().toISOString()
      }));
    }
  }

  // Register callback for events
  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }

  // Remove callback
  off(event, callback) {
    if (this.callbacks.has(event)) {
      const callbacks = this.callbacks.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Trigger callbacks for an event
  triggerCallbacks(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Callback error:', error);
        }
      });
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.isConnected = false;
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : null,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const webrtcWebSocketService = new WebRTCWebSocketService();

// Auto-connect when imported
webrtcWebSocketService.connect();

// Set up ping interval to keep connection alive
setInterval(() => {
  webrtcWebSocketService.ping();
}, 30000); // Ping every 30 seconds

export default webrtcWebSocketService;
