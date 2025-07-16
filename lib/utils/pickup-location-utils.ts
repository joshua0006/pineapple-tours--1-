import { RezdyProduct } from '@/lib/types/rezdy';
import { PickupLocationService } from '@/lib/services/pickup-location-service';

/**
 * Utility functions for working with pickup locations
 * Enhanced with detailed pickup location mapping based on actual tour data
 */

// Detailed pickup location mapping based on actual tour pickup data
const PICKUP_LOCATION_MAPPING = {
  'Brisbane': {
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
  'Gold Coast': {
    keywords: [
      'star casino', 'the star casino', '1 casino dr', 'casino drive', 'broadbeach',
      'voco gold coast', '31 hamilton ave', 'hamilton avenue',
      'sheraton grand mirage', '71 seaworld dr', 'seaworld drive',
      'surfers paradise', 'main beach'
    ],
    excludeKeywords: []
  },
  'Brisbane Loop': {
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

/**
 * Enhanced pickup location matching using detailed address and location data
 */
function matchesDetailedPickupLocation(
  pickupData: any,
  targetLocation: string
): boolean {
  if (!pickupData || !targetLocation) return false;

  const mapping = PICKUP_LOCATION_MAPPING[targetLocation as keyof typeof PICKUP_LOCATION_MAPPING];
  if (!mapping) return false;

  // Combine location name and address for comprehensive matching
  const searchText = [
    pickupData.locationName || '',
    pickupData.address || '',
    pickupData.additionalInstructions || ''
  ].join(' ').toLowerCase().trim();

  if (!searchText) return false;

  // Check exclude keywords first
  const hasExcludeKeywords = mapping.excludeKeywords.some(keyword => 
    searchText.includes(keyword.toLowerCase())
  );
  
  if (hasExcludeKeywords && targetLocation !== 'Brisbane Loop') {
    return false;
  }

  // Check for matching keywords
  return mapping.keywords.some(keyword => 
    searchText.includes(keyword.toLowerCase())
  );
}

/**
 * Check if a product offers pickup from any of our supported locations
 */
export function hasPickupService(product: RezdyProduct): boolean {
  const locations = PickupLocationService.extractPickupLocations(product);
  return locations.length > 0;
}

/**
 * Enhanced pickup location extraction that uses actual pickup data files
 */
export async function getEnhancedPickupLocations(
  product: RezdyProduct
): Promise<string[]> {
  const locations: string[] = [];

  // Try to load pickup data from the data files
  try {
    // In a real implementation, you'd fetch this from the API or load the file
    // For now, we'll use the existing extraction as fallback
    const response = await fetch(`/api/rezdy/products/${product.productCode}/pickups`);
    
    if (response.ok) {
      const pickupData = await response.json();
      
      if (pickupData.pickups && Array.isArray(pickupData.pickups)) {
        // Check each pickup location against our detailed mapping
        for (const pickup of pickupData.pickups) {
          for (const locationName of Object.keys(PICKUP_LOCATION_MAPPING)) {
            if (matchesDetailedPickupLocation(pickup, locationName)) {
              if (!locations.includes(locationName)) {
                locations.push(locationName);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to load pickup data for ${product.productCode}:`, error);
  }

  // Fallback to existing text-based extraction if no locations found
  if (locations.length === 0) {
    return PickupLocationService.extractPickupLocations(product);
  }

  return locations;
}

/**
 * Get a display-friendly list of pickup locations for a product
 */
export function getPickupLocationsDisplay(product: RezdyProduct): string {
  const locations = product.pickupLocations || PickupLocationService.extractPickupLocations(product);
  
  if (locations.length === 0) {
    return 'No pickup available';
  }
  
  if (locations.length === 1) {
    return `Pickup from ${locations[0]}`;
  }
  
  if (locations.length === 2) {
    return `Pickup from ${locations[0]} and ${locations[1]}`;
  }
  
  // For 3 or more locations
  const lastLocation = locations[locations.length - 1];
  const otherLocations = locations.slice(0, -1).join(', ');
  return `Pickup from ${otherLocations}, and ${lastLocation}`;
}

/**
 * Get pickup badge data for UI display with enhanced location info
 */
export function getPickupBadgeData(product: RezdyProduct): { 
  text: string; 
  variant: 'default' | 'secondary' | 'outline';
  description?: string;
} | null {
  const locations = product.pickupLocations || PickupLocationService.extractPickupLocations(product);
  
  if (locations.length === 0) {
    return null;
  }
  
  if (locations.length === 1) {
    const location = locations[0];
    let description = '';
    
    // Add specific pickup details for each location
    switch (location) {
      case 'Brisbane':
        description = 'Hotels: Brisbane Marriott, Royal on the Park, Emporium Southbank';
        break;
      case 'Gold Coast':
        description = 'Hotels: The Star Casino, Voco Gold Coast, Sheraton Grand Mirage';
        break;
      case 'Brisbane Loop':
        description = '5 stops: Southbank, Petrie Terrace, No 1 Anzac Square, Howard Smith Wharves, Kangaroo Point Cliffs';
        break;
    }
    
    return {
      text: `From ${location}`,
      variant: 'default',
      description
    };
  }
  
  return {
    text: `${locations.length} pickup locations`,
    variant: 'secondary',
    description: locations.join(', ')
  };
}

/**
 * Sort products by pickup location relevance
 */
export function sortByPickupRelevance(
  products: RezdyProduct[],
  preferredLocation: string
): RezdyProduct[] {
  if (!preferredLocation || preferredLocation === 'all') {
    return products;
  }

  return [...products].sort((a, b) => {
    const aHasPreferred = PickupLocationService.hasPickupFromLocation(a, preferredLocation);
    const bHasPreferred = PickupLocationService.hasPickupFromLocation(b, preferredLocation);
    
    if (aHasPreferred && !bHasPreferred) return -1;
    if (!aHasPreferred && bHasPreferred) return 1;
    
    // If both have or don't have the preferred location, maintain original order
    return 0;
  });
}

/**
 * Group products by pickup location
 */
export function groupProductsByPickupLocation(
  products: RezdyProduct[]
): Record<string, RezdyProduct[]> {
  const groups: Record<string, RezdyProduct[]> = {
    'Brisbane': [],
    'Gold Coast': [],
    'Brisbane Loop': [],
    'Multiple Locations': [],
    'No Pickup': []
  };

  for (const product of products) {
    const locations = product.pickupLocations || PickupLocationService.extractPickupLocations(product);
    
    if (locations.length === 0) {
      groups['No Pickup'].push(product);
    } else if (locations.length > 1) {
      groups['Multiple Locations'].push(product);
      // Also add to individual location groups
      for (const location of locations) {
        if (groups[location]) {
          groups[location].push(product);
        }
      }
    } else {
      const location = locations[0];
      if (groups[location]) {
        groups[location].push(product);
      }
    }
  }

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([_, products]) => products.length > 0)
  );
}

/**
 * Get pickup location icon name for UI
 */
export function getPickupLocationIcon(location: string): string {
  const normalized = PickupLocationService.normalizeLocation(location);
  
  switch (normalized) {
    case 'Brisbane':
      return 'building-2'; // City/urban icon
    case 'Gold Coast':
      return 'waves'; // Beach/coastal icon
    case 'Brisbane Loop':
      return 'route'; // Loop/circuit icon
    default:
      return 'map-pin'; // Generic location icon
  }
}

/**
 * Enhanced pickup location filter matching with detailed location data
 */
export function matchesPickupLocationFilter(
  product: RezdyProduct,
  filterLocation: string
): boolean {
  if (!filterLocation || filterLocation === 'all') {
    return true;
  }

  // Use cached pickup locations if available, otherwise extract them
  const locations = product.pickupLocations || PickupLocationService.extractPickupLocations(product);
  const normalizedFilter = PickupLocationService.normalizeLocation(filterLocation);
  
  if (!normalizedFilter) {
    return false;
  }

  return locations.includes(normalizedFilter);
}

/**
 * Get specific pickup times and locations for display
 */
export function getPickupScheduleDisplay(location: string): {
  title: string;
  schedule: Array<{ time: string; location: string; address?: string }>;
} | null {
  switch (location) {
    case 'Brisbane':
      return {
        title: 'Brisbane Hotel Pickups',
        schedule: [
          { time: '8:45am', location: 'Brisbane Marriott', address: '1 Howard St, Brisbane City' },
          { time: '9:00am', location: 'Royal on the Park', address: '152 Alice St, Brisbane City QLD 4000' },
          { time: '9:10am', location: 'Emporium Southbank', address: '267 Grey St, South Brisbane QLD' }
        ]
      };
    
    case 'Gold Coast':
      return {
        title: 'Gold Coast Hotel Pickups',
        schedule: [
          { time: '8:45am', location: 'The Star Casino', address: '1 Casino Dr, Broadbeach QLD 4218' },
          { time: '9:00am', location: 'Voco Gold Coast', address: '31 Hamilton Ave, Surfers Paradise QLD 4217' },
          { time: '9:15am', location: 'Sheraton Grand Mirage', address: '71 Seaworld Dr, Main Beach QLD 4217' }
        ]
      };
    
    case 'Brisbane Loop':
      return {
        title: 'Brisbane City Loop Stops',
        schedule: [
          { time: '8:00am', location: 'Southbank', address: '267 Grey St, South Brisbane' },
          { time: '8:10am', location: 'Petrie Terrace', address: 'Cnr Sexton st and Roma St (Petrie Tce at Windmill Cafe, stop 3)' },
          { time: '8:20am', location: 'No 1 Anzac Square', address: '295 Ann St, Brisbane City' },
          { time: '8:25am', location: 'Howard Smith Wharves', address: '7 Boundary St, Brisbane City' },
          { time: '8:30am', location: 'Kangaroo Point Cliffs', address: '66 River Terrace, Kangaroo Point QLD 4169' }
        ]
      };
    
    default:
      return null;
  }
}

/**
 * Get pickup location summary for analytics
 */
export function getPickupLocationSummary(products: RezdyProduct[]): {
  totalWithPickup: number;
  locationCounts: Record<string, number>;
  multiLocationProducts: number;
} {
  let totalWithPickup = 0;
  let multiLocationProducts = 0;
  const locationCounts: Record<string, number> = {
    'Brisbane': 0,
    'Gold Coast': 0,
    'Brisbane Loop': 0
  };

  for (const product of products) {
    const locations = product.pickupLocations || PickupLocationService.extractPickupLocations(product);
    
    if (locations.length > 0) {
      totalWithPickup++;
      
      if (locations.length > 1) {
        multiLocationProducts++;
      }
      
      for (const location of locations) {
        if (locationCounts[location] !== undefined) {
          locationCounts[location]++;
        }
      }
    }
  }

  return {
    totalWithPickup,
    locationCounts,
    multiLocationProducts
  };
}