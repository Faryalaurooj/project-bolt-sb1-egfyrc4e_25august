// Call Flow Management Service
// Handles call states, events, and controls using call ID

class CallFlowService {
  constructor() {
    this.currentCall = null;
    this.callStatus = 'idle'; // idle, ringing, connected, ended, failed
    this.callStartTime = null;
    this.callDuration = 0;
    this.isMuted = false;
    this.isOnHold = false;
    this.statusCheckInterval = null;
    this.pollingStartTime = null;
    this.maxPollingDuration = 30 * 60 * 1000; // 30 minutes max polling
    this.callbacks = {
      onStatusChange: null,
      onCallStart: null,
      onCallEnd: null,
      onCallConnect: null,
      onCallFail: null
    };
  }

  // Set call data when call is initiated
  setCall(callId, contactName, phoneNumber) {
    this.currentCall = {
      callId,
      contactName,
      phoneNumber,
      startTime: new Date()
    };
    this.callStartTime = new Date();
    this.callStatus = 'ringing';
    this.callDuration = 0;
    this.isMuted = false;
    this.isOnHold = false;
    
    console.log('📞 Call initiated:', this.currentCall);
    
    // Start status monitoring
    this.startStatusMonitoring();
    
    // Notify callbacks
    this.notifyCallbacks('onCallStart', this.currentCall);
    this.notifyCallbacks('onStatusChange', this.callStatus);
  }

  // Start monitoring call status with adaptive polling
  startStatusMonitoring() {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }

    // Adaptive polling based on call state
    const getPollingInterval = () => {
      switch (this.callStatus) {
        case 'ringing':
          return 3000; // Check every 3 seconds when ringing
        case 'connected':
          return 10000; // Check every 10 seconds when connected
        case 'idle':
        case 'ended':
        case 'failed':
          return 30000; // Check every 30 seconds for final states
        default:
          return 5000; // Default 5 seconds
      }
    };

    const poll = async () => {
      if (this.currentCall && this.callStatus !== 'ended' && this.callStatus !== 'failed') {
        // Check if we've exceeded maximum polling duration
        const pollingDuration = Date.now() - this.pollingStartTime;
        if (pollingDuration > this.maxPollingDuration) {
          console.warn('⚠️ Maximum polling duration reached, stopping status monitoring');
          this.stopStatusMonitoring();
          this.updateCallStatus('failed', { reason: 'Polling timeout' });
          return;
        }

        await this.checkCallStatus();
        this.updateCallDuration();
        
        // Reschedule with adaptive interval
        const interval = getPollingInterval();
        this.statusCheckInterval = setTimeout(poll, interval);
      }
    };

    // Start polling
    this.pollingStartTime = Date.now();
    const initialInterval = getPollingInterval();
    this.statusCheckInterval = setTimeout(poll, initialInterval);
  }

  // Stop status monitoring
  stopStatusMonitoring() {
    if (this.statusCheckInterval) {
      clearTimeout(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }

  // Check call status from backend
  async checkCallStatus() {
    if (!this.currentCall) return;

    try {
      const response = await fetch(`/api/jive-webrtc/call-status/${this.currentCall.callId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJraWQiOiI2MjAiLCJhbGciOiJSUzUxMiJ9.eyJzYyI6ImNhbGxzLnYyLmluaXRpYXRlIHVzZXJzLnYxLmxpbmVzLnJlYWQiLCJzdWIiOiIxNzQ2NDE0MTA4OTI1NzgzNzgzIiwiYXVkIjoiYTQwNTg0NTItY2E2NC00YWJhLWEwZDQtYTc3YjMxNGRhMTcyIiwib2duIjoicHdkIiwibHMiOiIzZmY4Y2E4Ni1iYmZmLTQ3NjktOWEwNi1kYzgwY2RmZmQxNGUiLCJ0eXAiOiJhIiwiZXhwIjoxNzU3NDg4NjEzLCJpYXQiOjE3NTc0ODUwMTMsImp0aSI6IjQ1MjIzNzA0LWYyN2ItNDNkOS1hOWEwLTVjNjBkY2YwMDQ0OCIsImxvYSI6M30.jY2E4at1jP78_eUWPME2vD4gLa4ZyqwYEMZk1KSy-k7sVuQTHuqT-gNbRmKwie0uKDhPLlDJLUJ6q3Zqj9VXzvQswM2QRZ4yGGfGROBoGidPg9Ix2kfbT8nGbgMSOXBZnfDQKRD79l8V6tgy4MGlFyBKeZYSZg5ZoHuWG7PLc14Q1a_PVEDFSgxNYZoRZUPQfMqgWd4mLFw7L5EdwgUIvyxUl1AX9Bcj0lcyoJ-ob6O5-7J50AChcZlHkftddWPycuTr5DOqyDxs1M3WHbF5KBX9goM5wbXJnWF3Pf0uYTIJQLzRz7n0jXaOJgOx3QFogAC-BBkk9Z4pGOtcVunOpw`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const newStatus = data.status || 'unknown';
        
        if (newStatus !== this.callStatus) {
          this.updateCallStatus(newStatus, data);
        }
      } else {
        console.warn('⚠️ Call status check failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Error checking call status:', error);
    }
  }

  // Update call status
  updateCallStatus(newStatus, data = null) {
    const oldStatus = this.callStatus;
    this.callStatus = newStatus;

    console.log(`📞 Call status changed: ${oldStatus} → ${newStatus}`, data);

    // Handle status-specific logic
    switch (newStatus) {
      case 'connected':
        this.handleCallConnected(data);
        break;
      case 'ended':
        this.handleCallEnded(data);
        break;
      case 'failed':
        this.handleCallFailed(data);
        break;
      case 'ringing':
        this.handleCallRinging(data);
        break;
    }

    // Notify callbacks
    this.notifyCallbacks('onStatusChange', newStatus, oldStatus);
  }

  // Handle call connected
  handleCallConnected(data) {
    console.log('✅ Call connected!', data);
    this.notifyCallbacks('onCallConnect', this.currentCall, data);
  }

  // Handle call ended
  handleCallEnded(data) {
    console.log('📞 Call ended', data);
    this.stopStatusMonitoring();
    this.notifyCallbacks('onCallEnd', this.currentCall, data);
  }

  // Handle call failed
  handleCallFailed(data) {
    console.log('❌ Call failed', data);
    this.stopStatusMonitoring();
    this.notifyCallbacks('onCallFail', this.currentCall, data);
  }

  // Handle call ringing
  handleCallRinging(data) {
    console.log('📞 Call ringing...', data);
  }

  // Update call duration
  updateCallDuration() {
    if (this.callStartTime) {
      this.callDuration = Math.floor((new Date() - this.callStartTime) / 1000);
    }
  }

  // End call
  async endCall() {
    if (!this.currentCall) return;

    try {
      const response = await fetch('/api/jive-webrtc/end-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJraWQiOiI2MjAiLCJhbGciOiJSUzUxMiJ9.eyJzYyI6ImNhbGxzLnYyLmluaXRpYXRlIHVzZXJzLnYxLmxpbmVzLnJlYWQiLCJzdWIiOiIxNzQ2NDE0MTA4OTI1NzgzNzgzIiwiYXVkIjoiYTQwNTg0NTItY2E2NC00YWJhLWEwZDQtYTc3YjMxNGRhMTcyIiwib2duIjoicHdkIiwibHMiOiIzZmY4Y2E4Ni1iYmZmLTQ3NjktOWEwNi1kYzgwY2RmZmQxNGUiLCJ0eXAiOiJhIiwiZXhwIjoxNzU3NDg4NjEzLCJpYXQiOjE3NTc0ODUwMTMsImp0aSI6IjQ1MjIzNzA0LWYyN2ItNDNkOS1hOWEwLTVjNjBkY2YwMDQ0OCIsImxvYSI6M30.jY2E4at1jP78_eUWPME2vD4gLa4ZyqwYEMZk1KSy-k7sVuQTHuqT-gNbRmKwie0uKDhPLlDJLUJ6q3Zqj9VXzvQswM2QRZ4yGGfGROBoGidPg9Ix2kfbT8nGbgMSOXBZnfDQKRD79l8V6tgy4MGlFyBKeZYSZg5ZoHuWG7PLc14Q1a_PVEDFSgxNYZoRZUPQfMqgWd4mLFw7L5EdwgUIvyxUl1AX9Bcj0lcyoJ-ob6O5-7J50AChcZlHkftddWPycuTr5DOqyDxs1M3WHbF5KBX9goM5wbXJnWF3Pf0uYTIJQLzRz7n0jXaOJgOx3QFogAC-BBkk9Z4pGOtcVunOpw`
        },
        body: JSON.stringify({
          callId: this.currentCall.callId
        })
      });

      if (response.ok) {
        console.log('✅ Call ended successfully');
      } else {
        console.warn('⚠️ Backend end call failed, but continuing with local cleanup');
      }
    } catch (error) {
      console.error('❌ Error ending call:', error);
    }

    // Update status
    this.updateCallStatus('ended');
    this.stopStatusMonitoring();
  }

  // Mute/Unmute call
  async toggleMute() {
    if (!this.currentCall) return;

    try {
      const response = await fetch('/api/jive-webrtc/mute-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJraWQiOiI2MjAiLCJhbGciOiJSUzUxMiJ9.eyJzYyI6ImNhbGxzLnYyLmluaXRpYXRlIHVzZXJzLnYxLmxpbmVzLnJlYWQiLCJzdWIiOiIxNzQ2NDE0MTA4OTI1NzgzNzgzIiwiYXVkIjoiYTQwNTg0NTItY2E2NC00YWJhLWEwZDQtYTc3YjMxNGRhMTcyIiwib2duIjoicHdkIiwibHMiOiIzZmY4Y2E4Ni1iYmZmLTQ3NjktOWEwNi1kYzgwY2RmZmQxNGUiLCJ0eXAiOiJhIiwiZXhwIjoxNzU3NDg4NjEzLCJpYXQiOjE3NTc0ODUwMTMsImp0aSI6IjQ1MjIzNzA0LWYyN2ItNDNkOS1hOWEwLTVjNjBkY2YwMDQ0OCIsImxvYSI6M30.jY2E4at1jP78_eUWPME2vD4gLa4ZyqwYEMZk1KSy-k7sVuQTHuqT-gNbRmKwie0uKDhPLlDJLUJ6q3Zqj9VXzvQswM2QRZ4yGGfGROBoGidPg9Ix2kfbT8nGbgMSOXBZnfDQKRD79l8V6tgy4MGlFyBKeZYSZg5ZoHuWG7PLc14Q1a_PVEDFSgxNYZoRZUPQfMqgWd4mLFw7L5EdwgUIvyxUl1AX9Bcj0lcyoJ-ob6O5-7J50AChcZlHkftddWPycuTr5DOqyDxs1M3WHbF5KBX9goM5wbXJnWF3Pf0uYTIJQLzRz7n0jXaOJgOx3QFogAC-BBkk9Z4pGOtcVunOpw`
        },
        body: JSON.stringify({
          callId: this.currentCall.callId,
          muted: !this.isMuted
        })
      });

      if (response.ok) {
        this.isMuted = !this.isMuted;
        console.log(`🔇 Call ${this.isMuted ? 'muted' : 'unmuted'}`);
        return this.isMuted;
      } else {
        console.error('❌ Failed to toggle mute');
        return false;
      }
    } catch (error) {
      console.error('❌ Error toggling mute:', error);
      return false;
    }
  }

  // Get current call info
  getCurrentCall() {
    return {
      ...this.currentCall,
      status: this.callStatus,
      duration: this.callDuration,
      isMuted: this.isMuted,
      isOnHold: this.isOnHold
    };
  }

  // Get call status
  getCallStatus() {
    return this.callStatus;
  }

  // Get call duration in formatted string
  getFormattedDuration() {
    const minutes = Math.floor(this.callDuration / 60);
    const seconds = this.callDuration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Register callbacks
  onStatusChange(callback) {
    this.callbacks.onStatusChange = callback;
  }

  onCallStart(callback) {
    this.callbacks.onCallStart = callback;
  }

  onCallEnd(callback) {
    this.callbacks.onCallEnd = callback;
  }

  onCallConnect(callback) {
    this.callbacks.onCallConnect = callback;
  }

  onCallFail(callback) {
    this.callbacks.onCallFail = callback;
  }

  // Notify callbacks
  notifyCallbacks(event, ...args) {
    const callback = this.callbacks[event];
    if (callback && typeof callback === 'function') {
      callback(...args);
    }
  }

  // Clear call data
  clearCall() {
    this.currentCall = null;
    this.callStatus = 'idle';
    this.callStartTime = null;
    this.callDuration = 0;
    this.isMuted = false;
    this.isOnHold = false;
    this.pollingStartTime = null;
    this.stopStatusMonitoring();
  }
}

// Create and export singleton instance
const callFlowService = new CallFlowService();

export default callFlowService;
