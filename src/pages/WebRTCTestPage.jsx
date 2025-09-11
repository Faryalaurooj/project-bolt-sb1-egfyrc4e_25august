import React from 'react';
import WebRTCTest from '../components/calls/WebRTCTest';

function WebRTCTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            WebRTC Calling Test
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test the WebRTC calling functionality using the Jive API. 
            This component allows you to make browser-based calls directly from your web application.
          </p>
        </div>
        
        <WebRTCTest />
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📋 Test Instructions
          </h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Make sure you have a working microphone connected to your device</li>
            <li>• Allow microphone permissions when prompted by your browser</li>
            <li>• Enter a valid phone number (e.g., 18667685429)</li>
            <li>• Click "Make Call" to initiate the WebRTC call via Jive API</li>
            <li>• The call will use your organization ID and extension number</li>
            <li>• Check the logs for detailed information about the call process</li>
          </ul>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            ⚠️ Important Notes
          </h3>
          <ul className="text-yellow-800 space-y-2 text-sm">
            <li>• This test uses the Jive WebRTC API at https://webrtc.jive.com</li>
            <li>• You need proper authentication credentials for production use</li>
            <li>• The current implementation uses placeholder organization and extension IDs</li>
            <li>• Make sure your browser supports WebRTC (Chrome, Firefox, Safari)</li>
            <li>• HTTPS is required for WebRTC to work in production</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default WebRTCTestPage;
