# MSAL Cache Usage Guide

## Overview
This guide shows you how to use MSAL cache effectively in your React application. MSAL cache automatically handles token storage, refresh, and management, making your authentication seamless.

## Quick Start

### 1. Basic Cache Usage

```javascript
import { useMSALCache, useUserAuthStatus } from '../hooks/useMSALCache';

const MyComponent = ({ userEmail }) => {
  const { isAuthenticated, loading } = useUserAuthStatus(userEmail);
  
  if (loading) return <div>Checking authentication...</div>;
  
  return (
    <div>
      {isAuthenticated ? (
        <div>✅ User is authenticated and cached</div>
      ) : (
        <div>❌ User needs to authenticate</div>
      )}
    </div>
  );
};
```

### 2. Check Cache Before API Calls

```javascript
import { useUserAuthStatus } from '../hooks/useMSALCache';
import { getOutlookCalendarEvents } from '../services/outlookSync';

const CalendarComponent = ({ userEmail }) => {
  const { isAuthenticated, loading } = useUserAuthStatus(userEmail);
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    if (!isAuthenticated) {
      alert('Please authenticate with Outlook first');
      return;
    }

    try {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const outlookEvents = await getOutlookCalendarEvents(userEmail, startDate, endDate);
      setEvents(outlookEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  return (
    <div>
      <button 
        onClick={fetchEvents}
        disabled={!isAuthenticated || loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Loading...' : 'Fetch Events'}
      </button>
    </div>
  );
};
```

## Advanced Cache Management

### 1. Cache Health Monitoring

```javascript
import { useCacheHealth } from '../hooks/useMSALCache';

const CacheMonitor = () => {
  const { health, loading, checkHealth } = useCacheHealth();

  return (
    <div>
      <h3>Cache Health: {health?.status}</h3>
      {health?.issues.map((issue, index) => (
        <div key={index} className="text-red-600">{issue}</div>
      ))}
      <button onClick={checkHealth}>Refresh Health</button>
    </div>
  );
};
```

### 2. Cache Statistics

```javascript
import { useMSALCache } from '../hooks/useMSALCache';

const CacheStats = () => {
  const { cacheInfo, loading, loadCacheInfo } = useMSALCache();

  return (
    <div>
      <h3>Cache Statistics</h3>
      <p>Total Accounts: {cacheInfo?.totalAccounts}</p>
      <p>Storage Type: {cacheInfo?.cacheLocation}</p>
      <button onClick={loadCacheInfo}>Refresh Stats</button>
    </div>
  );
};
```

## Integration with Existing Components

### 1. Update Your RegisterForm

```javascript
// In your RegisterForm.jsx
import { useUserAuthStatus } from '../hooks/useMSALCache';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    // ... your form data
    outlookEmail: ''
  });

  const { isAuthenticated, checkAuthStatus } = useUserAuthStatus(formData.outlookEmail);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Register user first
    await register(formData);
    
    // Check if Outlook email is already cached
    if (formData.outlookEmail) {
      if (isAuthenticated) {
        alert('✅ Outlook already connected! Using cached authentication.');
      } else {
        // Initialize Outlook sync
        const result = await initializeOutlookSync(formData.outlookEmail);
        if (result.success) {
          alert('✅ Outlook connected successfully!');
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      {formData.outlookEmail && (
        <div className="mb-4">
          <UserAuthStatus userEmail={formData.outlookEmail} />
        </div>
      )}
    </form>
  );
};
```

### 2. Update Your Dashboard

```javascript
// In your Dashboard.jsx
import { useUserAuthStatus } from '../hooks/useMSALCache';
import { getOutlookCalendarEvents } from '../services/outlookSync';

const Dashboard = () => {
  const { user } = useAuth();
  const { isAuthenticated, loading } = useUserAuthStatus(user?.outlook_email);
  const [outlookEvents, setOutlookEvents] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user?.outlook_email) {
      loadOutlookEvents();
    }
  }, [isAuthenticated, user?.outlook_email]);

  const loadOutlookEvents = async () => {
    try {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Next 7 days
      const events = await getOutlookCalendarEvents(user.outlook_email, startDate, endDate);
      setOutlookEvents(events);
    } catch (error) {
      console.error('Failed to load Outlook events:', error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      
      {user?.outlook_email && (
        <div className="mb-4">
          <h2>Outlook Calendar</h2>
          {loading ? (
            <div>Checking Outlook connection...</div>
          ) : isAuthenticated ? (
            <div>
              <div className="text-green-600">✅ Outlook connected</div>
              <div>Events: {outlookEvents.length}</div>
            </div>
          ) : (
            <div>
              <div className="text-red-600">❌ Outlook not connected</div>
              <button onClick={() => initializeOutlookSync(user.outlook_email)}>
                Connect Outlook
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

### 3. Update Your Settings Page

```javascript
// In your Settings page
import { useUserAuthStatus } from '../hooks/useMSALCache';
import { reAuthenticateUser, logoutUser } from '../services/outlookSync';

const SettingsPage = () => {
  const { user } = useAuth();
  const { isAuthenticated, loading, checkAuthStatus } = useUserAuthStatus(user?.outlook_email);

  const handleReconnectOutlook = async () => {
    try {
      await reAuthenticateUser(user.outlook_email);
      await checkAuthStatus();
      alert('✅ Outlook reconnected successfully!');
    } catch (error) {
      alert(`❌ Reconnection failed: ${error.message}`);
    }
  };

  const handleDisconnectOutlook = async () => {
    try {
      await logoutUser(user.outlook_email);
      await checkAuthStatus();
      alert('✅ Outlook disconnected successfully!');
    } catch (error) {
      alert(`❌ Disconnection failed: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Settings</h1>
      
      <div className="mb-6">
        <h2>Outlook Integration</h2>
        {loading ? (
          <div>Checking connection status...</div>
        ) : (
          <div>
            <div className={`mb-2 ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
              {isAuthenticated ? '✅ Connected' : '❌ Not Connected'}
            </div>
            
            {isAuthenticated ? (
              <div className="space-x-2">
                <button 
                  onClick={handleReconnectOutlook}
                  className="bg-yellow-600 text-white px-4 py-2 rounded"
                >
                  Reconnect
                </button>
                <button 
                  onClick={handleDisconnectOutlook}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={() => initializeOutlookSync(user.outlook_email)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Connect Outlook
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
```

## Best Practices

### 1. Always Check Cache Before API Calls

```javascript
// ✅ Good - Check cache first
const { isAuthenticated } = useUserAuthStatus(userEmail);

const fetchData = async () => {
  if (!isAuthenticated) {
    alert('Please authenticate first');
    return;
  }
  
  // Safe to make API call
  const data = await getOutlookCalendarEvents(userEmail, startDate, endDate);
};

// ❌ Bad - Direct API call without checking cache
const fetchData = async () => {
  // This might fail if user is not authenticated
  const data = await getOutlookCalendarEvents(userEmail, startDate, endDate);
};
```

### 2. Handle Loading States

```javascript
// ✅ Good - Show loading state
const { isAuthenticated, loading } = useUserAuthStatus(userEmail);

if (loading) return <div>Checking authentication...</div>;

// ❌ Bad - No loading state
const { isAuthenticated } = useUserAuthStatus(userEmail);
// User might see incorrect status while loading
```

### 3. Provide User Feedback

```javascript
// ✅ Good - Clear user feedback
const handleConnect = async () => {
  try {
    const result = await initializeOutlookSync(userEmail);
    if (result.success) {
      alert(result.isNewAccount ? 
        'New account connected!' : 
        'Existing account reconnected!'
      );
    }
  } catch (error) {
    alert(`Connection failed: ${error.message}`);
  }
};
```

## Cache Benefits You Get

### 1. **Automatic Token Management**
- Tokens are automatically stored and refreshed
- No manual token handling required
- Seamless user experience

### 2. **Cross-Tab Synchronization**
- Authentication works across all browser tabs
- No need to re-authenticate in each tab
- Consistent user experience

### 3. **Persistent Authentication**
- Users stay logged in across browser sessions
- No repeated authentication prompts
- Better user experience

### 4. **Error Handling**
- Automatic error recovery
- Clear error messages
- Graceful fallbacks

### 5. **Performance**
- Instant token retrieval from cache
- Reduced API calls
- Faster application response

## Troubleshooting

### Common Issues

1. **"User not authenticated" errors**
   - Check if user is in cache using `useUserAuthStatus`
   - Call `initializeOutlookSync` if not authenticated

2. **Token expiration errors**
   - MSAL automatically handles token refresh
   - If still failing, call `reAuthenticateUser`

3. **Cache not persisting**
   - Check if localStorage is available
   - Verify MSAL configuration

4. **Multiple login popups**
   - Check for existing accounts first
   - Use `hasExistingAccount` before calling `initializeOutlookSync`

## Conclusion

MSAL cache provides a robust, secure, and user-friendly way to manage authentication in your application. By using the provided hooks and utilities, you can easily integrate cache management into your existing components and provide a seamless user experience.

The cache automatically handles:
- ✅ Token storage and refresh
- ✅ Cross-tab synchronization
- ✅ Error recovery
- ✅ Performance optimization
- ✅ Security best practices

Just remember to always check authentication status before making API calls and provide clear feedback to users about their authentication state.
