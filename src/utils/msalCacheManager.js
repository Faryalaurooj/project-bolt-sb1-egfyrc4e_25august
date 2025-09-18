// MSAL Cache Manager - Utility functions for working with MSAL cache
import { getMSALInstance } from '../services/outlookSync';

// =========================
// CACHE INSPECTION UTILITIES
// =========================

// Get detailed cache information
export const getCacheInfo = async () => {
  try {
    const msalInstance = await getMSALInstance();
    const accounts = msalInstance.getAllAccounts();
    
    return {
      totalAccounts: accounts.length,
      accounts: accounts.map(account => ({
        username: account.username,
        name: account.name,
        localAccountId: account.localAccountId,
        environment: account.environment,
        homeAccountId: account.homeAccountId,
        tenantId: account.tenantId
      })),
      cacheLocation: msalInstance.getConfiguration()?.cache?.cacheLocation || 'unknown'
    };
  } catch (error) {
    console.error('Error getting cache info:', error);
    return null;
  }
};

// Check if specific user is in cache
export const isUserInCache = async (userEmail) => {
  try {
    const msalInstance = await getMSALInstance();
    const accounts = msalInstance.getAllAccounts();
    
    return accounts.some(account => 
      account.username.toLowerCase() === userEmail.toLowerCase()
    );
  } catch (error) {
    console.error('Error checking user in cache:', error);
    return false;
  }
};

// Get cache statistics
export const getCacheStats = async () => {
  try {
    const msalInstance = await getMSALInstance();
    const accounts = msalInstance.getAllAccounts();
    
    const stats = {
      totalAccounts: accounts.length,
      uniqueTenants: new Set(accounts.map(acc => acc.tenantId)).size,
      uniqueEnvironments: new Set(accounts.map(acc => acc.environment)).size,
      cacheLocation: msalInstance.getConfiguration()?.cache?.cacheLocation || 'unknown'
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return null;
  }
};

// =========================
// CACHE MANAGEMENT UTILITIES
// =========================

// Clear cache for specific user
export const clearUserCache = async (userEmail) => {
  try {
    const msalInstance = await getMSALInstance();
    const accounts = msalInstance.getAllAccounts();
    
    const account = accounts.find(acc => 
      acc.username.toLowerCase() === userEmail.toLowerCase()
    );
    
    if (account) {
      await msalInstance.removeAccount(account);
      console.log(`✅ Cleared cache for user: ${userEmail}`);
      return { success: true, message: `Cache cleared for ${userEmail}` };
    } else {
      return { success: false, message: `User ${userEmail} not found in cache` };
    }
  } catch (error) {
    console.error('Error clearing user cache:', error);
    return { success: false, message: `Failed to clear cache: ${error.message}` };
  }
};

// Clear all cache
export const clearAllCache = async () => {
  try {
    const msalInstance = await getMSALInstance();
    await msalInstance.clearCache();
    console.log('✅ Cleared all MSAL cache');
    return { success: true, message: 'All cache cleared successfully' };
  } catch (error) {
    console.error('Error clearing all cache:', error);
    return { success: false, message: `Failed to clear cache: ${error.message}` };
  }
};

// =========================
// TOKEN CACHE UTILITIES
// =========================

// Get token cache for specific user
export const getTokenCache = async (userEmail) => {
  try {
    const msalInstance = await getMSALInstance();
    const accounts = msalInstance.getAllAccounts();
    
    const account = accounts.find(acc => 
      acc.username.toLowerCase() === userEmail.toLowerCase()
    );
    
    if (!account) {
      return { success: false, message: 'User not found in cache' };
    }
    
    // Get token cache info (without exposing actual tokens)
    const tokenCache = {
      account: {
        username: account.username,
        name: account.name,
        localAccountId: account.localAccountId
      },
      hasValidTokens: false,
      tokenExpiry: null,
      scopes: []
    };
    
    // Try to get token silently to check if valid
    try {
      const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: ['User.Read'],
        account: account
      });
      
      tokenCache.hasValidTokens = true;
      tokenCache.tokenExpiry = new Date(tokenResponse.expiresOn);
      tokenCache.scopes = tokenResponse.scopes;
      
    } catch (error) {
      tokenCache.hasValidTokens = false;
      tokenCache.error = error.message;
    }
    
    return { success: true, data: tokenCache };
  } catch (error) {
    console.error('Error getting token cache:', error);
    return { success: false, message: `Failed to get token cache: ${error.message}` };
  }
};

// =========================
// CACHE MONITORING UTILITIES
// =========================

// Monitor cache changes
export const startCacheMonitoring = (callback) => {
  const monitorInterval = setInterval(async () => {
    try {
      const cacheInfo = await getCacheInfo();
      if (callback && typeof callback === 'function') {
        callback(cacheInfo);
      }
    } catch (error) {
      console.error('Error in cache monitoring:', error);
    }
  }, 5000); // Check every 5 seconds
  
  return () => clearInterval(monitorInterval);
};

// Get cache health status
export const getCacheHealth = async () => {
  try {
    const msalInstance = await getMSALInstance();
    const accounts = msalInstance.getAllAccounts();
    
    const health = {
      status: 'healthy',
      issues: [],
      recommendations: []
    };
    
    // Check for common issues
    if (accounts.length === 0) {
      health.status = 'empty';
      health.issues.push('No accounts in cache');
      health.recommendations.push('Users need to authenticate');
    }
    
    // Check for duplicate accounts
    const usernames = accounts.map(acc => acc.username.toLowerCase());
    const duplicates = usernames.filter((username, index) => 
      usernames.indexOf(username) !== index
    );
    
    if (duplicates.length > 0) {
      health.status = 'warning';
      health.issues.push(`Duplicate accounts found: ${duplicates.join(', ')}`);
      health.recommendations.push('Clear cache and re-authenticate users');
    }
    
    // Check token validity for each account
    for (const account of accounts) {
      try {
        await msalInstance.acquireTokenSilent({
          scopes: ['User.Read'],
          account: account
        });
      } catch (error) {
        health.status = 'warning';
        health.issues.push(`Invalid tokens for ${account.username}`);
        health.recommendations.push(`Re-authenticate ${account.username}`);
      }
    }
    
    return health;
  } catch (error) {
    console.error('Error getting cache health:', error);
    return {
      status: 'error',
      issues: [`Cache health check failed: ${error.message}`],
      recommendations: ['Restart application or clear cache']
    };
  }
};

// =========================
// CACHE OPTIMIZATION UTILITIES
// =========================

// Optimize cache by removing expired accounts
export const optimizeCache = async () => {
  try {
    const msalInstance = await getMSALInstance();
    const accounts = msalInstance.getAllAccounts();
    
    const removedAccounts = [];
    
    for (const account of accounts) {
      try {
        // Try to get token silently
        await msalInstance.acquireTokenSilent({
          scopes: ['User.Read'],
          account: account
        });
      } catch (error) {
        // If token acquisition fails, remove the account
        await msalInstance.removeAccount(account);
        removedAccounts.push(account.username);
        console.log(`🗑️ Removed expired account: ${account.username}`);
      }
    }
    
    return {
      success: true,
      message: `Cache optimized. Removed ${removedAccounts.length} expired accounts.`,
      removedAccounts
    };
  } catch (error) {
    console.error('Error optimizing cache:', error);
    return { success: false, message: `Failed to optimize cache: ${error.message}` };
  }
};

// =========================
// CACHE DEBUGGING UTILITIES
// =========================

// Debug cache issues
export const debugCache = async () => {
  try {
    const msalInstance = await getMSALInstance();
    const config = msalInstance.getConfiguration();
    const accounts = msalInstance.getAllAccounts();
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      configuration: {
        clientId: config.auth.clientId,
        authority: config.auth.authority,
        cacheLocation: config.cache.cacheLocation,
        storeAuthStateInCookie: config.cache.storeAuthStateInCookie
      },
      accounts: accounts.map(account => ({
        username: account.username,
        name: account.name,
        localAccountId: account.localAccountId,
        environment: account.environment,
        tenantId: account.tenantId,
        homeAccountId: account.homeAccountId
      })),
      browserInfo: {
        userAgent: navigator.userAgent,
        localStorage: typeof Storage !== 'undefined',
        sessionStorage: typeof Storage !== 'undefined'
      }
    };
    
    return debugInfo;
  } catch (error) {
    console.error('Error debugging cache:', error);
    return { error: error.message };
  }
};

// Export all utilities
export default {
  getCacheInfo,
  isUserInCache,
  getCacheStats,
  clearUserCache,
  clearAllCache,
  getTokenCache,
  startCacheMonitoring,
  getCacheHealth,
  optimizeCache,
  debugCache
};
