import { useState, useEffect, useCallback, useMemo } from 'react';
import { RezdyProduct } from '@/lib/types/rezdy';

interface PickupLocationData {
  location: string;
  productCount: number;
  hasApiData: boolean;
}

interface PickupLocationStats {
  locations: PickupLocationData[];
  totalProducts: number;
  apiDataAvailable: number;
  dataQuality: 'enhanced' | 'text_based' | 'error' | 'no_products';
  lastUpdated: string;
}

interface FilteredProductsResult {
  filteredProducts: RezdyProduct[];
  filterStats: {
    totalProducts: number;
    filteredCount: number;
    apiDataUsed: number;
    fallbackUsed: number;
    location: string;
  };
}

interface UsePickupLocationsOptions {
  useApiData?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  preloadOnMount?: boolean;
}

interface UsePickupLocationsReturn {
  // Location data
  locations: PickupLocationData[];
  stats: PickupLocationStats | null;
  
  // Loading states
  isLoading: boolean;
  isFiltering: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  refreshLocations: () => Promise<void>;
  filterProducts: (location: string, products?: RezdyProduct[]) => Promise<FilteredProductsResult | null>;
  clearCache: (productCode?: string) => Promise<void>;
  preloadData: (productCodes: string[]) => Promise<void>;
  
  // Utilities
  getLocationByName: (name: string) => PickupLocationData | undefined;
  hasLocationData: boolean;
}

export function usePickupLocations(options: UsePickupLocationsOptions = {}): UsePickupLocationsReturn {
  const {
    useApiData = true,
    autoRefresh = false,
    refreshInterval = 15 * 60 * 1000, // 15 minutes
    preloadOnMount = false,
  } = options;

  // State
  const [stats, setStats] = useState<PickupLocationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pickup locations data
  const fetchPickupLocations = useCallback(async (refresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (refresh) params.append('refresh', 'true');
      if (useApiData !== undefined) params.append('useApiData', useApiData.toString());

      const response = await fetch(`/api/rezdy/pickup-locations?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pickup locations: ${response.status}`);
      }

      const data = await response.json();
      
      setStats({
        locations: data.locations || [],
        totalProducts: data.totalProducts || 0,
        apiDataAvailable: data.apiDataAvailable || 0,
        dataQuality: data.dataQuality || 'error',
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pickup locations';
      setError(errorMessage);
      console.error('Error fetching pickup locations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [useApiData]);

  // Filter products by location
  const filterProducts = useCallback(async (
    location: string, 
    products?: RezdyProduct[]
  ): Promise<FilteredProductsResult | null> => {
    setIsFiltering(true);
    setError(null);

    try {
      const body = {
        location,
        products,
        useApiData,
      };

      const response = await fetch('/api/rezdy/pickup-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to filter products: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Filter operation failed');
      }

      return {
        filteredProducts: data.filteredProducts || [],
        filterStats: data.filterStats || {
          totalProducts: 0,
          filteredCount: 0,
          apiDataUsed: 0,
          fallbackUsed: 0,
          location,
        },
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to filter products';
      setError(errorMessage);
      console.error('Error filtering products:', err);
      return null;
    } finally {
      setIsFiltering(false);
    }
  }, [useApiData]);

  // Clear cache
  const clearCache = useCallback(async (productCode?: string) => {
    try {
      const params = new URLSearchParams();
      if (productCode) params.append('productCode', productCode);

      const response = await fetch(`/api/rezdy/pickup-locations?${params.toString()}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to clear cache: ${response.status}`);
      }

      // Refresh data after clearing cache
      await fetchPickupLocations(true);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cache';
      setError(errorMessage);
      console.error('Error clearing cache:', err);
    }
  }, [fetchPickupLocations]);

  // Refresh locations (wrapper for fetchPickupLocations with refresh=true)
  const refreshLocations = useCallback(() => fetchPickupLocations(true), [fetchPickupLocations]);

  // Preload pickup data for multiple products
  const preloadData = useCallback(async (productCodes: string[]) => {
    if (!productCodes.length) return;

    try {
      // Import EnhancedPickupFilter dynamically to avoid circular dependency
      const { EnhancedPickupFilter } = await import('@/lib/services/enhanced-pickup-filter');
      await EnhancedPickupFilter.preloadPickupData(productCodes);
    } catch (err) {
      console.warn('Failed to preload pickup data:', err);
    }
  }, []);

  // Derived values
  const locations = useMemo(() => stats?.locations || [], [stats]);
  
  const getLocationByName = useCallback((name: string) => {
    return locations.find(loc => 
      loc.location.toLowerCase() === name.toLowerCase()
    );
  }, [locations]);

  const hasLocationData = useMemo(() => locations.length > 0, [locations]);

  // Initial data fetch
  useEffect(() => {
    fetchPickupLocations();
  }, [fetchPickupLocations]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchPickupLocations(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchPickupLocations]);

  // Preload data on mount if enabled
  useEffect(() => {
    if (preloadOnMount && stats?.locations.length) {
      // Get products from locations data if available
      const productCodes = stats.locations.map(loc => loc.location).slice(0, 20); // Limit to avoid overwhelming
      preloadData(productCodes);
    }
  }, [preloadOnMount, stats, preloadData]);

  return {
    // Location data
    locations,
    stats,
    
    // Loading states
    isLoading,
    isFiltering,
    
    // Error states
    error,
    
    // Actions
    refreshLocations,
    filterProducts,
    clearCache,
    preloadData,
    
    // Utilities
    getLocationByName,
    hasLocationData,
  };
}

/**
 * Specialized hook for filtering products by pickup location with caching
 */
export function usePickupLocationFilter(location: string, products?: RezdyProduct[]) {
  const { filterProducts, isFiltering, error } = usePickupLocations();
  const [filteredResult, setFilteredResult] = useState<FilteredProductsResult | null>(null);

  const filter = useCallback(async () => {
    if (!location || location === 'all') {
      setFilteredResult({
        filteredProducts: products || [],
        filterStats: {
          totalProducts: products?.length || 0,
          filteredCount: products?.length || 0,
          apiDataUsed: 0,
          fallbackUsed: 0,
          location: 'all',
        },
      });
      return;
    }

    const result = await filterProducts(location, products);
    setFilteredResult(result);
  }, [location, products, filterProducts]);

  useEffect(() => {
    filter();
  }, [filter]);

  return {
    filteredProducts: filteredResult?.filteredProducts || [],
    filterStats: filteredResult?.filterStats || null,
    isFiltering,
    error,
    refetch: filter,
  };
}