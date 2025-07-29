import { RezdyProduct, RegionFilterOptions, RegionFilterResult } from '@/lib/types/rezdy';
import { CityFilterService } from './city-filter';
import { RegionFilterService } from './region-filter-service';
import { PickupRegion } from '@/lib/constants/pickup-regions';

/**
 * Unified filtering service that ensures consistent filtering logic
 * between search form and tours page components.
 * 
 * ENHANCED: Supports both region-based and city-based filtering
 * - Region filtering: Uses pickup location regions for precise filtering
 * - City filtering: Uses locationAddress.city data as fallback
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
    if (!location || location === 'all' || location === PickupRegion.ALL) {
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

  // =============================================================================
  // REGION-BASED FILTERING METHODS
  // =============================================================================

  /**
   * Enhanced filtering method that supports both region and location-based filtering
   * Automatically detects the filter type and applies the appropriate method
   */
  static async filterProductsByLocationOrRegion(
    products: RezdyProduct[],
    locationOrRegion: string,
    options: {
      preferRegion?: boolean;
      enableFallback?: boolean;
      exactMatch?: boolean;
    } = {}
  ): Promise<{
    filteredProducts: RezdyProduct[];
    filterStats: {
      totalProducts: number;
      filteredCount: number;
      localDataUsed: number;
      fallbackUsed: number;
      location: string;
      filteringMethod: 'region_based' | 'city_based' | 'text_based';
      accuracy: 'high' | 'medium' | 'low';
      dataSource: 'region_data' | 'city_data';
      filterType: 'region' | 'city';
    };
  }> {
    const { preferRegion = true, enableFallback = true, exactMatch = false } = options;

    // Handle 'all' case
    if (!locationOrRegion || locationOrRegion === 'all' || locationOrRegion === PickupRegion.ALL) {
      return {
        filteredProducts: products,
        filterStats: {
          totalProducts: products.length,
          filteredCount: products.length,
          localDataUsed: 0,
          fallbackUsed: 0,
          location: 'all',
          filteringMethod: 'region_based',
          accuracy: 'high',
          dataSource: 'region_data',
          filterType: 'region',
        },
      };
    }

    // Check if the input matches a region
    const isRegionInput = Object.values(PickupRegion).includes(locationOrRegion as PickupRegion) ||
                         RegionFilterService.getSupportedRegions().includes(locationOrRegion);

    try {
      if (preferRegion || isRegionInput) {
        // Try region-based filtering first
        const regionOptions: RegionFilterOptions = {
          exactMatch,
          fallbackToCity: enableFallback,
        };

        const regionResult = RegionFilterService.filterProductsByRegion(
          products,
          locationOrRegion,
          regionOptions
        );

        return {
          filteredProducts: regionResult.filteredProducts,
          filterStats: {
            totalProducts: regionResult.filterStats.totalProducts,
            filteredCount: regionResult.filterStats.filteredCount,
            localDataUsed: regionResult.filterStats.matchedPickupIds.length,
            fallbackUsed: regionResult.filterStats.unmatchedProducts,
            location: regionResult.filterStats.region,
            filteringMethod: regionResult.filterStats.filteringMethod,
            accuracy: regionResult.filterStats.accuracy,
            dataSource: 'region_data',
            filterType: 'region',
          },
        };
      } else {
        // Fall back to city-based filtering
        const cityResult = await this.filterProductsByLocation(
          products,
          locationOrRegion,
          { enableFallback }
        );

        return {
          filteredProducts: cityResult.filteredProducts,
          filterStats: {
            ...cityResult.filterStats,
            filterType: 'city' as const,
          },
        };
      }
    } catch (error) {
      console.error('Enhanced filtering failed:', error);
      
      if (enableFallback) {
        // Ultimate fallback: return all products
        return {
          filteredProducts: products,
          filterStats: {
            totalProducts: products.length,
            filteredCount: products.length,
            localDataUsed: 0,
            fallbackUsed: products.length,
            location: locationOrRegion,
            filteringMethod: 'text_based',
            accuracy: 'low',
            dataSource: 'city_data',
            filterType: 'city',
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
          location: locationOrRegion,
          filteringMethod: 'region_based',
          accuracy: 'low',
          dataSource: 'region_data',
          filterType: 'region',
        },
      };
    }
  }

  /**
   * Region-based filtering method
   */
  static async filterProductsByRegion(
    products: RezdyProduct[],
    region: string,
    options: RegionFilterOptions = {}
  ): Promise<RegionFilterResult> {
    return RegionFilterService.filterProductsByRegion(products, region, options);
  }

  /**
   * Check if a product belongs to a specific region
   */
  static async hasPickupFromRegion(
    product: RezdyProduct,
    region: string
  ): Promise<{ hasPickup: boolean; method: 'pickup_id' | 'city_fallback' | 'none'; confidence: 'high' | 'medium' | 'low' }> {
    return RegionFilterService.hasProductFromRegion(product, region);
  }

  /**
   * Get comprehensive region and city summary
   */
  static async getLocationAndRegionSummary(
    products: RezdyProduct[]
  ): Promise<{
    regions: Array<{
      region: string;
      displayName: string;
      productCount: number;
      hasDirectMapping: boolean;
      accuracy: 'high' | 'medium' | 'low';
    }>;
    cities: Array<{
      city: string;
      productCount: number;
      isSupported: boolean;
      accuracy: 'high' | 'medium' | 'low';
    }>;
    totalProcessed: number;
    regionCoverage: number;
    cityCoverage: number;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    preferredFilterType: 'region' | 'city';
  }> {
    try {
      // Get region summary
      const regionSummary = RegionFilterService.getRegionSummary(products);
      
      // Get city summary
      const citySummary = await this.getLocationSummary(products);

      // Calculate overall metrics
      const regionCoverage = regionSummary.directMappingCoverage;
      const cityCoverage = citySummary.dataQuality === 'excellent' ? 90 : 
                          citySummary.dataQuality === 'good' ? 70 :
                          citySummary.dataQuality === 'fair' ? 50 : 30;

      // Determine preferred filter type
      const preferredFilterType = regionCoverage >= cityCoverage ? 'region' : 'city';

      // Overall data quality
      const avgQuality = (regionCoverage + cityCoverage) / 2;
      let dataQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
      if (avgQuality >= 80) {
        dataQuality = 'excellent';
      } else if (avgQuality >= 65) {
        dataQuality = 'good';
      } else if (avgQuality >= 40) {
        dataQuality = 'fair';
      }

      return {
        regions: regionSummary.regions,
        cities: citySummary.locations.map(loc => ({
          city: loc.location,
          productCount: loc.productCount,
          isSupported: loc.hasLocalData,
          accuracy: loc.accuracy
        })),
        totalProcessed: products.length,
        regionCoverage,
        cityCoverage,
        dataQuality,
        preferredFilterType,
      };
    } catch (error) {
      console.warn('Failed to get location and region summary:', error);
      
      // Fallback to city-only summary
      const citySummary = await this.getLocationSummary(products);
      
      return {
        regions: [],
        cities: citySummary.locations.map(loc => ({
          city: loc.location,
          productCount: loc.productCount,
          isSupported: loc.hasLocalData,
          accuracy: loc.accuracy
        })),
        totalProcessed: products.length,
        regionCoverage: 0,
        cityCoverage: citySummary.dataQuality === 'excellent' ? 90 : 50,
        dataQuality: citySummary.dataQuality,
        preferredFilterType: 'city',
      };
    }
  }

  /**
   * Get supported regions for filtering
   */
  static getSupportedRegions(): string[] {
    return RegionFilterService.getSupportedRegions();
  }

  /**
   * Validate both region and city filter configurations
   */
  static validateEnhancedConfiguration(): {
    isValid: boolean;
    issues: string[];
    regionConfig: {
      isValid: boolean;
      supportedRegions: number;
      mappedPickupIds: number;
    };
    cityConfig: {
      isValid: boolean;
      supportedCities: number;
    };
    recommendedFilterType: 'region' | 'city';
  } {
    const regionValidation = RegionFilterService.validateConfiguration();
    const cityValidation = CityFilterService.validateConfiguration();

    const issues = [
      ...regionValidation.issues.map(issue => `Region: ${issue}`),
      ...cityValidation.issues.map(issue => `City: ${issue}`)
    ];

    const regionScore = regionValidation.isValid ? regionValidation.mappedPickupIds * 2 : 0;
    const cityScore = cityValidation.isValid ? cityValidation.supportedCities : 0;

    return {
      isValid: regionValidation.isValid || cityValidation.isValid,
      issues,
      regionConfig: {
        isValid: regionValidation.isValid,
        supportedRegions: regionValidation.supportedRegions,
        mappedPickupIds: regionValidation.mappedPickupIds,
      },
      cityConfig: {
        isValid: cityValidation.isValid,
        supportedCities: cityValidation.supportedCities,
      },
      recommendedFilterType: regionScore >= cityScore ? 'region' : 'city',
    };
  }
}