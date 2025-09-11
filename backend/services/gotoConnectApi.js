import axios from 'axios';

class GoToConnectAPI {
  constructor() {
    this.baseURL = 'https://api.goto.com';
    this.identityBaseURL = 'https://api.getgo.com';
    this.clientId = 'a4058452-ca64-4aba-a0d4-a77b314da172';
    this.clientSecret = '23DTUdbooAMfLEbnpMO8lerm';
    this.tokenURL = 'https://authentication.logmeininc.com/oauth/token';
    this.accessToken = 'eyJraWQiOiI2MjAiLCJhbGciOiJSUzUxMiJ9.eyJzYyI6InN1cHBvcnQ6IGlkZW50aXR5OiBpZGVudGl0eTpzY2ltLm9yZyBjb2xsYWI6IGlkZW50aXR5OnNjaW0ubWUiLCJzdWIiOiIxNzQ2NDE0MTA4OTI1NzgzNzgzIiwiYXVkIjoiZTY3Yjc4ZTctNmE4My00MmI0LWE2OGUtOTNhMWFmOWJjZmZhIiwib2duIjoicHdkIiwidHlwIjoiYSIsImV4cCI6MTc1NzQyNzU1NCwiaWF0IjoxNzU3NDIzOTU0LCJqdGkiOiJkZmM1ODU1Ny05MWIwLTQxNWUtYmI3YS0xMzAwOTcyZWUyZTMiLCJsb2EiOjN9.kg7S3sjajij7Y4cHeAnwE_3EocCyF3Qp9vAzIKUXBL_pHSDWwXxdpDGGdg94LxKfc4jPgI6pDdvtSrbf03CkLF3rdoUgA9zIHGgu6AoaxoftUygfyWO9vvxa1Y7d9vRYeWnqe7YRXX8NsrX0X2PssXdPsUMcNJzER4TNQR5kFeUqvmXRqQHMyzThdek9sxpogfftTCdtGjrgbiv19r2TSLW6FeP7kXJpBLMMYAZyHbwx4o7NPd__fLlvts9qKzq3fDP-UBtxBGOqPCu3yUiDF3N6I-BK1Y_7jcCaY8lpw5hlK0i-8MBoISqZreDWoAItoyoYl_p-dYZ5k-7Be4dAOw';
    this.userId = null;
    this.tokenExpiry = null;
  }

  // Generate authorization URL for user to get authorization code
  generateAuthorizationURL(redirectUri, state = null) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'users.v1.lines.read calls.v2.initiate calls.v2.read calls.v2.control'
    });
    
    if (state) {
      params.append('state', state);
    }
    
    return `https://authentication.logmeininc.com/oauth/authorize?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(authorizationCode, redirectUri) {
    try {
      console.log('🔄 Exchanging authorization code for access token...');
      
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(this.tokenURL, 
        `grant_type=authorization_code&code=${authorizationCode}&redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`,
            'Accept': 'application/json'
          }
        }
      );
      console.log("response___", response);

      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        const expiresIn = response.data.expires_in || 3600;
        this.tokenExpiry = new Date(Date.now() + (expiresIn - 60) * 1000);
        
        console.log('✅ Authorization code exchanged successfully');
        return {
          success: true,
          access_token: response.data.access_token,
          token_type: response.data.token_type,
          expires_in: response.data.expires_in,
          scope: response.data.scope,
          principal: response.data.principal
        };
      } else {
        throw new Error('No access token received from GoTo Connect API');
      }
    } catch (error) {
      console.error('❌ Failed to exchange authorization code:', error.response?.data || error.message);
      throw new Error(`Authorization code exchange failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  // Set access token directly
  setAccessToken(token) {
    this.accessToken = token;
    console.log('✅ Access token set:', token ? token.substring(0, 20) + '...' : 'None');
  }

  // Get access token
  async getAccessToken() {
    return this.accessToken;
  }

  // Get user ID from identity API
  async getUserId() {
    try {
      if (this.userId) {
        return this.userId;
      }

      console.log('🔄 Getting user ID from identity API...');
      
      const response = await axios.get(`${this.identityBaseURL}/identity/v1/Users/me`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.id) {
        this.userId = response.data.id;
        console.log('✅ User ID retrieved:', this.userId);
        return this.userId;
      } else {
        throw new Error('No user ID found in identity response');
      }
    } catch (error) {
      console.error('❌ Failed to get user ID:', error.response?.data || error.message);
      throw new Error(`Failed to get user ID: ${error.response?.data?.error_description || error.message}`);
    }
  }

  // Get account information
  async getAccountInfo() {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(`${this.baseURL}/v1/accounts/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Failed to get account info:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error_description || error.message
      };
    }
  }

  // Get phone numbers available for calling
  async getPhoneNumbers() {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(`${this.baseURL}/v1/phoneNumbers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Failed to get phone numbers:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error_description || error.message
      };
    }
  }

  // Initiate a call using GoTo Connect API with user ID from identity API
  async initiateCall(phoneNumber, contactName, fromLineId = null) {
    try {
      const token = await this.getAccessToken();
      
      // Get user ID from identity API first
      const userId = await this.getUserId();
      
      // Format phone number for dialing (ensure it's in correct format)
      let dialString = phoneNumber;
      
      // If number doesn't start with +, add country code
      if (!phoneNumber.startsWith('+')) {
        // Check if it's a Pakistani number (starts with 03)
        if (phoneNumber.startsWith('03')) {
          // Pakistani number: 03175970284 -> +923175970284
          dialString = `+92${phoneNumber.substring(1)}`;
        } else if (phoneNumber.startsWith('1') && phoneNumber.length === 10) {
          // US number: 1234567890 -> +11234567890
          dialString = `+1${phoneNumber}`;
        } else {
          // Default: assume it needs +1 (US)
          dialString = `+1${phoneNumber.replace(/\D/g, '')}`;
        }
      }

      console.log(`📞 Initiating GoTo Connect call to ${contactName} (${dialString})`);
      console.log(`👤 Using user ID: ${userId}`);

      // GoTo Connect v1 API call for initiating calls
      const callData = {
        from: {
          type: "user",
          id: userId // Use actual user ID from identity API
        },
        to: {
          type: "phoneNumber",
          id: dialString
        },
        context: "outbound"
      };

      console.log('📞 Call data:', callData);

      const response = await axios.post(`${this.baseURL}/connect/v1/calls`, callData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('✅ GoTo Connect call initiated successfully:', response.data);

      return {
        success: true,
        data: response.data,
        callId: response.data.callId || response.data.id,
        message: `Call initiated to ${contactName} (${dialString})`
      };
    } catch (error) {
      console.error('❌ Failed to initiate GoTo Connect call:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error_description || error.message,
        details: error.response?.data
      };
    }
  }

  // Get call status
  async getCallStatus(callId) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(`${this.baseURL}/v1/calls/${callId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Failed to get call status:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error_description || error.message
      };
    }
  }

  // End a call
  async endCall(callId) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.post(`${this.baseURL}/v1/calls/${callId}/end`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Failed to end call:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error_description || error.message
      };
    }
  }

  // Test connection
  async testConnection() {
    try {
      console.log('🔍 Testing GoTo Connect API connection...');
      
      // First, try to get an access token
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('Failed to obtain access token');
      }

      // Then, try to get account info
      const accountResult = await this.getAccountInfo();
      if (!accountResult.success) {
        throw new Error(`Account info failed: ${accountResult.error}`);
      }

      console.log('✅ GoTo Connect API connection test successful');
      return {
        success: true,
        message: 'GoTo Connect API is ready',
        accountInfo: accountResult.data
      };
    } catch (error) {
      console.error('❌ GoTo Connect API connection test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create a singleton instance
const gotoConnectAPI = new GoToConnectAPI();

export default gotoConnectAPI;

