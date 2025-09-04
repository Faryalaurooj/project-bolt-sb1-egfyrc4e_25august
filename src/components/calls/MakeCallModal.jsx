import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiPhone, FiUser, FiClock, FiSave, FiExternalLink, FiWifi, FiGlobe } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../../context/AuthContext';
import { createPhoneCall } from '../../services/api';
import { makeGoToConnectCall, checkGoToConnectStatus } from '../../services/gotoConnectApi';
import ContactSelectModal from '../contacts/ContactSelectModal';
import { useToast } from '../../hooks/useToast';

function MakeCallModal({ isOpen, onClose, onCallSaved }) {
  const { user } = useAuth();
  const { showSuccess, showWarning, showError } = useToast();
  const gotoConnectId = "1746414108925783783_EmUE8Fa0uujooXAG69vxVs6MkHh6L2Tk";
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('all employees');
  const [selectedContact, setSelectedContact] = useState(null);
  const [isContactSelectOpen, setIsContactSelectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [callDuration, setCallDuration] = useState('');
  const [callOutcome, setCallOutcome] = useState('');
  const [callStartTime, setCallStartTime] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [gotoConnectionStatus, setGotoConnectionStatus] = useState('checking');

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ]
  };

  const callOutcomes = [
    'Connected - Successful',
    'Connected - Follow-up needed',
    'Voicemail left',
    'No answer',
    'Busy',
    'Wrong number',
    'Call back requested'
  ];

  // GoTo Connect Integration Check
  useEffect(() => {
    if (gotoConnectId) {
      checkGoToConnectIntegration();
    } else {
      setGotoConnectionStatus('no-credentials');
    }
  }, [gotoConnectId]);

  const checkGoToConnectIntegration = async () => {
    try {
      setGotoConnectionStatus('checking');
      
      if (gotoConnectId) {
        // Check GoTo Connect status via backend
        const statusResult = await checkGoToConnectStatus(gotoConnectId);
        
        if (statusResult.status === 'connected' || statusResult.status === 'ready') {
          setGotoConnectionStatus('connected');
          console.log('✅ GoTo Connect integration ready via backend (no CORS)');
        } else {
          setGotoConnectionStatus('failed');
          console.log('❌ GoTo Connect not accessible:', statusResult.error);
          console.log('❌ Detailed error message:', statusResult.message);
        }
      } else {
        setGotoConnectionStatus('no-credentials');
      }
    } catch (error) {
      console.error('❌ GoTo Connect check failed:', error);
      setGotoConnectionStatus('failed');
    }
  };

  // Make call using ONLY GoTo Connect API directly
  const makeGoToCall = async (phoneNumber, contactName) => {
    // if (!gotoConnectId) {
    //   throw new Error('GoTo Connect not configured');
    // }

    try {
     
      
      // Only use GoTo Connect API - no fallbacks, no backend
      console.log("gotoConnectId_makeGoToCall_", gotoConnectId);
      const callResult = await makeGoToConnectCall(phoneNumber, contactName, gotoConnectId);
      
      if (callResult.success) {
        console.log('✅ GoTo Connect call successful via direct API:', callResult);
        return callResult;
      } else {
        throw new Error('GoTo Connect API call failed');
      }
      
    } catch (error) {
      console.error('❌ GoTo Connect API call failed:', error);
      throw new Error(`GoTo Connect API failed: ${error.message}. Please check your API credentials and network connection.`);
    }
  };

  const handleCallNow = async () => {
    if (!selectedContact) {
      setError('Please select a contact to call');
      return;
    }

    const phoneNumber = selectedContact.phone || selectedContact.contact_number || selectedContact.cell_number;
    if (!phoneNumber) {
      setError('Selected contact does not have a phone number');
      return;
    }

    // Record call start time
    const startTime = new Date();
    setCallStartTime(startTime);
    setIsCallActive(true);
    
    const contactName = selectedContact.name || `${selectedContact.first_name} ${selectedContact.last_name}`;
    
         try {
               // Use GoTo Connect API via backend - no CORS issues
        if (gotoConnectionStatus === 'connected' && gotoConnectId) {
          console.log('📞 Making call via GoTo Connect API via backend...');
          const callResult = await makeGoToCall(phoneNumber, contactName);
          
          // Call was successful via GoTo Connect API via backend
          setTitle(`Call to ${contactName} (GoTo Connect Backend API)`);
          setContent(`📞 Call initiated via GoTo Connect API via backend\n👤 Contact: ${contactName}\n📱 Phone: ${phoneNumber}\n⏰ Call started: ${startTime.toLocaleString()}\n🆔 GoTo Connect ID: ${gotoConnectId}\n🌐 Call Method: GoTo Connect Backend API (No CORS)\n\n--- Call Notes ---\n`);
          
          showSuccess('📞 Call initiated successfully via GoTo Connect Backend API!');
        } else {
          // GoTo Connect not available - show specific error based on status
          let errorMessage = '';
          if (gotoConnectionStatus === 'no-credentials') {
            errorMessage = 'GoTo Connect ID not configured. Please contact your administrator.';
          } else if (gotoConnectionStatus === 'failed') {
            errorMessage = 'GoTo Connect API is not accessible via backend. This may be due to network issues or backend configuration.';
          } else if (gotoConnectionStatus === 'checking') {
            errorMessage = 'GoTo Connect status is still being checked. Please wait and try again.';
          } else {
            errorMessage = 'GoTo Connect not connected. Please check your API credentials and network connection.';
          }
          throw new Error(errorMessage);
        }
                   } catch (error) {
        console.error('❌ GoTo Connect API call failed:', error);
        setError(`GoTo Connect API call failed: ${error.message}`);
        
        // GoTo Connect API via backend (no CORS issues)
        setTitle(`Call to ${contactName} (Failed)`);
        setContent(`❌ Call failed via GoTo Connect Backend API\n👤 Contact: ${contactName}\n📱 Phone: ${phoneNumber}\n⏰ Attempted: ${startTime.toLocaleString()}\n🆔 GoTo Connect ID: ${gotoConnectId || 'Not configured'}\n🌐 Call Method: GoTo Connect Backend API (Failed)\n❌ Error: ${error.message}\n\n--- Call Notes ---\n`);
      }
    
    // Start a timer to track call duration
    const timer = setInterval(() => {
      if (callStartTime) {
        const elapsed = Math.floor((new Date() - callStartTime) / 1000 / 60); // minutes
        setCallDuration(elapsed.toString());
      }
    }, 60000); // Update every minute
    
    // Clear timer when component unmounts or call ends
    setTimeout(() => clearInterval(timer), 3600000); // Clear after 1 hour max
  };

  const handleEndCall = () => {
    if (callStartTime) {
      const endTime = new Date();
      const durationMinutes = Math.floor((endTime - callStartTime) / 1000 / 60);
      setCallDuration(durationMinutes.toString());
      setIsCallActive(false);
      
      // Update content with call end time
      const endTimeText = `\n⏰ Call ended: ${endTime.toLocaleString()}\n⏱️ Duration: ${durationMinutes} minutes\n`;
      setContent(prev => prev + endTimeText);
    }
  };

  const handleLogCall = async () => {
    if (!title || !content) {
      setError('Please fill in call title and details');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const timestamp = new Date().toLocaleString();
      const finalContent = `${content}\n\n--- Call Summary ---\nDuration: ${callDuration || 'Not specified'} minutes\nOutcome: ${callOutcome || 'Not specified'}\nGoTo Connect ID: ${gotoConnectId || 'Not configured'}\nLogged by: ${user?.first_name || user?.email || 'Unknown'}\nLogged at: ${timestamp}`;
      
      const callData = {
        title,
        content: finalContent,
        visibility,
        contact_id: selectedContact?.id,
        is_action_item: false
      };

      await createPhoneCall(callData);

      // Reset form
      setTitle('');
      setContent('');
      setCallDuration('');
      setCallOutcome('');
      setCallStartTime(null);
      setIsCallActive(false);
      setSelectedContact(null);
      
      if (onCallSaved) {
        onCallSaved();
      }
      
      alert('Call logged successfully!');
      onClose();
    } catch (err) {
      console.error('Error logging call:', err);
      setError('Failed to log call. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSelect = (contact) => {
    console.log('📞 MakeCallModal: Contact selected, closing contact modal first...');
    // Close contact modal first to prevent interference
    setIsContactSelectOpen(false);
    
    // Use setTimeout to ensure contact modal closes before updating state
    setTimeout(() => {
      console.log('📞 MakeCallModal: Setting selected contact:', contact);
      setSelectedContact(contact);
    }, 0);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white w-full max-w-4xl mx-4 rounded-lg shadow-xl">
            <div className="flex justify-between items-center p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FiPhone className="w-5 h-5 text-green-600" />
                </div>
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  Make Phone Call
                </Dialog.Title>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Call Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Who are you calling? *
                    </label>
                    {selectedContact ? (
                      <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {selectedContact.name?.[0] || selectedContact.first_name?.[0] || 'C'}
                              {selectedContact.name?.split(' ')[1]?.[0] || selectedContact.last_name?.[0] || ''}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {selectedContact.name || `${selectedContact.first_name} ${selectedContact.last_name}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {selectedContact.phone || selectedContact.contact_number || selectedContact.cell_number || 'No phone'}
                            </div>
                            {selectedContact.type === 'user' && (
                              <span className="text-xs bg-purple-100 text-purple-600 px-1 py-0.5 rounded">
                                Team Member
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setIsContactSelectOpen(true)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsContactSelectOpen(true)}
                        className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                      >
                        <FiUser className="mr-2" />
                        Select Contact or Team Member
                      </button>
                    )}
                  </div>

                  {selectedContact && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="space-y-3">
                        <button
                          onClick={handleCallNow}
                          disabled={isCallActive || gotoConnectionStatus !== 'connected'}
                          className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiPhone className="mr-2" />
                          {isCallActive ? 'Call in Progress...' : 
                           gotoConnectionStatus !== 'connected' ? 'GoTo Connect Not Ready' :
                           `Call ${selectedContact.name || `${selectedContact.first_name} ${selectedContact.last_name}`}`}
                        </button>
                        
                                                 {isCallActive && (
                           <button
                             onClick={handleEndCall}
                             className="w-full flex items-center justify-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                           >
                             End Call & Log
                           </button>
                         )}
                         
                                                   {/* GoTo Connect Status Display */}
                          <div className="text-center p-3 rounded-lg border">
                            {gotoConnectionStatus === 'checking' && (
                              <div className="bg-yellow-50 border-yellow-200">
                                <p className="text-xs text-yellow-700 font-medium">
                                  🔍 Checking GoTo Connect status...
                                </p>
                                <p className="text-xs text-yellow-600 mt-1">
                                  Please wait while we verify the connection
                                </p>
                              </div>
                            )}
                            {gotoConnectionStatus === 'connected' && (
                              <div className="bg-green-50 border-green-200">
                                <p className="text-xs text-green-700 font-medium">
                                  ✅ GoTo Connect ready
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                  Backend API calls available (No CORS)
                                </p>
                              </div>
                            )}
                            {gotoConnectionStatus === 'failed' && (
                              <div className="bg-red-50 border-red-200">
                                <p className="text-xs text-red-700 font-medium">
                                  ❌ GoTo Connect not accessible
                                </p>
                                <p className="text-xs text-red-600 mt-1">
                                  Backend API or network issues detected
                                </p>
                                <button
                                  onClick={checkGoToConnectIntegration}
                                  className="text-xs text-red-600 hover:text-red-700 underline mt-1"
                                >
                                  Retry Connection
                                </button>
                              </div>
                            )}
                            {gotoConnectionStatus === 'no-credentials' && (
                              <div className="bg-orange-50 border-orange-200">
                                <p className="text-xs text-orange-700 font-medium">
                                  ⚠️ GoTo Connect ID not configured
                                </p>
                                <p className="text-xs text-orange-600 mt-1">
                                  Contact your administrator
                                </p>
                              </div>
                            )}
                          </div>
                      </div>
                      <p className="text-xs text-green-700 mt-2 text-center">
                        Phone: {selectedContact.phone || selectedContact.contact_number || selectedContact.cell_number}
                      </p>
                      {callStartTime && (
                        <p className="text-xs text-green-700 mt-1 text-center">
                          Call started: {callStartTime.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Call Subject</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Brief description of the call..."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                      <input
                        type="number"
                        value={callDuration}
                        onChange={(e) => setCallDuration(e.target.value)}
                        placeholder="5"
                        min="0"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Call Outcome</label>
                      <select
                        value={callOutcome}
                        onChange={(e) => setCallOutcome(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select outcome...</option>
                        {callOutcomes.map(outcome => (
                          <option key={outcome} value={outcome}>{outcome}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column - Call Notes */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Call Notes</label>
                    <ReactQuill
                      value={content}
                      onChange={setContent}
                      modules={modules}
                      className="h-48 mb-12"
                      placeholder="Enter call details, discussion points, next steps..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="all employees">All employees</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>
              </div>

                      

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogCall}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <FiSave className="mr-2" />
                  {isSubmitting ? 'Logging...' : 'Log Call'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      <ContactSelectModal
        isOpen={isContactSelectOpen}
        onClose={() => setIsContactSelectOpen(false)}
        onContactSelect={handleContactSelect}
      />
    </>
  );
}

export default MakeCallModal;