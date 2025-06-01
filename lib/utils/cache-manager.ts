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
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalRequests: number;
}

export class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private cacheStats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0
  };
  
  private config: CacheConfig = {
    ttl: 300, // 5 minutes default
    max_size: 1000,
    eviction_policy: 'lru'
  };

  private dependencies: Record<string, string[]> = {
    'products': ['product-list', 'search-results', 'categories', 'featured-products'],
    'availability': ['sessions', 'calendar', 'pricing', 'product-availability'],
    'bookings': ['customer-history', 'revenue-reports', 'availability', 'analytics'],
    'customers': ['customer-segments', 'analytics', 'reports']
  };

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // Set up periodic cleanup
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  // Core cache operations
  async get<T>(key: string): Promise<T | null> {
    this.cacheStats.totalRequests++;
    
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      this.cacheStats.misses++;
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.memoryCache.delete(key);
      this.cacheStats.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.cacheStats.hits++;

    return entry.data;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const entryTtl = ttl || this.config.ttl;
    
    // Check if we need to evict entries
    if (this.memoryCache.size >= this.config.max_size) {
      this.evictEntries();
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: entryTtl * 1000, // Convert to milliseconds
      accessCount: 1,
      lastAccessed: Date.now()
    };

    this.memoryCache.set(key, entry);
  }

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
    const relatedCaches = this.dependencies[dataType] || [];
    
    for (const cacheType of relatedCaches) {
      if (identifier) {
        await this.invalidate(`${cacheType}:${identifier}`);
      } else {
        await this.invalidate(cacheType);
      }
    }
  }

  // Specialized cache methods for different data types
  async cacheProducts(products: RezdyProduct[], key: string = 'products:all'): Promise<void> {
    await this.set(key, products, 600); // 10 minutes for products
    
    // Cache individual products
    for (const product of products) {
      await this.set(`product:${product.productCode}`, product, 600);
    }
  }

  async getProducts(key: string = 'products:all'): Promise<RezdyProduct[] | null> {
    return this.get<RezdyProduct[]>(key);
  }

  async cacheAvailability(availability: RezdyAvailability[], productCode: string): Promise<void> {
    const key = `availability:${productCode}`;
    await this.set(key, availability, 300); // 5 minutes for availability
  }

  async getAvailability(productCode: string): Promise<RezdyAvailability[] | null> {
    const key = `availability:${productCode}`;
    return this.get<RezdyAvailability[]>(key);
  }

  async cacheBookings(bookings: RezdyBooking[], key: string = 'bookings:all'): Promise<void> {
    await this.set(key, bookings, 180); // 3 minutes for bookings
  }

  async getBookings(key: string = 'bookings:all'): Promise<RezdyBooking[] | null> {
    return this.get<RezdyBooking[]>(key);
  }

  async cacheSearchResults(results: RezdyProduct[], searchKey: string): Promise<void> {
    const key = `search:${this.hashSearchKey(searchKey)}`;
    await this.set(key, results, 300); // 5 minutes for search results
  }

  async getSearchResults(searchKey: string): Promise<RezdyProduct[] | null> {
    const key = `search:${this.hashSearchKey(searchKey)}`;
    return this.get<RezdyProduct[]>(key);
  }

  // Cache warming strategies
  async warmCache(): Promise<void> {
    try {
      // Pre-load frequently accessed data
      await this.warmProductCache();
      await this.warmAvailabilityCache();
      await this.warmSearchCache();
    } catch (error) {
      console.error('Cache warming failed:', error);
    }
  }

  private async warmProductCache(): Promise<void> {
    // This would typically fetch from API
    // For now, we'll just set up the cache structure
    const popularProductKeys = [
      'products:featured',
      'products:bestsellers',
      'products:new',
      'products:categories'
    ];

    // Pre-allocate cache entries
    popularProductKeys.forEach(key => {
      this.memoryCache.set(key, {
        data: null,
        timestamp: Date.now(),
        ttl: 600000,
        accessCount: 0,
        lastAccessed: Date.now()
      });
    });
  }

  private async warmAvailabilityCache(): Promise<void> {
    // Pre-warm availability cache for popular products
    const popularProducts = await this.get<RezdyProduct[]>('products:featured');
    
    if (popularProducts) {
      for (const product of popularProducts.slice(0, 10)) {
        const key = `availability:${product.productCode}`;
        this.memoryCache.set(key, {
          data: null,
          timestamp: Date.now(),
          ttl: 300000,
          accessCount: 0,
          lastAccessed: Date.now()
        });
      }
    }
  }

  private async warmSearchCache(): Promise<void> {
    // Pre-warm common search queries
    const commonSearches = [
      'adventure',
      'cultural',
      'food',
      'nature',
      'family',
      'romantic'
    ];

    commonSearches.forEach(search => {
      const key = `search:${this.hashSearchKey(search)}`;
      this.memoryCache.set(key, {
        data: null,
        timestamp: Date.now(),
        ttl: 300000,
        accessCount: 0,
        lastAccessed: Date.now()
      });
    });
  }

  // Cache maintenance and optimization
  private cleanup(): void {
    const now = Date.now();
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
  }

  private evictEntries(): void {
    const entriesToEvict = Math.ceil(this.config.max_size * 0.1); // Evict 10%
    
    switch (this.config.eviction_policy) {
      case 'lru':
        this.evictLRU(entriesToEvict);
        break;
      case 'fifo':
        this.evictFIFO(entriesToEvict);
        break;
      case 'ttl':
        this.evictByTTL(entriesToEvict);
        break;
    }
  }

  private evictLRU(count: number): void {
    const entries = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.memoryCache.delete(entries[i][0]);
      this.cacheStats.evictions++;
    }
  }

  private evictFIFO(count: number): void {
    const entries = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.memoryCache.delete(entries[i][0]);
      this.cacheStats.evictions++;
    }
  }

  private evictByTTL(count: number): void {
    const now = Date.now();
    const entries = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => {
        const aExpiry = a.timestamp + a.ttl;
        const bExpiry = b.timestamp + b.ttl;
        return aExpiry - bExpiry;
      });
    
    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.memoryCache.delete(entries[i][0]);
      this.cacheStats.evictions++;
    }
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > (entry.timestamp + entry.ttl);
  }

  private hashSearchKey(searchKey: string): string {
    // Simple hash function for search keys
    let hash = 0;
    for (let i = 0; i < searchKey.length; i++) {
      const char = searchKey.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Performance monitoring
  getMetrics(): CacheMetrics {
    const totalRequests = this.cacheStats.totalRequests;
    
    return {
      hit_rate: totalRequests > 0 ? this.cacheStats.hits / totalRequests : 0,
      miss_rate: totalRequests > 0 ? this.cacheStats.misses / totalRequests : 0,
      eviction_count: this.cacheStats.evictions,
      memory_usage: this.calculateMemoryUsage()
    };
  }

  getPerformanceMetrics(): PerformanceMetrics {
    const metrics = this.getMetrics();
    
    return {
      api_response_time: 0, // Would be measured elsewhere
      data_freshness: this.calculateDataFreshness(),
      error_rate: 0, // Would be measured elsewhere
      cache_hit_ratio: metrics.hit_rate
    };
  }

  private calculateMemoryUsage(): number {
    // Estimate memory usage (simplified)
    let totalSize = 0;
    
    for (const [key, entry] of this.memoryCache.entries()) {
      totalSize += key.length * 2; // Approximate string size
      totalSize += JSON.stringify(entry.data).length * 2; // Approximate data size
      totalSize += 64; // Approximate overhead
    }
    
    return totalSize;
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

  // Cache statistics and debugging
  getCacheStats(): CacheStats & { size: number; config: CacheConfig } {
    return {
      ...this.cacheStats,
      size: this.memoryCache.size,
      config: this.config
    };
  }

  getCacheKeys(): string[] {
    return Array.from(this.memoryCache.keys());
  }

  getCacheEntry(key: string): CacheEntry<any> | undefined {
    return this.memoryCache.get(key);
  }

  // Bulk operations
  async setBulk<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.ttl);
    }
  }

  async getBulk<T>(keys: string[]): Promise<Array<{ key: string; value: T | null }>> {
    const results: Array<{ key: string; value: T | null }> = [];
    
    for (const key of keys) {
      const value = await this.get<T>(key);
      results.push({ key, value });
    }
    
    return results;
  }

  // Clear cache
  clear(): void {
    this.memoryCache.clear();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
  }

  // Export/Import cache state (for debugging)
  exportCache(): any {
    const cacheData: any = {};
    
    for (const [key, entry] of this.memoryCache.entries()) {
      cacheData[key] = {
        data: entry.data,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed
      };
    }
    
    return {
      cache: cacheData,
      stats: this.cacheStats,
      config: this.config
    };
  }

  importCache(cacheState: any): void {
    this.clear();
    
    if (cacheState.cache) {
      for (const [key, entry] of Object.entries(cacheState.cache)) {
        this.memoryCache.set(key, entry as CacheEntry<any>);
      }
    }
    
    if (cacheState.stats) {
      this.cacheStats = cacheState.stats;
    }
    
    if (cacheState.config) {
      this.config = { ...this.config, ...cacheState.config };
    }
  }
}

// Smart Cache Invalidation
export class SmartCacheInvalidation {
  constructor(private cacheManager: CacheManager) {}

  async invalidateRelated(dataType: string, identifier?: string): Promise<void> {
    await this.cacheManager.invalidateRelated(dataType, identifier);
  }

  async invalidateByPattern(patterns: string[]): Promise<void> {
    for (const pattern of patterns) {
      await this.cacheManager.invalidate(pattern);
    }
  }

  async invalidateStale(maxAge: number = 300000): Promise<void> {
    const now = Date.now();
    const keys = this.cacheManager.getCacheKeys();
    
    for (const key of keys) {
      const entry = this.cacheManager.getCacheEntry(key);
      if (entry && (now - entry.timestamp) > maxAge) {
        await this.cacheManager.invalidate(key);
      }
    }
  }

  async invalidateByAccessPattern(minAccessCount: number = 1): Promise<void> {
    const keys = this.cacheManager.getCacheKeys();
    
    for (const key of keys) {
      const entry = this.cacheManager.getCacheEntry(key);
      if (entry && entry.accessCount < minAccessCount) {
        await this.cacheManager.invalidate(key);
      }
    }
  }
}

// Export instances
export const cacheManager = new CacheManager();
export const smartCacheInvalidation = new SmartCacheInvalidation(cacheManager); 