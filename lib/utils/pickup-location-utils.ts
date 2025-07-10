import { RezdyProduct } from '@/lib/types/rezdy';
import { PickupLocationService } from '@/lib/services/pickup-location-service';

/**
 * Utility functions for working with pickup locations
 */

/**
 * Check if a product offers pickup from any of our supported locations
 */
export function hasPickupService(product: RezdyProduct): boolean {
  const locations = PickupLocationService.extractPickupLocations(product);
  return locations.length > 0;
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
 * Get pickup badge data for UI display
 */
export function getPickupBadgeData(product: RezdyProduct): { 
  text: string; 
  variant: 'default' | 'secondary' | 'outline' 
} | null {
  const locations = product.pickupLocations || PickupLocationService.extractPickupLocations(product);
  
  if (locations.length === 0) {
    return null;
  }
  
  if (locations.length === 1) {
    return {
      text: `From ${locations[0]}`,
      variant: 'default'
    };
  }
  
  return {
    text: `${locations.length} pickup locations`,
    variant: 'secondary'
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
    'Mount Tamborine': [],
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
    case 'Mount Tamborine':
      return 'mountain'; // Mountain icon
    default:
      return 'map-pin'; // Generic location icon
  }
}

/**
 * Check if product matches pickup location filter
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
    'Mount Tamborine': 0
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