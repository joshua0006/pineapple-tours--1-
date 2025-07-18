import {
  CacheConfig,
  CacheMetrics,
  RezdyProduct,
  RezdyBooking,
  RezdyAvailability,
  RezdyCategory,
  RezdyCategoryProduct,
  PerformanceMetrics,
} from "@/lib/types/rezdy";

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

export class SimpleCacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private cacheStats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0,
    memoryUsage: 0,
    redisConnected: false,
  };

  private config: CacheConfig = {
    ttl: 300,
    max_size: 1000,
    eviction_policy: "lru",
  };

  // Optimized TTL values based on data volatility
  private ttlConfig: Record<string, number> = {
    products: 1800, // 30 minutes
    product: 1800,
    availability: 60, // 1 minute
    bookings: 180, // 3 minutes
    sessions: 900, // 15 minutes
    search: 600, // 10 minutes
    categories: 1800, // 30 minutes
    category: 1800, // 30 minutes
    featured: 1800, // 30 minutes
    shared: 1800, // 30 minutes - for shared product cache
  };

  // Request deduplication - track ongoing requests
  private ongoingRequests = new Map<string, Promise<any>>();

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.setupPeriodicTasks();
  }

  private setupPeriodicTasks(): void {
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);

    // Memory usage tracking every 10 seconds
    setInterval(() => this.updateMemoryUsage(), 10000);

    // Background refresh for popular categories every 10 minutes
    setInterval(() => this.backgroundRefresh(), 600000);
  }

  // Core cache operations
  async get<T>(key: string): Promise<T | null> {
    this.cacheStats.totalRequests++;

    try {
      const entry = this.memoryCache.get(key);

      if (!entry) {
        console.log(`🔍 Cache MISS: ${key} (not found)`);
        this.cacheStats.misses++;
        return null;
      }

      // Check if entry has expired
      if (this.isExpired(entry)) {
        console.log(`🔍 Cache MISS: ${key} (expired)`);
        this.memoryCache.delete(key);
        this.cacheStats.misses++;
        return null;
      }

      // Update access statistics
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      this.cacheStats.hits++;
      console.log(
        `🔍 Cache HIT: ${key} (age: ${Math.round(
          (Date.now() - entry.timestamp) / 1000
        )}s)`
      );

      return entry.data;
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
      const size = serialized.length;

      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: entryTtl * 1000,
        accessCount: 1,
        lastAccessed: Date.now(),
        size,
      };

      // Check memory cache size and evict if necessary
      if (this.memoryCache.size >= this.config.max_size) {
        this.evictEntries();
      }

      // Store in memory cache
      this.memoryCache.set(key, entry);
      console.log(
        `🔍 Cache SET: ${key} (TTL: ${entryTtl}s, size: ${Math.round(
          size / 1024
        )}KB)`
      );
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  // Specialized cache methods
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

    // Also update shared product cache for cross-category optimization
    await this.updateSharedProductCache(products);
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

  async cacheCategories(
    categories: RezdyCategory[],
    key: string = "categories:all"
  ): Promise<void> {
    await this.set(key, categories, this.ttlConfig.categories);

    // Cache individual categories
    const promises = categories.map((category) =>
      this.set(
        `category:${category.id}`,
        category,
        this.ttlConfig.category
      )
    );
    await Promise.all(promises);
  }

  async getCategories(
    key: string = "categories:all"
  ): Promise<RezdyCategory[] | null> {
    return this.get<RezdyCategory[]>(key);
  }

  async cacheCategoryProducts(
    products: RezdyCategoryProduct[],
    key: string
  ): Promise<void> {
    await this.set(key, products, this.ttlConfig.category);
    
    // Also update shared product cache for cross-category optimization
    await this.updateSharedProductCache(products);
  }

  async getCategoryProducts(
    key: string
  ): Promise<RezdyCategoryProduct[] | null> {
    return this.get<RezdyCategoryProduct[]>(key);
  }

  // Shared product cache methods for cross-category optimization
  async updateSharedProductCache(products: RezdyProduct[]): Promise<void> {
    const sharedCacheKey = "shared:products:all";
    
    // Get existing shared cache or initialize empty
    let existingProducts = await this.get<RezdyProduct[]>(sharedCacheKey) || [];
    
    // Create a map for efficient lookups and updates
    const productMap = new Map<string, RezdyProduct>();
    
    // Add existing products to map
    existingProducts.forEach(product => {
      productMap.set(product.productCode, product);
    });
    
    // Add/update new products
    products.forEach(product => {
      productMap.set(product.productCode, product);
    });
    
    // Convert back to array and cache
    const updatedProducts = Array.from(productMap.values());
    await this.set(sharedCacheKey, updatedProducts, this.ttlConfig.shared);
    
    console.log(`🔄 Updated shared product cache with ${products.length} products (total: ${updatedProducts.length})`);
  }

  async getSharedProducts(): Promise<RezdyProduct[] | null> {
    return this.get<RezdyProduct[]>("shared:products:all");
  }

  async getProductsForCategory(categoryId: number): Promise<RezdyProduct[] | null> {
    const sharedProducts = await this.getSharedProducts();
    if (!sharedProducts) return null;
    
    const categoryProducts = sharedProducts.filter(product => 
      product.categoryId === categoryId
    );
    
    console.log(`🔍 Found ${categoryProducts.length} products in shared cache for category ${categoryId}`);
    return categoryProducts.length > 0 ? categoryProducts : null;
  }

  // Request deduplication methods
  async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already ongoing
    if (this.ongoingRequests.has(key)) {
      console.log(`🔄 Deduplicating request for key: ${key}`);
      return this.ongoingRequests.get(key) as Promise<T>;
    }

    // Start new request and store promise
    const promise = requestFn().finally(() => {
      // Clean up after request completes
      this.ongoingRequests.delete(key);
    });

    this.ongoingRequests.set(key, promise);
    return promise;
  }

  // Background refresh mechanism
  private async backgroundRefresh(): Promise<void> {
    try {
      console.log('🔄 Starting background cache refresh...');
      
      // Find entries that are close to expiration (within 10% of TTL)
      const now = Date.now();
      const refreshCandidates: string[] = [];
      
      for (const [key, entry] of this.memoryCache.entries()) {
        const age = now - entry.timestamp;
        const refreshThreshold = entry.ttl * 0.9; // Refresh when 90% of TTL has passed
        
        if (age >= refreshThreshold && !this.ongoingRequests.has(`refresh:${key}`)) {
          refreshCandidates.push(key);
        }
      }
      
      if (refreshCandidates.length === 0) {
        console.log('🔄 No cache entries need background refresh');
        return;
      }
      
      console.log(`🔄 Found ${refreshCandidates.length} cache entries for background refresh`);
      
      // Refresh category products in background
      const categoryKeys = refreshCandidates.filter(key => key.startsWith('category:') && key.includes(':products:'));
      
      for (const key of categoryKeys.slice(0, 3)) { // Limit to 3 concurrent background refreshes
        const match = key.match(/^category:(\d+):products:(\d+):(\d+)$/);
        if (match) {
          const [, categoryId, limit, offset] = match;
          this.refreshCategoryInBackground(parseInt(categoryId), parseInt(limit), parseInt(offset));
        }
      }
      
    } catch (error) {
      console.error('🔄 Background refresh failed:', error);
    }
  }

  private async refreshCategoryInBackground(categoryId: number, limit: number, offset: number): Promise<void> {
    const refreshKey = `refresh:category:${categoryId}:products:${limit}:${offset}`;
    
    try {
      console.log(`🔄 Background refreshing category ${categoryId} (limit: ${limit}, offset: ${offset})`);
      
      // Use deduplication to prevent multiple background refreshes
      await this.deduplicateRequest(refreshKey, async () => {
        // Simulate API call - in real implementation, you would make the actual API call here
        // For now, we'll just extend the TTL of existing entries
        const cacheKey = `category:${categoryId}:products:${limit}:${offset}`;
        const entry = this.memoryCache.get(cacheKey);
        
        if (entry) {
          // Extend TTL by resetting timestamp
          entry.timestamp = Date.now();
          console.log(`🔄 Extended TTL for category ${categoryId} cache entry`);
        }
      });
      
    } catch (error) {
      console.error(`🔄 Failed to refresh category ${categoryId} in background:`, error);
    }
  }

  // Cache warming implementation
  async warmCache(popularCategoryIds: number[] = []): Promise<void> {
    console.log(`🔥 Starting cache warming for ${popularCategoryIds.length} popular categories`);
    
    try {
      // Warm popular categories in parallel (limit to 5 concurrent operations)
      const batchSize = 5;
      for (let i = 0; i < popularCategoryIds.length; i += batchSize) {
        const batch = popularCategoryIds.slice(i, i + batchSize);
        const warmingPromises = batch.map(async (categoryId) => {
          const cacheKey = `category:${categoryId}:products:100:0`;
          
          // Check if already cached and fresh
          const cached = await this.get(cacheKey);
          if (cached) {
            console.log(`🔥 Category ${categoryId} already cached, skipping`);
            return;
          }
          
          // Try to warm from shared cache first
          const sharedProducts = await this.getProductsForCategory(categoryId);
          if (sharedProducts) {
            await this.set(cacheKey, sharedProducts, this.ttlConfig.category);
            console.log(`🔥 Warmed cache for category ${categoryId} from shared cache (${sharedProducts.length} products)`);
          } else {
            console.log(`🔥 No shared cache data available for category ${categoryId}`);
          }
        });
        
        await Promise.all(warmingPromises);
        
        // Add small delay between batches to prevent overwhelming the system
        if (i + batchSize < popularCategoryIds.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log(`🔥 Cache warming completed for ${popularCategoryIds.length} categories`);
    } catch (error) {
      console.error("🔥 Cache warming failed:", error);
    }
  }

  // Get cache freshness statistics
  getCacheFreshness(): { fresh: number; stale: number; expired: number } {
    const now = Date.now();
    let fresh = 0;
    let stale = 0;
    let expired = 0;
    
    for (const entry of this.memoryCache.values()) {
      const age = now - entry.timestamp;
      const staleThreshold = entry.ttl * 0.8; // Consider stale when 80% of TTL has passed
      
      if (age >= entry.ttl) {
        expired++;
      } else if (age >= staleThreshold) {
        stale++;
      } else {
        fresh++;
      }
    }
    
    return { fresh, stale, expired };
  }

  // Cache invalidation
  async invalidate(pattern: string): Promise<void> {
    const keysToDelete: string[] = [];

    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.memoryCache.delete(key);
      this.cacheStats.evictions++;
    });
    
    console.log(`🧹 Invalidated ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
  }

  async invalidateRelated(
    dataType: string,
    identifier?: string
  ): Promise<void> {
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
    return Date.now() > entry.timestamp + entry.ttl;
  }

  private hashSearchKey(searchKey: string): string {
    let hash = 0;
    for (let i = 0; i < searchKey.length; i++) {
      const char = searchKey.charCodeAt(i);
      hash = (hash << 5) - hash + char;
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

    keysToDelete.forEach((key) => {
      this.memoryCache.delete(key);
      this.cacheStats.evictions++;
    });

    if (keysToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${keysToDelete.length} expired cache entries`);
    }
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
      api_response_time: 0, // Not tracked in simple version
      data_freshness: this.calculateDataFreshness(),
      error_rate: 0, // Not tracked in simple version
      cache_hit_ratio:
        this.cacheStats.hits / this.cacheStats.totalRequests || 0,
    };
  }

  getCacheStats(): CacheStats & { size: number; config: CacheConfig; ongoingRequests: number; freshness: { fresh: number; stale: number; expired: number } } {
    return {
      ...this.cacheStats,
      size: this.memoryCache.size,
      config: this.config,
      ongoingRequests: this.ongoingRequests.size,
      freshness: this.getCacheFreshness(),
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

  clear(): void {
    this.memoryCache.clear();
    this.ongoingRequests.clear();
    this.cacheStats.hits = 0;
    this.cacheStats.misses = 0;
    this.cacheStats.evictions = 0;
    this.cacheStats.totalRequests = 0;
  }
}

// Export singleton instance for server-side use
export const simpleCacheManager = new SimpleCacheManager();
