import { RezdyProduct } from '@/lib/types/rezdy';
import { CityFilterService } from './city-filter';

/**
 * Unified city-based filtering service that ensures consistent filtering logic
 * between search form and tours page components.
 * 
 * MODERNIZED: Uses locationAddress.city data directly from Rezdy products
 * for simplified, high-performance filtering
 */
export class UnifiedPickupFilter {
  private static readonly SUPPORTED_LOCATIONS = ['Brisbane', 'Gold Coast', 'Byron Bay', 'Tamborine Mountain'];

  /**
   * Main filtering method used by both search form and tours page
   * MODERNIZED: Uses city-based filtering with locationAddress.city data
   */
  static async filterProductsByLocation(
    products: RezdyProduct[],
    location: string,
    options: {
      useApiData?: boolean; // Kept for backward compatibility (ignored)
      enableFallback?: boolean; // Kept for backward compatibility
      cacheResults?: boolean; // Kept for backward compatibility (ignored)
      forceLocalData?: boolean; // Kept for backward compatibility (ignored)
    } = {}
  ): Promise<{
    filteredProducts: RezdyProduct[];
    filterStats: {
      totalProducts: number;
      filteredCount: number;
      localDataUsed: number; // Always 0 now (kept for compatibility)
      fallbackUsed: number; // Always 0 now (kept for compatibility)
      location: string;
      filteringMethod: 'city_based' | 'text_based'; // Simplified options
      accuracy: 'high' | 'medium' | 'low';
      dataSource: 'city_data'; // Always city_data now
    };
  }> {
    const { enableFallback = true } = options;

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
          filteringMethod: 'city_based',
          accuracy: 'high',
          dataSource: 'city_data',
        },
      };
    }

    try {
      // Use city-based filtering as primary method
      const cityResult = CityFilterService.filterProductsByCity(products, location);
      
      console.log('City-based filtering results:', {
        location,
        normalizedCity: cityResult.filterStats.normalizedCity,
        totalProducts: cityResult.filterStats.totalProducts,
        filteredProducts: cityResult.filterStats.filteredCount,
        accuracy: cityResult.filterStats.accuracy,
        matchMethod: cityResult.filterStats.matchMethod
      });

      return {
        filteredProducts: cityResult.filteredProducts,
        filterStats: {
          totalProducts: cityResult.filterStats.totalProducts,
          filteredCount: cityResult.filterStats.filteredCount,
          localDataUsed: 0, // No longer applicable
          fallbackUsed: 0, // No longer applicable
          location: cityResult.filterStats.normalizedCity,
          filteringMethod: 'city_based',
          accuracy: cityResult.filterStats.accuracy,
          dataSource: 'city_data',
        },
      };
    } catch (error) {
      console.error('City filtering failed:', error);
      
      if (enableFallback) {
        // Simple fallback: return all products for now
        // In the future, could implement text-based fallback if needed
        return {
          filteredProducts: products,
          filterStats: {
            totalProducts: products.length,
            filteredCount: products.length,
            localDataUsed: 0,
            fallbackUsed: products.length,
            location,
            filteringMethod: 'text_based',
            accuracy: 'low',
            dataSource: 'city_data',
          },
        };
      }

      return {
        filteredProducts: [],
        filterStats: {
          totalProducts: products.length,
          filteredCount: 0,
          localDataUsed: 0,
          fallbackUsed: 0,
          location,
          filteringMethod: 'city_based',
          accuracy: 'low',
          dataSource: 'city_data',
        },
      };
    }
  }

  /**
   * Quick filtering method for simple city checks
   * MODERNIZED: Uses city-based filtering with locationAddress.city data
   */
  static async hasPickupFromLocation(
    product: RezdyProduct,
    location: string,
    useApiData = false // Kept for backward compatibility (ignored)
  ): Promise<{ hasPickup: boolean; method: 'city' | 'fallback'; confidence: 'high' | 'medium' | 'low' }> {
    if (!location) {
      return { hasPickup: false, method: 'city', confidence: 'low' };
    }

    try {
      // Use city-based checking
      const cityResult = CityFilterService.hasProductFromCity(product, location);
      
      return {
        hasPickup: cityResult.hasCity,
        method: 'city',
        confidence: cityResult.confidence
      };
    } catch (error) {
      console.warn(`City filtering failed for ${product.productCode}:`, error);
      
      // Simple fallback
      return {
        hasPickup: false,
        method: 'fallback',
        confidence: 'low'
      };
    }
  }

  /**
   * Get comprehensive city data for products
   * MODERNIZED: Uses city-based filtering with locationAddress.city data
   */
  static async getLocationSummary(
    products: RezdyProduct[],
    useApiData = false // Kept for backward compatibility (ignored)
  ): Promise<{
    locations: Array<{
      location: string;
      productCount: number;
      hasLocalData: boolean; // Always true now (kept for compatibility)
      accuracy: 'high' | 'medium' | 'low';
    }>;
    totalProcessed: number;
    localDataAvailable: number; // Number of products with city data
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    dataSource: 'city_data';
  }> {
    try {
      // Use city-based summary
      const citySummary = CityFilterService.getCitySummary(products);
      
      const locations = citySummary.cities.map(city => ({
        location: city.city,
        productCount: city.productCount,
        hasLocalData: true, // City data is always considered "local"
        accuracy: city.isSupported ? 'high' as const : 'medium' as const,
      }));

      // Calculate data quality based on city data coverage
      let dataQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
      if (citySummary.supportedCityCoverage >= 80) {
        dataQuality = 'excellent';
      } else if (citySummary.supportedCityCoverage >= 60) {
        dataQuality = 'good';
      } else if (citySummary.supportedCityCoverage >= 30) {
        dataQuality = 'fair';
      }

      // Count products with valid city data
      const productsWithCityData = products.filter(product => {
        const city = CityFilterService['getCityFromProduct'](product);
        return city && city.trim().length > 0;
      }).length;

      return {
        locations,
        totalProcessed: citySummary.totalProducts,
        localDataAvailable: productsWithCityData,
        dataQuality,
        dataSource: 'city_data',
      };
    } catch (error) {
      console.warn('Failed to get city summary:', error);
      
      // Simple fallback
      return {
        locations: [],
        totalProcessed: products.length,
        localDataAvailable: 0,
        dataQuality: 'poor',
        dataSource: 'city_data',
      };
    }
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
   * Preload city data for better performance
   * MODERNIZED: City data is already available in products, no preloading needed
   */
  static async preloadPickupData(products: RezdyProduct[]): Promise<void> {
    // City data is already available in products, no preloading needed
    // This method is kept for backward compatibility
    console.log('City data preloading: no action needed, data is already available');
  }

  /**
   * Get supported cities in preferred order
   */
  static getSupportedLocations(): string[] {
    return CityFilterService.getSupportedCities();
  }

  /**
   * Clear all caches (useful for testing or when data is updated)
   * MODERNIZED: No caches to clear with city-based filtering
   */
  static clearAllCaches(): void {
    // No caches to clear with city-based filtering
    // This method is kept for backward compatibility
    console.log('City filtering: no caches to clear');
  }

  /**
   * Get city filter configuration validation
   */
  static validateConfiguration(): {
    isValid: boolean;
    issues: string[];
    supportedCities: number;
    dataSource: 'city_data';
  } {
    const cityValidation = CityFilterService.validateConfiguration();
    
    return {
      isValid: cityValidation.isValid,
      issues: cityValidation.issues,
      supportedCities: cityValidation.supportedCities,
      dataSource: 'city_data',
    };
  }
}