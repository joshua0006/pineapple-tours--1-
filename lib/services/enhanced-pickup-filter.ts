import { RezdyProduct, RezdyPickupLocation } from '@/lib/types/rezdy';
import { PickupLocationService } from './pickup-location-service';
import { PickupStorage } from './pickup-storage';

/**
 * Enhanced pickup filtering service that combines real Rezdy API pickup data
 * with fallback text-based extraction for comprehensive product filtering
 */
export class EnhancedPickupFilter {
  private static readonly SUPPORTED_LOCATIONS = ['Brisbane', 'Gold Coast', 'Brisbane Loop'];
  
  // Simplified memory cache for client-side performance only
  private static pickupCache = new Map<string, {
    data: RezdyPickupLocation[];
    timestamp: number;
  }>();
  
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes - shorter since file storage handles persistence

  /**
   * Filter products by pickup location using enhanced data sources
   */
  static async filterProductsByPickupLocation(
    products: RezdyProduct[],
    location: string,
    useApiData = true
  ): Promise<{
    filteredProducts: RezdyProduct[];
    filterStats: {
      totalProducts: number;
      filteredCount: number;
      apiDataUsed: number;
      fallbackUsed: number;
      location: string;
    };
  }> {
    if (!location || location === 'all') {
      return {
        filteredProducts: products,
        filterStats: {
          totalProducts: products.length,
          filteredCount: products.length,
          apiDataUsed: 0,
          fallbackUsed: 0,
          location: 'all',
        },
      };
    }

    const normalizedLocation = PickupLocationService.normalizeLocation(location);
    if (!normalizedLocation) {
      return {
        filteredProducts: [],
        filterStats: {
          totalProducts: products.length,
          filteredCount: 0,
          apiDataUsed: 0,
          fallbackUsed: 0,
          location,
        },
      };
    }

    const filteredProducts: RezdyProduct[] = [];
    let apiDataUsed = 0;
    let fallbackUsed = 0;

    // Process each product
    for (const product of products) {
      const hasPickup = await this.productHasPickupFromLocation(
        product,
        normalizedLocation,
        useApiData
      );

      if (hasPickup.hasPickup) {
        filteredProducts.push(product);
        if (hasPickup.usedApiData) {
          apiDataUsed++;
        } else {
          fallbackUsed++;
        }
      }
    }

    return {
      filteredProducts,
      filterStats: {
        totalProducts: products.length,
        filteredCount: filteredProducts.length,
        apiDataUsed,
        fallbackUsed,
        location: normalizedLocation,
      },
    };
  }

  /**
   * Check if a product has pickup from a specific location using enhanced data sources
   */
  static async productHasPickupFromLocation(
    product: RezdyProduct,
    location: string,
    useApiData = true
  ): Promise<{ hasPickup: boolean; usedApiData: boolean }> {
    const normalizedLocation = PickupLocationService.normalizeLocation(location);
    if (!normalizedLocation) {
      return { hasPickup: false, usedApiData: false };
    }

    // Try API data first if enabled
    if (useApiData) {
      try {
        const apiPickupLocations = await this.getProductPickupLocations(product.productCode);
        
        if (apiPickupLocations.length > 0) {
          const hasApiPickup = apiPickupLocations.some(pickup => 
            this.pickupLocationMatches(pickup, normalizedLocation)
          );
          
          if (hasApiPickup) {
            return { hasPickup: true, usedApiData: true };
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch API pickup data for ${product.productCode}:`, error);
      }
    }

    // Fallback to text-based extraction
    const textBasedResult = PickupLocationService.hasPickupFromLocation(product, normalizedLocation);
    return { hasPickup: textBasedResult, usedApiData: false };
  }

  /**
   * Get pickup locations for a specific product using file storage
   * Falls back to API call if no stored data exists
   */
  static async getProductPickupLocations(productCode: string): Promise<RezdyPickupLocation[]> {
    try {
      // First, check if we can run server-side code (check if we're in Node.js environment)
      if (typeof window === 'undefined') {
        // Server-side: Use PickupStorage directly
        const storedPickups = await PickupStorage.loadPickupData(productCode);
        if (storedPickups !== null) {
          return storedPickups;
        }
        
        // No stored data, would need API client to fetch - for now return empty
        // The API route will handle fetching and storing
        return [];
      }
      
      // Client-side: Use API route with simplified memory cache
      const cacheKey = productCode;
      const cached = this.pickupCache.get(cacheKey);
      const now = Date.now();

      // Return cached data if valid
      if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
        return cached.data;
      }

      const response = await fetch(`/api/rezdy/products/${productCode}/pickups`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const pickupLocations: RezdyPickupLocation[] = data.pickups || [];

      // Cache the result
      this.pickupCache.set(cacheKey, {
        data: pickupLocations,
        timestamp: now,
      });

      return pickupLocations;
    } catch (error) {
      console.warn(`Failed to get pickup locations for ${productCode}:`, error);
      
      // Cache empty result briefly to avoid repeated failed requests
      if (typeof window !== 'undefined') {
        this.pickupCache.set(productCode, {
          data: [],
          timestamp: Date.now(),
        });
      }
      
      return [];
    }
  }

  /**
   * Check if a pickup location matches the target location
   */
  private static pickupLocationMatches(pickup: RezdyPickupLocation, targetLocation: string): boolean {
    if (!pickup.locationName) return false;

    // Combine all available text for comprehensive matching
    const searchText = [
      pickup.locationName || '',
      pickup.address || '',
      pickup.additionalInstructions || ''
    ].join(' ').toLowerCase().trim();

    const target = targetLocation.toLowerCase();
    
    // Use the detailed mapping from pickup-location-utils
    const PICKUP_LOCATION_MAPPING = {
      'brisbane': {
        keywords: [
          'brisbane marriott', '1 howard st', 'howard street',
          'royal on the park', '152 alice st', 'alice street',
          'emporium southbank', '267 grey st', 'grey street',
          'marriott', 'royal on park', 'emporium'
        ],
        excludeKeywords: [
          'loop', 'city loop', 'south brisbane'
        ]
      },
      'gold coast': {
        keywords: [
          'star casino', 'the star casino', '1 casino dr', 'casino drive', 'broadbeach',
          'voco gold coast', '31 hamilton ave', 'hamilton avenue',
          'sheraton grand mirage', '71 seaworld dr', 'seaworld drive',
          'surfers paradise', 'main beach'
        ],
        excludeKeywords: []
      },
      'brisbane loop': {
        keywords: [
          // Southbank stop
          '267 grey st south brisbane', 'southbank grey st', 'southbank',
          // Petrie Terrace stop
          'petrie terrace', 'sexton st', 'roma st', 'windmill cafe',
          // Anzac Square stop
          'anzac square', 'no 1 anzac square', '295 ann st', 'ann street brisbane',
          // Howard Smith Wharves stop
          'howard smith wharves', '7 boundary st', 'boundary street',
          // Kangaroo Point stop
          'kangaroo point', 'kangaroo point cliffs', '66 river terrace', 'river terrace',
          // General loop identifiers
          'city loop', 'brisbane loop', 'loop tour'
        ],
        excludeKeywords: []
      }
    };

    const mapping = PICKUP_LOCATION_MAPPING[target as keyof typeof PICKUP_LOCATION_MAPPING];
    
    if (mapping) {
      // Check exclude keywords first
      const hasExcludeKeywords = mapping.excludeKeywords.some(keyword => 
        searchText.includes(keyword.toLowerCase())
      );
      
      if (hasExcludeKeywords && target !== 'brisbane loop') {
        return false;
      }

      // Check for matching keywords
      const hasMatchingKeywords = mapping.keywords.some(keyword => 
        searchText.includes(keyword.toLowerCase())
      );
      
      if (hasMatchingKeywords) {
        return true;
      }
    }
    
    // Fallback to existing logic for backward compatibility
    const pickupName = pickup.locationName.toLowerCase();
    
    // Direct match
    if (pickupName.includes(target) || target.includes(pickupName)) {
      return true;
    }

    // Check address if available
    if (pickup.address) {
      const address = pickup.address.toLowerCase();
      if (address.includes(target) || target.includes(address.split(',')[0])) {
        return true;
      }
    }

    // Normalize and check again
    const normalizedPickup = PickupLocationService.normalizeLocation(pickup.locationName);
    const normalizedTarget = PickupLocationService.normalizeLocation(targetLocation);
    
    return normalizedPickup === normalizedTarget;
  }

  /**
   * Get aggregate pickup location data across all products
   */
  static async getAggregatePickupData(
    products: RezdyProduct[],
    useApiData = true
  ): Promise<{
    locations: Array<{
      location: string;
      productCount: number;
      hasApiData: boolean;
    }>;
    totalProcessed: number;
    apiDataAvailable: number;
  }> {
    const locationStats = new Map<string, { count: number; hasApiData: boolean }>();
    let totalProcessed = 0;
    let apiDataAvailable = 0;

    for (const product of products) {
      totalProcessed++;
      
      // Try to get API data first
      let productLocations: string[] = [];
      let hasApiData = false;

      if (useApiData) {
        try {
          const apiPickups = await this.getProductPickupLocations(product.productCode);
          if (apiPickups.length > 0) {
            hasApiData = true;
            apiDataAvailable++;
            
            // Extract and normalize API pickup locations
            productLocations = apiPickups
              .map(pickup => PickupLocationService.normalizeLocation(pickup.locationName))
              .filter(Boolean) as string[];
          }
        } catch (error) {
          console.warn(`Failed to get API data for ${product.productCode}:`, error);
        }
      }

      // Fallback to text extraction if no API data
      if (productLocations.length === 0) {
        productLocations = PickupLocationService.extractPickupLocations(product);
      }

      // Update location stats
      for (const location of productLocations) {
        const existing = locationStats.get(location) || { count: 0, hasApiData: false };
        locationStats.set(location, {
          count: existing.count + 1,
          hasApiData: existing.hasApiData || hasApiData,
        });
      }
    }

    // Convert to array and sort by product count
    const locations = Array.from(locationStats.entries())
      .map(([location, stats]) => ({
        location,
        productCount: stats.count,
        hasApiData: stats.hasApiData,
      }))
      .filter(item => this.SUPPORTED_LOCATIONS.includes(item.location))
      .sort((a, b) => b.productCount - a.productCount);

    return {
      locations,
      totalProcessed,
      apiDataAvailable,
    };
  }

  /**
   * Preload pickup data for products to improve filtering performance
   */
  static async preloadPickupData(productCodes: string[]): Promise<void> {
    const promises = productCodes.map(code => this.getProductPickupLocations(code));
    
    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.warn('Some pickup data preloading failed:', error);
    }
  }

  /**
   * Clear cache for specific product or all products
   */
  static clearCache(productCode?: string): void {
    if (productCode) {
      this.pickupCache.delete(productCode);
    } else {
      this.pickupCache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number;
    entries: Array<{
      productCode: string;
      age: number;
      dataSize: number;
    }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.pickupCache.entries()).map(([productCode, data]) => ({
      productCode,
      age: now - data.timestamp,
      dataSize: data.data.length,
    }));

    return {
      size: this.pickupCache.size,
      entries,
    };
  }
}