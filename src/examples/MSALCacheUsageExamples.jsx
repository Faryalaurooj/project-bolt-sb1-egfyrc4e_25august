// Examples of how to use MSAL cache in your React components
import React, { useState, useEffect } from 'react';
import { useMSALCache, useUserAuthStatus, useCacheHealth } from '../hooks/useMSALCache';
import { 
  initializeOutlookSync, 
  getOutlookCalendarEvents,
  syncEventWithOutlook 
} from '../services/outlookSync';

// Example 1: User Authentication Status Component
const UserAuthStatus = ({ userEmail }) => {
  const { isAuthenticated, loading, error, checkAuthStatus } = useUserAuthStatus(userEmail);

  if (loading) return <div>Checking authentication status...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">Authentication Status</h3>
      <div className={`inline-block px-3 py-1 rounded-full text-sm ${
        isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
      </div>
      <button 
        onClick={checkAuthStatus}
        className="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      >
        Refresh
      </button>
    </div>
  );
};

// Example 2: Outlook Integration with Cache Awareness
const OutlookIntegration = ({ userEmail }) => {
  const { isAuthenticated, loading } = useUserAuthStatus(userEmail);
  const [outlookLoading, setOutlookLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState('');

  const handleConnectOutlook = async () => {
    setOutlookLoading(true);
    setMessage('');
    try {
      const result = await initializeOutlookSync(userEmail);
      if (result.success) {
        setMessage(result.isNewAccount ? 
          'New Outlook account connected!' : 
          'Existing Outlook account reconnected!'
        );
      }
    } catch (error) {
      setMessage(`Connection failed: ${error.message}`);
    } finally {
      setOutlookLoading(false);
    }
  };

  const handleFetchEvents = async () => {
    if (!isAuthenticated) {
      setMessage('Please connect Outlook first');
      return;
    }

    setOutlookLoading(true);
    setMessage('');
    try {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const outlookEvents = await getOutlookCalendarEvents(userEmail, startDate, endDate);
      setEvents(outlookEvents);
      setMessage(`Fetched ${outlookEvents.length} events`);
    } catch (error) {
      setMessage(`Failed to fetch events: ${error.message}`);
    } finally {
      setOutlookLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!isAuthenticated) {
      setMessage('Please connect Outlook first');
      return;
    }

    setOutlookLoading(true);
    setMessage('');
    try {
      const eventData = {
        title: 'Test Event from CRM',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        description: 'This is a test event created from the CRM system',
        duration: 60
      };
      
      const result = await syncEventWithOutlook(userEmail, eventData);
      setMessage('Event created successfully in Outlook!');
    } catch (error) {
      setMessage(`Failed to create event: ${error.message}`);
    } finally {
      setOutlookLoading(false);
    }
  };

  if (loading) return <div>Loading authentication status...</div>;

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-3">Outlook Integration</h3>
      
      <UserAuthStatus userEmail={userEmail} />
      
      <div className="mt-4 space-y-2">
        {!isAuthenticated ? (
          <button
            onClick={handleConnectOutlook}
            disabled={outlookLoading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {outlookLoading ? 'Connecting...' : 'Connect Outlook'}
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleFetchEvents}
              disabled={outlookLoading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {outlookLoading ? 'Fetching...' : 'Fetch Outlook Events'}
            </button>
            <button
              onClick={handleCreateEvent}
              disabled={outlookLoading}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {outlookLoading ? 'Creating...' : 'Create Test Event'}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="mt-3 p-2 bg-blue-50 text-blue-800 rounded text-sm">
          {message}
        </div>
      )}

      {events.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Recent Events:</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {events.slice(0, 5).map((event, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                <div className="font-medium">{event.event_text}</div>
                <div className="text-gray-600">{event.event_date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Example 3: Cache Health Monitor
const CacheHealthMonitor = () => {
  const { health, loading, error, checkHealth } = useCacheHealth();

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'empty': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) return <div>Checking cache health...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Cache Health Monitor</h3>
        <button 
          onClick={checkHealth}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
      
      {health && (
        <div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.status)}`}>
            {health.status.toUpperCase()}
          </div>
          
          {health.issues.length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium text-red-600">Issues:</h4>
              <ul className="list-disc list-inside text-sm text-red-600">
                {health.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          {health.recommendations.length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium text-blue-600">Recommendations:</h4>
              <ul className="list-disc list-inside text-sm text-blue-600">
                {health.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Example 4: Cache Statistics Dashboard
const CacheStatsDashboard = () => {
  const { cacheInfo, loading, error, loadCacheInfo } = useMSALCache();

  if (loading) return <div>Loading cache statistics...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Cache Statistics</h3>
        <button 
          onClick={loadCacheInfo}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
      
      {cacheInfo && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{cacheInfo.totalAccounts}</div>
            <div className="text-sm text-gray-600">Total Accounts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {new Set(cacheInfo.accounts.map(acc => acc.tenantId)).size}
            </div>
            <div className="text-sm text-gray-600">Unique Tenants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(cacheInfo.accounts.map(acc => acc.environment)).size}
            </div>
            <div className="text-sm text-gray-600">Environments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{cacheInfo.cacheLocation}</div>
            <div className="text-sm text-gray-600">Storage Type</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Example Component
const MSALCacheUsageExamples = () => {
  const [userEmail, setUserEmail] = useState('');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">MSAL Cache Usage Examples</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          User Email for Testing:
        </label>
        <input
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="Enter user email to test"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CacheHealthMonitor />
        <CacheStatsDashboard />
        {userEmail && <UserAuthStatus userEmail={userEmail} />}
        {userEmail && <OutlookIntegration userEmail={userEmail} />}
      </div>
    </div>
  );
};

export default MSALCacheUsageExamples;
