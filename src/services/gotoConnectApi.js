// GoTo Connect API service for frontend
const API_BASE_URL = 'http://localhost:5000/api/goto-connect';

class GoToConnectAPI {
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

export default gotoConnectAPI;