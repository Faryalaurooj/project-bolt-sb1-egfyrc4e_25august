import { useState, useEffect, useCallback } from 'react';
import { 
  getCacheInfo, 
  isUserInCache, 
  getTokenCache,
  getCacheHealth 
} from '../utils/msalCacheManager';

// Hook for managing MSAL cache in React components
export const useMSALCache = () => {
  const [cacheInfo, setCacheInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cache information
  const loadCacheInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await getCacheInfo();
      setCacheInfo(info);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user is in cache
  const checkUserInCache = useCallback(async (userEmail) => {
    try {
      return await isUserInCache(userEmail);
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  // Get token cache for user
  const getUserTokenCache = useCallback(async (userEmail) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTokenCache(userEmail);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cache info on mount
  useEffect(() => {
    loadCacheInfo();
  }, [loadCacheInfo]);

  return {
    cacheInfo,
    loading,
    error,
    loadCacheInfo,
    checkUserInCache,
    getUserTokenCache
  };
};

// Hook for checking if specific user is authenticated
export const useUserAuthStatus = (userEmail) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuthStatus = useCallback(async () => {
    if (!userEmail) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const inCache = await isUserInCache(userEmail);
      setIsAuthenticated(inCache);
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    isAuthenticated,
    loading,
    error,
    checkAuthStatus
  };
};

// Hook for monitoring cache health
export const useCacheHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const healthStatus = await getCacheHealth();
      setHealth(healthStatus);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    health,
    loading,
    error,
    checkHealth
  };
};

export default useMSALCache;
