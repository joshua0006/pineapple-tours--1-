import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { RezdyProduct, RezdyProductsResponse } from '@/lib/types/rezdy';

// Cache interface
interface CacheEntry {
  data: RezdyProduct[];
  timestamp: number;
  expiresAt: number;
}

// Enhanced loading states
export interface EnhancedLoadingState {
  isInitialLoading: boolean;
  isRefreshing: boolean;
  isCategoryLoading: boolean;
  isRetrying: boolean;
  progress: number; // 0-100
  stage: 'fetching' | 'processing' | 'complete' | 'error';
}

interface UseEnhancedRezdyProductsOptions {
  limit?: number;
  offset?: number;
  cacheTimeout?: number; // in milliseconds
  retryAttempts?: number;
  retryDelay?: number;
  enableProgressiveLoading?: boolean;
  preloadCategories?: string[];
}

interface UseEnhancedRezdyProductsReturn {
  data: RezdyProduct[] | null;
  loading: EnhancedLoadingState;
  error: string | null;
  retry: () => void;
  refresh: () => void;
  preloadCategory: (categoryId: string) => Promise<void>;
  getCategoryProducts: (categoryId: string) => RezdyProduct[];
}

// Global cache
const productCache = new Map<string, CacheEntry>();
const categoryCache = new Map<string, RezdyProduct[]>();

// Default options
const DEFAULT_OPTIONS: Required<UseEnhancedRezdyProductsOptions> = {
  limit: 100,
  offset: 0,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  retryAttempts: 3,
  retryDelay: 1000,
  enableProgressiveLoading: true,
  preloadCategories: []
};

export function useEnhancedRezdyProducts(
  options: UseEnhancedRezdyProductsOptions = {}
): UseEnhancedRezdyProductsReturn {
  // Memoize options to prevent infinite re-renders
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [
    options.limit,
    options.offset,
    options.cacheTimeout,
    options.retryAttempts,
    options.retryDelay,
    options.enableProgressiveLoading,
    JSON.stringify(options.preloadCategories || [])
  ]);
  const [data, setData] = useState<RezdyProduct[] | null>(null);
  const [loading, setLoading] = useState<EnhancedLoadingState>({
    isInitialLoading: true,
    isRefreshing: false,
    isCategoryLoading: false,
    isRetrying: false,
    progress: 0,
    stage: 'fetching'
  });
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate cache key
  const getCacheKey = useCallback((limit: number, offset: number) => {
    return `products_${limit}_${offset}`;
  }, []);

  // Check if cache is valid
  const isCacheValid = useCallback((entry: CacheEntry) => {
    return Date.now() < entry.expiresAt;
  }, []);

  // Update loading progress
  const updateProgress = useCallback((progress: number, stage: EnhancedLoadingState['stage']) => {
    setLoading(prev => ({ ...prev, progress, stage }));
  }, []);

  // Preload category data (defined early to avoid circular dependency)
  const preloadCategory = useCallback(async (categoryId: string) => {
    if (!data || categoryCache.has(categoryId)) return;

    setLoading(prev => ({ ...prev, isCategoryLoading: true }));

    try {
      // Filter products for this category (simplified - you might want to enhance this)
      const categoryProducts = data.filter(product => 
        product.categories?.some((category: string) => category.toLowerCase().includes(categoryId.toLowerCase())) ||
        product.name.toLowerCase().includes(categoryId.toLowerCase())
      );

      categoryCache.set(categoryId, categoryProducts);
    } catch (err) {
      console.error('Error preloading category:', categoryId, err);
    } finally {
      setLoading(prev => ({ ...prev, isCategoryLoading: false }));
    }
  }, [data]);

  // Fetch products with enhanced loading states
  const fetchProducts = useCallback(async (isRetry = false, isRefresh = false) => {
    const cacheKey = getCacheKey(opts.limit, opts.offset);
    
    // Check cache first (unless refreshing)
    if (!isRefresh && !isRetry) {
      const cached = productCache.get(cacheKey);
      if (cached && isCacheValid(cached)) {
        setData(cached.data);
        setLoading({
          isInitialLoading: false,
          isRefreshing: false,
          isCategoryLoading: false,
          isRetrying: false,
          progress: 100,
          stage: 'complete'
        });
        setError(null);
        return;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // Set loading state
      setLoading(prev => ({
        ...prev,
        isInitialLoading: !isRetry && !isRefresh && !prev.isInitialLoading ? false : prev.isInitialLoading,
        isRefreshing: isRefresh,
        isRetrying: isRetry,
        progress: 0,
        stage: 'fetching'
      }));
      setError(null);

      updateProgress(10, 'fetching');

      // Add cache-busting parameter
      const cacheBuster = Date.now();
      const url = `/api/rezdy/products?limit=${opts.limit}&offset=${opts.offset}&_t=${cacheBuster}`;
      
      updateProgress(30, 'fetching');

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal
      });

      updateProgress(60, 'fetching');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData: RezdyProductsResponse = await response.json();
      
      updateProgress(80, 'processing');

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      const products = responseData.products || responseData.data || [];
      
      updateProgress(90, 'processing');

      // Cache the results
      const cacheEntry: CacheEntry = {
        data: products,
        timestamp: Date.now(),
        expiresAt: Date.now() + opts.cacheTimeout
      };
      productCache.set(cacheKey, cacheEntry);

      // Progressive loading: Set data immediately for better UX
      setData(products);
      
      updateProgress(100, 'complete');

      // Final loading state
      setLoading({
        isInitialLoading: false,
        isRefreshing: false,
        isCategoryLoading: false,
        isRetrying: false,
        progress: 100,
        stage: 'complete'
      });

      // Reset retry count on success
      retryCountRef.current = 0;

      // Note: Category preloading is handled in a separate useEffect to avoid circular dependencies

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }

      console.error('Enhanced useRezdyProducts error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      
      // Retry logic
      if (retryCountRef.current < opts.retryAttempts) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchProducts(true, isRefresh);
        }, opts.retryDelay * retryCountRef.current);
        return;
      }

      // Set error state
      setError(errorMessage);
      setLoading({
        isInitialLoading: false,
        isRefreshing: false,
        isCategoryLoading: false,
        isRetrying: false,
        progress: 0,
        stage: 'error'
      });
    }
  }, [opts, getCacheKey, isCacheValid, updateProgress]);

  // Retry function
  const retry = useCallback(() => {
    retryCountRef.current = 0;
    fetchProducts(false, false);
  }, [fetchProducts]);

  // Refresh function
  const refresh = useCallback(() => {
    fetchProducts(false, true);
  }, [fetchProducts]);



  // Get category products
  const getCategoryProducts = useCallback((categoryId: string): RezdyProduct[] => {
    return categoryCache.get(categoryId) || [];
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
    
    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  // Separate effect for category preloading to avoid circular dependencies
  useEffect(() => {
    if (data && opts.enableProgressiveLoading && opts.preloadCategories.length > 0) {
      const timeoutId = setTimeout(() => {
        opts.preloadCategories.forEach((categoryId: string) => {
          preloadCategory(categoryId);
        });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [data, opts.enableProgressiveLoading, opts.preloadCategories, preloadCategory]);

  return {
    data,
    loading,
    error,
    retry,
    refresh,
    preloadCategory,
    getCategoryProducts
  };
}

// Utility function to clear cache
export function clearProductCache() {
  productCache.clear();
  categoryCache.clear();
}

// Utility function to get cache stats
export function getCacheStats() {
  return {
    productCacheSize: productCache.size,
    categoryCacheSize: categoryCache.size,
    productCacheEntries: Array.from(productCache.keys()),
    categoryCacheEntries: Array.from(categoryCache.keys())
  };
} 