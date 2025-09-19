import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Get all phone calls for a contact
router.get('/contact/:contactId', authenticateToken, async (req, res) => {
  try {
    const { data: calls, error } = await supabase
      .from('phone_calls')
      .select('*')
      .eq('contact_id', req.params.contactId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching phone calls:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json(calls);
  } catch (error) {
    console.error('Error fetching phone calls:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new phone call
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { data: call, error } = await supabase
      .from('phone_calls')
      .insert({
        ...req.body,
        created_by: req.user.userId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating phone call:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.status(201).json(call);
  } catch (error) {
    console.error('Error creating phone call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a phone call
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { data: call, error } = await supabase
      .from('phone_calls')
      .update({
        ...req.body,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating phone call:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!call) {
      return res.status(404).json({ error: 'Phone call not found' });
    }
    
    res.json(call);
  } catch (error) {
    console.error('Error updating phone call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a phone call
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('phone_calls')
      .delete()
      .eq('id', req.params.id);
    
    if (error) {
      console.error('Error deleting phone call:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting phone call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =========================
// GOTO CONNECT API ENDPOINTS
// =========================

const GOTO_CONNECT_API_BASE = 'https://api.goto.com/calls/v2/calls';

// Test different authentication methods
router.get('/goto-connect/test-auth', async (req, res) => {
  try {
    const gotoAppKey = "1746414108925783783_nXb4r9HhbjCQMYOV0kefarxg0VV9LzOQ";
    const gotoConnectKey = "1746414108925783783_EmUE8Fa0uujooXAG69vxVs6MkHh6L2Tk";
    
    console.log('🧪 Testing different GoTo Connect authentication methods...');
    
    const authMethods = [
      {
        name: 'Method 1: Bearer with App Key',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${gotoAppKey}`,
        }
      },
      {
        name: 'Method 2: Bearer with Connect Key',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${gotoConnectKey}`,
        }
      },
      {
        name: 'Method 3: X-API-Key with App Key',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': gotoAppKey,
        }
      },
      {
        name: 'Method 4: X-API-Key with Connect Key',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': gotoConnectKey,
        }
      },
      {
        name: 'Method 5: Both Bearer and X-API-Key',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${gotoAppKey}`,
          'X-API-Key': gotoConnectKey,
        }
      },
      {
        name: 'Method 6: Basic Auth',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${gotoAppKey}:${gotoConnectKey}`).toString('base64')}`,
        }
      }
    ];
    
    const results = [];
    
    for (const method of authMethods) {
      try {
        console.log(`Testing ${method.name}...`);
        const response = await fetch(GOTO_CONNECT_API_BASE, {
          method: 'HEAD',
          headers: method.headers
        });
        
        let responseBody = '';
        try {
          responseBody = await response.text();
        } catch (e) {
          responseBody = 'Could not read response body';
        }
        
        results.push({
          method: method.name,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          responseBody: responseBody
        });
        
        console.log(`${method.name}: ${response.status} ${response.statusText}`);
      } catch (error) {
        results.push({
          method: method.name,
          status: 'ERROR',
          statusText: error.message,
          success: false,
          responseBody: error.message
        });
        console.log(`${method.name}: ERROR - ${error.message}`);
      }
    }
    
    res.json({
      message: 'Authentication test completed',
      results: results
    });
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    res.status(500).json({ 
      error: error.message,
      message: 'Authentication test failed'
    });
  }
});

// Check GoTo Connect status via backend
router.get('/goto-connect/status/:gotoConnectId', async (req, res) => {
  try {
    const { gotoConnectId } = req.params;
    console.log('🔍 Backend: Checking GoTo Connect status for ID:', gotoConnectId);
    
    // Get GoTo Connect credentials from environment
    const gotoAppKey = "1746414108925783783_nXb4r9HhbjCQMYOV0kefarxg0VV9LzOQ";
    const gotoConnectKey = "1746414108925783783_EmUE8Fa0uujooXAG69vxVs6MkHh6L2Tk";

    console.log('🔑 Backend: Using GoTo Connect credentials:', {
      gotoAppKey: gotoAppKey ? `${gotoAppKey.substring(0, 8)}...` : 'Not set',
      gotoConnectKey: gotoConnectKey ? `${gotoConnectKey.substring(0, 8)}...` : 'Not set'
    });
    
    // Test connection to GoTo Connect API from backend (no CORS issues)
    // Try different authentication formats
    const response = await fetch(GOTO_CONNECT_API_BASE, {
      method: 'HEAD',
      headers: {
        'Content-Type': 'application/json',
        // Try different authentication header combinations
        'Authorization': `Bearer ${gotoAppKey}`,
        'X-API-Key': gotoConnectKey,
        // Alternative formats:
        'X-Goto-App-Key': gotoAppKey,
        'X-Goto-Connect-Key': gotoConnectKey,
        // Basic auth format:
        // 'Authorization': `Basic ${Buffer.from(`${gotoAppKey}:${gotoConnectKey}`).toString('base64')}`,
      }
    });
    console.log("response___", response);
    console.log("response.status___", response.status);
    console.log("response.statusText___", response.statusText);
    
    // Try to get response body for more details
    let responseBody = null;
    try {
      responseBody = await response.text();
      console.log("response.body___", responseBody);
    } catch (e) {
      console.log("Could not read response body:", e.message);
    }

    if (response.ok) {
      console.log('✅ Backend: GoTo Connect API accessible');
      res.json({ 
        status: 'connected', 
        message: 'GoTo Connect API accessible via backend',
        method: 'backend_api'
      });
    } else {
      console.log(`❌ Backend: GoTo Connect API not accessible: ${response.status}`);
      console.log(`❌ Response body: ${responseBody}`);
      res.json({ 
        status: 'failed', 
        error: `HTTP ${response.status} - ${response.statusText}`, 
        message: `GoTo Connect API not accessible via backend. Response: ${responseBody}`,
        method: 'backend_api',
        responseBody: responseBody
      });
    }
  } catch (error) {
    console.error('❌ Backend: GoTo Connect status check failed:', error);
    res.status(500).json({ 
      status: 'failed', 
      error: error.message, 
      message: 'Backend cannot connect to GoTo Connect API',
      method: 'backend_api'
    });
  }
});

// Make GoTo Connect call via backend
router.post('/goto-connect/make-call1', async (req, res) => {
  try {
    const { phoneNumber, contactName, gotoConnectId } = req.body;
    
    console.log('📞 Backend: Making GoTo Connect call...');
    console.log('📞 Backend: Phone:', phoneNumber);
    console.log('📞 Backend: Contact:', contactName);
    console.log('📞 Backend: GoTo Connect ID:', gotoConnectId);
    
    if (!phoneNumber || !gotoConnectId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and GoTo Connect ID are required' 
      });
    }
    
    // Get GoTo Connect credentials (hardcoded for testing)
    const gotoAppKey = "1746414108925783783_nXb4r9HhbjCQMYOV0kefarxg0VV9LzOQ";
    const gotoConnectKey = "1746414108925783783_EmUE8Fa0uujooXAG69vxVs6MkHh6L2Tk";
    
    console.log('🔑 Backend: Using GoTo Connect credentials for call:', {
      gotoAppKey: gotoAppKey ? `${gotoAppKey.substring(0, 8)}...` : 'Not set',
      gotoConnectKey: gotoConnectKey ? `${gotoConnectKey.substring(0, 8)}...` : 'Not set'
    });
    
    // Make call to GoTo Connect API from backend (no CORS issues)
    const response = await fetch(GOTO_CONNECT_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Try different authentication header combinations
        'Authorization': `Bearer ${gotoAppKey}`,
        'X-API-Key': gotoConnectKey,
        // Alternative formats:
        'X-Goto-App-Key': gotoAppKey,
        'X-Goto-Connect-Key': gotoConnectKey,
        // Basic auth format:
        // 'Authorization': `Basic ${Buffer.from(`${gotoAppKey}:${gotoConnectKey}`).toString('base64')}`,
      },
      body: JSON.stringify({
        dialString: phoneNumber,
        from: { lineId: gotoConnectId },
        autoAnswer: false,
        // Add any other required fields based on GoTo Connect docs
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Backend: GoTo Connect call successful:', result);
      res.json({ 
        success: true, 
        method: 'backend_api', 
        data: result,
        message: 'Call initiated successfully via backend'
      });
    } else {
      const errorData = await response.json();
      console.log(`❌ Backend: GoTo Connect API call failed: ${response.status}`, errorData);
      res.status(response.status).json({ 
        success: false, 
        error: `GoTo Connect API failed: ${response.status} - ${errorData.message || 'Unknown error'}`,
        method: 'backend_api'
      });
    }
  } catch (error) {
    console.error('❌ Backend: GoTo Connect call failed:', error);
    res.status(500).json({ 
      success: false, 
      error: `Backend API call failed: ${error.message}`,
      method: 'backend_api'
    });
  }
});

// Get GoTo Connect lines via backend
router.get('/goto-connect/lines', async (req, res) => {
  try {
    console.log('📱 Backend: Getting GoTo Connect lines...');
    
    // Get GoTo Connect credentials (hardcoded for testing)
    const gotoAppKey = "1746414108925783783_nXb4r9HhbjCQMYOV0kefarxg0VV9LzOQ";
    const gotoConnectKey = "1746414108925783783_EmUE8Fa0uujooXAG69vxVs6MkHh6L2Tk";
    
    console.log('🔑 Backend: Using GoTo Connect credentials for lines:', {
      gotoAppKey: gotoAppKey ? `${gotoAppKey.substring(0, 8)}...` : 'Not set',
      gotoConnectKey: gotoConnectKey ? `${gotoConnectKey.substring(0, 8)}...` : 'Not set'
    });
    
    // Get lines from GoTo Connect API from backend (no CORS issues)
    const response = await fetch('https://api.goto.com/lines', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gotoConnectKey}`,
        'X-API-Key': gotoAppKey,
        // Alternative header formats you might need:
        // 'X-Goto-App-Key': gotoAppKey,
        // 'X-Goto-Connect-Key': gotoConnectKey,
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Backend: Got GoTo Connect lines:', result);
      res.json({ 
        success: true, 
        lines: result.data || result,
        method: 'backend_api'
      });
    } else {
      console.log(`❌ Backend: Lines fetch failed: ${response.status}`);
      res.status(response.status).json({ 
        success: false, 
        error: `HTTP ${response.status}`,
        method: 'backend_api'
      });
    }
  } catch (error) {
    console.error('❌ Backend: Lines fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      method: 'backend_api'
    });
  }
});

export default router;