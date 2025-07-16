#!/usr/bin/env node

/**
 * Pickup Performance Monitor
 * 
 * Monitors and reports on pickup data cache performance, hit rates,
 * and provides recommendations for optimization.
 * 
 * Usage:
 *   node scripts/monitor-pickup-performance.js [--format=json|table] [--detailed]
 */

const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  DATA_DIR: path.join(__dirname, '../data/pickups'),
  CACHE_HEALTH_THRESHOLD: 0.8, // 80% cache hit rate considered healthy
  STALE_DATA_DAYS: 7, // Data older than 7 days considered stale
  MAX_CACHE_SIZE: 100, // Maximum recommended cached products
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  format: args.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'table',
  detailed: args.includes('--detailed'),
};

/**
 * Get all cached pickup data files
 */
const getCachedFiles = async () => {
  try {
    const files = await fs.readdir(CONFIG.DATA_DIR);
    return files.filter(file => file.endsWith('.json'));
  } catch (error) {
    console.error('Error reading cache directory:', error.message);
    return [];
  }
};

/**
 * Read and parse pickup data file
 */
const readPickupFile = async (filename) => {
  try {
    const filePath = path.join(CONFIG.DATA_DIR, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Add file metadata
    const stats = await fs.stat(filePath);
    data._metadata = {
      filename,
      fileSize: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
    };
    
    return data;
  } catch (error) {
    console.warn(`Error reading ${filename}:`, error.message);
    return null;
  }
};

/**
 * Calculate cache performance metrics
 */
const calculateCacheMetrics = (cacheData) => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let totalProducts = 0;
  let productsWithPickups = 0;
  let totalPickupLocations = 0;
  let apiSources = 0;
  let recentAccess = 0;
  let staleData = 0;
  let totalFileSize = 0;
  let totalAccessCount = 0;

  const locationDistribution = new Map();
  const accessPatterns = [];

  cacheData.forEach(item => {
    if (!item) return;

    totalProducts++;
    totalFileSize += item._metadata.fileSize;
    
    if (item.pickups && item.pickups.length > 0) {
      productsWithPickups++;
      totalPickupLocations += item.pickups.length;
      
      // Track pickup locations
      item.pickups.forEach(pickup => {
        if (pickup.locationName) {
          const location = pickup.locationName;
          locationDistribution.set(location, (locationDistribution.get(location) || 0) + 1);
        }
      });
    }

    if (item.source === 'rezdy_api') {
      apiSources++;
    }

    if (item.accessCount) {
      totalAccessCount += item.accessCount;
    }

    const lastAccessed = new Date(item.lastAccessed || item.fetchedAt);
    if (lastAccessed > oneDayAgo) {
      recentAccess++;
    }

    const fetchedAt = new Date(item.fetchedAt);
    if (fetchedAt < oneWeekAgo) {
      staleData++;
    }

    // Access pattern analysis
    accessPatterns.push({
      productCode: item.productCode,
      accessCount: item.accessCount || 0,
      lastAccessed: lastAccessed,
      daysSinceAccess: Math.floor((now - lastAccessed) / (24 * 60 * 60 * 1000)),
      pickupCount: item.pickups?.length || 0,
      source: item.source,
    });
  });

  const avgPickupsPerProduct = totalProducts > 0 ? (totalPickupLocations / productsWithPickups) : 0;
  const cacheUtilization = totalProducts > 0 ? (recentAccess / totalProducts) : 0;
  const avgAccessCount = totalProducts > 0 ? (totalAccessCount / totalProducts) : 0;

  return {
    overview: {
      totalProducts,
      productsWithPickups,
      pickupCoverage: totalProducts > 0 ? (productsWithPickups / totalProducts) : 0,
      totalPickupLocations,
      avgPickupsPerProduct,
      totalFileSize,
      avgFileSize: totalProducts > 0 ? (totalFileSize / totalProducts) : 0,
    },
    performance: {
      cacheUtilization,
      recentAccess,
      staleData,
      stalenessRate: totalProducts > 0 ? (staleData / totalProducts) : 0,
      apiSources,
      apiSourceRate: totalProducts > 0 ? (apiSources / totalProducts) : 0,
      avgAccessCount,
      totalAccessCount,
    },
    distribution: {
      locationCounts: Array.from(locationDistribution.entries())
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count),
      accessPatterns: accessPatterns.sort((a, b) => b.accessCount - a.accessCount),
    },
  };
};

/**
 * Generate performance recommendations
 */
const generateRecommendations = (metrics) => {
  const recommendations = [];

  // Cache utilization recommendations
  if (metrics.performance.cacheUtilization < CONFIG.CACHE_HEALTH_THRESHOLD) {
    recommendations.push({
      priority: 'high',
      category: 'utilization',
      message: `Low cache utilization (${(metrics.performance.cacheUtilization * 100).toFixed(1)}%). Consider running bulk fetch for frequently accessed products.`,
      action: 'Run: node scripts/bulk-fetch-pickup-data.js --force',
    });
  }

  // Stale data recommendations
  if (metrics.performance.stalenessRate > 0.3) {
    recommendations.push({
      priority: 'medium',
      category: 'freshness',
      message: `${(metrics.performance.stalenessRate * 100).toFixed(1)}% of cached data is stale (>7 days old).`,
      action: 'Schedule regular data refresh or run bulk fetch with --force',
    });
  }

  // Coverage recommendations
  if (metrics.overview.pickupCoverage < 0.5) {
    recommendations.push({
      priority: 'medium',
      category: 'coverage',
      message: `Only ${(metrics.overview.pickupCoverage * 100).toFixed(1)}% of products have pickup location data.`,
      action: 'Review product configurations and API data availability',
    });
  }

  // Performance recommendations
  if (metrics.overview.totalProducts > CONFIG.MAX_CACHE_SIZE) {
    recommendations.push({
      priority: 'low',
      category: 'performance',
      message: `Large cache size (${metrics.overview.totalProducts} products). Consider cleanup of unused data.`,
      action: 'Review access patterns and remove unused cached data',
    });
  }

  // API source recommendations
  if (metrics.performance.apiSourceRate < 0.8) {
    recommendations.push({
      priority: 'medium',
      category: 'data_quality',
      message: `${(metrics.performance.apiSourceRate * 100).toFixed(1)}% of data from API. Low API coverage may impact filtering accuracy.`,
      action: 'Verify API connectivity and product configurations',
    });
  }

  return recommendations;
};

/**
 * Format output as table
 */
const formatAsTable = (metrics, recommendations) => {
  console.log('🚀 Pickup Data Performance Report\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Overview section
  console.log('\n📊 CACHE OVERVIEW');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`Total Products Cached:        ${metrics.overview.totalProducts}`);
  console.log(`Products with Pickup Data:    ${metrics.overview.productsWithPickups} (${(metrics.overview.pickupCoverage * 100).toFixed(1)}%)`);
  console.log(`Total Pickup Locations:       ${metrics.overview.totalPickupLocations}`);
  console.log(`Avg Pickups per Product:      ${metrics.overview.avgPickupsPerProduct.toFixed(1)}`);
  console.log(`Total Cache Size:             ${(metrics.overview.totalFileSize / 1024).toFixed(1)} KB`);
  console.log(`Average File Size:            ${(metrics.overview.avgFileSize / 1024).toFixed(1)} KB`);

  // Performance section
  console.log('\n⚡ PERFORMANCE METRICS');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`Cache Utilization:            ${(metrics.performance.cacheUtilization * 100).toFixed(1)}%`);
  console.log(`Recently Accessed (24h):      ${metrics.performance.recentAccess}/${metrics.overview.totalProducts}`);
  console.log(`Stale Data (>7 days):         ${metrics.performance.staleData} (${(metrics.performance.stalenessRate * 100).toFixed(1)}%)`);
  console.log(`API Data Sources:             ${metrics.performance.apiSources} (${(metrics.performance.apiSourceRate * 100).toFixed(1)}%)`);
  console.log(`Total Access Count:           ${metrics.performance.totalAccessCount}`);
  console.log(`Average Access Count:         ${metrics.performance.avgAccessCount.toFixed(1)}`);

  // Top pickup locations
  console.log('\n📍 TOP PICKUP LOCATIONS');
  console.log('─────────────────────────────────────────────────────────');
  metrics.distribution.locationCounts.slice(0, 10).forEach((item, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${item.location.padEnd(25)} ${item.count} products`);
  });

  // Most accessed products
  if (options.detailed) {
    console.log('\n🔥 MOST ACCESSED PRODUCTS');
    console.log('─────────────────────────────────────────────────────────');
    metrics.distribution.accessPatterns.slice(0, 10).forEach((item, index) => {
      const daysSince = item.daysSinceAccess;
      const lastAccessStr = daysSince === 0 ? 'today' : daysSince === 1 ? '1 day ago' : `${daysSince} days ago`;
      console.log(`${(index + 1).toString().padStart(2)}. ${item.productCode.padEnd(8)} | ${item.accessCount.toString().padStart(3)} accesses | ${item.pickupCount} pickups | ${lastAccessStr}`);
    });
  }

  // Recommendations
  if (recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS');
    console.log('─────────────────────────────────────────────────────────');
    recommendations.forEach((rec, index) => {
      const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      console.log(`${priorityIcon} ${rec.category.toUpperCase()}`);
      console.log(`   ${rec.message}`);
      console.log(`   Action: ${rec.action}\n`);
    });
  } else {
    console.log('\n✅ NO RECOMMENDATIONS - Cache is performing well!');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

/**
 * Format output as JSON
 */
const formatAsJSON = (metrics, recommendations) => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      cacheHealth: metrics.performance.cacheUtilization >= CONFIG.CACHE_HEALTH_THRESHOLD ? 'healthy' : 'needs_attention',
      totalProducts: metrics.overview.totalProducts,
      utilizationRate: metrics.performance.cacheUtilization,
      recommendationCount: recommendations.length,
    },
    metrics,
    recommendations,
  };

  console.log(JSON.stringify(report, null, 2));
};

/**
 * Main execution function
 */
const main = async () => {
  try {
    // Get all cached files
    const files = await getCachedFiles();
    
    if (files.length === 0) {
      console.log('📭 No cached pickup data found.');
      console.log('💡 Run: node scripts/bulk-fetch-pickup-data.js to populate cache');
      return;
    }

    // Read all cache data
    console.log(`📡 Analyzing ${files.length} cached products...`);
    const cacheData = await Promise.all(
      files.map(file => readPickupFile(file))
    );

    // Calculate metrics
    const metrics = calculateCacheMetrics(cacheData.filter(Boolean));
    
    // Generate recommendations
    const recommendations = generateRecommendations(metrics);

    // Output results
    if (options.format === 'json') {
      formatAsJSON(metrics, recommendations);
    } else {
      formatAsTable(metrics, recommendations);
    }

  } catch (error) {
    console.error('💥 Error generating performance report:', error.message);
    process.exit(1);
  }
};

// Run the monitor
main();