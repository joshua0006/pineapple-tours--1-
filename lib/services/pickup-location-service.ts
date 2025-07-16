import { RezdyProduct, RezdyAddress } from '@/lib/types/rezdy';

/**
 * Service for extracting, normalizing, and managing pickup locations from Rezdy products
 */
export class PickupLocationService {
  // Main pickup locations we support
  private static readonly SUPPORTED_LOCATIONS = ['Brisbane', 'Gold Coast', 'Brisbane Loop'];
  
  // Location name normalization mappings
  private static readonly LOCATION_MAPPINGS: Record<string, string> = {
    'brisbane': 'Brisbane',
    'brisbane city': 'Brisbane',
    'brisbane cbd': 'Brisbane',
    'brisbane marriott': 'Brisbane',
    'marriott': 'Brisbane',
    '1 howard st': 'Brisbane',
    'howard street': 'Brisbane',
    'royal on the park': 'Brisbane',
    '152 alice st': 'Brisbane',
    'alice street': 'Brisbane',
    'emporium southbank': 'Brisbane',
    '267 grey st': 'Brisbane',
    'grey street': 'Brisbane',
    'gold coast': 'Gold Coast',
    'the gold coast': 'Gold Coast',
    'goldcoast': 'Gold Coast',
    'star casino': 'Gold Coast',
    'the star casino': 'Gold Coast',
    '1 casino dr': 'Gold Coast',
    'casino drive': 'Gold Coast',
    'broadbeach': 'Gold Coast',
    'voco gold coast': 'Gold Coast',
    '31 hamilton ave': 'Gold Coast',
    'hamilton avenue': 'Gold Coast',
    'surfers paradise': 'Gold Coast',
    'sheraton grand mirage': 'Gold Coast',
    '71 seaworld dr': 'Gold Coast',
    'seaworld drive': 'Gold Coast',
    'main beach': 'Gold Coast',
    'brisbane loop': 'Brisbane Loop',
    'brisbane city loop': 'Brisbane Loop',
    'city loop': 'Brisbane Loop',
    'loop': 'Brisbane Loop',
    'southbank': 'Brisbane Loop',
    '267 grey st south brisbane': 'Brisbane Loop',
    'petrie terrace': 'Brisbane Loop',
    'sexton st': 'Brisbane Loop',
    'roma st': 'Brisbane Loop',
    'windmill cafe': 'Brisbane Loop',
    'anzac square': 'Brisbane Loop',
    'no 1 anzac square': 'Brisbane Loop',
    '295 ann st': 'Brisbane Loop',
    'ann street': 'Brisbane Loop',
    'howard smith wharves': 'Brisbane Loop',
    '7 boundary st': 'Brisbane Loop',
    'boundary street': 'Brisbane Loop',
    'kangaroo point': 'Brisbane Loop',
    'kangaroo point cliffs': 'Brisbane Loop',
    '66 river terrace': 'Brisbane Loop',
    'river terrace': 'Brisbane Loop',
  };

  // Patterns for extracting pickup locations from text
  private static readonly PICKUP_PATTERNS = [
    /from\s+([^,.]+?)(?:\s+to|\s+for|\s+with|\s*[-–]|\s*$)/gi,
    /departing\s+from\s+([^,.]+?)(?:\s+to|\s+for|\s+with|\s*[-–]|\s*$)/gi,
    /departs?\s+from\s+([^,.]+?)(?:\s+to|\s+for|\s+with|\s*[-–]|\s*$)/gi,
    /pickup\s+from\s+([^,.]+?)(?:\s+to|\s+for|\s+with|\s*[-–]|\s*$)/gi,
    /pick\s+up\s+from\s+([^,.]+?)(?:\s+to|\s+for|\s+with|\s*[-–]|\s*$)/gi,
    /collection\s+from\s+([^,.]+?)(?:\s+to|\s+for|\s+with|\s*[-–]|\s*$)/gi,
  ];

  /**
   * Extract all pickup locations from a product
   */
  static extractPickupLocations(product: RezdyProduct): string[] {
    const locations = new Set<string>();

    // 1. Check structured location data
    if (product.locationAddress) {
      const location = this.extractLocationFromAddress(product.locationAddress);
      if (location) {
        const normalized = this.normalizeLocation(location);
        if (normalized && this.isSupportedLocation(normalized)) {
          locations.add(normalized);
        }
      }
    }

    // 2. Extract from product name and descriptions
    const textToSearch = [
      product.name || '',
      product.shortDescription || '',
      product.description || ''
    ].join(' ');

    // Look for pickup patterns
    for (const pattern of this.PICKUP_PATTERNS) {
      const matches = textToSearch.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const location = match[1].trim();
          const normalized = this.normalizeLocation(location);
          if (normalized && this.isSupportedLocation(normalized)) {
            locations.add(normalized);
          }
        }
      }
    }

    // 3. Check for direct location mentions in specific contexts
    const lowerText = textToSearch.toLowerCase();
    for (const location of this.SUPPORTED_LOCATIONS) {
      const lowerLocation = location.toLowerCase();
      
      // Check various context patterns
      const contextPatterns = [
        `from ${lowerLocation}`,
        `depart ${lowerLocation}`,
        `departing ${lowerLocation}`,
        `pickup ${lowerLocation}`,
        `pick up ${lowerLocation}`,
        `collection ${lowerLocation}`,
        `${lowerLocation} pickup`,
        `${lowerLocation} departure`,
      ];

      if (contextPatterns.some(pattern => lowerText.includes(pattern))) {
        locations.add(location);
      }
    }

    return Array.from(locations);
  }

  /**
   * Extract location from RezdyAddress
   */
  private static extractLocationFromAddress(address: string | RezdyAddress): string | null {
    if (typeof address === 'string') {
      return address;
    }
    
    if (address && typeof address === 'object') {
      // Priority: city > addressLine > state
      return address.city || address.addressLine || address.state || null;
    }
    
    return null;
  }

  /**
   * Normalize location name to standard format
   */
  static normalizeLocation(location: string): string | null {
    if (!location) return null;
    
    const trimmed = location.trim().toLowerCase();
    
    // Special handling for Brisbane Loop keywords (check these first)
    const loopKeywords = [
      'southbank', 'petrie terrace', 'anzac square', 'howard smith wharves', 
      'kangaroo point', 'kangaroo point cliffs', 'loop', 'city loop',
      '267 grey st south brisbane', 'sexton st', 'roma st', 'windmill cafe',
      'no 1 anzac square', '295 ann st', '7 boundary st', '66 river terrace'
    ];
    
    if (loopKeywords.some(keyword => trimmed.includes(keyword))) {
      return 'Brisbane Loop';
    }
    
    // Check direct mappings
    for (const [key, value] of Object.entries(this.LOCATION_MAPPINGS)) {
      if (trimmed === key || trimmed.includes(key)) {
        return value;
      }
    }
    
    // Check if it contains any of our supported locations
    // Note: Brisbane check should come after loop keywords to avoid misclassification
    for (const supportedLocation of this.SUPPORTED_LOCATIONS) {
      if (supportedLocation !== 'Brisbane Loop' && trimmed.includes(supportedLocation.toLowerCase())) {
        return supportedLocation;
      }
    }
    
    return null;
  }

  /**
   * Check if a location is one of our supported pickup locations
   */
  static isSupportedLocation(location: string): boolean {
    const normalized = this.normalizeLocation(location);
    return normalized !== null && this.SUPPORTED_LOCATIONS.includes(normalized);
  }

  /**
   * Check if a product has pickup from a specific location
   */
  static hasPickupFromLocation(product: RezdyProduct, location: string): boolean {
    const normalizedTarget = this.normalizeLocation(location);
    if (!normalizedTarget) return false;

    const productLocations = this.extractPickupLocations(product);
    return productLocations.includes(normalizedTarget);
  }

  /**
   * Get primary pickup location for a product (first detected supported location)
   */
  static getPrimaryPickupLocation(product: RezdyProduct): string | null {
    const locations = this.extractPickupLocations(product);
    return locations.length > 0 ? locations[0] : null;
  }

  /**
   * Filter products by pickup location
   */
  static filterProductsByPickupLocation(
    products: RezdyProduct[],
    location: string
  ): RezdyProduct[] {
    if (!location || location === 'all') {
      return products;
    }

    return products.filter(product => 
      this.hasPickupFromLocation(product, location)
    );
  }

  /**
   * Get all unique pickup locations from a list of products
   */
  static getUniquePickupLocations(products: RezdyProduct[]): string[] {
    const allLocations = new Set<string>();
    
    for (const product of products) {
      const locations = this.extractPickupLocations(product);
      locations.forEach(loc => allLocations.add(loc));
    }
    
    // Return in our preferred order
    return this.SUPPORTED_LOCATIONS.filter(loc => allLocations.has(loc));
  }

  /**
   * Get pickup location statistics for products
   */
  static getPickupLocationStats(products: RezdyProduct[]): Record<string, number> {
    const stats: Record<string, number> = {};
    
    // Initialize with zeros
    for (const location of this.SUPPORTED_LOCATIONS) {
      stats[location] = 0;
    }
    
    // Count products per location
    for (const product of products) {
      const locations = this.extractPickupLocations(product);
      for (const location of locations) {
        if (stats[location] !== undefined) {
          stats[location]++;
        }
      }
    }
    
    return stats;
  }
}