/**
 * Region-based filtering service for Rezdy products
 * Uses pickup location regions (Brisbane, Gold Coast, Tamborine Mountain) 
 * instead of city-based filtering for more precise pickup location handling
 */

import { RezdyProduct, RegionFilterOptions, RegionFilterResult, PickupRegionMapping } from '@/lib/types/rezdy';
import { 
  PickupRegion, 
  PICKUP_ID_TO_REGION, 
  PICKUP_REGIONS, 
  REGION_OPTIONS,
  getRegionFromPickupId, 
  getPickupIdsForRegion, 
  isPickupIdInRegion,
  normalizeRegion 
} from '@/lib/constants/pickup-regions';
import { CityFilterService } from './city-filter';
import { PickupLocationService } from './pickup-location-service';

export class RegionFilterService {
  // Mapping between PickupRegion enum values and PickupLocationService supported locations
  private static readonly REGION_TO_LOCATION_MAP: Record<PickupRegion, string[]> = {
    [PickupRegion.BRISBANE]: ['Brisbane'],
    [PickupRegion.YOUR_HOTEL_ACCOMMODATION]: ['Brisbane', 'Gold Coast', 'Brisbane Loop'], // Hotel pickup available in all regions
    [PickupRegion.BRISBANE_CITY_LOOP]: ['Brisbane Loop'],
    [PickupRegion.GOLD_COAST]: ['Gold Coast'],
    [PickupRegion.TAMBORINE_MOUNTAIN]: [], // Will use city fallback for Tamborine Mountain
    [PickupRegion.ALL]: []
  };

  /**
   * Filter products by pickup region
   */
  static filterProductsByRegion(
    products: RezdyProduct[],
    region: string,
    options: RegionFilterOptions = {}
  ): RegionFilterResult {
    const {
      includeAllRegions = false,
      exactMatch = false,
      fallbackToCity = true
    } = options;

    // Handle "all" regions case
    const targetRegion = normalizeRegion(region);
    if (includeAllRegions || targetRegion === PickupRegion.ALL) {
      return {
        filteredProducts: products,
        filterStats: {
          totalProducts: products.length,
          filteredCount: products.length,
          region: 'all',
          filteringMethod: 'region_based',
          accuracy: 'high',
          matchedPickupIds: [],
          unmatchedProducts: 0
        }
      };
    }

    // Get pickup IDs for the target region
    const targetPickupIds = getPickupIdsForRegion(targetRegion);
    const matchedPickupIds: (number | string)[] = [];
    const filteredProducts: RezdyProduct[] = [];

    // Filter products using PickupLocationService for text-based location matching
    products.forEach(product => {
      let isMatched = false;
      const productPickupLocations = PickupLocationService.extractPickupLocations(product);

      // Check if any of the product's pickup locations match the target region
      if (productPickupLocations.length > 0) {
        const targetLocations = this.REGION_TO_LOCATION_MAP[targetRegion] || [];
        
        // Check for direct location matches
        for (const productLocation of productPickupLocations) {
          if (targetLocations.includes(productLocation)) {
            isMatched = true;
            // Track the location that matched for stats
            if (!matchedPickupIds.includes(productLocation)) {
              matchedPickupIds.push(productLocation);
            }
            break;
          }
        }
      }

      // For YOUR_HOTEL_ACCOMMODATION region, be more inclusive since it can service multiple areas
      if (!isMatched && targetRegion === PickupRegion.YOUR_HOTEL_ACCOMMODATION) {
        // If the product has any supported pickup location, it likely offers hotel pickup
        if (productPickupLocations.length > 0) {
          isMatched = true;
          if (!matchedPickupIds.includes('hotel_pickup')) {
            matchedPickupIds.push('hotel_pickup');
          }
        }
      }

      // Fallback to city-based filtering if no location match and fallback is enabled
      if (!isMatched && fallbackToCity) {
        const cityMatch = this.matchesCityForRegion(product, targetRegion);
        if (cityMatch) {
          isMatched = true;
        }
      }

      // For products with no pickup locations detected, include them for broader regions
      if (!isMatched && productPickupLocations.length === 0) {
        // Include products without clear pickup locations for hotel pickup regions
        if (targetRegion === PickupRegion.YOUR_HOTEL_ACCOMMODATION) {
          isMatched = true;
        }
        // Or if city fallback found a match based on location address
        else if (fallbackToCity && this.matchesCityForRegion(product, targetRegion)) {
          isMatched = true;
        }
      }

      if (isMatched) {
        filteredProducts.push(product);
      }
    });

    const unmatchedProducts = products.length - filteredProducts.length;
    const accuracy = this.calculateAccuracy(matchedPickupIds.length, filteredProducts.length, unmatchedProducts);

    return {
      filteredProducts,
      filterStats: {
        totalProducts: products.length,
        filteredCount: filteredProducts.length,
        region: PICKUP_REGIONS[targetRegion]?.displayName || region,
        filteringMethod: matchedPickupIds.length > 0 ? 'location_based' : (fallbackToCity ? 'city_fallback' : 'location_based'),
        accuracy,
        matchedPickupIds,
        unmatchedProducts
      }
    };
  }

  /**
   * Check if a single product belongs to a region
   */
  static hasProductFromRegion(
    product: RezdyProduct,
    region: string
  ): { hasRegion: boolean; method: 'location_match' | 'city_fallback' | 'none'; confidence: 'high' | 'medium' | 'low' } {
    const targetRegion = normalizeRegion(region);
    
    if (targetRegion === PickupRegion.ALL) {
      return { hasRegion: true, method: 'location_match', confidence: 'high' };
    }

    // Use PickupLocationService to extract pickup locations
    const productPickupLocations = PickupLocationService.extractPickupLocations(product);
    const targetLocations = this.REGION_TO_LOCATION_MAP[targetRegion] || [];

    // Check for direct location matches
    for (const productLocation of productPickupLocations) {
      if (targetLocations.includes(productLocation)) {
        return { hasRegion: true, method: 'location_match', confidence: 'high' };
      }
    }

    // Special case for hotel accommodation
    if (targetRegion === PickupRegion.YOUR_HOTEL_ACCOMMODATION && productPickupLocations.length > 0) {
      return { hasRegion: true, method: 'location_match', confidence: 'high' };
    }

    // Fallback to city-based matching
    if (this.matchesCityForRegion(product, targetRegion)) {
      return { hasRegion: true, method: 'city_fallback', confidence: 'medium' };
    }

    return { hasRegion: false, method: 'none', confidence: 'low' };
  }

  /**
   * Get region summary for all products
   */
  static getRegionSummary(products: RezdyProduct[]): {
    regions: Array<{
      region: string;
      displayName: string;
      productCount: number;
      hasDirectMapping: boolean;
      accuracy: 'high' | 'medium' | 'low';
    }>;
    totalProcessed: number;
    directMappingCoverage: number;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  } {
    const regionStats = new Map<PickupRegion, {
      productCount: number;
      directMappings: number;
      fallbackMappings: number;
    }>();

    // Initialize all regions
    Object.values(PickupRegion).forEach(region => {
      if (region !== PickupRegion.ALL) {
        regionStats.set(region, { productCount: 0, directMappings: 0, fallbackMappings: 0 });
      }
    });

    // Count products per region
    products.forEach(product => {
      Object.values(PickupRegion).forEach(region => {
        if (region !== PickupRegion.ALL) {
          const result = this.hasProductFromRegion(product, region);
          if (result.hasRegion) {
            const stats = regionStats.get(region)!;
            stats.productCount++;
            if (result.method === 'location_match') {
              stats.directMappings++;
            } else {
              stats.fallbackMappings++;
            }
          }
        }
      });
    });

    // Calculate metrics
    let totalDirectMappings = 0;
    let totalProducts = 0;

    const regions = Array.from(regionStats.entries()).map(([region, stats]) => {
      totalDirectMappings += stats.directMappings;
      totalProducts += stats.productCount;
      
      const accuracy: 'high' | 'medium' | 'low' = 
        stats.directMappings > stats.fallbackMappings ? 'high' :
        stats.directMappings > 0 ? 'medium' : 'low';

      return {
        region,
        displayName: PICKUP_REGIONS[region].displayName,
        productCount: stats.productCount,
        hasDirectMapping: stats.directMappings > 0,
        accuracy
      };
    });

    const directMappingCoverage = totalProducts > 0 ? (totalDirectMappings / totalProducts) * 100 : 0;
    
    let dataQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
    if (directMappingCoverage >= 80) {
      dataQuality = 'excellent';
    } else if (directMappingCoverage >= 60) {
      dataQuality = 'good';
    } else if (directMappingCoverage >= 30) {
      dataQuality = 'fair';
    }

    return {
      regions,
      totalProcessed: products.length,
      directMappingCoverage,
      dataQuality
    };
  }

  /**
   * Get all available regions
   */
  static getSupportedRegions(): string[] {
    return REGION_OPTIONS.map(option => option.value);
  }

  /**
   * Get region display options for UI components
   */
  static getRegionOptions() {
    return REGION_OPTIONS;
  }

  /**
   * Validate region filter configuration
   */
  static validateConfiguration(): {
    isValid: boolean;
    issues: string[];
    supportedRegions: number;
    mappedPickupIds: number;
  } {
    const issues: string[] = [];
    
    // Check if we have pickup ID mappings
    const mappedPickupIds = Object.keys(PICKUP_ID_TO_REGION).length;
    if (mappedPickupIds === 0) {
      issues.push('No pickup ID to region mappings defined');
    }

    // Check if all regions have pickup IDs
    Object.values(PickupRegion).forEach(region => {
      if (region !== PickupRegion.ALL) {
        const pickupIds = getPickupIdsForRegion(region);
        if (pickupIds.length === 0) {
          issues.push(`Region ${region} has no pickup IDs assigned`);
        }
      }
    });

    // Check for overlapping pickup IDs (should not happen but good to validate)
    const allPickupIds = Object.keys(PICKUP_ID_TO_REGION);
    const uniquePickupIds = new Set(allPickupIds);
    if (allPickupIds.length !== uniquePickupIds.size) {
      issues.push('Duplicate pickup ID mappings detected');
    }

    return {
      isValid: issues.length === 0,
      issues,
      supportedRegions: Object.values(PickupRegion).length - 1, // Exclude ALL
      mappedPickupIds
    };
  }

  /**
   * Get pickup region mappings for debugging/admin purposes
   */
  static getPickupRegionMappings(): PickupRegionMapping[] {
    return Object.entries(PICKUP_ID_TO_REGION).map(([pickupId, region]) => {
      const regionInfo = PICKUP_REGIONS[region];
      const pickupIdNum = isNaN(Number(pickupId)) ? pickupId : Number(pickupId);
      
      // Find locations for this pickup ID
      const locations = regionInfo.locations.filter(loc => 
        loc.pickupId === pickupIdNum || loc.pickupId.toString() === pickupId
      ).map(loc => ({
        time: loc.time,
        location: loc.location,
        address: loc.address,
        status: loc.status,
        productCount: loc.products
      }));

      return {
        pickupId: pickupIdNum,
        region,
        displayName: regionInfo.displayName,
        locations
      };
    });
  }

  /**
   * Private helper methods
   */

  /**
   * Extract pickup locations using PickupLocationService
   * @deprecated - Use PickupLocationService.extractPickupLocations() directly instead
   */
  private static extractPickupIdFromLocation(location: string): number | string | null {
    // This method is deprecated in favor of PickupLocationService
    // Keeping for backward compatibility but it now returns null
    return null;
  }

  /**
   * Fallback city-based matching for regions
   */
  private static matchesCityForRegion(product: RezdyProduct, region: PickupRegion): boolean {
    // Map regions to expected city names
    const regionToCityMap: Record<PickupRegion, string[]> = {
      [PickupRegion.BRISBANE]: ['Brisbane', 'South Brisbane', 'Kangaroo Point'],
      [PickupRegion.YOUR_HOTEL_ACCOMMODATION]: ['Brisbane', 'Gold Coast', 'Surfers Paradise', 'Broadbeach', 'Main Beach', 'Tamborine Mountain'],
      [PickupRegion.BRISBANE_CITY_LOOP]: ['Brisbane', 'South Brisbane', 'Brisbane City'],
      [PickupRegion.GOLD_COAST]: ['Gold Coast', 'Surfers Paradise', 'Broadbeach', 'Main Beach'],
      [PickupRegion.TAMBORINE_MOUNTAIN]: ['Tamborine Mountain', 'Mount Tamborine', 'Mt Tamborine'],
      [PickupRegion.ALL]: []
    };

    const expectedCities = regionToCityMap[region] || [];
    if (expectedCities.length === 0) return false;

    // Check city in locationAddress
    if (product.locationAddress) {
      const city = typeof product.locationAddress === 'string' 
        ? product.locationAddress 
        : product.locationAddress.city;
      
      if (city) {
        return expectedCities.some(expectedCity => 
          city.toLowerCase().includes(expectedCity.toLowerCase())
        );
      }
    }

    // Check pickup locations for city names
    const allLocations = [
      ...(product.pickupLocations || []),
      ...(product.departsFrom || []),
      ...(product.primaryPickupLocation ? [product.primaryPickupLocation] : [])
    ];

    return allLocations.some(location => 
      expectedCities.some(expectedCity => 
        location.toLowerCase().includes(expectedCity.toLowerCase())
      )
    );
  }

  /**
   * Calculate accuracy based on matching metrics
   */
  private static calculateAccuracy(
    directMatches: number,
    totalFiltered: number,
    unmatchedProducts: number
  ): 'high' | 'medium' | 'low' {
    if (totalFiltered === 0) return 'low';
    
    const directMatchRatio = directMatches / totalFiltered;
    const unmatchedRatio = unmatchedProducts / (totalFiltered + unmatchedProducts);

    if (directMatchRatio >= 0.8 && unmatchedRatio <= 0.1) {
      return 'high';
    } else if (directMatchRatio >= 0.5 && unmatchedRatio <= 0.3) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}