import React, { useState, useEffect } from 'react';
import { makeWebRTCCall, endWebRTCCall, isWebRTCSupported, getWebRTCStatus } from '../../services/webrtcService';

function WebRTCTest() {
  const [phoneNumber, setPhoneNumber] = useState('18667685429');
  const [contactName, setContactName] = useState('Test Contact');
  const [isCallActive, setIsCallActive] = useState(false);
  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog('WebRTC Test Component loaded');
    addLog(`WebRTC Supported: ${isWebRTCSupported()}`);
  }, []);

  const handleMakeCall = async () => {
    try {
      setStatus('calling');
      addLog(`Starting call to ${phoneNumber} (${contactName})`);
      
      const result = await makeWebRTCCall(phoneNumber, contactName);
      
      if (result.success) {
        setIsCallActive(true);
        setStatus('connected');
        addLog(`Call successful: ${result.message}`);
        addLog(`Call ID: ${result.callId}`);
        addLog(`Device ID: ${result.data?.deviceId}`);
      } else {
        setStatus('failed');
        addLog(`Call failed: ${result.error}`);
      }
    } catch (error) {
      setStatus('error');
      addLog(`Error: ${error.message}`);
    }
  };

  const handleEndCall = async () => {
    try {
      addLog('Ending call...');
      const result = await endWebRTCCall();
      
      if (result.success) {
        setIsCallActive(false);
        setStatus('ended');
        addLog('Call ended successfully');
      } else {
        addLog(`Error ending call: ${result.error}`);
      }
    } catch (error) {
      addLog(`Error ending call: ${error.message}`);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'calling': return 'text-yellow-600';
      case 'connected': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'error': return 'text-red-600';
      case 'ended': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">WebRTC Test Component</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Name
          </label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter contact name"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleMakeCall}
            disabled={isCallActive || status === 'calling'}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCallActive ? 'Call Active' : 'Make Call'}
          </button>

          <button
            onClick={handleEndCall}
            disabled={!isCallActive}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            End Call
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Status</h3>
          <p className={`font-medium ${getStatusColor()}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            WebRTC Support: {isWebRTCSupported() ? '✅ Yes' : '❌ No'}
          </p>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Logs</h3>
          <div className="bg-gray-100 p-4 rounded-md max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono text-gray-700 mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WebRTCTest;
