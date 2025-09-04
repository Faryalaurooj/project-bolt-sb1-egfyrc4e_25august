// GoTo Connect API Service - Backend Integration
// This service handles API calls through the backend to avoid CORS issues

import { supabase } from '../lib/supabase';

const BACKEND_API_BASE = '/api/phone-calls';

// Make call via backend to GoTo Connect API
export const makeGoToConnectCall = async (phoneNumber, contactName, gotoConnectId) => {
  console.log("gotoConnectId_makeGoToConnectCall", gotoConnectId);
  try {
    console.log('📞 Making GoTo Connect call via backend...');
    
        // Call backend API (no CORS issues)
    const response = await fetch(`${BACKEND_API_BASE}/goto-connect/make-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        contactName,
        gotoConnectId
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ GoTo Connect call successful via backend:', result);
      return { success: true, method: 'backend_api', data: result.data };
    } else {
      console.log(`❌ GoTo Connect API call failed via backend: ${response.status}`, result);
      throw new Error(result.error || `Backend API failed: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Backend API call error:', error);
    throw error;
  }
};

// Check GoTo Connect connection status via backend
export const checkGoToConnectStatus = async (gotoConnectId) => {
  console.log("gotoConnectId", gotoConnectId);
  try {
    console.log('🔍 Checking GoTo Connect status via backend...');
    
    // Test connection to GoTo Connect API via backend (no CORS issues)
    const response = await fetch(`${BACKEND_API_BASE}/goto-connect/status/${gotoConnectId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ GoTo Connect status check successful via backend:', result);
      return result;
    } else {
      console.log(`❌ GoTo Connect status check failed via backend: ${response.status}`, result);
      return { 
        status: 'failed', 
        error: result.error || `HTTP ${response.status}`, 
        message: result.message || 'GoTo Connect API not accessible via backend' 
      };
    }
  } catch (error) {
    console.error('❌ Backend status check error:', error);
    return { 
      status: 'failed', 
      error: error.message, 
      message: 'Cannot connect to backend for GoTo Connect status check' 
    };
  }
};

// Get available phone numbers/lines from GoTo Connect via backend
export const getGoToConnectLines = async () => {
  try {
    console.log('📱 Getting GoTo Connect lines via backend...');
    
    // Get lines from GoTo Connect API via backend (no CORS issues)
    const response = await fetch(`${BACKEND_API_BASE}/goto-connect/lines`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Got GoTo Connect lines via backend:', result);
      return { success: true, lines: result.lines, method: 'backend_api' };
    } else {
      console.log(`❌ Lines fetch failed via backend: ${response.status}`, result);
      return { success: false, lines: [], error: result.error || `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Backend lines fetch error:', error);
    return { success: false, lines: [], error: error.message };
  }
};
