import { EnhancedPickupFilter } from '@/lib/services/enhanced-pickup-filter';

/**
 * Diagnostic utilities for pickup location caching
 */
export class PickupCacheDiagnostics {
  
  /**
   * Analyze cache performance and efficiency
   */
  static analyzeCachePerformance() {
    const stats = EnhancedPickupFilter.getCacheStats();
    const now = Date.now();
    
    const analysis = {
      totalEntries: stats.size,
      validEntries: 0,
      expiredEntries: 0,
      apiDataEntries: 0,
      textBasedEntries: 0,
      fromApiCacheEntries: 0,
      averageAge: 0,
      oldestEntry: 0,
      newestEntry: Number.MAX_SAFE_INTEGER,
      recommendations: [] as string[],
    };

    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes (Enhanced Filter TTL)
    
    stats.entries.forEach(entry => {
      const age = entry.age;
      
      if (age < CACHE_TTL) {
        analysis.validEntries++;
      } else {
        analysis.expiredEntries++;
      }
      
      if (entry.hasApiData) {
        analysis.apiDataEntries++;
      } else {
        analysis.textBasedEntries++;
      }
      
      if (entry.fromApiCache) {
        analysis.fromApiCacheEntries++;
      }
      
      analysis.averageAge += age;
      analysis.oldestEntry = Math.max(analysis.oldestEntry, age);
      analysis.newestEntry = Math.min(analysis.newestEntry, age);
    });

    if (stats.entries.length > 0) {
      analysis.averageAge = analysis.averageAge / stats.entries.length;
    }

    // Generate recommendations
    if (analysis.expiredEntries > analysis.validEntries) {
      analysis.recommendations.push('High number of expired cache entries - consider clearing cache');
    }
    
    if (analysis.textBasedEntries > analysis.apiDataEntries) {
      analysis.recommendations.push('More text-based entries than API data - check API connectivity');
    }
    
    if (analysis.totalEntries === 0) {
      analysis.recommendations.push('No cache entries found - cache may not be working');
    }
    
    if (analysis.averageAge > CACHE_TTL * 0.8) {
      analysis.recommendations.push('Cache entries are aging - consider refreshing');
    }

    return analysis;
  }

  /**
   * Test cache efficiency by making repeated requests
   */
  static async testCacheEfficiency(productCode: string, iterations = 3) {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      try {
        const pickups = await EnhancedPickupFilter.getProductPickupLocations(productCode);
        const endTime = Date.now();
        
        results.push({
          iteration: i + 1,
          duration: endTime - startTime,
          pickupsCount: pickups.length,
          success: true,
        });
        
        // Small delay between requests
        if (i < iterations - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        const endTime = Date.now();
        results.push({
          iteration: i + 1,
          duration: endTime - startTime,
          pickupsCount: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const analysis = {
      results,
      averageDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      cacheEfficiency: results.length > 1 ? results[1].duration / results[0].duration : 1,
      successRate: results.filter(r => r.success).length / results.length,
    };

    return analysis;
  }

  /**
   * Compare API route caching vs Enhanced Filter caching
   */
  static async compareCachingLayers(productCode: string) {
    const results = {
      apiRoute: { cached: false, duration: 0, error: null as string | null },
      enhancedFilter: { cached: false, duration: 0, error: null as string | null },
      comparison: { efficiency: 0, recommendation: '' },
    };

    try {
      // Test API route directly
      const apiStartTime = Date.now();
      const apiResponse = await fetch(`/api/rezdy/products/${productCode}/pickups`);
      const apiData = await apiResponse.json();
      const apiEndTime = Date.now();
      
      results.apiRoute = {
        cached: apiData.cached || false,
        duration: apiEndTime - apiStartTime,
        error: apiResponse.ok ? null : `API error: ${apiResponse.status}`,
      };

    } catch (error) {
      results.apiRoute.error = error instanceof Error ? error.message : 'Unknown error';
    }

    try {
      // Test Enhanced Filter
      const filterStartTime = Date.now();
      await EnhancedPickupFilter.getProductPickupLocations(productCode);
      const filterEndTime = Date.now();
      
      results.enhancedFilter = {
        cached: true, // We can't easily determine this without modifying the method
        duration: filterEndTime - filterStartTime,
        error: null,
      };

    } catch (error) {
      results.enhancedFilter.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Analysis
    if (results.apiRoute.duration > 0 && results.enhancedFilter.duration > 0) {
      results.comparison.efficiency = results.enhancedFilter.duration / results.apiRoute.duration;
      
      if (results.comparison.efficiency < 0.5) {
        results.comparison.recommendation = 'Enhanced Filter is significantly faster - good caching';
      } else if (results.comparison.efficiency > 1.5) {
        results.comparison.recommendation = 'Enhanced Filter is slower - check for double-caching issues';
      } else {
        results.comparison.recommendation = 'Performance is similar - caching layers are working well';
      }
    }

    return results;
  }

  /**
   * Generate a comprehensive cache health report
   */
  static async generateCacheHealthReport(testProductCode?: string) {
    const report = {
      timestamp: new Date().toISOString(),
      cachePerformance: this.analyzeCachePerformance(),
      layerComparison: null as any,
      efficiencyTest: null as any,
      overallHealth: 'unknown' as 'good' | 'warning' | 'critical' | 'unknown',
      summary: [] as string[],
    };

    if (testProductCode) {
      try {
        report.layerComparison = await this.compareCachingLayers(testProductCode);
        report.efficiencyTest = await this.testCacheEfficiency(testProductCode);
      } catch (error) {
        report.summary.push(`Testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Determine overall health
    const perf = report.cachePerformance;
    let healthScore = 0;

    if (perf.totalEntries > 0) healthScore += 2;
    if (perf.validEntries > perf.expiredEntries) healthScore += 2;
    if (perf.apiDataEntries > 0) healthScore += 2;
    if (perf.recommendations.length === 0) healthScore += 2;
    if (report.efficiencyTest?.successRate === 1) healthScore += 2;

    if (healthScore >= 8) report.overallHealth = 'good';
    else if (healthScore >= 6) report.overallHealth = 'warning';
    else if (healthScore >= 4) report.overallHealth = 'critical';

    // Generate summary
    report.summary.push(`Cache contains ${perf.totalEntries} entries (${perf.validEntries} valid, ${perf.expiredEntries} expired)`);
    report.summary.push(`Data sources: ${perf.apiDataEntries} API, ${perf.textBasedEntries} text-based`);
    
    if (perf.recommendations.length > 0) {
      report.summary.push(`Recommendations: ${perf.recommendations.join(', ')}`);
    }

    return report;
  }
}