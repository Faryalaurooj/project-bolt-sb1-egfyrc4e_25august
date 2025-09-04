// Example of how to use the cleaned up Outlook sync functions
import React, { useState, useEffect } from 'react';
import { 
  initializeOutlookSync, 
  isUserAuthenticated, 
  checkTokenStatus,
  getOutlookCalendarEvents,
  syncEventWithOutlook,
  reAuthenticateUser,
  logoutUser
} from '../services/outlookSync';

const OutlookUsageExample = ({ userEmail }) => {
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);

  // Check authentication status on component mount
  useEffect(() => {
    if (userEmail) {
      checkUserAuthStatus();
    }
  }, [userEmail]);

  const checkUserAuthStatus = async () => {
    try {
      const status = await checkTokenStatus(userEmail);
      setAuthStatus(status);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleConnectOutlook = async () => {
    setLoading(true);
    try {
      const result = await initializeOutlookSync(userEmail);
      console.log('Outlook sync result:', result);
      
      if (result.success) {
        alert(result.isNewAccount ? 
          'New Outlook account connected!' : 
          'Existing Outlook account reconnected!'
        );
        await checkUserAuthStatus(); // Refresh status
      }
    } catch (error) {
      alert(`Outlook connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReconnectOutlook = async () => {
    setLoading(true);
    try {
      const result = await reAuthenticateUser(userEmail);
      console.log('Re-authentication result:', result);
      alert('Outlook re-authenticated successfully!');
      await checkUserAuthStatus(); // Refresh status
    } catch (error) {
      alert(`Re-authentication failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutOutlook = async () => {
    setLoading(true);
    try {
      const result = await logoutUser(userEmail);
      console.log('Logout result:', result);
      alert('Outlook logged out successfully!');
      await checkUserAuthStatus(); // Refresh status
    } catch (error) {
      alert(`Logout failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchEvents = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Next 30 days
      
      const outlookEvents = await getOutlookCalendarEvents(userEmail, startDate, endDate);
      setEvents(outlookEvents);
      console.log('Fetched events:', outlookEvents);
    } catch (error) {
      alert(`Failed to fetch events: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    setLoading(true);
    try {
      const eventData = {
        title: 'Test Event from CRM',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        description: 'This is a test event created from the CRM system',
        duration: 60, // 1 hour
        priority: 'Normal'
      };
      
      const result = await syncEventWithOutlook(userEmail, eventData);
      console.log('Event created:', result);
      alert('Event created successfully in Outlook!');
    } catch (error) {
      alert(`Failed to create event: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!userEmail) {
    return <div>Please provide user email</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Outlook Integration Example</h2>
      
      {/* Authentication Status */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
        {authStatus ? (
          <div className={`p-3 rounded ${authStatus.isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p><strong>Status:</strong> {authStatus.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
            <p><strong>Message:</strong> {authStatus.message}</p>
            {authStatus.account && <p><strong>Account:</strong> {authStatus.account}</p>}
          </div>
        ) : (
          <p>Checking authentication status...</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mb-6 space-y-2">
        {!authStatus?.isAuthenticated ? (
          <button
            onClick={handleConnectOutlook}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect Outlook'}
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleReconnectOutlook}
              disabled={loading}
              className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              {loading ? 'Reconnecting...' : 'Re-authenticate Outlook'}
            </button>
            <button
              onClick={handleLogoutOutlook}
              disabled={loading}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Logging out...' : 'Logout Outlook'}
            </button>
          </div>
        )}
      </div>

      {/* Calendar Actions */}
      {authStatus?.isAuthenticated && (
        <div className="mb-6 space-y-2">
          <button
            onClick={handleFetchEvents}
            disabled={loading}
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Fetching...' : 'Fetch Outlook Events'}
          </button>
          <button
            onClick={handleCreateEvent}
            disabled={loading}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Test Event'}
          </button>
        </div>
      )}

      {/* Events Display */}
      {events.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Outlook Events</h3>
          <div className="space-y-2">
            {events.map((event, index) => (
              <div key={index} className="p-3 border rounded bg-gray-50">
                <p><strong>Subject:</strong> {event.event_text}</p>
                <p><strong>Date:</strong> {event.event_date}</p>
                <p><strong>Time:</strong> {event.startTime}</p>
                {event.location && <p><strong>Location:</strong> {event.location}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OutlookUsageExample;
