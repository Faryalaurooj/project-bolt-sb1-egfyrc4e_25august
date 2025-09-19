import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import gotoConnectAPI from '../services/gotoConnectApi.js';

const router = express.Router();

// Generate authorization URL for OAuth flow
router.get('/auth-url', async (req, res) => {
  try {
    const { redirect_uri, state } = req.query;
    
    if (!redirect_uri) {
      return res.status(400).json({
        success: false,
        error: 'redirect_uri is required'
      });
    }
    
    const authURL = gotoConnectAPI.generateAuthorizationURL(redirect_uri, state);
    
    
    res.json({
      success: true,
      message: 'Authorization URL generated successfully',
      data: {
        auth_url: authURL,
        redirect_uri: redirect_uri,
        state: state
      }
    });
  } catch (error) {
    console.error('❌ Auth URL generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to generate authorization URL'
    });
  }
});

// Set access token directly
router.post('/set-token', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: 'access_token is required'
      });
    }
    
    gotoConnectAPI.setAccessToken(access_token);
    
    res.json({
      success: true,
      message: 'Access token set successfully',
      token_preview: access_token.substring(0, 20) + '...'
    });
  } catch (error) {
    console.error('❌ Set token error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to set access token'
    });
  }
});

// Exchange authorization code for access token
router.post('/exchange-code', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    
    if (!code || !redirect_uri) {
      return res.status(400).json({
        success: false,
        error: 'code and redirect_uri are required'
      });
    }
    
    const result = await gotoConnectAPI.exchangeCodeForToken(code, redirect_uri);
    
    res.json({
      success: true,
      message: 'Authorization code exchanged successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Code exchange error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to exchange authorization code'
    });
  }
});

// Get authorization status
router.get('/auth-status', async (req, res) => {
  try {
    const status = gotoConnectAPI.getAuthorizationStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('❌ Auth status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Handle OAuth callback (when user is redirected back from GoTo)
router.get('/oauth-callback', async (req, res) => {
  try {
    const { code, error, error_description } = req.query;
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error_description || error,
        message: 'OAuth authorization was denied or failed'
      });
    }
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'No authorization code received',
        message: 'OAuth callback missing authorization code'
      });
    }
    
    // Exchange code for tokens
    const result = await gotoConnectAPI.exchangeCodeForToken(code, gotoConnectAPI.redirectUri);
    
    // Redirect to a success page or close the window
    res.send(`
      <html>
        <head><title>GoTo Connect Authorization</title></head>
        <body>
          <h2>✅ Authorization Successful!</h2>
          <p>GoTo Connect has been authorized successfully. You can now make calls.</p>
          <script>
            // Try to close the popup window
            if (window.opener) {
              window.opener.postMessage({type: 'goto_auth_success', data: ${JSON.stringify(result)}}, '*');
              window.close();
            } else {
              // If not a popup, redirect to the main app
              setTimeout(() => {
                window.location.href = '/';
              }, 2000);
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    res.send(`
      <html>
        <head><title>GoTo Connect Authorization Error</title></head>
        <body>
          <h2>❌ Authorization Failed</h2>
          <p>Error: ${error.message}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({type: 'goto_auth_error', error: '${error.message}'}, '*');
              window.close();
            }
          </script>
        </body>
      </html>
    `);
  }
});

// Initiate OAuth flow - returns URL or directly redirects
router.get('/start-auth', async (req, res) => {
  try {
    // Prefer configured SPA redirect (e.g., http://localhost:5173) if provided in service
    const redirect = (gotoConnectAPI.redirectUri || 'http://localhost:5173')
      .replace(/\/$/, '') + '/goto-auth-callback';
    const authUrl = gotoConnectAPI.generateAuthorizationURL(redirect);
    
    // If this is requested via API, return the URL
    if (req.headers.accept?.includes('application/json')) {
      res.json({
        success: true,
        authUrl: authUrl,
        message: 'Visit this URL to authorize GoTo Connect'
      });
    } else {
      // If accessed via browser, redirect directly
      res.redirect(authUrl);
    }
  } catch (error) {
    console.error('❌ Start auth error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Try to obtain an access token without user interaction
router.post('/auto-auth', async (req, res) => {
  try {
    // If we already have a valid token, return success
    const token = await gotoConnectAPI.getAccessToken();
    if (token) {
      return res.json({ success: true, message: 'Token already available', mode: 'existing' });
    }

    // Try refresh if refresh token exists
    try {
      const refreshed = await gotoConnectAPI.refreshAccessToken();
      if (refreshed) {
        return res.json({ success: true, message: 'Token refreshed', mode: 'refresh' });
      }
    } catch (e) {
      // ignore and fall back to client credentials
    }

    // Try client credentials if supported by account/app
    try {
      const cc = await gotoConnectAPI.getClientCredentialsToken();
      if (cc) {
        return res.json({ success: true, message: 'Client credentials token acquired', mode: 'client_credentials' });
      }
    } catch (ccErr) {
      // Not supported or failed
    }

    // Otherwise, require interactive auth
    const redirect = (gotoConnectAPI.redirectUri || 'http://localhost:5173')
      .replace(/\/$/, '') + '/goto-auth-callback';
    return res.status(401).json({
      success: false,
      authRequired: true,
      authUrl: gotoConnectAPI.generateAuthorizationURL(redirect),
      message: 'Interactive authorization required'
    });
  } catch (error) {
    console.error('❌ Auto-auth error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test GoTo Connect connection
router.get('/test',  async (req, res) => {
  try {
    console.log('🔍 Testing GoTo Connect API connection...');
    
    const result = await gotoConnectAPI.testConnection();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'GoTo Connect API is ready',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: 'GoTo Connect API connection failed'
      });
    }
  } catch (error) {
    console.error('❌ GoTo Connect test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'GoTo Connect API test failed'
    });
  }
});

// Get account information
router.get('/account', authenticateToken, async (req, res) => {
  try {
    const result = await gotoConnectAPI.getAccountInfo();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Get account info error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available phone numbers
router.get('/phone-numbers', authenticateToken, async (req, res) => {
  try {
    const result = await gotoConnectAPI.getPhoneNumbers();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Get phone numbers error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Automated call endpoint - handles auth automatically
router.post('/auto-call', async (req, res) => {
  try {
    const { phoneNumber, contactName, fromLineId } = req.body;
    
    // Validate required fields
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    
    if (!contactName) {
      return res.status(400).json({
        success: false,
        error: 'Contact name is required'
      });
    }
    
    console.log(`📞 Auto-call request for ${contactName} (${phoneNumber})`);
    
    // Check authorization status
    const authStatus = gotoConnectAPI.getAuthorizationStatus();
    
    if (!authStatus.authorized) {
      return res.status(401).json({
        success: false,
        error: 'Authorization required',
        authRequired: true,
        authUrl: authStatus.authUrl,
        message: 'Please authorize GoTo Connect first',
        nextSteps: authStatus.nextSteps
      });
    }
    
    // Ensure we have a valid token
    const token = await gotoConnectAPI.getAccessToken();
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No valid access token available',
        authRequired: true,
        authUrl: gotoConnectAPI.generateAuthorizationURL(`http://localhost:5000/api/goto-connect/oauth-callback`),
        message: 'Token expired and refresh failed. Please re-authorize.'
      });
    }
    
    // Make the call
    const result = await gotoConnectAPI.makeDirectCall(phoneNumber, contactName, fromLineId);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.data,
        callId: result.callId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        details: result.details
      });
    }
  } catch (error) {
    console.error('❌ Auto-call error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Direct call using GoTo Connect v2 API
router.post('/direct-call', async (req, res) => {
  try {
    const { phoneNumber, contactName, fromLineId } = req.body;
    
    // Validate required fields
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    
    if (!contactName) {
      return res.status(400).json({
        success: false,
        error: 'Contact name is required'
      });
    }
    
    console.log(`📞 Making direct call to ${contactName} (${phoneNumber}) using GoTo Connect v2 API`);
    
    const result = await gotoConnectAPI.makeDirectCall(phoneNumber, contactName, fromLineId);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.data,
        callId: result.callId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        details: result.details
      });
    }
  } catch (error) {
    console.error('❌ Direct call error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Initiate a call
router.post('/call', async (req, res) => {
  try {
    const { phoneNumber, contactName, fromLineId } = req.body;
    
    // Validate required fields
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    
    if (!contactName) {
      return res.status(400).json({
        success: false,
        error: 'Contact name is required'
      });
    }
    
    console.log(`📞 Initiating call to ${contactName} (${phoneNumber}) using GoTo Connect v2 API`);
    
    const result = await gotoConnectAPI.initiateCall(phoneNumber, contactName, fromLineId);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.data,
        callId: result.callId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        details: result.details
      });
    }
  } catch (error) {
    console.error('❌ Initiate call error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get call status
router.get('/call/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    
    if (!callId) {
      return res.status(400).json({
        success: false,
        error: 'Call ID is required'
      });
    }
    
    const result = await gotoConnectAPI.getCallStatus(callId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Get call status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// End a call
router.post('/call/:callId/end', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    
    if (!callId) {
      return res.status(400).json({
        success: false,
        error: 'Call ID is required'
      });
    }
    
    const result = await gotoConnectAPI.endCall(callId);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Call ended successfully',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ End call error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

