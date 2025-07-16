import { useState, useEffect, useCallback } from 'react';
import { RezdyPickupLocation } from '@/lib/types/rezdy';

interface PickupCacheData {
  pickups: RezdyPickupLocation[];
  lastUpdated: string;
  cached: boolean;
  hasPickups: boolean;
}

interface UsePickupCacheOptions {
  productCode: string;
  autoFetch?: boolean;
  cacheKey?: string;
}

export function usePickupCache({ 
  productCode, 
  autoFetch = true,
  cacheKey = 'pickup-locations'
}: UsePickupCacheOptions) {
  const [pickupData, setPickupData] = useState<PickupCacheData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storageKey = `${cacheKey}-${productCode}`;

  // Load from session storage
  const loadFromCache = useCallback((): PickupCacheData | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if data is less than 30 minutes old
        const age = Date.now() - new Date(parsed.lastUpdated).getTime();
        if (age < 30 * 60 * 1000) { // 30 minutes
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load pickup cache:', error);
    }
    return null;
  }, [storageKey]);

  // Save to session storage
  const saveToCache = useCallback((data: PickupCacheData) => {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save pickup cache:', error);
    }
  }, [storageKey]);

  // Fetch pickup locations from API
  const fetchPickupLocations = useCallback(async (refresh = false): Promise<PickupCacheData | null> => {
    if (!productCode) return null;

    setIsLoading(true);
    setError(null);

    try {
      const url = `/api/rezdy/products/${productCode}/pickups${refresh ? '?refresh=true' : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pickup locations: ${response.status}`);
      }

      const data = await response.json();
      const cacheData: PickupCacheData = {
        pickups: data.pickups || [],
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        cached: data.cached || false,
        hasPickups: data.hasPickups || false,
      };

      setPickupData(cacheData);
      saveToCache(cacheData);
      
      return cacheData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pickup locations';
      setError(errorMessage);
      console.error('Error fetching pickup locations:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [productCode, saveToCache]);

  // Preload pickup locations (background fetch)
  const preloadPickupLocations = useCallback(async () => {
    if (!productCode) return;

    // Check cache first
    const cached = loadFromCache();
    if (cached) {
      setPickupData(cached);
      return cached;
    }

    // Fetch in background without setting loading state
    try {
      const url = `/api/rezdy/products/${productCode}/pickups`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        const cacheData: PickupCacheData = {
          pickups: data.pickups || [],
          lastUpdated: data.lastUpdated || new Date().toISOString(),
          cached: data.cached || false,
          hasPickups: data.hasPickups || false,
        };

        setPickupData(cacheData);
        saveToCache(cacheData);
        return cacheData;
      }
    } catch (err) {
      console.warn('Background pickup preload failed:', err);
    }
    
    return null;
  }, [productCode, loadFromCache, saveToCache]);

  // Initial load
  useEffect(() => {
    if (!productCode) return;

    // Try cache first
    const cached = loadFromCache();
    if (cached) {
      setPickupData(cached);
      return;
    }

    // Auto-fetch if enabled
    if (autoFetch) {
      fetchPickupLocations();
    }
  }, [productCode, autoFetch, loadFromCache, fetchPickupLocations]);

  // Refresh pickup locations
  const refresh = useCallback(() => {
    return fetchPickupLocations(true);
  }, [fetchPickupLocations]);

  // Check if pickup locations are available
  const hasPickupLocations = pickupData?.hasPickups ?? false;

  // Get pickup locations array
  const pickupLocations = pickupData?.pickups ?? [];

  return {
    pickupData,
    pickupLocations,
    hasPickupLocations,
    isLoading,
    error,
    fetchPickupLocations,
    preloadPickupLocations,
    refresh,
    lastUpdated: pickupData?.lastUpdated,
    isCached: pickupData?.cached ?? false,
  };
}