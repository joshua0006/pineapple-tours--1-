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

export class RegionFilterService {
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

    // Filter products by pickup locations that match the region
    products.forEach(product => {
      let isMatched = false;

      // Check if product has pickup locations
      if (product.pickupLocations && product.pickupLocations.length > 0) {
        // Check each pickup location against target region
        for (const pickupLocation of product.pickupLocations) {
          // Try to extract pickup ID from the pickup location string
          const pickupId = this.extractPickupIdFromLocation(pickupLocation);
          if (pickupId && isPickupIdInRegion(pickupId, targetRegion)) {
            isMatched = true;
            if (!matchedPickupIds.includes(pickupId)) {
              matchedPickupIds.push(pickupId);
            }
            break;
          }
        }
      }

      // Check primary pickup location
      if (!isMatched && product.primaryPickupLocation) {
        const pickupId = this.extractPickupIdFromLocation(product.primaryPickupLocation);
        if (pickupId && isPickupIdInRegion(pickupId, targetRegion)) {
          isMatched = true;
          if (!matchedPickupIds.includes(pickupId)) {
            matchedPickupIds.push(pickupId);
          }
        }
      }

      // Check departsFrom locations
      if (!isMatched && product.departsFrom && product.departsFrom.length > 0) {
        for (const departLocation of product.departsFrom) {
          const pickupId = this.extractPickupIdFromLocation(departLocation);
          if (pickupId && isPickupIdInRegion(pickupId, targetRegion)) {
            isMatched = true;
            if (!matchedPickupIds.includes(pickupId)) {
              matchedPickupIds.push(pickupId);
            }
            break;
          }
        }
      }

      // Fallback to city-based filtering if no pickup ID match and fallback is enabled
      if (!isMatched && fallbackToCity) {
        const cityMatch = this.matchesCityForRegion(product, targetRegion);
        if (cityMatch) {
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
        filteringMethod: matchedPickupIds.length > 0 ? 'region_based' : (fallbackToCity ? 'city_fallback' : 'region_based'),
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
  ): { hasRegion: boolean; method: 'pickup_id' | 'city_fallback' | 'none'; confidence: 'high' | 'medium' | 'low' } {
    const targetRegion = normalizeRegion(region);
    
    if (targetRegion === PickupRegion.ALL) {
      return { hasRegion: true, method: 'pickup_id', confidence: 'high' };
    }

    // Check pickup locations for matching pickup IDs
    const pickupLocations = [
      ...(product.pickupLocations || []),
      ...(product.departsFrom || []),
      ...(product.primaryPickupLocation ? [product.primaryPickupLocation] : [])
    ];

    for (const location of pickupLocations) {
      const pickupId = this.extractPickupIdFromLocation(location);
      if (pickupId && isPickupIdInRegion(pickupId, targetRegion)) {
        return { hasRegion: true, method: 'pickup_id', confidence: 'high' };
      }
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
            if (result.method === 'pickup_id') {
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
   * Extract pickup ID from location string
   * This method attempts to find pickup IDs in various formats within location strings
   */
  private static extractPickupIdFromLocation(location: string): number | string | null {
    if (!location) return null;

    // Common patterns for pickup IDs in location strings
    const patterns = [
      /pickup[_\s]*id[:\s]*(\d+)/i,
      /id[:\s]*(\d+)/i,
      /\b(\d{4,5})\b/, // 4-5 digit numbers (common pickup ID format)
      /#(\d+)/,
      /\((\d+)\)/,
    ];

    for (const pattern of patterns) {
      const match = location.match(pattern);
      if (match && match[1]) {
        const id = parseInt(match[1]);
        // Validate that this is a known pickup ID
        if (PICKUP_ID_TO_REGION[id]) {
          return id;
        }
      }
    }

    // Check for string-based pickup IDs (like "5885/5884/5886")
    const stringIds = ['5885/5884/5886', '2114/26037'];
    for (const stringId of stringIds) {
      if (location.includes(stringId) || location.includes(stringId.replace('/', '-'))) {
        return stringId;
      }
    }

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