import { useState, useEffect, useCallback, useRef } from "react";
import { RezdyProduct } from "@/lib/types/rezdy";
import { dataPreloader } from "@/lib/services/data-preloader";

interface UsePreloadedProductsOptions {
  limit?: number;
  offset?: number;
  autoLoad?: boolean;
  enableBackground?: boolean;
  fallbackToFetch?: boolean;
  onLoad?: (products: RezdyProduct[]) => void;
  onError?: (error: string) => void;
}

interface UsePreloadedProductsResult {
  products: RezdyProduct[];
  loading: boolean;
  error: string | null;
  fromCache: boolean;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  preloadStats: {
    totalPreloads: number;
    successfulPreloads: number;
    failedPreloads: number;
    averageLoadTime: number;
    cacheHitRate: number;
  };
}

export function usePreloadedProducts(
  options: UsePreloadedProductsOptions = {}
): UsePreloadedProductsResult {
  const {
    limit = 100,
    offset = 0,
    autoLoad = true,
    enableBackground = true,
    fallbackToFetch = true,
    onLoad,
    onError,
  } = options;

  const [products, setProducts] = useState<RezdyProduct[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  const loadProducts = useCallback(
    async (forceRefresh = false) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const result = await dataPreloader.preloadProducts({
          limit,
          offset,
          forceRefresh,
          priority: "high",
        });

        if (!mountedRef.current) return;

        if (result.success && result.data) {
          setProducts(result.data);
          setFromCache(result.fromCache);
          setLastUpdated(result.timestamp);
          onLoad?.(result.data);
        } else {
          const errorMsg = result.error || "Failed to load products";
          setError(errorMsg);
          onError?.(errorMsg);

          // Try to get any cached data as fallback
          if (fallbackToFetch) {
            const fallbackData = await dataPreloader.getPreloadedData({
              limit,
              offset,
              fallbackToFetch: false,
            });
            if (fallbackData.length > 0) {
              setProducts(fallbackData);
              setFromCache(true);
            }
          }
        }
      } catch (err) {
        if (!mountedRef.current) return;

        const errorMsg =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
        loadingRef.current = false;
      }
    },
    [limit, offset, fallbackToFetch, onLoad, onError]
  );

  const refresh = useCallback(async () => {
    await loadProducts(true);
  }, [loadProducts]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;

    try {
      const nextOffset = offset + limit;
      const result = await dataPreloader.preloadProducts({
        limit,
        offset: nextOffset,
        priority: "low",
      });

      if (result.success && result.data && mountedRef.current) {
        setProducts((prev) => [...prev, ...result.data!]);
        setLastUpdated(result.timestamp);
      }
    } catch (err) {
      console.error("Error loading more products:", err);
    }
  }, [limit, offset]);

  // Initial load
  useEffect(() => {
    if (autoLoad) {
      loadProducts();
    }

    // Start background preloading
    if (enableBackground) {
      dataPreloader.backgroundPreload().catch((err) => {
        console.warn("Background preload failed:", err);
      });
    }

    return () => {
      mountedRef.current = false;
    };
  }, [autoLoad, enableBackground, loadProducts]);

  // Get current stats
  const preloadStats = dataPreloader.getStats();

  return {
    products,
    loading,
    error,
    fromCache,
    lastUpdated,
    refresh,
    loadMore,
    preloadStats,
  };
}

/**
 * Hook specifically for featured products
 */
export function useFeaturedProducts(): UsePreloadedProductsResult {
  return usePreloadedProducts({
    limit: 20,
    offset: 0,
    autoLoad: true,
    enableBackground: true,
  });
}

/**
 * Hook for getting preloaded data without triggering new loads
 */
export function usePreloadedCache(cacheKey?: string): {
  products: RezdyProduct[];
  loading: boolean;
  error: string | null;
} {
  const [products, setProducts] = useState<RezdyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getFromCache = async () => {
      try {
        const cachedData = await dataPreloader.getPreloadedData({
          fallbackToFetch: false,
        });
        setProducts(cachedData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to get cached data"
        );
      } finally {
        setLoading(false);
      }
    };

    getFromCache();
  }, [cacheKey]);

  return { products, loading, error };
}
