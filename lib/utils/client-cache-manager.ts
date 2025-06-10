'use client';

import {
  CacheConfig,
  CacheMetrics,
  RezdyProduct,
  RezdyBooking,
  RezdyAvailability,
  PerformanceMetrics
} from '@/lib/types/rezdy';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalRequests: number;
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

export class ClientCacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private cacheStats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0,
    memoryUsage: 0,
    redisConnected: false
  };
  
  private config: CacheConfig & {
    enableAnalytics: boolean;
  } = {
    ttl: 300,
    max_size: 1000,
    eviction_policy: 'lru',
    enableAnalytics: true
  };

  private analytics: CacheAnalytics = {
    hitRateByEndpoint: {},
    averageResponseTime: {},
    cacheEffectiveness: 0,
    memoryTrends: [],
    popularKeys: []
  };

  // Optimized TTL values based on data volatility
  private ttlConfig: Record<string, number> = {
    'products': 1800, // 30 minutes
    'product': 1800,
    'availability': 60, // 1 minute
    'bookings': 180, // 3 minutes
    'sessions': 900, // 15 minutes
    'search': 600, // 10 minutes
    'categories': 3600, // 1 hour
    'featured': 1800 // 30 minutes
  };

  constructor(config?: Partial<CacheConfig & { enableAnalytics: boolean }>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    this.setupPeriodicTasks();
  }

  private setupPeriodicTasks(): void {
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
    
    // Analytics collection every 30 seconds
    if (this.config.enableAnalytics) {
      setInterval(() => this.collectAnalytics(), 30000);
    }
    
    // Memory usage tracking every 10 seconds
    setInterval(() => this.updateMemoryUsage(), 10000);
  }

  // Core cache operations
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    this.cacheStats.totalRequests++;
    
    try {
      const entry = this.memoryCache.get(key);
      
      if (!entry) {
        this.cacheStats.misses++;
        this.updateAnalytics(key, Date.now() - startTime, false);
        return null;
      }

      // Check if entry has expired
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
        this.cacheStats.misses++;
        this.updateAnalytics(key, Date.now() - startTime, false);
        return null;
      }

      // Update access statistics
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      this.cacheStats.hits++;
      this.updateAnalytics(key, Date.now() - startTime, true);

      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      this.cacheStats.misses++;
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const entryTtl = ttl || this.getTTLForKey(key);
      const serialized = JSON.stringify(value);
      const size = serialized.length;

      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: entryTtl * 1000,
        accessCount: 1,
        lastAccessed: Date.now(),
        size
      };

      // Check memory cache size and evict if necessary
      if (this.memoryCache.size >= this.config.max_size) {
        this.evictEntries();
      }

      // Store in memory cache
      this.memoryCache.set(key, entry);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Specialized cache methods
  async cacheProducts(products: RezdyProduct[], key: string = 'products:all'): Promise<void> {
    await this.set(key, products, this.ttlConfig.products);
    
    // Cache individual products
    const promises = products.map(product => 
      this.set(`product:${product.productCode}`, product, this.ttlConfig.product)
    );
    await Promise.all(promises);
  }

  async getProducts(key: string = 'products:all'): Promise<RezdyProduct[] | null> {
    return this.get<RezdyProduct[]>(key);
  }

  async cacheAvailability(availability: RezdyAvailability[], productCode: string): Promise<void> {
    const key = `availability:${productCode}`;
    await this.set(key, availability, this.ttlConfig.availability);
  }

  async getAvailability(productCode: string): Promise<RezdyAvailability[] | null> {
    const key = `availability:${productCode}`;
    return this.get<RezdyAvailability[]>(key);
  }

  async cacheBookings(bookings: RezdyBooking[], key: string = 'bookings:all'): Promise<void> {
    await this.set(key, bookings, this.ttlConfig.bookings);
  }

  async getBookings(key: string = 'bookings:all'): Promise<RezdyBooking[] | null> {
    return this.get<RezdyBooking[]>(key);
  }

  async cacheSearchResults(results: RezdyProduct[], searchKey: string): Promise<void> {
    const key = `search:${this.hashSearchKey(searchKey)}`;
    await this.set(key, results, this.ttlConfig.search);
  }

  async getSearchResults(searchKey: string): Promise<RezdyProduct[] | null> {
    const key = `search:${this.hashSearchKey(searchKey)}`;
    return this.get<RezdyProduct[]>(key);
  }

  // Cache warming (client-side version)
  async warmCache(): Promise<void> {
    try {
      console.log('🔥 Starting client-side cache warming...');
      
      // Pre-warm with API calls
      await Promise.allSettled([
        this.warmProductCache(),
        this.warmCategoryCache()
      ]);
      
      console.log('✅ Client-side cache warming completed');
    } catch (error) {
      console.error('❌ Client-side cache warming failed:', error);
    }
  }

  private async warmProductCache(): Promise<void> {
    try {
      const response = await fetch('/api/rezdy/products?limit=20');
      if (response.ok) {
        const data = await response.json();
        const products = data.products || data.data || [];
        await this.cacheProducts(products, 'products:featured');
      }
    } catch (error) {
      console.warn('Failed to warm product cache:', error);
    }
  }

  private async warmCategoryCache(): Promise<void> {
    const categories = ['adventure', 'cultural', 'food'];
    
    const promises = categories.map(async (category) => {
      try {
        const response = await fetch(`/api/search?category=${category}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          await this.set(`category:${category}`, data.products || [], this.ttlConfig.categories);
        }
      } catch (error) {
        console.warn(`Failed to warm ${category} cache:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  // Cache invalidation
  async invalidate(pattern: string): Promise<void> {
    const keysToDelete: string[] = [];
    
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.memoryCache.delete(key);
      this.cacheStats.evictions++;
    });
  }

  async invalidateRelated(dataType: string, identifier?: string): Promise<void> {
    const patterns = [dataType];
    if (identifier) {
      patterns.push(`${dataType}:${identifier}`);
    }
    
    for (const pattern of patterns) {
      await this.invalidate(pattern);
    }
  }

  // Utility methods
  private getTTLForKey(key: string): number {
    for (const [prefix, ttl] of Object.entries(this.ttlConfig)) {
      if (key.startsWith(prefix)) {
        return ttl;
      }
    }
    return this.config.ttl;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > (entry.timestamp + entry.ttl);
  }

  private hashSearchKey(searchKey: string): string {
    let hash = 0;
    for (let i = 0; i < searchKey.length; i++) {
      const char = searchKey.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private evictEntries(): void {
    const evictCount = Math.floor(this.config.max_size * 0.1);
    this.evictLRU(evictCount);
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

  private cleanup(): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.memoryCache.delete(key);
      this.cacheStats.evictions++;
    });

    if (keysToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }

  private updateAnalytics(key: string, responseTime: number, hit: boolean): void {
    if (!this.config.enableAnalytics) return;

    const endpoint = key.split(':')[0];
    
    if (!this.analytics.hitRateByEndpoint[endpoint]) {
      this.analytics.hitRateByEndpoint[endpoint] = 0;
    }
    
    if (!this.analytics.averageResponseTime[endpoint]) {
      this.analytics.averageResponseTime[endpoint] = responseTime;
    } else {
      this.analytics.averageResponseTime[endpoint] = 
        (this.analytics.averageResponseTime[endpoint] + responseTime) / 2;
    }
  }

  private collectAnalytics(): void {
    if (!this.config.enableAnalytics) return;

    this.analytics.cacheEffectiveness = 
      this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0;

    this.analytics.memoryTrends.push(this.cacheStats.memoryUsage);
    if (this.analytics.memoryTrends.length > 100) {
      this.analytics.memoryTrends.shift();
    }

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
      memory_usage: this.cacheStats.memoryUsage
    };
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return {
      api_response_time: Object.values(this.analytics.averageResponseTime).reduce((a, b) => a + b, 0) / 
                        Object.keys(this.analytics.averageResponseTime).length || 0,
      data_freshness: this.calculateDataFreshness(),
      error_rate: 0, // Static value for client-side
      cache_hit_ratio: this.cacheStats.hits / this.cacheStats.totalRequests || 0
    };
  }

  getAnalytics(): CacheAnalytics {
    return { ...this.analytics };
  }

  getCacheStats(): CacheStats & { size: number; config: CacheConfig & { enableAnalytics: boolean } } {
    return {
      ...this.cacheStats,
      size: this.memoryCache.size,
      config: this.config
    };
  }

  private calculateDataFreshness(): number {
    if (this.memoryCache.size === 0) return 1;
    
    const now = Date.now();
    let totalFreshness = 0;
    
    for (const entry of this.memoryCache.values()) {
      const age = now - entry.timestamp;
      const freshness = Math.max(0, 1 - (age / entry.ttl));
      totalFreshness += freshness;
    }
    
    return totalFreshness / this.memoryCache.size;
  }

  clear(): void {
    this.memoryCache.clear();
    this.cacheStats.hits = 0;
    this.cacheStats.misses = 0;
    this.cacheStats.evictions = 0;
    this.cacheStats.totalRequests = 0;
  }
}

// Export singleton instance for client-side use
export const clientCacheManager = new ClientCacheManager({
  enableAnalytics: true
}); 