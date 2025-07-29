/**
 * Pickup Region Constants
 * Based on pickup-locations.md data structure
 */

export enum PickupRegion {
  BRISBANE = 'BRISBANE',
  YOUR_HOTEL_ACCOMMODATION = 'YOUR_HOTEL_ACCOMMODATION',
  BRISBANE_CITY_LOOP = 'BRISBANE_CITY_LOOP',
  GOLD_COAST = 'GOLD_COAST',
  TAMBORINE_MOUNTAIN = 'TAMBORINE_MOUNTAIN',
  ALL = 'ALL'
}

export interface PickupLocation {
  time: string;
  location: string;
  address: string;
  pickupId: number | string;
  status: string;
  products: string;
}

export interface RegionInfo {
  id: PickupRegion;
  name: string;
  displayName: string;
  description: string;
  pickupIds: (number | string)[];
  locations: PickupLocation[];
}

/**
 * PickupId to Region mapping based on verified API data
 */
export const PICKUP_ID_TO_REGION: Record<string | number, PickupRegion> = {
  // Brisbane region
  2114: PickupRegion.BRISBANE,
  24417: PickupRegion.BRISBANE,
  29816: PickupRegion.BRISBANE,
  
  // Your Hotel or Accommodation
  5884: PickupRegion.YOUR_HOTEL_ACCOMMODATION,
  5885: PickupRegion.YOUR_HOTEL_ACCOMMODATION,
  5886: PickupRegion.YOUR_HOTEL_ACCOMMODATION,
  11475: PickupRegion.YOUR_HOTEL_ACCOMMODATION,
  
  // Brisbane City Loop
  29261: PickupRegion.BRISBANE_CITY_LOOP,
  
  // Gold Coast region
  16529: PickupRegion.GOLD_COAST,
  25447: PickupRegion.GOLD_COAST,
  15810: PickupRegion.GOLD_COAST,
  24418: PickupRegion.GOLD_COAST,
  26037: PickupRegion.GOLD_COAST,
  
  // Tamborine Mountain region
  12696: PickupRegion.TAMBORINE_MOUNTAIN,
};

/**
 * Comprehensive region information
 */
export const PICKUP_REGIONS: Record<PickupRegion, RegionInfo> = {
  [PickupRegion.BRISBANE]: {
    id: PickupRegion.BRISBANE,
    name: 'brisbane',
    displayName: 'Brisbane',
    description: 'Brisbane hotels and central locations',
    pickupIds: [2114, 24417, 29816],
    locations: [
      {
        time: '8:45am',
        location: 'Brisbane Marriott',
        address: '1 Howard St Brisbane City',
        pickupId: 2114,
        status: '✅ API Verified',
        products: '12+ tours'
      },
      {
        time: '9:00am',
        location: 'Royal on the Park',
        address: '152 Alice St, Brisbane City QLD 4000',
        pickupId: 2114,
        status: '✅ API Verified',
        products: '12+ tours'
      },
      {
        time: '9:10am',
        location: 'Emporium Southbank',
        address: '267 Grey St, South Brisbane QLD 4101',
        pickupId: 2114,
        status: '✅ API Verified',
        products: '12+ tours'
      },
      {
        time: 'Door-to-Door',
        location: 'Brisbane Hotels',
        address: 'Various Brisbane locations',
        pickupId: 24417,
        status: '✅ API Verified',
        products: '20+ tours'
      },
      // Brisbane City Loop
      {
        time: '8:00am',
        location: 'Southbank',
        address: '267 Grey St, South Brisbane',
        pickupId: 2114,
        status: '✅ API Verified',
        products: '12+ tours'
      },
      {
        time: '8:10am',
        location: 'Petrie Terrace',
        address: 'Cnr Sexton st and Roma St (Petrie Tce at Windmill Cafe, stop 3)',
        pickupId: 2114,
        status: '✅ API Verified',
        products: '12+ tours'
      },
      {
        time: '8:20am',
        location: 'No1 Anzac Square',
        address: '295 Ann St, Brisbane City',
        pickupId: 2114,
        status: '✅ API Verified',
        products: '12+ tours'
      },
      {
        time: '8:25am',
        location: 'Howard Smith Wharves',
        address: '7 Boundary St, Brisbane City',
        pickupId: 2114,
        status: '✅ API Verified',
        products: '12+ tours'
      },
      {
        time: '8:30am',
        location: 'Kangaroo Point Cliffs',
        address: '66 River Terrace, Kangaroo Point QLD 4169',
        pickupId: 2114,
        status: '✅ API Verified',
        products: '12+ tours'
      }
    ]
  },
  
  [PickupRegion.YOUR_HOTEL_ACCOMMODATION]: {
    id: PickupRegion.YOUR_HOTEL_ACCOMMODATION,
    name: 'your-hotel-accommodation',
    displayName: 'Your Hotel or Accommodation',
    description: 'Door-to-door pickup from your hotel or accommodation',
    pickupIds: [5884, 5885, 5886, 11475],
    locations: [
      {
        time: '8:00am',
        location: 'Your Hotel or Accommodation',
        address: 'Door-to-door pickup service',
        pickupId: 5884,
        status: '✅ API Verified',
        products: '15+ tours'
      },
      {
        time: '10:00am',
        location: 'Your Hotel or Accommodation',
        address: 'Door-to-door pickup service',
        pickupId: 5885,
        status: '✅ API Verified',
        products: '15+ tours'
      },
      {
        time: '12:00pm',
        location: 'Your Hotel or Accommodation',
        address: 'Door-to-door pickup service',
        pickupId: 5886,
        status: '✅ API Verified',
        products: '15+ tours'
      },
      {
        time: 'Various',
        location: 'Your Hotel or Accommodation',
        address: 'Flexible pickup times',
        pickupId: 11475,
        status: '✅ API Verified',
        products: '10+ tours'
      }
    ]
  },
  
  [PickupRegion.BRISBANE_CITY_LOOP]: {
    id: PickupRegion.BRISBANE_CITY_LOOP,
    name: 'brisbane-city-loop',
    displayName: 'Brisbane City Loop',
    description: 'Brisbane city loop transport service',
    pickupIds: [29261],
    locations: [
      {
        time: 'Various',
        location: 'Brisbane City Loop',
        address: 'Multiple city loop stops',
        pickupId: 29261,
        status: '✅ API Verified',
        products: '8+ tours'
      }
    ]
  },
  
  [PickupRegion.GOLD_COAST]: {
    id: PickupRegion.GOLD_COAST,
    name: 'gold-coast',
    displayName: 'Gold Coast',
    description: 'Gold Coast hotels and attractions',
    pickupIds: [16529, 25447, 15810, 24418, 26037],
    locations: [
      {
        time: '8:45am',
        location: 'The Star Casino',
        address: '1 Casino Dr, Broadbeach QLD 4218',
        pickupId: 7980,
        status: '✅ API Verified',
        products: '8+ tours'
      },
      {
        time: '9:00am',
        location: 'Voco Gold Coast',
        address: '31 Hamilton Ave, Surfers Paradise QLD 4217',
        pickupId: 16529,
        status: '✅ API Verified',
        products: '6+ tours'
      },
      {
        time: '9:10am',
        location: 'JW Marriott',
        address: 'Gold Coast Location',
        pickupId: 7959,
        status: '✅ API Verified',
        products: '5+ tours'
      },
      {
        time: '9:15am',
        location: 'Sheraton Grand Mirage',
        address: '71 Seaworld Dr, Main Beach QLD 4217',
        pickupId: 7959,
        status: '✅ API Verified',
        products: '5+ tours'
      },
      {
        time: 'Door-to-Door',
        location: 'Gold Coast Hotels',
        address: 'Various Gold Coast locations',
        pickupId: 24418,
        status: '✅ API Verified',
        products: '18+ tours'
      },
      {
        time: 'Hotel Pickups',
        location: 'Cavill Avenue Area',
        address: '63 Cavill Avenue, Surfers Paradise',
        pickupId: '5885/5884/5886',
        status: '✅ API Verified',
        products: '8+ tours'
      }
    ]
  },
  
  [PickupRegion.TAMBORINE_MOUNTAIN]: {
    id: PickupRegion.TAMBORINE_MOUNTAIN,
    name: 'tamborine-mountain',
    displayName: 'Tamborine Mountain',
    description: 'Mountain connections and services',
    pickupIds: [12696],
    locations: [
      {
        time: 'Various',
        location: 'Tamborine Mountain',
        address: 'Tamborine Mountain locations',
        pickupId: 12696,
        status: '✅ API Verified',
        products: '10+ tours'
      }
    ]
  },
  
  [PickupRegion.ALL]: {
    id: PickupRegion.ALL,
    name: 'all',
    displayName: 'All Regions',
    description: 'All available pickup locations',
    pickupIds: [],
    locations: []
  }
};

/**
 * Region display options for UI components
 */
export const REGION_OPTIONS = [
  {
    value: PickupRegion.ALL,
    label: 'All Regions',
    description: 'Show tours from all pickup locations'
  },
  {
    value: PickupRegion.BRISBANE,
    label: 'Brisbane',
    description: 'Brisbane hotels & central locations'
  },
  {
    value: PickupRegion.YOUR_HOTEL_ACCOMMODATION,
    label: 'Your Hotel or Accommodation',
    description: 'Door-to-door pickup service'
  },
  {
    value: PickupRegion.BRISBANE_CITY_LOOP,
    label: 'Brisbane City Loop',
    description: 'City loop transport stops'
  },
  {
    value: PickupRegion.GOLD_COAST,
    label: 'Gold Coast',
    description: 'Gold Coast hotels & attractions'
  },
  {
    value: PickupRegion.TAMBORINE_MOUNTAIN,
    label: 'Tamborine Mountain',
    description: 'Mountain connections'
  }
];

/**
 * Get region from PickupId
 */
export function getRegionFromPickupId(pickupId: number | string): PickupRegion | null {
  return PICKUP_ID_TO_REGION[pickupId] || null;
}

/**
 * Get all PickupIds for a region
 */
export function getPickupIdsForRegion(region: PickupRegion): (number | string)[] {
  if (region === PickupRegion.ALL) {
    return Object.keys(PICKUP_ID_TO_REGION);
  }
  return PICKUP_REGIONS[region]?.pickupIds || [];
}

/**
 * Check if a PickupId belongs to a region
 */
export function isPickupIdInRegion(pickupId: number | string, region: PickupRegion): boolean {
  if (region === PickupRegion.ALL) return true;
  return getRegionFromPickupId(pickupId) === region;
}

/**
 * Normalize region input (for URL params, user input, etc.)
 */
export function normalizeRegion(input: string): PickupRegion {
  const normalized = input.toLowerCase().replace(/[^a-z]/g, '');
  
  switch (normalized) {
    case 'brisbane':
    case 'bris':
      return PickupRegion.BRISBANE;
    case 'yourhoteloraccommodation':
    case 'your hotel or accommodation':
    case 'hotel':
    case 'accommodation':
    case 'doortodoor':
    case 'door to door':
      return PickupRegion.YOUR_HOTEL_ACCOMMODATION;
    case 'brisbanecityloop':
    case 'brisbane city loop':
    case 'cityloop':
    case 'city loop':
      return PickupRegion.BRISBANE_CITY_LOOP;
    case 'goldcoast':
    case 'gold coast':
    case 'gc':
      return PickupRegion.GOLD_COAST;
    case 'tamborine':
    case 'tamborinemountain':
    case 'tamborine mountain':
    case 'mount tamborine':
    case 'mt tamborine':
      return PickupRegion.TAMBORINE_MOUNTAIN;
    case 'all':
    case '':
    default:
      return PickupRegion.ALL;
  }
}