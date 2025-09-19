import axios from 'axios';

class GoToConnectAPI {
  constructor() {
    this.baseURL = 'https://api.goto.com';
    this.identityBaseURL = 'https://api.getgo.com';
    this.clientId = 'a4058452-ca64-4aba-a0d4-a77b314da172';
    this.clientSecret = '23DTUdbooAMfLEbnpMO8lerm';
    this.tokenURL = 'https://authentication.logmeininc.com/oauth/token';
    // Updated access token with voice admin permissions
    this.accessToken = 'eyJraWQiOiI2MjAiLCJhbGciOiJSUzUxMiJ9.eyJzYyI6InZvaWNlLWFkbWluLnYxLnJlYWQgY2FsbHMudjIuaW5pdGlhdGUgdm9pY2UtYWRtaW4udjEud3JpdGUgaWRlbnRpdHk6IHdlYnJ0Yy52MS53cml0ZSB3ZWJydGMudjEucmVhZCB1c2Vycy52MS5saW5lcy5yZWFkIiwic3ViIjoiNjAxMzI0MjY3OTE0MzIwMTI5MiIsImF1ZCI6ImJjNzMxZTRjLTdjZTEtNDg1Zi05NmJjLWNjMWRlZWZlNDliMCIsIm9nbiI6InB3ZCIsImxzIjoiZmQyMGUxYWMtNTEyYS00YjBlLTg2MmUtNzg4NGQ0NDY5Yjc0IiwidHlwIjoiYSIsImV4cCI6MTc1ODI2OTgxNSwiaWF0IjoxNzU4MjY2MjE1LCJqdGkiOiJkMDc4YmFjNC0xMjkwLTQ4YmYtYTNkYS03NTUxNjJjYTQxYTgifQ.gY9b1zDMwkLF95zzfGOf2pJEealxIWLPvB7kWgVZBotHw_kTvwSXwCwttldtuo0kAQwbdlnuigRi4QxRdPg06MLCLeo-0qgE9mooA0_WyTUIA91QY2GTFyh79Q_MiuB7R3BBRkxU6oNkaTFH9neGw1-TUrAIOkBDO4HQ7-Z6ORhpvXJ4eJZWzwB8KGJ8fqrRxn3cN-BTRKpAgPzKsgYcFyWFdCFCrUT3YXEJhbQT7Baq3IExXxNIGwVEPMPdaN_ZBSqpxz6oO2KDsgNN-PAcH5doYFPxlqlrKpTi-FX983scGjIbHpVVDY8f20LkaiZDV_uInFnwj0H1swkF_OQIBQ';
    this.userId = null;
    this.tokenExpiry = null;
    // Default line ID for direct calls
    this.defaultLineId = '836ce9e8-7a2b-4aaa-b61a-932d22aeb9ca';
    // Cache of discovered lines for current token
    this._cachedUserLines = null;
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

  // Fetch lines available to the authenticated user (requires users.v1.lines.read)
  async getUserLines() {
    try {
      // Return cached if present
      if (this._cachedUserLines && Array.isArray(this._cachedUserLines)) {
        return this._cachedUserLines;
      }

      const token = await this.getAccessToken();
      // Users API is on api.goto.com
      // We need a userId for the path
      const userId = await this.getUserId();

      // Typical path: /users/v1/users/{userId}/lines
      const url = `${this.baseURL}/users/v1/users/${encodeURIComponent(userId)}/lines`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });

      const lines = Array.isArray(response.data?.items) ? response.data.items : (response.data || []);
      this._cachedUserLines = lines;
      return lines;
    } catch (error) {
      console.error('❌ Failed to fetch user lines:', error.response?.data || error.message);
      return [];
    }
  }

  // Pick a reasonable default line that has at least one device assigned
  async resolveDefaultFrom() {
    // If a defaultLineId is set, prefer it
    if (this.defaultLineId) {
      return { lineId: this.defaultLineId };
    }
    const lines = await this.getUserLines();
    if (!lines.length) return null;

    // Heuristic: prefer a line that has devices and is not a ring group/queue
    const withDevices = lines.find(l => (l.devices && l.devices.length) || l.deviceCount > 0);
    if (withDevices?.id) {
      this.defaultLineId = withDevices.id; // cache for next time
      return { lineId: withDevices.id };
    }
    // Fallback to first line
    const first = lines[0];
    if (first?.id) {
      this.defaultLineId = first.id;
      return { lineId: first.id };
    }
    return null;
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

  // Direct call using GoTo Connect v2 API with the specified format
  async makeDirectCall(phoneNumber, contactName, fromLineId = null) {
    try {
      const token = await this.getAccessToken();
      
      // Build `from` object: allow passing an object (e.g., { lineId } or { phoneNumberId })
      let from = null;
      if (fromLineId && typeof fromLineId === 'object') {
        // Use as-is but whitelist expected keys
        const { lineId, phoneNumberId, deviceId } = fromLineId;
        from = {};
        if (lineId) from.lineId = lineId;
        if (phoneNumberId) from.phoneNumberId = phoneNumberId;
        if (deviceId) from.deviceId = deviceId;
      } else {
        // Use provided line ID string; otherwise resolve dynamically
        if (typeof fromLineId === 'string' && fromLineId.trim()) {
          from = { lineId: fromLineId };
        } else {
          from = await this.resolveDefaultFrom();
          if (!from?.lineId) {
            throw new Error('No usable line found for the authenticated user. Please authenticate a user with at least one assigned device/line.');
          }
        }
      }
      
      // Format phone number: simple E.164-like normalization
      let dialString = `${phoneNumber}`.trim();
      dialString = dialString.replace(/[^\d+]/g, '');
      if (!dialString.startsWith('+')) {
        // Heuristics: Pakistan numbers starting with 03 -> +92
        if (/^03\d{9}$/.test(dialString)) {
          dialString = `+92${dialString.substring(1)}`;
        } else if (/^\d{10}$/.test(dialString)) {
          // 10-digit -> assume US
          dialString = `+1${dialString}`;
        } else if (/^\d{11,15}$/.test(dialString)) {
          // If already country code without +, add +
          dialString = `+${dialString}`;
        } else {
          throw new Error(`Invalid phone number format: ${phoneNumber}`);
        }
      }

      console.log(`📞 Making direct GoTo Connect call to ${contactName} (${dialString})`);
  if (from.lineId) console.log(`📱 Using line ID: ${from.lineId}`);
  if (from.phoneNumberId) console.log(`📞 Using phoneNumberId: ${from.phoneNumberId}`);

      // GoTo Connect Calls v2 API call format as specified in official docs
      const callData = {
        dialString: dialString,
        from,
        autoAnswer: true
      };

      console.log('📞 Direct call data:', callData);

      // Correct endpoint: POST https://api.goto.com/calls/v2/calls
      const response = await axios.post(`${this.baseURL}/calls/v2/calls`, callData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('✅ Direct GoTo Connect call initiated (queued). InitiatorId:', response.data?.initiatorId);

      return {
        success: true,
        data: response.data,
        callId: response.data.callId || response.data.id || response.data.initiatorId,
        message: `Direct call initiated to ${contactName} (${dialString})`
      };
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      console.error(`❌ Failed to initiate direct GoTo Connect call (status ${status || 'unknown'}):`, data || error.message);
      return {
        success: false,
        error: data?.error_description || data?.message || error.message,
        details: data
      };
    }
  }

  // Initiate a call using GoTo Connect API with user ID from identity API
  async initiateCall(phoneNumber, contactName, fromLineId = null) {
    // Reuse the same Calls v2 implementation to avoid divergence
    return this.makeDirectCall(phoneNumber, contactName, fromLineId);
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

