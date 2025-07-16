import fs from 'fs';
import path from 'path';
import { RezdyPickupLocation } from '@/lib/types/rezdy';

interface IndexedPickupData {
  productCode: string;
  pickups: RezdyPickupLocation[];
  locationMappings: string[]; // Normalized location names that this product serves
  hasPickupData: boolean;
  lastAccessed?: string;
  accessCount?: number;
}

interface LocalPickupIndex {
  products: Map<string, IndexedPickupData>;
  locationIndex: Map<string, string[]>; // location -> product codes
  totalProducts: number;
  productsWithPickups: number;
  lastUpdated: string;
}

/**
 * Local pickup data indexing service for fast filtering operations
 * Loads all pickup data files into memory for optimal performance
 */
export class LocalPickupIndexService {
  private static index: LocalPickupIndex | null = null;
  private static readonly PICKUP_DIR = path.join(process.cwd(), 'data', 'pickups');
  private static readonly SUPPORTED_LOCATIONS = ['Brisbane', 'Gold Coast', 'Brisbane Loop'];
  
  // Location mapping for normalization
  private static readonly LOCATION_MAPPINGS: Record<string, string> = {
    // Brisbane mappings
    'brisbane marriott': 'Brisbane',
    'marriott': 'Brisbane',
    'howard st': 'Brisbane', 
    'royal on the park': 'Brisbane',
    'alice st': 'Brisbane',
    'alice street': 'Brisbane',
    'emporium southbank': 'Brisbane',
    'grey st': 'Brisbane',
    'grey street': 'Brisbane',
    
    // Gold Coast mappings  
    'sheraton grand mirage': 'Gold Coast',
    'sheraton': 'Gold Coast',
    'seaworld dr': 'Gold Coast',
    'main beach': 'Gold Coast',
    'star casino': 'Gold Coast',
    'the star casino': 'Gold Coast',
    'star gold coast': 'Gold Coast',
    'casino dr': 'Gold Coast',
    'broadbeach': 'Gold Coast',
    'voco gold coast': 'Gold Coast',
    'voco': 'Gold Coast',
    'hamilton ave': 'Gold Coast',
    'surfers paradise': 'Gold Coast',
    
    // Brisbane Loop mappings
    'southbank': 'Brisbane Loop',
    'grey st south brisbane': 'Brisbane Loop',
    'petrie terrace': 'Brisbane Loop',
    'sexton st': 'Brisbane Loop',
    'roma st': 'Brisbane Loop',
    'windmill cafe': 'Brisbane Loop',
    'anzac square': 'Brisbane Loop',
    'ann st': 'Brisbane Loop',
    'ann street': 'Brisbane Loop',
    'howard smith wharves': 'Brisbane Loop',
    'boundary st': 'Brisbane Loop',
    'boundary street': 'Brisbane Loop',
    'kangaroo point': 'Brisbane Loop',
    'river terrace': 'Brisbane Loop',
    'kangaroo point cliffs': 'Brisbane Loop',
  };

  /**
   * Initialize and build the local pickup data index
   * Server-side only - returns empty index when called from browser
   */
  static async buildIndex(): Promise<LocalPickupIndex> {
    // Environment check - only run on server side
    if (typeof window !== 'undefined') {
      console.warn('LocalPickupIndexService.buildIndex() called from browser context, returning empty index');
      return this.createEmptyIndex();
    }

    console.log('Building local pickup data index...');
    const startTime = Date.now();
    
    const products = new Map<string, IndexedPickupData>();
    const locationIndex = new Map<string, string[]>();
    
    try {
      // Check if pickup directory exists
      if (!fs.existsSync(this.PICKUP_DIR)) {
        console.warn('Pickup data directory not found:', this.PICKUP_DIR);
        return this.createEmptyIndex();
      }

      // Read all pickup data files
      const files = await fs.promises.readdir(this.PICKUP_DIR);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      console.log(`Found ${jsonFiles.length} pickup data files`);
      
      let productsWithPickups = 0;
      
      for (const file of jsonFiles) {
        try {
          const filePath = path.join(this.PICKUP_DIR, file);
          const content = await fs.promises.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);
          
          const productCode = data.productCode || path.basename(file, '.json');
          const pickups: RezdyPickupLocation[] = data.pickups || [];
          const hasPickupData = pickups.length > 0;
          
          if (hasPickupData) {
            productsWithPickups++;
          }
          
          // Extract and normalize location mappings
          const locationMappings = this.extractLocationMappings(pickups);
          
          // Index product data
          products.set(productCode, {
            productCode,
            pickups,
            locationMappings,
            hasPickupData,
            lastAccessed: data.lastAccessed,
            accessCount: data.accessCount,
          });
          
          // Update location index
          for (const location of locationMappings) {
            if (!locationIndex.has(location)) {
              locationIndex.set(location, []);
            }
            locationIndex.get(location)!.push(productCode);
          }
          
        } catch (error) {
          console.warn(`Failed to process pickup file ${file}:`, error);
        }
      }
      
      const index: LocalPickupIndex = {
        products,
        locationIndex,
        totalProducts: products.size,
        productsWithPickups,
        lastUpdated: new Date().toISOString(),
      };
      
      this.index = index;
      
      const duration = Date.now() - startTime;
      console.log(`Pickup index built successfully:`, {
        totalProducts: products.size,
        productsWithPickups,
        locations: Array.from(locationIndex.keys()),
        buildTime: `${duration}ms`
      });
      
      return index;
      
    } catch (error) {
      console.error('Failed to build pickup index:', error);
      return this.createEmptyIndex();
    }
  }

  /**
   * Extract and normalize location mappings from pickup data
   */
  private static extractLocationMappings(pickups: RezdyPickupLocation[]): string[] {
    const locations = new Set<string>();
    
    for (const pickup of pickups) {
      const searchText = [
        pickup.locationName || '',
        pickup.address || '',
        pickup.additionalInstructions || ''
      ].join(' ').toLowerCase();
      
      // Check against location mappings
      for (const [keyword, location] of Object.entries(this.LOCATION_MAPPINGS)) {
        if (searchText.includes(keyword.toLowerCase())) {
          locations.add(location);
        }
      }
    }
    
    return Array.from(locations);
  }

  /**
   * Create empty index for fallback
   */
  private static createEmptyIndex(): LocalPickupIndex {
    return {
      products: new Map(),
      locationIndex: new Map(),
      totalProducts: 0,
      productsWithPickups: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get the current index (build if not exists)
   * Returns empty index when called from browser context
   */
  static async getIndex(): Promise<LocalPickupIndex> {
    // Environment check - only run on server side
    if (typeof window !== 'undefined') {
      console.warn('LocalPickupIndexService.getIndex() called from browser context, returning empty index');
      return this.createEmptyIndex();
    }

    if (!this.index) {
      this.index = await this.buildIndex();
    }
    return this.index;
  }

  /**
   * Get pickup data for a specific product
   */
  static async getProductPickupData(productCode: string): Promise<IndexedPickupData | null> {
    const index = await this.getIndex();
    return index.products.get(productCode) || null;
  }

  /**
   * Get all product codes that have pickup from a specific location
   */
  static async getProductsWithPickupFromLocation(location: string): Promise<string[]> {
    const index = await this.getIndex();
    
    // Normalize the location
    const normalizedLocation = this.normalizeLocationName(location);
    if (!normalizedLocation) {
      return [];
    }
    
    return index.locationIndex.get(normalizedLocation) || [];
  }

  /**
   * Filter product codes by pickup location using local index
   */
  static async filterProductCodesByLocation(
    productCodes: string[],
    location: string
  ): Promise<{
    filteredProducts: string[];
    stats: {
      totalProducts: number;
      filteredCount: number;
      hasLocalData: number;
      location: string;
    };
  }> {
    if (!location || location === 'all') {
      return {
        filteredProducts: productCodes,
        stats: {
          totalProducts: productCodes.length,
          filteredCount: productCodes.length,
          hasLocalData: 0,
          location: 'all',
        },
      };
    }

    const index = await this.getIndex();
    const normalizedLocation = this.normalizeLocationName(location);
    
    if (!normalizedLocation) {
      return {
        filteredProducts: [],
        stats: {
          totalProducts: productCodes.length,
          filteredCount: 0,
          hasLocalData: 0,
          location,
        },
      };
    }

    const validProducts = index.locationIndex.get(normalizedLocation) || [];
    const validProductSet = new Set(validProducts);
    
    const filteredProducts = productCodes.filter(code => validProductSet.has(code));
    const hasLocalData = filteredProducts.filter(code => index.products.has(code)).length;

    return {
      filteredProducts,
      stats: {
        totalProducts: productCodes.length,
        filteredCount: filteredProducts.length,
        hasLocalData,
        location: normalizedLocation,
      },
    };
  }

  /**
   * Check if a product has pickup from a specific location
   */
  static async hasProductPickupFromLocation(
    productCode: string,
    location: string
  ): Promise<{ hasPickup: boolean; hasLocalData: boolean; confidence: 'high' | 'low' }> {
    const index = await this.getIndex();
    const productData = index.products.get(productCode);
    
    if (!productData) {
      return { hasPickup: false, hasLocalData: false, confidence: 'low' };
    }
    
    const normalizedLocation = this.normalizeLocationName(location);
    if (!normalizedLocation) {
      return { hasPickup: false, hasLocalData: true, confidence: 'low' };
    }
    
    const hasPickup = productData.locationMappings.includes(normalizedLocation);
    
    return {
      hasPickup,
      hasLocalData: true,
      confidence: productData.hasPickupData ? 'high' : 'low',
    };
  }

  /**
   * Normalize location name using our mapping
   */
  private static normalizeLocationName(location: string): string | null {
    if (!location) return null;
    
    const trimmed = location.trim();
    
    // Direct match with supported locations
    if (this.SUPPORTED_LOCATIONS.includes(trimmed)) {
      return trimmed;
    }
    
    // Check mappings
    const lower = trimmed.toLowerCase();
    for (const [keyword, mappedLocation] of Object.entries(this.LOCATION_MAPPINGS)) {
      if (lower.includes(keyword)) {
        return mappedLocation;
      }
    }
    
    // Check if it contains any supported location name
    for (const supportedLocation of this.SUPPORTED_LOCATIONS) {
      if (lower.includes(supportedLocation.toLowerCase())) {
        return supportedLocation;
      }
    }
    
    return null;
  }

  /**
   * Get pickup location statistics
   */
  static async getLocationStats(): Promise<{
    totalProducts: number;
    productsWithPickups: number;
    locationCounts: Record<string, number>;
    coverage: number;
  }> {
    const index = await this.getIndex();
    
    const locationCounts: Record<string, number> = {};
    for (const location of this.SUPPORTED_LOCATIONS) {
      locationCounts[location] = index.locationIndex.get(location)?.length || 0;
    }
    
    const coverage = index.totalProducts > 0 
      ? (index.productsWithPickups / index.totalProducts) * 100 
      : 0;
    
    return {
      totalProducts: index.totalProducts,
      productsWithPickups: index.productsWithPickups,
      locationCounts,
      coverage,
    };
  }

  /**
   * Refresh the index (rebuild from files)
   */
  static async refreshIndex(): Promise<LocalPickupIndex> {
    this.index = null;
    return await this.buildIndex();
  }

  /**
   * Get index metadata
   */
  static async getIndexMetadata(): Promise<{
    isBuilt: boolean;
    lastUpdated: string | null;
    totalProducts: number;
    productsWithPickups: number;
    availableLocations: string[];
  }> {
    if (!this.index) {
      return {
        isBuilt: false,
        lastUpdated: null,
        totalProducts: 0,
        productsWithPickups: 0,
        availableLocations: [],
      };
    }
    
    return {
      isBuilt: true,
      lastUpdated: this.index.lastUpdated,
      totalProducts: this.index.totalProducts,
      productsWithPickups: this.index.productsWithPickups,
      availableLocations: Array.from(this.index.locationIndex.keys()),
    };
  }
}