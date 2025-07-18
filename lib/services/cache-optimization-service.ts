import { simpleCacheManager } from "@/lib/utils/simple-cache-manager";

export class CacheOptimizationService {
  // Popular categories based on typical usage patterns
  private static readonly POPULAR_CATEGORIES = [
    1, // Winery Tours
    2, // Day Tours
    3, // Private Tours
    4, // Brewery Tours
    5, // Hop-on Hop-off
  ];

  // Cache warming on application startup
  static async initializeCache(): Promise<void> {
    console.log('🚀 Initializing cache optimization...');
    
    try {
      // Warm cache for popular categories
      await simpleCacheManager.warmCache(this.POPULAR_CATEGORIES);
      
      console.log('✅ Cache optimization initialized successfully');
    } catch (error) {
      console.error('❌ Cache optimization initialization failed:', error);
    }
  }

  // Get cache performance metrics
  static getCachePerformanceMetrics() {
    const stats = simpleCacheManager.getCacheStats();
    const metrics = simpleCacheManager.getMetrics();
    
    return {
      hitRate: metrics.hit_rate,
      missRate: metrics.miss_rate,
      totalRequests: stats.totalRequests,
      cacheSize: stats.size,
      memoryUsage: stats.memoryUsage,
      ongoingRequests: stats.ongoingRequests,
      freshness: stats.freshness,
      evictions: stats.evictions,
    };
  }

  // Preload category data for better performance
  static async preloadCategory(categoryId: number): Promise<void> {
    console.log(`🔄 Preloading category ${categoryId}...`);
    
    try {
      // Check if already cached
      const cacheKey = `category:${categoryId}:products:100:0`;
      const cached = await simpleCacheManager.getCategoryProducts(cacheKey);
      
      if (cached) {
        console.log(`✅ Category ${categoryId} already cached`);
        return;
      }
      
      // Try to load from shared cache
      const sharedProducts = await simpleCacheManager.getProductsForCategory(categoryId);
      if (sharedProducts) {
        await simpleCacheManager.cacheCategoryProducts(sharedProducts, cacheKey);
        console.log(`✅ Preloaded category ${categoryId} from shared cache`);
      } else {
        console.log(`⚠️ No shared cache data available for category ${categoryId}`);
      }
    } catch (error) {
      console.error(`❌ Failed to preload category ${categoryId}:`, error);
    }
  }

  // Invalidate related caches when data changes
  static async invalidateProductCache(productCode?: string): Promise<void> {
    console.log(`🗑️ Invalidating product cache for ${productCode || 'all products'}...`);
    
    try {
      if (productCode) {
        // Invalidate specific product
        await simpleCacheManager.invalidate(`product:${productCode}`);
        // Also invalidate any category caches that might contain this product
        await simpleCacheManager.invalidate('category:');
      } else {
        // Invalidate all product-related caches
        await simpleCacheManager.invalidate('products');
        await simpleCacheManager.invalidate('category:');
        await simpleCacheManager.invalidate('shared:products');
      }
      
      console.log('✅ Product cache invalidation completed');
    } catch (error) {
      console.error('❌ Product cache invalidation failed:', error);
    }
  }

  // Get cache health status
  static getCacheHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: ReturnType<typeof this.getCachePerformanceMetrics>;
    recommendations: string[];
  } {
    const metrics = this.getCachePerformanceMetrics();
    const recommendations: string[] = [];
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    // Check hit rate
    if (metrics.hitRate < 0.5) {
      status = 'critical';
      recommendations.push('Hit rate is low - consider cache warming or increasing TTL');
    } else if (metrics.hitRate < 0.7) {
      status = 'warning';
      recommendations.push('Hit rate could be improved - consider cache optimization');
    }
    
    // Check freshness
    const totalEntries = metrics.freshness.fresh + metrics.freshness.stale + metrics.freshness.expired;
    if (totalEntries > 0) {
      const staleRatio = (metrics.freshness.stale + metrics.freshness.expired) / totalEntries;
      if (staleRatio > 0.3) {
        status = status === 'critical' ? 'critical' : 'warning';
        recommendations.push('High ratio of stale/expired entries - consider background refresh');
      }
    }
    
    // Check memory usage
    if (metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
      status = status === 'critical' ? 'critical' : 'warning';
      recommendations.push('High memory usage - consider cache size limits');
    }
    
    // Check ongoing requests
    if (metrics.ongoingRequests > 10) {
      recommendations.push('High number of ongoing requests - request deduplication is working');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Cache is performing well');
    }
    
    return {
      status,
      metrics,
      recommendations,
    };
  }
}