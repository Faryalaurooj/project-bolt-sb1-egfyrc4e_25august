// WebRTC Configuration for Jive API
// Update these values with your actual credentials

export const WEBRTC_CONFIG = {
  // Jive API endpoint
  API_BASE_URL: 'https://webrtc.jive.com/web-calls/v1',
  
  // Your organization ID (replace with actual value)
  ORGANIZATION_ID: '0149be93-9b2d-9ac4-5712-000100420005',
  
  // Your extension number (replace with actual value)
  EXTENSION_NUMBER: '223',
  
  // Impersonatee user key (replace with actual value or get from auth system)
  IMPERSONATEE_USER_KEY: '6141815170848815365',
  
  // STUN servers for WebRTC
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ],
  
  // Media constraints for getUserMedia
  MEDIA_CONSTRAINTS: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    },
    video: false
  },
  
  // Call timeout settings (in milliseconds)
  CALL_TIMEOUT: 30000, // 30 seconds
  ICE_GATHERING_TIMEOUT: 10000, // 10 seconds
  
  // Debug mode
  DEBUG: process.env.NODE_ENV === 'development'
};

// Helper function to get configuration
export const getWebRTCConfig = () => {
  return {
    ...WEBRTC_CONFIG,
    // You can override config values from environment variables
    ORGANIZATION_ID: "0149be93-9b2d-9ac4-5712-000100420005",
    EXTENSION_NUMBER: "223",
    IMPERSONATEE_USER_KEY: "6141815170848815365"
  };
};

export default WEBRTC_CONFIG;
