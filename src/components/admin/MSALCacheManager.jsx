import React, { useState, useEffect } from 'react';
import { 
  getCacheInfo, 
  getCacheStats, 
  clearUserCache, 
  clearAllCache,
  getTokenCache,
  getCacheHealth,
  optimizeCache,
  debugCache,
  startCacheMonitoring
} from '../../utils/msalCacheManager';

const MSALCacheManager = () => {
  const [cacheInfo, setCacheInfo] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [cacheHealth, setCacheHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [tokenCache, setTokenCache] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // Load cache information on component mount
  useEffect(() => {
    loadCacheInfo();
    loadCacheStats();
    loadCacheHealth();
  }, []);

  // Start cache monitoring
  useEffect(() => {
    const stopMonitoring = startCacheMonitoring((info) => {
      setCacheInfo(info);
    });

    return () => stopMonitoring();
  }, []);

  const loadCacheInfo = async () => {
    setLoading(true);
    try {
      const info = await getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error('Error loading cache info:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCacheStats = async () => {
    try {
      const stats = await getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Error loading cache stats:', error);
    }
  };

  const loadCacheHealth = async () => {
    try {
      const health = await getCacheHealth();
      setCacheHealth(health);
    } catch (error) {
      console.error('Error loading cache health:', error);
    }
  };

  const handleClearUserCache = async (userEmail) => {
    setLoading(true);
    try {
      const result = await clearUserCache(userEmail);
      if (result.success) {
        alert(`✅ ${result.message}`);
        await loadCacheInfo();
        await loadCacheStats();
        await loadCacheHealth();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllCache = async () => {
    if (window.confirm('Are you sure you want to clear all MSAL cache? This will require all users to re-authenticate.')) {
      setLoading(true);
      try {
        const result = await clearAllCache();
        if (result.success) {
          alert(`✅ ${result.message}`);
          await loadCacheInfo();
          await loadCacheStats();
          await loadCacheHealth();
        } else {
          alert(`❌ ${result.message}`);
        }
      } catch (error) {
        alert(`❌ Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOptimizeCache = async () => {
    setLoading(true);
    try {
      const result = await optimizeCache();
      if (result.success) {
        alert(`✅ ${result.message}`);
        await loadCacheInfo();
        await loadCacheStats();
        await loadCacheHealth();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetTokenCache = async (userEmail) => {
    setLoading(true);
    try {
      const result = await getTokenCache(userEmail);
      if (result.success) {
        setTokenCache(result.data);
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDebugCache = async () => {
    setLoading(true);
    try {
      const debug = await debugCache();
      setDebugInfo(debug);
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'empty': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">MSAL Cache Manager</h1>
      
      {/* Cache Health Status */}
      {cacheHealth && (
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Cache Health Status</h2>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getHealthStatusColor(cacheHealth.status)}`}>
            {cacheHealth.status.toUpperCase()}
          </div>
          
          {cacheHealth.issues.length > 0 && (
            <div className="mt-3">
              <h3 className="font-semibold text-red-600">Issues:</h3>
              <ul className="list-disc list-inside text-red-600">
                {cacheHealth.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          {cacheHealth.recommendations.length > 0 && (
            <div className="mt-3">
              <h3 className="font-semibold text-blue-600">Recommendations:</h3>
              <ul className="list-disc list-inside text-blue-600">
                {cacheHealth.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Cache Statistics */}
      {cacheStats && (
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Cache Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{cacheStats.totalAccounts}</div>
              <div className="text-sm text-gray-600">Total Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{cacheStats.uniqueTenants}</div>
              <div className="text-sm text-gray-600">Unique Tenants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{cacheStats.uniqueEnvironments}</div>
              <div className="text-sm text-gray-600">Environments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{cacheStats.cacheLocation}</div>
              <div className="text-sm text-gray-600">Storage Type</div>
            </div>
          </div>
        </div>
      )}

      {/* Cache Management Actions */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Cache Management</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadCacheInfo}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Cache Info'}
          </button>
          
          <button
            onClick={handleOptimizeCache}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Optimizing...' : 'Optimize Cache'}
          </button>
          
          <button
            onClick={handleClearAllCache}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Clearing...' : 'Clear All Cache'}
          </button>
          
          <button
            onClick={handleDebugCache}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Debugging...' : 'Debug Cache'}
          </button>
        </div>
      </div>

      {/* Cached Accounts */}
      {cacheInfo && (
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Cached Accounts ({cacheInfo.totalAccounts})</h2>
          
          {cacheInfo.accounts.length === 0 ? (
            <p className="text-gray-600">No accounts in cache</p>
          ) : (
            <div className="space-y-3">
              {cacheInfo.accounts.map((account, index) => (
                <div key={index} className="p-3 border rounded bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{account.name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-600">{account.username}</p>
                      <p className="text-xs text-gray-500">ID: {account.localAccountId}</p>
                      <p className="text-xs text-gray-500">Tenant: {account.tenantId}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGetTokenCache(account.username)}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        View Tokens
                      </button>
                      <button
                        onClick={() => handleClearUserCache(account.username)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Clear Cache
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Token Cache Details */}
      {tokenCache && (
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Token Cache Details</h2>
          <div className="bg-gray-50 p-3 rounded">
            <p><strong>User:</strong> {tokenCache.account.username}</p>
            <p><strong>Name:</strong> {tokenCache.account.name}</p>
            <p><strong>Valid Tokens:</strong> {tokenCache.hasValidTokens ? '✅ Yes' : '❌ No'}</p>
            {tokenCache.tokenExpiry && (
              <p><strong>Token Expiry:</strong> {tokenCache.tokenExpiry.toLocaleString()}</p>
            )}
            {tokenCache.scopes.length > 0 && (
              <p><strong>Scopes:</strong> {tokenCache.scopes.join(', ')}</p>
            )}
            {tokenCache.error && (
              <p><strong>Error:</strong> <span className="text-red-600">{tokenCache.error}</span></p>
            )}
          </div>
        </div>
      )}

      {/* Debug Information */}
      {debugInfo && (
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Debug Information</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MSALCacheManager;
