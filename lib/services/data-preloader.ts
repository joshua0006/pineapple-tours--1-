import { RezdyProduct, RezdyProductsResponse } from "@/lib/types/rezdy";
import { simpleCacheManager } from "@/lib/utils/simple-cache-manager";

interface PreloadConfig {
  enablePreloading: boolean;
  preloadOnMount: boolean;
  preloadInBackground: boolean;
  maxRetries: number;
  retryDelay: number;
  fallbackData?: RezdyProduct[];
}

interface PreloadResult {
  success: boolean;
  data?: RezdyProduct[];
  error?: string;
  fromCache: boolean;
  timestamp: number;
  loadTime: number;
}

interface PreloadStats {
  totalPreloads: number;
  successfulPreloads: number;
  failedPreloads: number;
  averageLoadTime: number;
  cacheHits: number;
  cacheHitRate: number;
  lastPreloadTime?: number;
}

export class DataPreloader {
  private static instance: DataPreloader;
  private preloadStats: PreloadStats = {
    totalPreloads: 0,
    successfulPreloads: 0,
    failedPreloads: 0,
    averageLoadTime: 0,
    cacheHits: 0,
    cacheHitRate: 0,
  };

  private config: PreloadConfig = {
    enablePreloading: true,
    preloadOnMount: true,
    preloadInBackground: true,
    maxRetries: 3,
    retryDelay: 1000,
  };

  private preloadPromises = new Map<string, Promise<PreloadResult>>();
  private loadTimes: number[] = [];

  private constructor(config?: Partial<PreloadConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  static getInstance(config?: Partial<PreloadConfig>): DataPreloader {
    if (!DataPreloader.instance) {
      DataPreloader.instance = new DataPreloader(config);
    }
    return DataPreloader.instance;
  }

  /**
   * Preload all products with intelligent caching and error handling
   */
  async preloadProducts(options?: {
    limit?: number;
    offset?: number;
    forceRefresh?: boolean;
    priority?: "high" | "low";
  }): Promise<PreloadResult> {
    const startTime = Date.now();
    const {
      limit = 100,
      offset = 0,
      forceRefresh = false,
      priority = "high",
    } = options || {};

    if (!this.config.enablePreloading) {
      return {
        success: false,
        error: "Preloading disabled",
        fromCache: false,
        timestamp: Date.now(),
        loadTime: 0,
      };
    }

    const cacheKey = `products:${limit}:${offset}`;

    // Check if preload is already in progress
    if (this.preloadPromises.has(cacheKey)) {
      return this.preloadPromises.get(cacheKey)!;
    }

    const preloadPromise = this.executePreload(
      cacheKey,
      limit,
      offset,
      forceRefresh,
      priority
    );
    this.preloadPromises.set(cacheKey, preloadPromise);

    try {
      const result = await preloadPromise;
      this.updateStats(result, startTime);
      return result;
    } finally {
      this.preloadPromises.delete(cacheKey);
    }
  }

  private async executePreload(
    cacheKey: string,
    limit: number,
    offset: number,
    forceRefresh: boolean,
    priority: "high" | "low"
  ): Promise<PreloadResult> {
    const startTime = Date.now();

    try {
      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cachedData = await simpleCacheManager.getProducts(cacheKey);
        if (cachedData && cachedData.length > 0) {
          console.log(
            `🚀 Preload cache HIT: ${cacheKey} (${cachedData.length} products)`
          );
          return {
            success: true,
            data: cachedData,
            fromCache: true,
            timestamp: Date.now(),
            loadTime: Date.now() - startTime,
          };
        }
      }

      // Fetch from API with retry logic
      const data = await this.fetchWithRetry(limit, offset, priority);

      // Cache the results
      await simpleCacheManager.cacheProducts(data, cacheKey);

      console.log(
        `🚀 Preload SUCCESS: ${cacheKey} (${data.length} products, ${
          Date.now() - startTime
        }ms)`
      );

      return {
        success: true,
        data,
        fromCache: false,
        timestamp: Date.now(),
        loadTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error(`🚀 Preload FAILED: ${cacheKey}`, error);

      // Try to return fallback data
      const fallbackData = this.config.fallbackData || [];

      return {
        success: false,
        data: fallbackData.length > 0 ? fallbackData : undefined,
        error: error instanceof Error ? error.message : "Unknown error",
        fromCache: false,
        timestamp: Date.now(),
        loadTime: Date.now() - startTime,
      };
    }
  }

  private async fetchWithRetry(
    limit: number,
    offset: number,
    priority: "high" | "low",
    attempt = 1
  ): Promise<RezdyProduct[]> {
    try {
      const url = `/api/rezdy/products?limit=${limit}&offset=${offset}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Preload-Priority": priority,
        },
        // Add timeout for high priority requests
        ...(priority === "high" && { signal: AbortSignal.timeout(10000) }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: RezdyProductsResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.products || data.data || [];
    } catch (error) {
      if (attempt < this.config.maxRetries) {
        console.warn(
          `🚀 Preload retry ${attempt}/${this.config.maxRetries}:`,
          error
        );
        await this.delay(this.config.retryDelay * attempt);
        return this.fetchWithRetry(limit, offset, priority, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Preload featured products specifically
   */
  async preloadFeaturedProducts(): Promise<PreloadResult> {
    return this.preloadProducts({
      limit: 20,
      offset: 0,
      priority: "high",
    });
  }

  /**
   * Background preload for additional data
   */
  async backgroundPreload(): Promise<void> {
    if (!this.config.preloadInBackground) return;

    try {
      // Preload different segments in background
      const preloadTasks = [
        this.preloadProducts({ limit: 50, offset: 0, priority: "low" }),
        this.preloadProducts({ limit: 50, offset: 50, priority: "low" }),
        this.preloadFeaturedProducts(),
      ];

      // Don't await - let them run in background
      Promise.allSettled(preloadTasks).then((results) => {
        const successful = results.filter(
          (r) => r.status === "fulfilled"
        ).length;
        console.log(
          `🚀 Background preload completed: ${successful}/${results.length} successful`
        );
      });
    } catch (error) {
      console.error("Background preload error:", error);
    }
  }

  /**
   * Warm up the cache with essential data
   */
  async warmupCache(): Promise<void> {
    console.log("🚀 Starting cache warmup...");

    try {
      await Promise.allSettled([
        this.preloadFeaturedProducts(),
        this.preloadProducts({ limit: 100, offset: 0 }),
      ]);

      console.log("🚀 Cache warmup completed");
    } catch (error) {
      console.error("Cache warmup error:", error);
    }
  }

  /**
   * Invalidate preloaded data and refresh
   */
  async invalidateAndRefresh(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        await simpleCacheManager.invalidate(pattern);
      } else {
        await simpleCacheManager.invalidate("products:*");
      }

      // Trigger fresh preload
      await this.preloadFeaturedProducts();

      console.log("🚀 Cache invalidated and refreshed");
    } catch (error) {
      console.error("Invalidation error:", error);
    }
  }

  /**
   * Get preloaded data with fallback
   */
  async getPreloadedData(options?: {
    limit?: number;
    offset?: number;
    fallbackToFetch?: boolean;
  }): Promise<RezdyProduct[]> {
    const { limit = 100, offset = 0, fallbackToFetch = true } = options || {};
    const cacheKey = `products:${limit}:${offset}`;

    try {
      // Try cache first
      const cachedData = await simpleCacheManager.getProducts(cacheKey);
      if (cachedData && cachedData.length > 0) {
        return cachedData;
      }

      // Fallback to fetch if enabled
      if (fallbackToFetch) {
        const result = await this.preloadProducts({
          limit,
          offset,
          priority: "high",
        });
        return result.data || [];
      }

      return [];
    } catch (error) {
      console.error("Error getting preloaded data:", error);
      return this.config.fallbackData || [];
    }
  }

  /**
   * Get preload statistics
   */
  getStats(): PreloadStats {
    return { ...this.preloadStats };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PreloadConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  private updateStats(result: PreloadResult, startTime: number): void {
    this.preloadStats.totalPreloads++;

    // Track success/failure counts
    if (result.success) {
      this.preloadStats.successfulPreloads++;
    } else {
      this.preloadStats.failedPreloads++;
    }

    // Track cache hits and update hit rate on every preload
    if (result.fromCache) {
      this.preloadStats.cacheHits++;
    }

    this.preloadStats.cacheHitRate =
      this.preloadStats.cacheHits / this.preloadStats.totalPreloads;

    const loadTime = Date.now() - startTime;
    this.loadTimes.push(loadTime);

    // Keep only last 100 load times for average calculation
    if (this.loadTimes.length > 100) {
      this.loadTimes.shift();
    }

    this.preloadStats.averageLoadTime =
      this.loadTimes.reduce((sum, time) => sum + time, 0) /
      this.loadTimes.length;

    this.preloadStats.lastPreloadTime = Date.now();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.preloadStats = {
      totalPreloads: 0,
      successfulPreloads: 0,
      failedPreloads: 0,
      averageLoadTime: 0,
      cacheHits: 0,
      cacheHitRate: 0,
    };
    this.loadTimes = [];
  }
}

// Export singleton instance
export const dataPreloader = DataPreloader.getInstance();
