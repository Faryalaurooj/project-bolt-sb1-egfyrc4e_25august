// WebRTC service for Jive API integration
// https://webrtc.jive.com/web-calls/v1/calls

import { getWebRTCConfig } from '../config/webrtcConfig';
import callFlowService from './callFlowService';
import deviceService from './deviceService';

class WebRTCService {
  constructor() {
    this.config = getWebRTCConfig();
    this.organizationId = this.config.ORGANIZATION_ID;
    this.extensionNumber = this.config.EXTENSION_NUMBER;
    this.impersonateeUserKey = this.config.IMPERSONATEE_USER_KEY;
    this.deviceId = null;
    this.inCallChannelId = null;
    this.peerConnection = null;
    this.localStream = null;
    this.isCallActive = false;
  }

  // Generate a unique device ID
  generateDeviceId() {
    if (!this.deviceId) {
      this.deviceId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
    return this.deviceId;
  }

  // Generate a unique in-call channel ID
  generateInCallChannelId() {
    if (!this.inCallChannelId) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
      let result = '';
      for (let i = 0; i < 64; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.inCallChannelId = result;
    }
    return this.inCallChannelId;
  }

  // Generate SDP offer for WebRTC
  async generateSDPOffer() {
    try {
      console.log('🔄 Creating RTCPeerConnection...');
      
      // Create RTCPeerConnection with better configuration
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.config.ICE_SERVERS,
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
      });

      console.log('🔄 Getting user media...');
      // Get user media (microphone)
      this.localStream = await navigator.mediaDevices.getUserMedia(this.config.MEDIA_CONSTRAINTS);

      // Add stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      console.log('🔄 Creating offer...');
      // Create offer with better options
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
        voiceActivityDetection: true
      });
      
      await this.peerConnection.setLocalDescription(offer);

      console.log('🔄 Waiting for ICE gathering...');
      // Wait for ICE gathering to complete with timeout
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn('⚠️ ICE gathering timeout, proceeding with current candidates');
          resolve();
        }, this.config.ICE_GATHERING_TIMEOUT);

        if (this.peerConnection.iceGatheringState === 'complete') {
          clearTimeout(timeout);
          resolve();
        } else {
          this.peerConnection.onicegatheringstatechange = () => {
            if (this.peerConnection.iceGatheringState === 'complete') {
              clearTimeout(timeout);
              resolve();
            }
          };
        }
      });

      const sdp = this.peerConnection.localDescription.sdp;
      console.log('✅ SDP offer generated, length:', sdp.length);
      return sdp;
    } catch (error) {
      console.error('❌ Error generating SDP offer:', error);
      throw new Error(`Failed to generate SDP offer: ${error.message}`);
    }
  }

  // Get user's public IP address for SDP
  async getPublicIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Could not get public IP, using fallback');
      return '199.88.123.123'; // Fallback IP
    }
  }

  // Generate complete SDP with real IP and port
  async generateCompleteSDP() {
    try {
      console.log('🔄 Generating SDP offer...');
      const sdpOffer = await this.generateSDPOffer();
      
      console.log('🔄 Getting public IP...');
      const publicIP = await this.getPublicIP();
      
      // Use a more reliable port range for WebRTC
      const port = Math.floor(Math.random() * 10000) + 50000; // Random port between 50000-60000
      
      console.log('🔄 Processing SDP with IP:', publicIP, 'Port:', port);

      // Replace placeholder IP and port in SDP
      let completeSDP = sdpOffer;
      
      // Replace any placeholder IPs with real public IP
      completeSDP = completeSDP.replace(/199\.88\.123\.123/g, publicIP);
      completeSDP = completeSDP.replace(/127\.0\.0\.1/g, publicIP);
      
      // Replace any placeholder ports
      completeSDP = completeSDP.replace(/40342/g, port.toString());
      
      // Ensure SDP has proper format
      if (!completeSDP.includes('v=0')) {
        throw new Error('Invalid SDP format generated');
      }
      
      console.log('✅ SDP generated successfully, length:', completeSDP.length);
      return completeSDP;
    } catch (error) {
      console.error('❌ Error generating complete SDP:', error);
      throw error;
    }
  }

  // Make a direct call using GoTo Connect API via backend with auto-auth
  async makeDirectCall(phoneNumber, contactName) {
    try {
      console.log('📞 Making automated GoTo Connect call via backend...');
      
      // Use the automated call endpoint that handles OAuth automatically
      const response = await fetch('/api/goto-connect/auto-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          contactName
        })
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.authRequired) {
          // Handle authorization requirement
          console.log('🔐 Authorization required for GoTo Connect');
          
          // Show user-friendly message and redirect to auth
          if (result.authUrl) {
            const userConfirm = confirm(
              `GoTo Connect authorization is required to make calls. Would you like to authorize now?\n\n` +
              `This will open a popup window for authentication.`
            );
            
            if (userConfirm) {
              // Open auth URL in popup
              const popup = window.open(result.authUrl, 'goto-auth', 'width=600,height=700');
              
              return new Promise((resolve, reject) => {
                const messageHandler = (event) => {
                  if (event.origin !== window.location.origin) return;
                  
                  if (event.data.type === 'goto_auth_success') {
                    window.removeEventListener('message', messageHandler);
                    // Retry the call after successful auth
                    this.makeDirectCall(phoneNumber, contactName).then(resolve).catch(reject);
                  } else if (event.data.type === 'goto_auth_error') {
                    window.removeEventListener('message', messageHandler);
                    reject(new Error('Authorization failed: ' + event.data.error));
                  }
                };
                
                window.addEventListener('message', messageHandler);
              });
            } else {
              throw new Error('GoTo Connect authorization is required to make calls');
            }
          }
        }
        
        throw new Error(`API error: ${response.status} - ${result.error || response.statusText}`);
      }
      
      console.log('✅ Automated GoTo Connect call initiated successfully:', result);
      
      this.isCallActive = true;
      
      // Set up call flow management
      const callId = result.callId || result.data?.callId;
      if (callId) {
        callFlowService.setCall(callId, contactName, phoneNumber);
      }
      
      return {
        success: true,
        callId: callId,
        data: result,
        message: `Direct call to ${contactName} initiated successfully via GoTo Connect`
      };

    } catch (error) {
      console.error('❌ Direct call failed:', error);
      this.isCallActive = false;
      
      return {
        success: false,
        error: error.message,
        message: `Direct call failed: ${error.message}`
      };
    }
  }

  // Make a call using Jive WebRTC API via backend (no CORS issues)
  async makeCall(phoneNumber, contactName) {
    try {
      console.log('🌐 Starting WebRTC call via backend (no CORS)...');
      
      // Ensure device is registered
      if (!deviceService.isDeviceRegistered()) {
        console.log('🔄 Device not registered, registering now...');
        const deviceResult = await deviceService.registerDevice();
        if (!deviceResult.success) {
          throw new Error(`Device registration failed: ${deviceResult.error}`);
        }

        // Register extensions for the device
        const extensionResult = await deviceService.registerExtensions(
          this.organizationId,
          [this.extensionNumber],
          this.impersonateeUserKey
        );
        if (!extensionResult.success) {
          console.warn('⚠️ Extension registration failed:', extensionResult.error);
        }
      }

      // Get device ID from device service
      const deviceInfo = deviceService.getCurrentDevice();
      const deviceId = deviceInfo.deviceId;
      
      // Generate required parameters
      const inCallChannelId = this.generateInCallChannelId();
      const sdp = await this.generateCompleteSDP();

      console.log('📞 Call data prepared:', {
        phoneNumber,
        contactName,
        deviceId,
        inCallChannelId,
        sdpLength: sdp.length
      });

      // Make API call to our backend (no CORS issues)
      const response = await fetch('/api/jive-webrtc/make-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          contactName,
          sdp,
          deviceId,
          inCallChannelId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Backend API error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ WebRTC call initiated successfully via backend:', result);
      
      this.isCallActive = true;
      
      // Set up call flow management
      const callId = result.callId || inCallChannelId;
      callFlowService.setCall(callId, contactName, phoneNumber);
      
      return {
        success: true,
        callId: callId,
        data: result,
        message: `WebRTC call to ${contactName} initiated successfully via backend`
      };

    } catch (error) {
      console.error('❌ WebRTC call failed:', error);
      this.isCallActive = false;
      
      return {
        success: false,
        error: error.message,
        message: `WebRTC call failed: ${error.message}`
      };
    }
  }

  // End the current call
  async endCall() {
    try {
      // Use call flow service to end call
      await callFlowService.endCall();

      // Local cleanup
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      this.isCallActive = false;
      
      return {
        success: true,
        message: 'Call ended successfully'
      };
    } catch (error) {
      console.error('Error ending call:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if WebRTC is supported
  isWebRTCSupported() {
    return !!(
      window.RTCPeerConnection &&
      window.navigator.mediaDevices &&
      window.navigator.mediaDevices.getUserMedia
    );
  }

  // Get call status
  getCallStatus() {
    return {
      isActive: this.isCallActive,
      deviceId: this.deviceId,
      inCallChannelId: this.inCallChannelId,
      hasLocalStream: !!this.localStream,
      peerConnectionState: this.peerConnection ? this.peerConnection.connectionState : 'none'
    };
  }
}

// Create and export singleton instance
const webrtcService = new WebRTCService();

// Export individual functions
export const makeWebRTCCall = (phoneNumber, contactName) => 
  webrtcService.makeCall(phoneNumber, contactName);

export const makeDirectCall = (phoneNumber, contactName) => 
  webrtcService.makeDirectCall(phoneNumber, contactName);

export const endWebRTCCall = () => 
  webrtcService.endCall();

export const isWebRTCSupported = () => 
  webrtcService.isWebRTCSupported();

export const getWebRTCStatus = () => 
  webrtcService.getCallStatus();

// Call flow management functions
export const getCurrentCall = () => 
  callFlowService.getCurrentCall();

export const getCallStatus = () => 
  callFlowService.getCallStatus();

export const getFormattedDuration = () => 
  callFlowService.getFormattedDuration();

export const toggleMute = () => 
  callFlowService.toggleMute();

export const endCall = () => 
  callFlowService.endCall();

// Callback registration
export const onCallStatusChange = (callback) => 
  callFlowService.onStatusChange(callback);

export const onCallStart = (callback) => 
  callFlowService.onCallStart(callback);

export const onCallEnd = (callback) => 
  callFlowService.onCallEnd(callback);

export const onCallConnect = (callback) => 
  callFlowService.onCallConnect(callback);

export const onCallFail = (callback) => 
  callFlowService.onCallFail(callback);

// Device management functions
export const registerDevice = () => 
  deviceService.registerDevice();

export const registerExtensions = (organizationId, extensionNumbers, impersonateeUserKey) => 
  deviceService.registerExtensions(organizationId, extensionNumbers, impersonateeUserKey);

export const getDeviceDetails = () => 
  deviceService.getDeviceDetails();

export const getExtensions = (organizationId, extensionNumber) => 
  deviceService.getExtensions(organizationId, extensionNumber);

export const updateDevice = (clientInformation, callbackReference) => 
  deviceService.updateDevice(clientInformation, callbackReference);

export const deleteDevice = () => 
  deviceService.deleteDevice();

export const getCurrentDevice = () => 
  deviceService.getCurrentDevice();

export const isDeviceRegistered = () => 
  deviceService.isDeviceRegistered();

export const getDeviceStatus = () => 
  deviceService.getDeviceStatus();

export default webrtcService;
