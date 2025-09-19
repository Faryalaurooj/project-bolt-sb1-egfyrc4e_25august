import axios from 'axios';
import dotenv from 'dotenv';
import tokenStorage from './tokenStorage.js';

// Load environment variables
dotenv.config();

class GoToConnectAPI {
  constructor() {
    // Use environment variables for credentials
    this.clientId = process.env.GoTo_Client_Id;
    this.clientSecret = process.env.GoTo_Secret_Id;
    
    // GoTo Connect API endpoints (based on documentation research)
    this.baseURL = 'https://api.goto.com';
    this.identityBaseURL = 'https://api.getgo.com';
    this.tokenURL = 'https://authentication.logmeininc.com/oauth/token';
  this.redirectUri = process.env.GoTo_Redirect_Uri || 'http://localhost:5173';
    
    // Token management
    this.accessToken = null;
    this.refreshToken = null;
    this.userId = null;
    this.tokenExpiry = null;
    
    // Default line ID for direct calls (this should be obtained from your account)
    this.defaultLineId = null;
    
    console.log(`🔧 GoTo Connect API initialized with Client ID: ${this.clientId?.substring(0, 8)}...`);
    
    // Load any existing tokens on startup
    this.loadStoredTokens();
  }

  // Load tokens from storage
  loadStoredTokens() {
    const tokens = tokenStorage.loadTokens();
    if (tokens) {
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
      this.tokenExpiry = new Date(tokens.expires_at);
      console.log('✅ Loaded stored GoTo Connect tokens');
    }
  }

  // Generate authorization URL for user to get authorization code
  generateAuthorizationURL(redirectUri = null, state = null) {
    const finalRedirectUri = redirectUri || this.redirectUri;
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: finalRedirectUri,
      scope: 'users.v1.lines.read calls.v2.initiate calls.v2.read calls.v2.control'
    });
    
    if (state) {
      params.append('state', state);
    }
    
    return `https://authentication.logmeininc.com/oauth/authorize?${params.toString()}`;
  }

  // Check if we need authorization (no valid tokens available)
  needsAuthorization() {
    return !this.accessToken || (this.tokenExpiry && new Date() >= this.tokenExpiry && !this.refreshToken);
  }

  // Get authorization status and next steps
  getAuthorizationStatus() {
    if (this.accessToken && (!this.tokenExpiry || new Date() < this.tokenExpiry)) {
      return {
        authorized: true,
        message: 'Ready to make calls',
        hasToken: true
      };
    }
    
    if (this.refreshToken) {
      return {
        authorized: true,
        message: 'Token can be refreshed automatically',
        hasToken: false,
        canRefresh: true
      };
    }
    
    return {
      authorized: false,
      message: 'Authorization required',
      authUrl: this.generateAuthorizationURL(),
      nextSteps: [
        '1. Visit the authorization URL',
        '2. Grant permissions',
        '3. The system will automatically capture the authorization code'
      ]
    };
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
        this.refreshToken = response.data.refresh_token;
        const expiresIn = response.data.expires_in || 3600;
        this.tokenExpiry = new Date(Date.now() + (expiresIn - 60) * 1000);
        
        // Store tokens for persistence
        tokenStorage.storeTokens(response.data);
        
        console.log('✅ Authorization code exchanged successfully');
        return {
          success: true,
          access_token: response.data.access_token,
          token_type: response.data.token_type,
          expires_in: response.data.expires_in,
          scope: response.data.scope,
          principal: response.data.principal,
          refresh_token: response.data.refresh_token
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

  // Refresh access token using refresh token
  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Refreshing access token...');
      
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(this.tokenURL, 
        `grant_type=refresh_token&refresh_token=${this.refreshToken}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`,
            'Accept': 'application/json'
          }
        }
      );

      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        if (response.data.refresh_token) {
          this.refreshToken = response.data.refresh_token;
        }
        const expiresIn = response.data.expires_in || 3600;
        this.tokenExpiry = new Date(Date.now() + (expiresIn - 60) * 1000);
        
        // Store refreshed tokens
        tokenStorage.storeTokens(response.data);
        
        console.log('✅ Access token refreshed successfully');
        return this.accessToken;
      } else {
        throw new Error('No access token received from refresh');
      }
    } catch (error) {
      console.error('❌ Failed to refresh access token:', error.response?.data || error.message);
      // Clear invalid tokens
      this.accessToken = null;
      this.refreshToken = null;
      tokenStorage.clearTokens();
      throw new Error(`Token refresh failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  // Get access token with automatic refresh
  async getAccessToken() {
    // Check if token is expired or about to expire
    if (this.tokenExpiry && new Date() >= this.tokenExpiry) {
      console.log('⚠️ Access token has expired, attempting refresh...');
      try {
        return await this.refreshAccessToken();
      } catch (error) {
        console.log('❌ Token refresh failed, need new authorization');
        return null;
      }
    }
    
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
      
      // Try different possible endpoints for account info
      const endpoints = [
        `${this.baseURL}/admin/v1/accounts/me`,
        `${this.baseURL}/v1/accounts/me`,
        `${this.baseURL}/connect/v1/accounts/me`
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Trying account endpoint: ${endpoint}`);
          
          const response = await axios.get(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });

          return {
            success: true,
            data: response.data
          };
        } catch (endpointError) {
          console.log(`❌ Account endpoint ${endpoint} failed:`, endpointError.response?.status, endpointError.response?.data);
          
          if (endpoint === endpoints[endpoints.length - 1]) {
            throw endpointError;
          }
        }
      }
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

  // Get client credentials access token (Note: GoTo Connect may not support this grant type)
  async getClientCredentialsToken() {
    try {
      console.log('🔄 Attempting client credentials token...');
      
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(this.tokenURL, 
        'grant_type=client_credentials&scope=calls.v2.initiate voice-admin.v1.read voice-admin.v1.write',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`,
            'Accept': 'application/json'
          }
        }
      );

      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        const expiresIn = response.data.expires_in || 3600;
        this.tokenExpiry = new Date(Date.now() + (expiresIn - 60) * 1000);
        
        console.log('✅ Client credentials token obtained successfully');
        return this.accessToken;
      } else {
        throw new Error('No access token received from GoTo Connect API');
      }
    } catch (error) {
      console.error('❌ Client credentials not supported:', error.response?.data || error.message);
      throw new Error(`GoTo Connect requires authorization_code flow. Please use OAuth authorization flow first.`);
    }
  }

  // Direct call using GoTo Connect API (updated endpoint)
  async makeDirectCall(phoneNumber, contactName, fromLineId = null) {
    try {
      // Check if we have an access token
      if (!this.accessToken) {
        throw new Error('No access token available. Please complete OAuth authorization flow first.');
      }
      
      // Format phone number for dialing
      let dialString = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        dialString = `+1${phoneNumber.replace(/\D/g, '')}`;
      }

      console.log(`📞 Making direct GoTo Connect call to ${contactName} (${dialString})`);

      // Try different call data formats and endpoints
      const callDataFormats = [
        // Format 1: Simple dialString format (v2 API style)
        {
          dialString: dialString,
          from: {
            lineId: fromLineId || this.defaultLineId
          },
          autoAnswer: true
        },
        // Format 2: Standard format with type specification
        {
          from: {
            type: "line",
            id: fromLineId || this.defaultLineId
          },
          to: {
            type: "phoneNumber", 
            id: dialString
          }
        },
        // Format 3: Simplified format
        {
          to: dialString,
          from: fromLineId || this.defaultLineId
        }
      ];

      // Try different possible endpoints
      const endpoints = [
        `${this.baseURL}/calls/v2/initiate`,
        `${this.baseURL}/connect/v1/calls`,
        `${this.baseURL}/voice/v1/calls`, 
        `${this.baseURL}/v1/calls`,
        `${this.baseURL}/admin/v1/calls`
      ];

      for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i];
        
        for (let j = 0; j < callDataFormats.length; j++) {
          const callData = callDataFormats[j];
          
          try {
            console.log(`🔄 Trying endpoint: ${endpoint} with format ${j + 1}`);
            console.log('📞 Call data:', JSON.stringify(callData, null, 2));
            
            const response = await axios.post(endpoint, callData, {
              headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });

            console.log('✅ Direct GoTo Connect call initiated successfully:', response.data);

            return {
              success: true,
              data: response.data,
              callId: response.data.callId || response.data.id,
              message: `Direct call initiated to ${contactName} (${dialString})`,
              endpoint: endpoint,
              format: j + 1
            };
          } catch (endpointError) {
            console.log(`❌ Endpoint ${endpoint} format ${j + 1} failed:`, endpointError.response?.status, endpointError.response?.data);
            
            // If this is the last combination, continue to next endpoint
            if (j === callDataFormats.length - 1 && i === endpoints.length - 1) {
              // This was the last combination, re-throw the error
              throw endpointError;
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to initiate direct GoTo Connect call:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error_description || error.message,
        details: error.response?.data,
        suggestion: !this.accessToken ? 'Please complete OAuth authorization flow first using /api/goto-connect/auth-url' : 'Check API credentials and permissions'
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
      
      // Check if credentials are configured
      if (!this.clientId || !this.clientSecret) {
        throw new Error('GoTo Connect credentials not configured. Check GoTo_Client_Id and GoTo_Secret_Id in .env file');
      }

      console.log('✅ GoTo Connect credentials are configured');
      console.log(`Client ID: ${this.clientId.substring(0, 8)}...`);

      // Check if we already have an access token
      if (this.accessToken) {
        console.log('✅ Access token is available');
        
        // Try to test with a simple API call
        try {
          const accountResult = await this.getAccountInfo();
          if (accountResult.success) {
            return {
              success: true,
              message: 'GoTo Connect API is ready with existing token',
              tokenAvailable: true,
              accountInfo: accountResult.data
            };
          }
        } catch (tokenError) {
          console.log('⚠️ Existing token may be expired or invalid');
        }
      }

      // GoTo Connect requires OAuth authorization flow
      return {
        success: true,
        message: 'GoTo Connect credentials configured. Ready for OAuth flow.',
        credentialsConfigured: true,
        note: 'GoTo Connect requires OAuth authorization_code flow. Use /auth-url endpoint to start OAuth flow.',
        nextSteps: [
          '1. Call /api/goto-connect/auth-url with redirect_uri to get authorization URL',
          '2. User authorizes the application in browser',
          '3. Call /api/goto-connect/exchange-code with the authorization code',
          '4. Use the obtained access token for API calls'
        ]
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

