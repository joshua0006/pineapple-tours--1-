import { RezdyProduct, RezdyPickupLocation } from '@/lib/types/rezdy';
import { EnhancedPickupFilter } from './enhanced-pickup-filter';
import { PickupLocationService } from './pickup-location-service';
import { LocalPickupIndexService } from './local-pickup-index';

/**
 * Unified pickup filtering service that ensures consistent filtering logic
 * between search form and tours page components.
 * 
 * OPTIMIZED: Prioritizes local pickup data files over API calls for maximum performance
 */
export class UnifiedPickupFilter {
  private static readonly SUPPORTED_LOCATIONS = ['Brisbane', 'Gold Coast', 'Brisbane Loop'];

  /**
   * Main filtering method used by both search form and tours page
   * OPTIMIZED: Uses local pickup data files first, API calls only as fallback
   */
  static async filterProductsByLocation(
    products: RezdyProduct[],
    location: string,
    options: {
      useApiData?: boolean;
      enableFallback?: boolean;
      cacheResults?: boolean;
      forceLocalData?: boolean; // NEW: Force use of local data only
    } = {}
  ): Promise<{
    filteredProducts: RezdyProduct[];
    filterStats: {
      totalProducts: number;
      filteredCount: number;
      localDataUsed: number; // Changed from apiDataUsed
      fallbackUsed: number;
      location: string;
      filteringMethod: 'local_data' | 'enhanced' | 'text_based' | 'mixed';
      accuracy: 'high' | 'medium' | 'low';
      dataSource: 'local_files' | 'api_calls' | 'mixed' | 'text_based';
    };
  }> {
    const {
      useApiData = false, // Changed default to prefer local data
      enableFallback = true,
      cacheResults = true,
      forceLocalData = true // Default to local data first
    } = options;

    // Handle 'all' location case
    if (!location || location === 'all') {
      return {
        filteredProducts: products,
        filterStats: {
          totalProducts: products.length,
          filteredCount: products.length,
          localDataUsed: 0,
          fallbackUsed: 0,
          location: 'all',
          filteringMethod: 'local_data',
          accuracy: 'high',
          dataSource: 'local_files',
        },
      };
    }

    // Normalize location first
    const normalizedLocation = PickupLocationService.normalizeLocation(location);
    if (!normalizedLocation) {
      return {
        filteredProducts: [],
        filterStats: {
          totalProducts: products.length,
          filteredCount: 0,
          localDataUsed: 0,
          fallbackUsed: 0,
          location,
          filteringMethod: 'local_data',
          accuracy: 'low',
          dataSource: 'local_files',
        },
      };
    }

    let filteredProducts: RezdyProduct[] = [];
    let localDataUsed = 0;
    let fallbackUsed = 0;
    let filteringMethod: 'local_data' | 'enhanced' | 'text_based' | 'mixed' = 'local_data';
    let dataSource: 'local_files' | 'api_calls' | 'mixed' | 'text_based' = 'local_files';

    try {
      // PRIORITY 1: Use local pickup data files (fastest and most reliable)
      // Only attempt local data on server side or when explicitly forced
      if ((forceLocalData || typeof window === 'undefined') && typeof window === 'undefined') {
        try {
          const productCodes = products.map(p => p.productCode);
          const localResult = await LocalPickupIndexService.filterProductCodesByLocation(
            productCodes,
            normalizedLocation
          );

          // Convert product codes back to products
          const validCodes = new Set(localResult.filteredProducts);
          filteredProducts = products.filter(p => validCodes.has(p.productCode));
          
          localDataUsed = localResult.stats.hasLocalData;
          filteringMethod = 'local_data';
          dataSource = 'local_files';

          console.log('Local data filtering results:', {
            location: normalizedLocation,
            totalProducts: products.length,
            filteredProducts: filteredProducts.length,
            localDataCoverage: localResult.stats.hasLocalData,
            method: 'local_files'
          });

          // If we get good results from local data, return immediately
          if (filteredProducts.length > 0 || !enableFallback) {
            const accuracy: 'high' | 'medium' | 'low' = localDataUsed > 0 ? 'high' : 'medium';
            
            return {
              filteredProducts,
              filterStats: {
                totalProducts: products.length,
                filteredCount: filteredProducts.length,
                localDataUsed,
                fallbackUsed: 0,
                location: normalizedLocation,
                filteringMethod: 'local_data',
                accuracy,
                dataSource: 'local_files',
              },
            };
          }
        } catch (localError) {
          console.warn('Local pickup data filtering failed:', localError);
          // Continue to fallback methods
        }
      } else if (typeof window !== 'undefined') {
        console.log('Skipping local data filtering in browser context, using fallback methods');
      }

      // PRIORITY 2: Fallback to API-based filtering (if enabled and local data insufficient)
      if (useApiData && enableFallback && filteredProducts.length === 0) {
        console.log('Falling back to API-based filtering for location:', normalizedLocation);
        
        const enhancedResult = await EnhancedPickupFilter.filterProductsByPickupLocation(
          products,
          normalizedLocation,
          true
        );

        filteredProducts = enhancedResult.filteredProducts;
        const apiDataUsed = enhancedResult.filterStats.apiDataUsed;
        fallbackUsed = enhancedResult.filterStats.fallbackUsed;

        // Determine filtering method based on data sources used
        if (localDataUsed > 0 && apiDataUsed > 0) {
          filteringMethod = 'mixed';
          dataSource = 'mixed';
        } else if (apiDataUsed > 0) {
          filteringMethod = 'enhanced';
          dataSource = 'api_calls';
        } else {
          filteringMethod = 'text_based';
          dataSource = 'text_based';
        }
      }

      // PRIORITY 3: Final fallback to text-based filtering
      if (enableFallback && filteredProducts.length === 0) {
        console.log('Final fallback to text-based filtering for location:', normalizedLocation);
        
        filteredProducts = PickupLocationService.filterProductsByPickupLocation(
          products,
          normalizedLocation
        );
        fallbackUsed = filteredProducts.length;
        filteringMethod = localDataUsed > 0 ? 'mixed' : 'text_based';
        dataSource = localDataUsed > 0 ? 'mixed' : 'text_based';
      }
    } catch (error) {
      console.error('Filtering failed, using text-based fallback:', error);
      
      if (enableFallback) {
        // Emergency fallback to text-based filtering
        filteredProducts = PickupLocationService.filterProductsByPickupLocation(
          products,
          normalizedLocation
        );
        fallbackUsed = filteredProducts.length;
        filteringMethod = 'text_based';
        dataSource = 'text_based';
      }
    }

    // Determine accuracy based on filtering method and data source
    let accuracy: 'high' | 'medium' | 'low' = 'medium';
    if (dataSource === 'local_files' && localDataUsed > 0) {
      accuracy = 'high';
    } else if (dataSource === 'api_calls' || (dataSource === 'mixed' && localDataUsed > fallbackUsed)) {
      accuracy = 'high';
    } else if (dataSource === 'text_based' && filteredProducts.length > 0) {
      accuracy = 'medium';
    } else {
      accuracy = 'low';
    }

    return {
      filteredProducts,
      filterStats: {
        totalProducts: products.length,
        filteredCount: filteredProducts.length,
        localDataUsed,
        fallbackUsed,
        location: normalizedLocation,
        filteringMethod,
        accuracy,
        dataSource,
      },
    };
  }

  /**
   * Quick filtering method for simple location checks
   * OPTIMIZED: Uses local pickup data files first, API calls only as fallback
   */
  static async hasPickupFromLocation(
    product: RezdyProduct,
    location: string,
    useApiData = false // Changed default to prefer local data
  ): Promise<{ hasPickup: boolean; method: 'local' | 'api' | 'text'; confidence: 'high' | 'medium' | 'low' }> {
    const normalizedLocation = PickupLocationService.normalizeLocation(location);
    if (!normalizedLocation) {
      return { hasPickup: false, method: 'text', confidence: 'low' };
    }

    try {
      // PRIORITY 1: Check local pickup data first
      const localResult = await LocalPickupIndexService.hasProductPickupFromLocation(
        product.productCode,
        normalizedLocation
      );
      
      if (localResult.hasLocalData) {
        return {
          hasPickup: localResult.hasPickup,
          method: 'local',
          confidence: localResult.confidence
        };
      }

      // PRIORITY 2: Fallback to API if enabled and no local data
      if (useApiData) {
        const apiResult = await EnhancedPickupFilter.productHasPickupFromLocation(
          product,
          normalizedLocation,
          true
        );
        
        if (apiResult.usedApiData) {
          return {
            hasPickup: apiResult.hasPickup,
            method: 'api',
            confidence: 'high'
          };
        }
      }
    } catch (error) {
      console.warn(`Local/API filtering failed for ${product.productCode}:`, error);
    }

    // PRIORITY 3: Final fallback to text-based
    const textResult = PickupLocationService.hasPickupFromLocation(product, normalizedLocation);
    return {
      hasPickup: textResult,
      method: 'text',
      confidence: textResult ? 'medium' : 'low'
    };
  }

  /**
   * Get comprehensive pickup location data for products
   * OPTIMIZED: Uses local pickup data files for statistics
   */
  static async getLocationSummary(
    products: RezdyProduct[],
    useApiData = false // Changed default to prefer local data
  ): Promise<{
    locations: Array<{
      location: string;
      productCount: number;
      hasLocalData: boolean; // Changed from hasApiData
      accuracy: 'high' | 'medium' | 'low';
    }>;
    totalProcessed: number;
    localDataAvailable: number; // Changed from apiDataAvailable
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    dataSource: 'local_files' | 'api_calls' | 'text_based';
  }> {
    try {
      // PRIORITY 1: Use local pickup data statistics
      const localStats = await LocalPickupIndexService.getLocationStats();
      
      if (localStats.totalProducts > 0) {
        const locations = Object.entries(localStats.locationCounts)
          .filter(([_, count]) => count > 0)
          .map(([location, count]) => ({
            location,
            productCount: count,
            hasLocalData: true,
            accuracy: 'high' as const,
          }));

        // Calculate data quality based on local data coverage
        let dataQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
        if (localStats.coverage >= 80) {
          dataQuality = 'excellent';
        } else if (localStats.coverage >= 60) {
          dataQuality = 'good';
        } else if (localStats.coverage >= 30) {
          dataQuality = 'fair';
        }

        return {
          locations,
          totalProcessed: products.length,
          localDataAvailable: localStats.productsWithPickups,
          dataQuality,
          dataSource: 'local_files',
        };
      }

      // PRIORITY 2: Fallback to API data if enabled and no local data
      if (useApiData) {
        const aggregateData = await EnhancedPickupFilter.getAggregatePickupData(products, true);
        
        // Calculate data quality based on API availability
        let dataQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
        const apiPercentage = aggregateData.totalProcessed > 0 
          ? (aggregateData.apiDataAvailable / aggregateData.totalProcessed) * 100 
          : 0;

        if (apiPercentage >= 80) {
          dataQuality = 'excellent';
        } else if (apiPercentage >= 60) {
          dataQuality = 'good';
        } else if (apiPercentage >= 30) {
          dataQuality = 'fair';
        }

        // Add accuracy assessment to each location
        const locationsWithAccuracy = aggregateData.locations.map(loc => ({
          location: loc.location,
          productCount: loc.productCount,
          hasLocalData: false, // This is API data
          accuracy: loc.hasApiData ? 'high' as const : 'medium' as const
        }));

        return {
          locations: locationsWithAccuracy,
          totalProcessed: aggregateData.totalProcessed,
          localDataAvailable: aggregateData.apiDataAvailable, // Using API data as local fallback
          dataQuality,
          dataSource: 'api_calls',
        };
      }
    } catch (error) {
      console.warn('Failed to get location summary from local/API data:', error);
    }
    
    // PRIORITY 3: Final fallback to basic text-based analysis
    const locationStats = PickupLocationService.getPickupLocationStats(products);
    const locations = Object.entries(locationStats)
      .filter(([_, count]) => count > 0)
      .map(([location, count]) => ({
        location,
        productCount: count,
        hasLocalData: false,
        accuracy: 'medium' as const,
      }));

    return {
      locations,
      totalProcessed: products.length,
      localDataAvailable: 0,
      dataQuality: 'fair',
      dataSource: 'text_based',
    };
  }

  /**
   * Validate filtering consistency between two filter results
   * Used for testing and debugging filtering accuracy
   */
  static validateFilteringConsistency(
    products: RezdyProduct[],
    location: string,
    searchFormResults: RezdyProduct[],
    toursPageResults: RezdyProduct[]
  ): {
    isConsistent: boolean;
    discrepancies: {
      onlyInSearchForm: RezdyProduct[];
      onlyInToursPage: RezdyProduct[];
    };
    consistencyPercentage: number;
    recommendation: string;
  } {
    const searchFormCodes = new Set(searchFormResults.map(p => p.productCode));
    const toursPageCodes = new Set(toursPageResults.map(p => p.productCode));
    
    const onlyInSearchForm = searchFormResults.filter(p => !toursPageCodes.has(p.productCode));
    const onlyInToursPage = toursPageResults.filter(p => !searchFormCodes.has(p.productCode));
    
    const intersection = searchFormResults.filter(p => toursPageCodes.has(p.productCode)).length;
    const union = new Set([...searchFormCodes, ...toursPageCodes]).size;
    
    const consistencyPercentage = union > 0 ? (intersection / union) * 100 : 100;
    const isConsistent = consistencyPercentage >= 95; // 95% threshold for consistency
    
    let recommendation = '';
    if (!isConsistent) {
      if (onlyInSearchForm.length > onlyInToursPage.length) {
        recommendation = 'Tours page filtering is too restrictive. Consider using enhanced filtering.';
      } else if (onlyInToursPage.length > onlyInSearchForm.length) {
        recommendation = 'Search form filtering is too restrictive. Check API data availability.';
      } else {
        recommendation = 'Both filters have issues. Investigate filtering logic discrepancies.';
      }
    } else {
      recommendation = 'Filtering is consistent between components.';
    }

    return {
      isConsistent,
      discrepancies: {
        onlyInSearchForm,
        onlyInToursPage,
      },
      consistencyPercentage,
      recommendation,
    };
  }

  /**
   * Preload pickup data for better performance
   * Should be called early in component lifecycle
   */
  static async preloadPickupData(products: RezdyProduct[]): Promise<void> {
    const productCodes = products.map(p => p.productCode);
    await EnhancedPickupFilter.preloadPickupData(productCodes);
  }

  /**
   * Get supported pickup locations in preferred order
   */
  static getSupportedLocations(): string[] {
    return [...this.SUPPORTED_LOCATIONS];
  }

  /**
   * Clear all caches (useful for testing or when data is updated)
   */
  static clearAllCaches(): void {
    EnhancedPickupFilter.clearCache();
  }
}