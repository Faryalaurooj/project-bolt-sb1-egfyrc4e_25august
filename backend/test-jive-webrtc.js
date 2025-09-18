// Test script for Jive WebRTC backend endpoint
import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:5000';

async function testJiveWebRTC() {
  console.log('🧪 Testing Jive WebRTC Backend Endpoints...\n');

  try {
    // Test 1: Check status endpoint
    console.log('1️⃣ Testing status endpoint...');
    const statusResponse = await fetch(`${BACKEND_URL}/api/jive-webrtc/status`);
    const statusData = await statusResponse.json();
    
    if (statusResponse.ok) {
      console.log('✅ Status endpoint working:', statusData);
    } else {
      console.log('❌ Status endpoint failed:', statusData);
    }

    // Test 2: Test make call endpoint (with mock data)
    console.log('\n2️⃣ Testing make call endpoint...');
    const mockCallData = {
      phoneNumber: '18667685429',
      contactName: 'Test Contact',
      sdp: 'v=0\r\no=rtcweb 1 1 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=ice-lite\r\n',
      deviceId: 'test-device-123',
      inCallChannelId: 'test-channel-456'
    };

    const callResponse = await fetch(`${BACKEND_URL}/api/jive-webrtc/make-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockCallData)
    });

    const callData = await callResponse.json();
    
    if (callResponse.ok) {
      console.log('✅ Make call endpoint working:', callData);
    } else {
      console.log('❌ Make call endpoint failed:', callData);
    }

    // Test 3: Test end call endpoint
    console.log('\n3️⃣ Testing end call endpoint...');
    const endCallResponse = await fetch(`${BACKEND_URL}/api/jive-webrtc/end-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callId: 'test-call-123'
      })
    });

    const endCallData = await endCallResponse.json();
    
    if (endCallResponse.ok) {
      console.log('✅ End call endpoint working:', endCallData);
    } else {
      console.log('❌ End call endpoint failed:', endCallData);
    }

    console.log('\n🎉 Backend endpoint tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testJiveWebRTC();
