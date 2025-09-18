import React, { useState, useEffect } from 'react';
import { 
  FiPhone, 
  FiPhoneOff, 
  FiMic, 
  FiMicOff, 
  FiPause, 
  FiPlay,
  FiVolume2,
  FiVolumeX
} from 'react-icons/fi';
import { 
  getCurrentCall, 
  getCallStatus, 
  getFormattedDuration, 
  toggleMute, 
  endCall,
  onCallStatusChange,
  onCallConnect,
  onCallEnd,
  onCallFail
} from '../../services/webrtcService';

function CallControlPanel({ onCallEnded }) {
  const [callInfo, setCallInfo] = useState(null);
  const [callStatus, setCallStatus] = useState('idle');
  const [duration, setDuration] = useState('00:00');
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);

  useEffect(() => {
    // Set up call status monitoring
    const updateCallInfo = () => {
      const currentCall = getCurrentCall();
      const status = getCallStatus();
      const formattedDuration = getFormattedDuration();
      
      setCallInfo(currentCall);
      setCallStatus(status);
      setDuration(formattedDuration);
      setIsMuted(currentCall?.isMuted || false);
      setIsOnHold(currentCall?.isOnHold || false);
    };

    // Initial update
    updateCallInfo();

    // Set up callbacks
    onCallStatusChange((newStatus, oldStatus) => {
      console.log(`📞 Call status changed: ${oldStatus} → ${newStatus}`);
      updateCallInfo();
    });

    onCallConnect((call, data) => {
      console.log('✅ Call connected!', call, data);
      updateCallInfo();
    });

    onCallEnd((call, data) => {
      console.log('📞 Call ended', call, data);
      updateCallInfo();
      if (onCallEnded) {
        onCallEnded(call, data);
      }
    });

    onCallFail((call, data) => {
      console.log('❌ Call failed', call, data);
      updateCallInfo();
      if (onCallEnded) {
        onCallEnded(call, data);
      }
    });

    // Update duration every second
    const durationInterval = setInterval(updateCallInfo, 1000);

    return () => {
      clearInterval(durationInterval);
    };
  }, [onCallEnded]);

  const handleEndCall = async () => {
    try {
      await endCall();
      if (onCallEnded) {
        onCallEnded();
      }
    } catch (error) {
      console.error('❌ Error ending call:', error);
    }
  };

  const handleToggleMute = async () => {
    try {
      const newMutedState = await toggleMute();
      setIsMuted(newMutedState);
    } catch (error) {
      console.error('❌ Error toggling mute:', error);
    }
  };

  const handleToggleHold = () => {
    // TODO: Implement hold functionality
    setIsOnHold(!isOnHold);
    console.log('Hold functionality not yet implemented');
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'ringing': return 'text-yellow-600';
      case 'connected': return 'text-green-600';
      case 'ended': return 'text-gray-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'ringing': return 'Ringing...';
      case 'connected': return 'Connected';
      case 'ended': return 'Call Ended';
      case 'failed': return 'Call Failed';
      default: return 'Unknown';
    }
  };

  if (!callInfo) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-80 z-50">
      {/* Call Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <FiPhone className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {callInfo.contactName || 'Unknown Contact'}
            </h3>
            <p className="text-sm text-gray-500">
              {callInfo.phoneNumber}
            </p>
          </div>
        </div>
        <button
          onClick={handleEndCall}
          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
        >
          <FiPhoneOff className="w-5 h-5" />
        </button>
      </div>

      {/* Call Status */}
      <div className="text-center mb-4">
        <p className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </p>
        <p className="text-lg font-mono text-gray-700">
          {duration}
        </p>
      </div>

      {/* Call Controls */}
      <div className="flex justify-center space-x-4">
        {/* Mute/Unmute */}
        <button
          onClick={handleToggleMute}
          className={`p-3 rounded-full transition-colors ${
            isMuted 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
        </button>

        {/* Hold/Resume */}
        <button
          onClick={handleToggleHold}
          className={`p-3 rounded-full transition-colors ${
            isOnHold 
              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={isOnHold ? 'Resume' : 'Hold'}
        >
          {isOnHold ? <FiPlay className="w-5 h-5" /> : <FiPause className="w-5 h-5" />}
        </button>

        {/* Volume (placeholder) */}
        <button
          className="p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          title="Volume Control"
        >
          <FiVolume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Call Details */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <p>Call ID: {callInfo.callId}</p>
          <p>Status: {callStatus}</p>
          {isMuted && <p className="text-red-500">🔇 Muted</p>}
          {isOnHold && <p className="text-yellow-500">⏸️ On Hold</p>}
        </div>
      </div>
    </div>
  );
}

export default CallControlPanel;
