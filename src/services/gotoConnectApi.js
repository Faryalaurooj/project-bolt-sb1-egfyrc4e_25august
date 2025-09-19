// GoTo Connect API service for frontend
const API_BASE_URL = 'http://localhost:5000/api/goto-connect';

class GoToConnectAPI {
  // Get authorization status
  async getAuthStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to get auth status'
        };
      }
    } catch (error) {
      console.error('Get auth status error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Start OAuth authorization flow
  async startAuth() {
    try {
      const response = await fetch(`${API_BASE_URL}/start-auth`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        // Open authorization URL in a popup
        const popup = window.open(data.authUrl, 'goto-auth', 'width=600,height=700');
        
        return new Promise((resolve, reject) => {
          const messageHandler = (event) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'goto_auth_success') {
              window.removeEventListener('message', messageHandler);
              resolve({
                success: true,
                data: event.data.data
              });
            } else if (event.data.type === 'goto_auth_error') {
              window.removeEventListener('message', messageHandler);
              reject(new Error(event.data.error));
            }
          };
          
          window.addEventListener('message', messageHandler);
          
          // Check if popup was closed manually
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              window.removeEventListener('message', messageHandler);
              reject(new Error('Authorization cancelled by user'));
            }
          }, 1000);
        });
      } else {
        return {
          success: false,
          error: data.error || 'Failed to start authorization'
        };
      }
    } catch (error) {
      console.error('Start auth error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Make automated call - handles auth automatically
  async makeAutoCall(phoneNumber, contactName, fromLineId = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/auto-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber,
          contactName,
          fromLineId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data: data.data,
          callId: data.callId,
          message: data.message
        };
      } else if (data.authRequired) {
        // Need authorization - start auth flow
        console.log('🔐 Authorization required, starting OAuth flow...');
        
        try {
          await this.startAuth();
          // Retry the call after authorization
          return await this.makeAutoCall(phoneNumber, contactName, fromLineId);
        } catch (authError) {
          return {
            success: false,
            error: 'Authorization failed: ' + authError.message,
            authRequired: true
          };
        }
      } else {
        return {
          success: false,
          error: data.error || 'Failed to make call',
          details: data.details
        };
      }
    } catch (error) {
      console.error('Auto call error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  // Test GoTo Connect connection
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          error: data.error || 'Connection test failed'
        };
      }
    } catch (error) {
      console.error('GoTo Connect test error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get account information
  async getAccountInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/account`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to get account info'
        };
      }
    } catch (error) {
      console.error('Get account info error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get available phone numbers
  async getPhoneNumbers() {
    try {
      const response = await fetch(`${API_BASE_URL}/phone-numbers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to get phone numbers'
        };
      }
    } catch (error) {
      console.error('Get phone numbers error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Initiate a call
  async initiateCall(phoneNumber, contactName, fromNumber = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber,
          contactName,
          fromNumber
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data: data.data,
          callId: data.callId,
          message: data.message
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to initiate call',
          details: data.details
        };
      }
    } catch (error) {
      console.error('Initiate call error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get call status
  async getCallStatus(callId) {
    try {
      const response = await fetch(`${API_BASE_URL}/call/${callId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to get call status'
        };
      }
    } catch (error) {
      console.error('Get call status error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // End a call
  async endCall(callId) {
    try {
      const response = await fetch(`${API_BASE_URL}/call/${callId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data: data.data,
          message: data.message
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to end call'
        };
      }
    } catch (error) {
      console.error('End call error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create and export a singleton instance
const gotoConnectAPI = new GoToConnectAPI();

// Export individual functions for easier importing
export const makeGoToConnectCall = (phoneNumber, contactName, fromNumber) => 
  gotoConnectAPI.initiateCall(phoneNumber, contactName, fromNumber);

export const makeAutoGoToConnectCall = (phoneNumber, contactName, fromLineId) => 
  gotoConnectAPI.makeAutoCall(phoneNumber, contactName, fromLineId);

export const checkGoToConnectStatus = (callId) => 
  gotoConnectAPI.getCallStatus(callId);

export const testGoToConnectConnection = () => 
  gotoConnectAPI.testConnection();

export const getGoToConnectAccountInfo = () => 
  gotoConnectAPI.getAccountInfo();

export const getGoToConnectPhoneNumbers = () => 
  gotoConnectAPI.getPhoneNumbers();

export const endGoToConnectCall = (callId) => 
  gotoConnectAPI.endCall(callId);

export const getGoToAuthStatus = () => 
  gotoConnectAPI.getAuthStatus();

export const startGoToAuth = () => 
  gotoConnectAPI.startAuth();

export default gotoConnectAPI;