import express from 'express';
import fetch from 'node-fetch';
import { WebSocket, WebSocketServer } from 'ws';

const router = express.Router();

// Jive WebRTC API configuration
const JIVE_CONFIG = {
  API_BASE_URL: 'https://webrtc.jive.com/web-calls/v1',
  ORGANIZATION_ID: '0149be93-9b2d-9ac4-5712-000100420005',
  EXTENSION_NUMBER: '223',
  IMPERSONATEE_USER_KEY: '6141815170848815365',
  JWT_TOKEN: 'eyJraWQiOiI2MjAiLCJhbGciOiJSUzUxMiJ9.eyJzYyI6ImNhbGxzLnYyLmluaXRpYXRlIHdlYnJ0Yy52MS53cml0ZSB3ZWJydGMudjEucmVhZCB1c2Vycy52MS5saW5lcy5yZWFkIiwic3ViIjoiMTc0NjQxNDEwODkyNTc4Mzc4MyIsImF1ZCI6ImE0MDU4NDUyLWNhNjQtNGFiYS1hMGQ0LWE3N2IzMTRkYTE3MiIsIm9nbiI6InB3ZCIsImxzIjoiM2ZmOGNhODYtYmJmZi00NzY5LTlhMDYtZGM4MGNkZmZkMTRlIiwidHlwIjoiYSIsImV4cCI6MTc1ODAxODU4MiwiaWF0IjoxNzU4MDE0OTgyLCJqdGkiOiJmYjdkZmViOS03OGUxLTQyZTItYWI3YS02NWE3M2FmNmJmMDMiLCJsb2EiOjN9.SKGVr1Sb7tD9ueaqJP_cTdV6-OfEQ3bXGJk2xMtavvUb0Sf7B5vldqtlwN4pfUysFpDzRPmNJ4-bURIvjXQc03tiFw-susoBmOslBIBCY1lpxSdAS9qRWOJbKyllsi06GbeF9DLFiMjXBg9orDOukB3QNehdYuxvKtMawgqtMtu3yUQzXNEDFOK21bM1a44yYCcWPH4IzuiKGDKFAt7QiMIYCVjxSUN3Zg9jUu9Oe5UvFKTAmTX6I7YahvMbBaUV9BqNt5PLKvSs6T-qkro4QYI3Eb1wMQ4r8TFIykMeX-tbYf4HWmc4P-g8VOUFQvzhDw3BvR24l6rvHO7yNXSmDA'
};

// Make a WebRTC call via Jive API
router.post('/make-call', async (req, res) => {
  try {
    const { phoneNumber, contactName, sdp, deviceId, inCallChannelId } = req.body;

    // Validate required fields
    if (!phoneNumber || !sdp || !deviceId || !inCallChannelId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: phoneNumber, sdp, deviceId, inCallChannelId'
      });
    }

    // Check if device exists and is active
    const device = deviceStorage.get(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found. Please register device first.',
        deviceId: deviceId
      });
    }

    // Update device last active
    device.lastActive = new Date().toISOString();
    deviceStorage.set(deviceId, device);


    // Format phone number for dialing (ensure it's in correct format)
    let dialString = "03175970284";
    
    // If number doesn't start with +, add country code
  

    // Prepare call data for Jive API
    const callData = {
      dialString: "03175970284",
      sdp: sdp,
      deviceId: deviceId,
      organizationId: JIVE_CONFIG.ORGANIZATION_ID,
      extensionNumber: JIVE_CONFIG.EXTENSION_NUMBER,
      inCallChannelId: inCallChannelId,
      // impersonateeUserKey: JIVE_CONFIG.IMPERSONATEE_USER_KEY
    };
    console.log("callData___>>", callData);

    // Make API call to Jive (no CORS issues from backend)
    const response = await fetch(`${JIVE_CONFIG.API_BASE_URL}/calls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
      },
      body: JSON.stringify({
        dialString: "03175970284",
        sdp: sdp,
        deviceId: deviceId,
        organizationId: JIVE_CONFIG.ORGANIZATION_ID,
        extensionNumber: JIVE_CONFIG.EXTENSION_NUMBER,
        inCallChannelId: inCallChannelId,
        // impersonateeUserKey: JIVE_CONFIG.IMPERSONATEE_USER_KEY
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('❌ Jive API error:', response.status, responseData);
      return res.status(response.status).json({
        success: false,
        error: `Jive API error: ${response.status}`,
        details: responseData
      });
    }
console.log("responseData___>>", responseData);


    res.json({
      success: true,
      callId: responseData.id,
      data: responseData,
      message: `WebRTC call to ${contactName || phoneNumber} initiated successfully`
    });

  } catch (error) {
    console.error('❌ Backend Jive WebRTC error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to make WebRTC call via Jive API'
    });
  }
});

// Answer a call
router.post('/answer-call', async (req, res) => {
  try {
    const { callId, sdp, inCallChannelId } = req.body;

    if (!callId || !sdp || !inCallChannelId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: callId, sdp, inCallChannelId'
      });
    }

    console.log('📞 Backend: Answering call:', callId);

    const response = await fetch(`${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
      },
      body: JSON.stringify({ sdp, inCallChannelId })
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('❌ Jive API answer call error:', response.status, responseData);
      return res.status(response.status).json({
        success: false,
        error: `Jive API error: ${response.status}`,
        details: responseData
      });
    }

    console.log('✅ Call answered successfully:', responseData);

    res.json({
      success: true,
      callId: callId,
      data: responseData,
      message: 'Call answered successfully'
    });

  } catch (error) {
    console.error('❌ Backend answer call error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to answer call'
    });
  }
});

// Send ringing signal
router.post('/ringing', async (req, res) => {
  try {
    const { callId, inCallChannelId, incomingNotificationTimestamp } = req.body;

    if (!callId) {
      return res.status(400).json({
        success: false,
        error: 'Call ID is required'
      });
    }

    console.log('📞 Backend: Sending ringing signal for call:', callId);
    console.log('📞 Call ID type:', typeof callId, 'Length:', callId?.length);
    console.log('📞 Call ID value:', callId);
    console.log('📞 Call ID encoded:', encodeURIComponent(callId));

    const requestBody = {};
    if (inCallChannelId) requestBody.inCallChannelId = inCallChannelId;
    if (incomingNotificationTimestamp) requestBody.incomingNotificationTimestamp = incomingNotificationTimestamp;

    console.log('📞 Request body:', requestBody);
    console.log('📞 Full URL:', `${JIVE_CONFIG.API_BASE_URL}/calls/${callId}/ringing`);
    console.log('📞 Encoded URL:', `${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/ringing`);

    const response = await fetch(`${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/ringing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
      },
      body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined
    });
    console.log("📞 Ringing response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Jive API ringing error:', response.status, errorData);
      return res.status(response.status).json({
        success: false,
        error: `Jive API error: ${response.status}`,
        details: errorData
      });
    }

    console.log('✅ Ringing signal sent successfully');

    res.json({
      success: true,
      callId: callId,
      message: 'Ringing signal sent successfully'
    });

  } catch (error) {
    console.error('❌ Backend ringing error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to send ringing signal'
    });
  }
});

// Reject a call
router.post('/reject-call', async (req, res) => {
  try {
    const { callId, action, destination } = req.body;

    if (!callId) {
      return res.status(400).json({
        success: false,
        error: 'Call ID is required'
      });
    }

    console.log('📞 Backend: Rejecting call:', callId, 'action:', action);

    const requestBody = {};
    if (action) requestBody.action = action;
    if (destination) requestBody.destination = destination;

    const response = await fetch(`${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
      },
      body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Jive API reject call error:', response.status, errorData);
      return res.status(response.status).json({
        success: false,
        error: `Jive API error: ${response.status}`,
        details: errorData
      });
    }

    console.log('✅ Call rejected successfully');

    res.json({
      success: true,
      callId: callId,
      message: 'Call rejected successfully'
    });

  } catch (error) {
    console.error('❌ Backend reject call error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to reject call'
    });
  }
});

// Hold a call
router.post('/hold-call', async (req, res) => {
  try {
    const { callId } = req.body;

    if (!callId) {
      return res.status(400).json({
        success: false,
        error: 'Call ID is required'
      });
    }

    console.log('📞 Backend: Holding call:', callId);

    const response = await fetch(`${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/hold`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Jive API hold call error:', response.status, errorData);
      return res.status(response.status).json({
        success: false,
        error: `Jive API error: ${response.status}`,
        details: errorData
      });
    }

    console.log('✅ Call held successfully');

    res.json({
      success: true,
      callId: callId,
      message: 'Call held successfully'
    });

  } catch (error) {
    console.error('❌ Backend hold call error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to hold call'
    });
  }
});

// Unhold a call
router.post('/unhold-call', async (req, res) => {
  try {
    const { callId } = req.body;

    if (!callId) {
      return res.status(400).json({
        success: false,
        error: 'Call ID is required'
      });
    }

    console.log('📞 Backend: Unholding call:', callId);

    const response = await fetch(`${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/unhold`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Jive API unhold call error:', response.status, errorData);
      return res.status(response.status).json({
        success: false,
        error: `Jive API error: ${response.status}`,
        details: errorData
      });
    }

    console.log('✅ Call unheld successfully');

    res.json({
      success: true,
      callId: callId,
      message: 'Call unheld successfully'
    });

  } catch (error) {
    console.error('❌ Backend unhold call error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to unhold call'
    });
  }
});

// Modify a call (update SDP)
router.put('/modify-call', async (req, res) => {
  try {
    const { callId, sdp } = req.body;

    if (!callId || !sdp) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: callId, sdp'
      });
    }

    console.log('📞 Backend: Modifying call:', callId);

    const response = await fetch(`${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/offer`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
      },
      body: JSON.stringify({ sdp })
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('❌ Jive API modify call error:', response.status, responseData);
      return res.status(response.status).json({
        success: false,
        error: `Jive API error: ${response.status}`,
        details: responseData
      });
    }

    console.log('✅ Call modified successfully:', responseData);

    res.json({
      success: true,
      callId: callId,
      data: responseData,
      message: 'Call modified successfully'
    });

  } catch (error) {
    console.error('❌ Backend modify call error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to modify call'
    });
  }
});

// Check Jive WebRTC API status
router.get('/status', async (req, res) => {
  try {
    // Simple health check - you might want to implement a more sophisticated check
    res.json({
      success: true,
      status: 'ready',
      organizationId: JIVE_CONFIG.ORGANIZATION_ID,
      extensionNumber: JIVE_CONFIG.EXTENSION_NUMBER,
      message: 'Jive WebRTC API backend is ready'
    });
  } catch (error) {
    console.error('❌ Jive status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to check Jive WebRTC status'
    });
  }
});

// Debug call ID endpoint
router.get('/debug-call/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    
    console.log('🔍 Debug call ID:', callId);
    console.log('🔍 Call ID type:', typeof callId);
    console.log('🔍 Call ID length:', callId?.length);
    console.log('🔍 Encoded call ID:', encodeURIComponent(callId));
    console.log('🔍 Full URL would be:', `${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}`);
    
    res.json({
      success: true,
      callId: callId,
      callIdType: typeof callId,
      callIdLength: callId?.length,
      encodedCallId: encodeURIComponent(callId),
      fullUrl: `${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}`,
      message: 'Call ID debug information'
    });
  } catch (error) {
    console.error('❌ Debug call ID error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to debug call ID'
    });
  }
});

// Ringing endpoint
router.post('/ringing', async (req, res) => {
  try {
    const { callId, inCallChannelId, incomingNotificationTimestamp } = req.body;

    if (!callId) {
      return res.status(400).json({
        success: false,
        error: 'Call ID is required'
      });
    }

    console.log('📞 Backend: Ringing call:', callId);
    console.log('📞 inCallChannelId:', inCallChannelId);
    console.log('📞 incomingNotificationTimestamp:', incomingNotificationTimestamp);

    // Prepare request body
    const requestBody = {};
    if (inCallChannelId) requestBody.inCallChannelId = inCallChannelId;
    if (incomingNotificationTimestamp) requestBody.incomingNotificationTimestamp = incomingNotificationTimestamp;

    console.log('📞 Request body:', requestBody);

    // Try multiple API endpoints
    const possibleUrls = [
      `${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/ringing`,
      `https://api.jive.com/v1/calls/${encodeURIComponent(callId)}/ringing`,
      `https://webrtc.jive.com/web-calls/v1/calls/${encodeURIComponent(callId)}/ringing`
    ];

    let response;
    let lastError;
    
    for (const url of possibleUrls) {
      try {
        console.log('🔍 Trying ringing URL:', url);
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
          },
          body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined
        });
        
        if (response.ok) {
          console.log('✅ Success with ringing URL:', url);
          break;
        } else {
          const errorData = await response.json();
          console.log('❌ Failed with ringing URL:', url, 'Status:', response.status, 'Error:', errorData);
          lastError = errorData;
        }
      } catch (error) {
        console.log('❌ Network error with ringing URL:', url, 'Error:', error.message);
        lastError = error;
      }
    }

    if (!response || !response.ok) {
      return res.status(response?.status || 500).json({
        success: false,
        error: 'Failed to ring call',
        details: lastError,
        message: 'Could not ring call from any API endpoint'
      });
    }

    const responseData = await response.json();
    console.log('✅ Ringing response:', responseData);

    res.json({
      success: true,
      data: responseData,
      message: 'Call ringing initiated successfully'
    });
  } catch (error) {
    console.error('❌ Ringing error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to ring call'
    });
  }
});

// Send DTMF tone
router.post('/dtmf', async (req, res) => {
  try {
    const { callId, tone } = req.body;

    if (!callId || !tone) {
      return res.status(400).json({
        success: false,
        error: 'Call ID and tone are required'
      });
    }

    // Validate tone format (only digits, #, *)
    if (!/^[0-9,#,*]+$/.test(tone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tone format. Only digits, #, and * are allowed'
      });
    }

    console.log('📞 Sending DTMF tone:', tone, 'for call:', callId);

    const response = await fetch(`${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/dtmf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
      },
      body: JSON.stringify({ tone })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ DTMF error:', response.status, errorData);
      return res.status(response.status).json({
        success: false,
        error: `DTMF failed: ${response.status}`,
        details: errorData
      });
    }

    console.log('✅ DTMF tone sent successfully');
    res.status(204).send();
  } catch (error) {
    console.error('❌ DTMF error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to send DTMF tone'
    });
  }
});

// Mute call
router.post('/mute', async (req, res) => {
  try {
    const { callId } = req.body;

    if (!callId) {
      return res.status(400).json({
        success: false,
        error: 'Call ID is required'
      });
    }

    console.log('📞 Muting call:', callId);

    const response = await fetch(`${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/mute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Mute error:', response.status, errorData);
      return res.status(response.status).json({
        success: false,
        error: `Mute failed: ${response.status}`,
        details: errorData
      });
    }

    console.log('✅ Call muted successfully');
    res.status(204).send();
  } catch (error) {
    console.error('❌ Mute error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to mute call'
    });
  }
});

// Unmute call
router.post('/unmute', async (req, res) => {
  try {
    const { callId } = req.body;

    if (!callId) {
      return res.status(400).json({
        success: false,
        error: 'Call ID is required'
      });
    }

    console.log('📞 Unmuting call:', callId);

    const response = await fetch(`${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/unmute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Unmute error:', response.status, errorData);
      return res.status(response.status).json({
        success: false,
        error: `Unmute failed: ${response.status}`,
        details: errorData
      });
    }

    console.log('✅ Call unmuted successfully');
    res.status(204).send();
  } catch (error) {
    console.error('❌ Unmute error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to unmute call'
    });
  }
});

// Merge calls
router.post('/merge', async (req, res) => {
  try {
    const { callId, referId } = req.body;

    if (!callId || !referId) {
      return res.status(400).json({
        success: false,
        error: 'Call ID and refer ID are required'
      });
    }

    console.log('📞 Merging calls:', callId, 'with', referId);

    const response = await fetch(`${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
      },
      body: JSON.stringify({ referId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Merge error:', response.status, errorData);
      return res.status(response.status).json({
        success: false,
        error: `Merge failed: ${response.status}`,
        details: errorData
      });
    }

    const responseData = await response.json();
    console.log('✅ Calls merged successfully');

    res.json({
      success: true,
      data: responseData,
      message: 'Calls merged successfully'
    });
  } catch (error) {
    console.error('❌ Merge error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to merge calls'
    });
  }
});

// Split merged call
router.post('/split', async (req, res) => {
  try {
    const { callId } = req.body;

    if (!callId) {
      return res.status(400).json({
        success: false,
        error: 'Call ID is required'
      });
    }

    console.log('📞 Splitting merged call:', callId);

    const response = await fetch(`${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/split`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Split error:', response.status, errorData);
      return res.status(response.status).json({
        success: false,
        error: `Split failed: ${response.status}`,
        details: errorData
      });
    }

    console.log('✅ Call split successfully');
    res.status(204).send();
  } catch (error) {
    console.error('❌ Split error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to split call'
    });
  }
});

// Warm transfer
router.post('/warm-transfer', async (req, res) => {
  try {
    const { callId, referId } = req.body;

    if (!callId || !referId) {
      return res.status(400).json({
        success: false,
        error: 'Call ID and refer ID are required'
      });
    }

    console.log('📞 Warm transferring call:', callId, 'to', referId);

    const response = await fetch(`${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/warm-transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
      },
      body: JSON.stringify({ referId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Warm transfer error:', response.status, errorData);
      return res.status(response.status).json({
        success: false,
        error: `Warm transfer failed: ${response.status}`,
        details: errorData
      });
    }

    console.log('✅ Warm transfer completed successfully');
    res.status(204).send();
  } catch (error) {
    console.error('❌ Warm transfer error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to warm transfer call'
    });
  }
});

// Blind transfer
router.post('/blind-transfer', async (req, res) => {
  try {
    const { callId, dialString } = req.body;

    if (!callId || !dialString) {
      return res.status(400).json({
        success: false,
        error: 'Call ID and dial string are required'
      });
    }

    console.log('📞 Blind transferring call:', callId, 'to', dialString);

    const response = await fetch(`${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/blind-transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
      },
      body: JSON.stringify({ dialString })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Blind transfer error:', response.status, errorData);
      return res.status(response.status).json({
        success: false,
        error: `Blind transfer failed: ${response.status}`,
        details: errorData
      });
    }

    console.log('✅ Blind transfer completed successfully');
    res.status(204).send();
  } catch (error) {
    console.error('❌ Blind transfer error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to blind transfer call'
    });
  }
});

// List all active calls
router.get('/list-calls', async (req, res) => {
  try {
    console.log('📋 Listing all active calls...');
    
    const possibleUrls = [
      `${JIVE_CONFIG.API_BASE_URL}/calls`,
      `https://api.jive.com/v1/calls`,
      `https://webrtc.jive.com/web-calls/v1/calls`
    ];

    let response;
    let lastError;
    
    for (const url of possibleUrls) {
      try {
        console.log('🔍 Trying calls list URL:', url);
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
          }
        });
        
        if (response.ok) {
          console.log('✅ Success with calls list URL:', url);
          break;
        } else {
          const errorData = await response.json();
          console.log('❌ Failed with calls list URL:', url, 'Status:', response.status, 'Error:', errorData);
          lastError = errorData;
        }
      } catch (error) {
        console.log('❌ Network error with calls list URL:', url, 'Error:', error.message);
        lastError = error;
      }
    }

    if (!response || !response.ok) {
      return res.status(response?.status || 500).json({
        success: false,
        error: 'Failed to fetch calls list',
        details: lastError,
        message: 'Could not retrieve active calls from any API endpoint'
      });
    }

    const responseData = await response.json();
    console.log('📋 Calls list response:', responseData);

    res.json({
      success: true,
      calls: responseData,
      message: 'Active calls retrieved successfully'
    });
  } catch (error) {
    console.error('❌ List calls error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to list calls'
    });
  }
});

// Get call status
router.get('/call-status/:callId', async (req, res) => {
  try {
    const { callId } = req.params;

    if (!callId) {
      return res.status(400).json({
        success: false,
        error: 'Call ID is required'
      });
    }

    console.log('📞 Backend: Getting call status for:', callId);
    console.log('📞 Call ID type:', typeof callId, 'Length:', callId?.length);
    console.log('📞 Call ID value:', callId);
    console.log('📞 Call ID encoded:', encodeURIComponent(callId));
    console.log('📞 Full URL:', `${JIVE_CONFIG.API_BASE_URL}/calls/${callId}`);
    console.log('📞 Encoded URL:', `${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}`);

    // Add a small delay to handle CONNECTING state
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Try multiple API endpoints to find the correct one
    const possibleUrls = [
      `${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}`,
      `https://api.jive.com/v1/calls/${encodeURIComponent(callId)}`,
      `https://webrtc.jive.com/web-calls/v1/calls/${encodeURIComponent(callId)}`
    ];

    console.log('🔍 Trying multiple API endpoints...');
    
    let response;
    let lastError;
    
    for (const url of possibleUrls) {
      try {
        console.log('🔍 Trying URL:', url);
        response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
            'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
          }
        });
        
        if (response.ok) {
          console.log('✅ Success with URL:', url);
          break;
        } else {
          const errorData = await response.json();
          console.log('❌ Failed with URL:', url, 'Status:', response.status, 'Error:', errorData);
          lastError = errorData;
        }
      } catch (error) {
        console.log('❌ Network error with URL:', url, 'Error:', error.message);
        lastError = error;
      }
    }

    // Check if we have a successful response
    if (!response || !response.ok) {
      console.error('❌ All API endpoints failed');
      return res.status(500).json({
        success: false,
        error: 'All API endpoints failed',
        details: lastError,
        debug: {
          callId: callId,
          urls: possibleUrls
        }
      });
    }

    const responseData = await response.json();

    console.log('✅ Call status retrieved:', responseData);

    res.json({
      success: true,
      callId: callId,
      status: responseData.status || 'unknown',
      data: responseData,
      message: 'Call status retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Backend call status error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to get call status'
    });
  }
});

// End a WebRTC call
router.post('/end-call', async (req, res) => {
  try {
    const { callId } = req.body;

    if (!callId) {
      return res.status(400).json({
        success: false,
        error: 'Call ID is required'
      });
    }

    console.log('📞 Backend: Ending WebRTC call:', callId);
    console.log('📞 End call - Call ID type:', typeof callId, 'Length:', callId?.length);
    console.log('📞 End call - Call ID value:', callId);
    console.log('📞 End call - Call ID encoded:', encodeURIComponent(callId));
    console.log('📞 End call - Full URL:', `${JIVE_CONFIG.API_BASE_URL}/calls/${callId}/end`);
    console.log('📞 End call - Encoded URL:', `${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/end`);

    // Try to end call with Jive API
    try {
      const response = await fetch(`${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
        }
      });

      if (response.ok) {
        const endData = await response.json();
        console.log('✅ Call ended via Jive API:', endData);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn('⚠️ Jive API end call failed, but continuing with local cleanup');
        console.warn('⚠️ End call error details:', response.status, errorData);
      }
    } catch (apiError) {
      console.warn('⚠️ Jive API end call error:', apiError.message);
    }

    res.json({
      success: true,
      message: 'WebRTC call ended successfully'
    });

  } catch (error) {
    console.error('❌ Backend end call error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to end WebRTC call'
    });
  }
});

// Mute/Unmute call
router.post('/mute-call', async (req, res) => {
  try {
    const { callId, muted } = req.body;

    if (!callId) {
      return res.status(400).json({
        success: false,
        error: 'Call ID is required'
      });
    }

    console.log('📞 Backend: Muting/Unmuting call:', callId, 'muted:', muted);

    // Jive API call to mute/unmute
    const response = await fetch(`${JIVE_CONFIG.API_BASE_URL}/calls/${encodeURIComponent(callId)}/${muted ? 'mute' : 'unmute'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JIVE_CONFIG.JWT_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        success: false,
        error: `Jive API error: ${response.status}`,
        details: errorData
      });
    }

    console.log('✅ Call mute/unmute successful');

    res.json({
      success: true,
      muted: muted,
      message: `Call ${muted ? 'muted' : 'unmuted'} successfully`
    });

  } catch (error) {
    console.error('❌ Backend mute call error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to mute/unmute call'
    });
  }
});

// Device management storage (in production, use a database)
const deviceStorage = new Map();
const extensionStorage = new Map();

// ===== DEVICE MANAGEMENT ENDPOINTS =====

// Create a device
router.post('/devices', async (req, res) => {
  try {
    const { clientInformation, callbackReference } = req.body;

    if (!clientInformation || !callbackReference) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: clientInformation and callbackReference'
      });
    }

    const { deviceId } = clientInformation;
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'deviceId is required in clientInformation'
      });
    }

    // Check if device already exists
    if (deviceStorage.has(deviceId)) {
      return res.status(409).json({
        success: false,
        error: 'Device already exists',
        deviceId: deviceId
      });
    }

    // Create device
    const device = {
      deviceId,
      clientInformation: {
        deviceId: clientInformation.deviceId,
        appVersion: clientInformation.appVersion || '1.0.0',
        platform: clientInformation.platform || 'WEB',
        appId: clientInformation.appId || 'CRM-WebRTC'
      },
      callbackReference: {
        incomingCallChannelId: callbackReference.incomingCallChannelId,
        sessionManagementChannelId: callbackReference.sessionManagementChannelId
      },
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    deviceStorage.set(deviceId, device);

    console.log('✅ Device created:', deviceId);

    res.status(201).json({
      success: true,
      data: device,
      message: 'Device created successfully'
    });

  } catch (error) {
    console.error('❌ Device creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to create device'
    });
  }
});

// Get device details
router.get('/devices/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Device ID is required'
      });
    }

    const device = deviceStorage.get(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
        deviceId: deviceId
      });
    }

    // Update last active
    device.lastActive = new Date().toISOString();
    deviceStorage.set(deviceId, device);

    res.json({
      success: true,
      data: device,
      message: 'Device details retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Device retrieval error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve device'
    });
  }
});

// Update device details
router.patch('/devices/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { clientInformation, callbackReference } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Device ID is required'
      });
    }

    const device = deviceStorage.get(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
        deviceId: deviceId
      });
    }

    // Update client information if provided
    if (clientInformation) {
      device.clientInformation = {
        ...device.clientInformation,
        ...clientInformation
      };
    }

    // Update callback reference if provided
    if (callbackReference) {
      device.callbackReference = {
        ...device.callbackReference,
        ...callbackReference
      };
    }

    device.lastActive = new Date().toISOString();
    deviceStorage.set(deviceId, device);

    console.log('✅ Device updated:', deviceId);

    res.json({
      success: true,
      data: device,
      message: 'Device updated successfully'
    });

  } catch (error) {
    console.error('❌ Device update error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to update device'
    });
  }
});

// Delete device
router.delete('/devices/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Device ID is required'
      });
    }

    const device = deviceStorage.get(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
        deviceId: deviceId
      });
    }

    // Remove all extensions for this device
    const deviceExtensions = Array.from(extensionStorage.values())
      .filter(ext => ext.deviceId === deviceId);
    
    deviceExtensions.forEach(ext => {
      extensionStorage.delete(ext.extensionId);
    });

    // Remove device
    deviceStorage.delete(deviceId);

    console.log('✅ Device deleted:', deviceId, `(${deviceExtensions.length} extensions removed)`);

    res.status(204).send();

  } catch (error) {
    console.error('❌ Device deletion error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to delete device'
    });
  }
});

// ===== EXTENSION MANAGEMENT ENDPOINTS =====

// Create extensions for a device
router.post('/devices/:deviceId/extensions', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { organizationId, extensions } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Device ID is required'
      });
    }

    if (!organizationId || !extensions || !Array.isArray(extensions)) {
      return res.status(400).json({
        success: false,
        error: 'organizationId and extensions array are required'
      });
    }

    if (extensions.length === 0 || extensions.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Extensions array must contain 1-20 items'
      });
    }

    // Check if device exists
    const device = deviceStorage.get(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
        deviceId: deviceId
      });
    }

    const createdExtensions = [];

    for (const ext of extensions) {
      const { number, impersonateeUserKey } = ext;
      
      if (!number) {
        return res.status(400).json({
          success: false,
          error: 'Extension number is required for each extension'
        });
      }

      const extensionId = `${deviceId}-${number}-${organizationId}`;
      
      // Check if extension already exists
      if (extensionStorage.has(extensionId)) {
        console.warn('⚠️ Extension already exists:', extensionId);
        continue;
      }

      const extension = {
        extensionId,
        deviceId,
        organizationId,
        number,
        impersonateeUserKey: impersonateeUserKey || null,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };

      extensionStorage.set(extensionId, extension);
      createdExtensions.push(extension);
    }

    console.log('✅ Extensions created:', createdExtensions.length, 'for device:', deviceId);

    res.status(201).json({
      success: true,
      data: {
        organizationId,
        extensions: createdExtensions
      },
      message: `${createdExtensions.length} extensions created successfully`
    });

  } catch (error) {
    console.error('❌ Extension creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to create extensions'
    });
  }
});

// Get extensions for a device
router.get('/devices/:deviceId/extensions', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { organizationId, extensionNumber, pageMarker, pageSize = 50 } = req.query;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Device ID is required'
      });
    }

    // Check if device exists
    const device = deviceStorage.get(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
        deviceId: deviceId
      });
    }

    // Get all extensions for this device
    let deviceExtensions = Array.from(extensionStorage.values())
      .filter(ext => ext.deviceId === deviceId);

    // Filter by organization if specified
    if (organizationId) {
      deviceExtensions = deviceExtensions.filter(ext => ext.organizationId === organizationId);
    }

    // Filter by extension number if specified
    if (extensionNumber) {
      deviceExtensions = deviceExtensions.filter(ext => ext.number === extensionNumber);
    }

    // Pagination
    const pageSizeInt = Math.min(parseInt(pageSize), 100);
    const startIndex = pageMarker ? parseInt(pageMarker) : 0;
    const endIndex = startIndex + pageSizeInt;
    const paginatedExtensions = deviceExtensions.slice(startIndex, endIndex);
    const nextPageMarker = endIndex < deviceExtensions.length ? endIndex.toString() : null;

    res.json({
      success: true,
      data: {
        nextPageMarker,
        pageSize: pageSizeInt,
        extensions: paginatedExtensions
      },
      message: 'Extensions retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Extension retrieval error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve extensions'
    });
  }
});

// Delete extensions for a device
router.delete('/devices/:deviceId/extensions', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { organizationId, extensionNumber } = req.query;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Device ID is required'
      });
    }

    // Check if device exists
    const device = deviceStorage.get(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
        deviceId: deviceId
      });
    }

    // Get extensions to delete
    let extensionsToDelete = Array.from(extensionStorage.values())
      .filter(ext => ext.deviceId === deviceId);

    // Filter by organization if specified
    if (organizationId) {
      extensionsToDelete = extensionsToDelete.filter(ext => ext.organizationId === organizationId);
    }

    // Filter by extension number if specified
    if (extensionNumber) {
      extensionsToDelete = extensionsToDelete.filter(ext => ext.number === extensionNumber);
    }

    // Delete extensions
    extensionsToDelete.forEach(ext => {
      extensionStorage.delete(ext.extensionId);
    });

    console.log('✅ Extensions deleted:', extensionsToDelete.length, 'for device:', deviceId);

    res.status(204).send();

  } catch (error) {
    console.error('❌ Extension deletion error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to delete extensions'
    });
  }
});

// ===== UTILITY ENDPOINTS =====

// Get all devices (for debugging)
router.get('/devices', async (req, res) => {
  try {
    const devices = Array.from(deviceStorage.values());
    
    res.json({
      success: true,
      data: {
        devices,
        count: devices.length
      },
      message: 'All devices retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Devices retrieval error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve devices'
    });
  }
});

// Get all extensions (for debugging)
router.get('/extensions', async (req, res) => {
  try {
    const extensions = Array.from(extensionStorage.values());
    
    res.json({
      success: true,
      data: {
        extensions,
        count: extensions.length
      },
      message: 'All extensions retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Extensions retrieval error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve extensions'
    });
  }
});

// WebSocket server for real-time call events
let wss = null;
const connectedClients = new Set();

// Initialize WebSocket server
export const initializeWebSocket = (server) => {
  wss = new WebSocketServer({ 
    server,
    path: '/api/jive-webrtc/ws'
  });

  wss.on('connection', (ws, req) => {
    console.log('🔌 New WebSocket connection established');
    connectedClients.add(ws);

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to Jive WebRTC WebSocket',
      timestamp: new Date().toISOString()
    }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('📨 WebSocket message received:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            break;
          case 'subscribe':
            // Subscribe to specific call events
            ws.callId = data.callId;
            ws.send(JSON.stringify({
              type: 'subscribed',
              callId: data.callId,
              message: 'Subscribed to call events'
            }));
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('❌ WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket connection closed');
      connectedClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      connectedClients.delete(ws);
    });
  });

  console.log('✅ WebSocket server initialized on /api/jive-webrtc/ws');
};

// Broadcast call event to all connected clients
export const broadcastCallEvent = (event) => {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'call_event',
    data: event,
    timestamp: new Date().toISOString()
  });

  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// Broadcast to specific call subscribers
export const broadcastToCallSubscribers = (callId, event) => {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'call_event',
    callId: callId,
    data: event,
    timestamp: new Date().toISOString()
  });

  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && 
        (client.callId === callId || !client.callId)) {
      client.send(message);
    }
  });
};

// Callback endpoints for Jive WebRTC events
router.post('/callback/ringing', (req, res) => {
  try {
    const event = req.body;
    console.log('📞 Ringing callback received:', event);
    
    // Broadcast to WebSocket clients
    broadcastCallEvent({
      type: 'ringing',
      data: event
    });

    res.status(204).send();
  } catch (error) {
    console.error('❌ Ringing callback error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

router.post('/callback/answered', (req, res) => {
  try {
    const event = req.body;
    console.log('📞 Answered callback received:', event);
    
    // Broadcast to WebSocket clients
    broadcastCallEvent({
      type: 'answered',
      data: event
    });

    res.status(204).send();
  } catch (error) {
    console.error('❌ Answered callback error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

router.post('/callback/update', (req, res) => {
  try {
    const event = req.body;
    console.log('📞 Call update callback received:', event);
    
    // Broadcast to WebSocket clients
    broadcastCallEvent({
      type: 'update',
      data: event
    });

    res.status(204).send();
  } catch (error) {
    console.error('❌ Call update callback error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

router.post('/callback/ended', (req, res) => {
  try {
    const event = req.body;
    console.log('📞 Call ended callback received:', event);
    
    // Broadcast to WebSocket clients
    broadcastCallEvent({
      type: 'ended',
      data: event
    });

    res.status(204).send();
  } catch (error) {
    console.error('❌ Call ended callback error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

router.post('/callback/no-media', (req, res) => {
  try {
    const event = req.body;
    console.log('📞 No media callback received:', event);
    
    // Broadcast to WebSocket clients
    broadcastCallEvent({
      type: 'no_media',
      data: event
    });

    res.status(204).send();
  } catch (error) {
    console.error('❌ No media callback error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

export default router;
