import Redis from "ioredis";
import { gzip, gunzip } from "zlib";
import { promisify } from "util";
import {
  CacheConfig,
  CacheMetrics,
  RezdyProduct,
  RezdyBooking,
  RezdyAvailability,
  PerformanceMetrics,
} from "@/lib/types/rezdy";

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  compressed: boolean;
  size: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalRequests: number;
  compressionRatio: number;
  memoryUsage: number;
  redisConnected: boolean;
}

interface CacheAnalytics {
  hitRateByEndpoint: Record<string, number>;
  averageResponseTime: Record<string, number>;
  cacheEffectiveness: number;
  memoryTrends: number[];
  popularKeys: Array<{ key: string; accessCount: number }>;
}

export class EnhancedCacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private redis: Redis | null = null;
  private cacheStats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0,
    compressionRatio: 0,
    memoryUsage: 0,
    redisConnected: false,
  };

  private config: CacheConfig & {
    enableCompression: boolean;
    compressionThreshold: number;
    enableRedis: boolean;
    redisUrl?: string;
    enableAnalytics: boolean;
  } = {
    ttl: 300,
    max_size: 2000, // Increased from 1000
    eviction_policy: "lru",
    enableCompression: true,
    compressionThreshold: 1024, // Compress data > 1KB
    enableRedis: true,
    enableAnalytics: true,
  };

  private analytics: CacheAnalytics = {
    hitRateByEndpoint: {},
    averageResponseTime: {},
    cacheEffectiveness: 0,
    memoryTrends: [],
    popularKeys: [],
  };

  private dependencies: Record<string, string[]> = {
    products: [
      "product-list",
      "search-results",
      "categories",
      "featured-products",
    ],
    availability: ["sessions", "calendar", "pricing", "product-availability"],
    bookings: [
      "customer-history",
      "revenue-reports",
      "availability",
      "analytics",
    ],
    customers: ["customer-segments", "analytics", "reports"],
  };

  // Optimized TTL values based on data volatility
  private ttlConfig: Record<string, number> = {
    products: 1800, // 30 minutes (increased from 10)
    product: 1800,
    availability: 60, // 1 minute (real-time critical)
    bookings: 180, // 3 minutes
    sessions: 900, // 15 minutes (increased from 5)
    search: 600, // 10 minutes (increased from 5)
    categories: 3600, // 1 hour (very stable)
    featured: 1800, // 30 minutes
  };

  constructor(config?: Partial<typeof EnhancedCacheManager.prototype.config>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.initializeRedis();
    this.setupPeriodicTasks();
  }

  private async initializeRedis(): Promise<void> {
    if (!this.config.enableRedis) return;

    // Skip Redis initialization during build time (Vercel build environment)
    if (process.env.NODE_ENV === "production" && !process.env.REDIS_URL) {
      console.log("⚠️ Skipping Redis initialization during build time");
      return;
    }

    try {
      const redisUrl =
        this.config.redisUrl ||
        process.env.REDIS_URL ||
        "redis://localhost:6379";
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        enableOfflineQueue: false,
      });

      this.redis.on("connect", () => {
        this.cacheStats.redisConnected = true;
        console.log("✅ Redis connected successfully");
      });

      this.redis.on("error", (error) => {
        this.cacheStats.redisConnected = false;
        console.warn("⚠️ Redis connection error:", error.message);
        // Don't throw error, just continue without Redis
      });

      await this.redis.connect();
    } catch (error) {
      console.warn(
        "⚠️ Redis initialization failed, falling back to memory-only caching:",
        error
      );
      this.redis = null;
      this.cacheStats.redisConnected = false;
    }
  }

  private setupPeriodicTasks(): void {
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);

    // Cache warming every 5 minutes
    setInterval(() => this.warmCache(), 300000);

    // Analytics collection every 30 seconds
    if (this.config.enableAnalytics) {
      setInterval(() => this.collectAnalytics(), 30000);
    }

    // Memory usage tracking every 10 seconds
    setInterval(() => this.updateMemoryUsage(), 10000);
  }

  // Core cache operations with Redis fallback
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    this.cacheStats.totalRequests++;

    try {
      // Level 1: Memory cache
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry && !this.isExpired(memoryEntry)) {
        memoryEntry.accessCount++;
        memoryEntry.lastAccessed = Date.now();
        this.cacheStats.hits++;
        this.updateAnalytics(key, Date.now() - startTime, true);
        return await this.decompressData<T>(
          memoryEntry.data,
          memoryEntry.compressed
        );
      }

      // Level 2: Redis cache
      if (this.redis && this.cacheStats.redisConnected) {
        const redisValue = await this.redis.get(key);
        if (redisValue) {
          const parsed = JSON.parse(redisValue);
          const decompressed = await this.decompressData<T>(
            parsed.data,
            parsed.compressed
          );

          // Store back in memory cache
          const entry: CacheEntry<T> = {
            data: parsed.compressed ? parsed.data : decompressed,
            timestamp: parsed.timestamp,
            ttl: parsed.ttl,
            accessCount: 1,
            lastAccessed: Date.now(),
            compressed: parsed.compressed,
            size: parsed.size,
          };
          this.memoryCache.set(key, entry);

          this.cacheStats.hits++;
          this.updateAnalytics(key, Date.now() - startTime, true);
          return decompressed;
        }
      }

      this.cacheStats.misses++;
      this.updateAnalytics(key, Date.now() - startTime, false);
      return null;
    } catch (error) {
      console.error("Cache get error:", error);
      this.cacheStats.misses++;
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const entryTtl = ttl || this.getTTLForKey(key);
      const serialized = JSON.stringify(value);
      const shouldCompress =
        this.config.enableCompression &&
        serialized.length > this.config.compressionThreshold;

      let finalData = value;
      let compressed = false;
      let size = serialized.length;

      if (shouldCompress) {
        try {
          const compressedBuffer = await gzipAsync(Buffer.from(serialized));
          finalData = compressedBuffer.toString("base64") as any;
          compressed = true;
          size = compressedBuffer.length;

          // Update compression ratio
          const ratio = size / serialized.length;
          this.cacheStats.compressionRatio =
            (this.cacheStats.compressionRatio + ratio) / 2;
        } catch (compressionError) {
          console.warn(
            "Compression failed, storing uncompressed:",
            compressionError
          );
        }
      }

      const entry: CacheEntry<T> = {
        data: finalData,
        timestamp: Date.now(),
        ttl: entryTtl * 1000,
        accessCount: 1,
        lastAccessed: Date.now(),
        compressed,
        size,
      };

      // Check memory cache size and evict if necessary
      if (this.memoryCache.size >= this.config.max_size) {
        this.evictEntries();
      }

      // Store in memory cache
      this.memoryCache.set(key, entry);

      // Store in Redis cache
      if (this.redis && this.cacheStats.redisConnected) {
        const redisEntry = {
          data: finalData,
          timestamp: entry.timestamp,
          ttl: entryTtl,
          compressed,
          size,
        };
        await this.redis.setex(key, entryTtl, JSON.stringify(redisEntry));
      }
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  // Specialized cache methods with optimized TTL
  async cacheProducts(
    products: RezdyProduct[],
    key: string = "products:all"
  ): Promise<void> {
    await this.set(key, products, this.ttlConfig.products);

    // Cache individual products
    const promises = products.map((product) =>
      this.set(
        `product:${product.productCode}`,
        product,
        this.ttlConfig.product
      )
    );
    await Promise.all(promises);
  }

  async getProducts(
    key: string = "products:all"
  ): Promise<RezdyProduct[] | null> {
    return this.get<RezdyProduct[]>(key);
  }

  async cacheAvailability(
    availability: RezdyAvailability[],
    productCode: string
  ): Promise<void> {
    const key = `availability:${productCode}`;
    await this.set(key, availability, this.ttlConfig.availability);
  }

  async getAvailability(
    productCode: string
  ): Promise<RezdyAvailability[] | null> {
    const key = `availability:${productCode}`;
    return this.get<RezdyAvailability[]>(key);
  }

  async cacheBookings(
    bookings: RezdyBooking[],
    key: string = "bookings:all"
  ): Promise<void> {
    await this.set(key, bookings, this.ttlConfig.bookings);
  }

  async getBookings(
    key: string = "bookings:all"
  ): Promise<RezdyBooking[] | null> {
    return this.get<RezdyBooking[]>(key);
  }

  async cacheSearchResults(
    results: RezdyProduct[],
    searchKey: string
  ): Promise<void> {
    const key = `search:${this.hashSearchKey(searchKey)}`;
    await this.set(key, results, this.ttlConfig.search);
  }

  async getSearchResults(searchKey: string): Promise<RezdyProduct[] | null> {
    const key = `search:${this.hashSearchKey(searchKey)}`;
    return this.get<RezdyProduct[]>(key);
  }

  // Enhanced cache warming with background preloading
  async warmCache(): Promise<void> {
    try {
      console.log("🔥 Starting cache warming...");

      // Warm critical data in parallel
      await Promise.allSettled([
        this.warmProductCache(),
        this.warmCategoryCache(),
        this.warmPopularSearches(),
      ]);

      console.log("✅ Cache warming completed");
    } catch (error) {
      console.error("❌ Cache warming failed:", error);
    }
  }

  private async warmProductCache(): Promise<void> {
    try {
      // Pre-fetch featured products
      const response = await fetch(
        "/api/rezdy/products?limit=50&featured=true"
      );
      if (response.ok) {
        const data = await response.json();
        const products = data.products || data.data || [];
        await this.cacheProducts(products, "products:featured");
      }
    } catch (error) {
      console.warn("Failed to warm product cache:", error);
    }
  }

  private async warmCategoryCache(): Promise<void> {
    const categories = ["adventure", "cultural", "food", "nature", "family"];

    const promises = categories.map(async (category) => {
      try {
        const response = await fetch(
          `/api/search?category=${category}&limit=20`
        );
        if (response.ok) {
          const data = await response.json();
          await this.set(
            `category:${category}`,
            data.products || [],
            this.ttlConfig.categories
          );
        }
      } catch (error) {
        console.warn(`Failed to warm ${category} cache:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  private async warmPopularSearches(): Promise<void> {
    const popularSearches = [
      "sydney harbour",
      "wine tour",
      "cultural experience",
      "adventure tour",
      "food tour",
    ];

    const promises = popularSearches.map(async (search) => {
      try {
        const response = await fetch(
          `/api/search?query=${encodeURIComponent(search)}&limit=10`
        );
        if (response.ok) {
          const data = await response.json();
          await this.cacheSearchResults(data.products || [], search);
        }
      } catch (error) {
        console.warn(`Failed to warm search cache for "${search}":`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  // Enhanced invalidation with dependency tracking
  async invalidate(pattern: string): Promise<void> {
    const keysToDelete: string[] = [];

    // Memory cache invalidation
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.memoryCache.delete(key);
      this.cacheStats.evictions++;
    });

    // Redis cache invalidation
    if (this.redis && this.cacheStats.redisConnected) {
      try {
        const redisKeys = await this.redis.keys(`*${pattern}*`);
        if (redisKeys.length > 0) {
          await this.redis.del(...redisKeys);
        }
      } catch (error) {
        console.warn("Redis invalidation error:", error);
      }
    }
  }

  async invalidateRelated(
    dataType: string,
    identifier?: string
  ): Promise<void> {
    const relatedCaches = this.dependencies[dataType] || [];

    const promises = relatedCaches.map((cacheType) => {
      if (identifier) {
        return this.invalidate(`${cacheType}:${identifier}`);
      } else {
        return this.invalidate(cacheType);
      }
    });

    await Promise.allSettled(promises);
  }

  // Utility methods
  private async compressData(data: any): Promise<string> {
    const serialized = JSON.stringify(data);
    const compressed = await gzipAsync(Buffer.from(serialized));
    return compressed.toString("base64");
  }

  private async decompressData<T>(
    data: any,
    isCompressed: boolean
  ): Promise<T> {
    if (!isCompressed) return data;

    try {
      const buffer = Buffer.from(data as string, "base64");
      const decompressed = await gunzipAsync(buffer);
      return JSON.parse(decompressed.toString());
    } catch (error) {
      console.error("Decompression error:", error);
      return data; // Fallback to original data
    }
  }

  private getTTLForKey(key: string): number {
    for (const [prefix, ttl] of Object.entries(this.ttlConfig)) {
      if (key.startsWith(prefix)) {
        return ttl;
      }
    }
    return this.config.ttl;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.timestamp + entry.ttl;
  }

  private hashSearchKey(searchKey: string): string {
    // Simple hash function for search keys
    let hash = 0;
    for (let i = 0; i < searchKey.length; i++) {
      const char = searchKey.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private evictEntries(): void {
    const evictCount = Math.floor(this.config.max_size * 0.1); // Evict 10%

    switch (this.config.eviction_policy) {
      case "lru":
        this.evictLRU(evictCount);
        break;
      case "fifo":
        this.evictFIFO(evictCount);
        break;
      case "ttl":
        this.evictByTTL(evictCount);
        break;
    }
  }

  private evictLRU(count: number): void {
    const entries = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
      .slice(0, count);

    entries.forEach(([key]) => {
      this.memoryCache.delete(key);
      this.cacheStats.evictions++;
    });
  }

  private evictFIFO(count: number): void {
    const entries = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .slice(0, count);

    entries.forEach(([key]) => {
      this.memoryCache.delete(key);
      this.cacheStats.evictions++;
    });
  }

  private evictByTTL(count: number): void {
    const now = Date.now();
    const entries = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => a.timestamp + a.ttl - (b.timestamp + b.ttl))
      .slice(0, count);

    entries.forEach(([key]) => {
      this.memoryCache.delete(key);
      this.cacheStats.evictions++;
    });
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.memoryCache.delete(key);
      this.cacheStats.evictions++;
    });

    if (keysToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }

  private updateAnalytics(
    key: string,
    responseTime: number,
    hit: boolean
  ): void {
    if (!this.config.enableAnalytics) return;

    const endpoint = key.split(":")[0];

    // Update hit rate by endpoint
    if (!this.analytics.hitRateByEndpoint[endpoint]) {
      this.analytics.hitRateByEndpoint[endpoint] = 0;
    }

    // Update average response time
    if (!this.analytics.averageResponseTime[endpoint]) {
      this.analytics.averageResponseTime[endpoint] = responseTime;
    } else {
      this.analytics.averageResponseTime[endpoint] =
        (this.analytics.averageResponseTime[endpoint] + responseTime) / 2;
    }
  }

  private collectAnalytics(): void {
    if (!this.config.enableAnalytics) return;

    // Update cache effectiveness
    this.analytics.cacheEffectiveness =
      this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) ||
      0;

    // Update memory trends
    this.analytics.memoryTrends.push(this.cacheStats.memoryUsage);
    if (this.analytics.memoryTrends.length > 100) {
      this.analytics.memoryTrends.shift(); // Keep last 100 data points
    }

    // Update popular keys
    const keyStats = Array.from(this.memoryCache.entries())
      .map(([key, entry]) => ({ key, accessCount: entry.accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);

    this.analytics.popularKeys = keyStats;
  }

  private updateMemoryUsage(): void {
    let totalSize = 0;
    for (const entry of this.memoryCache.values()) {
      totalSize += entry.size || 0;
    }
    this.cacheStats.memoryUsage = totalSize;
  }

  // Public API methods
  getMetrics(): CacheMetrics {
    return {
      hit_rate: this.cacheStats.hits / this.cacheStats.totalRequests || 0,
      miss_rate: this.cacheStats.misses / this.cacheStats.totalRequests || 0,
      eviction_count: this.cacheStats.evictions,
      memory_usage: this.cacheStats.memoryUsage,
    };
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return {
      cache_hit_ratio:
        this.cacheStats.hits / this.cacheStats.totalRequests || 0,
      api_response_time:
        Object.values(this.analytics.averageResponseTime).reduce(
          (a, b) => a + b,
          0
        ) / Object.keys(this.analytics.averageResponseTime).length || 0,
      data_freshness: this.calculateDataFreshness(),
      error_rate: 0, // TODO: Implement error tracking
    };
  }

  getAnalytics(): CacheAnalytics {
    return { ...this.analytics };
  }

  getCacheStats(): CacheStats & { size: number; config: any } {
    return {
      ...this.cacheStats,
      size: this.memoryCache.size,
      config: this.config,
    };
  }

  private calculateDataFreshness(): number {
    if (this.memoryCache.size === 0) return 1;

    const now = Date.now();
    let totalFreshness = 0;

    for (const entry of this.memoryCache.values()) {
      const age = now - entry.timestamp;
      const freshness = Math.max(0, 1 - age / entry.ttl);
      totalFreshness += freshness;
    }

    return totalFreshness / this.memoryCache.size;
  }

  // Cache management methods
  clear(): void {
    this.memoryCache.clear();
    if (this.redis && this.cacheStats.redisConnected) {
      this.redis
        .flushdb()
        .catch((error) => console.warn("Redis flush error:", error));
    }

    // Reset stats
    this.cacheStats.hits = 0;
    this.cacheStats.misses = 0;
    this.cacheStats.evictions = 0;
    this.cacheStats.totalRequests = 0;
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.disconnect();
      this.cacheStats.redisConnected = false;
    }
  }
}

// Export singleton instance
export const enhancedCacheManager = new EnhancedCacheManager({
  enableRedis: process.env.NODE_ENV === "production",
  enableCompression: true,
  enableAnalytics: true,
});

export const smartCacheInvalidation = {
  async invalidateRelated(
    dataType: string,
    identifier?: string
  ): Promise<void> {
    await enhancedCacheManager.invalidateRelated(dataType, identifier);
  },

  async invalidateByPattern(patterns: string[]): Promise<void> {
    const promises = patterns.map((pattern) =>
      enhancedCacheManager.invalidate(pattern)
    );
    await Promise.allSettled(promises);
  },
};
