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

