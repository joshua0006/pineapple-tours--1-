import { RezdyBookingOption, RezdyPickupLocation } from "@/lib/types/rezdy";

// FIT Tour Pickup Locations based on your specifications
const BRISBANE_PICKUPS: RezdyPickupLocation[] = [
  {
    id: "brisbane-marriott",
    name: "Brisbane Marriott",
    address: "1 Howard St Brisbane City",
    pickupTime: "8:45am",
    region: "brisbane",
    facilityType: "hotel",
    isPreferred: true,
  },
  {
    id: "royal-on-park",
    name: "Royal on the Park",
    address: "152 Alice St, Brisbane City QLD 4000",
    pickupTime: "9:00am",
    region: "brisbane",
    facilityType: "hotel",
  },
  {
    id: "star-grand-casino",
    name: "Star Grand Casino Brisbane",
    address: "Queen St, Brisbane City QLD 4000",
    pickupTime: "9:05am",
    region: "brisbane",
    facilityType: "casino",
  },
  {
    id: "emporium-southbank",
    name: "Emporium Southbank",
    address: "267 Grey St, South Brisbane QLD 4101",
    pickupTime: "9:10am",
    region: "brisbane",
    facilityType: "landmark",
  },
];

const GOLD_COAST_PICKUPS: RezdyPickupLocation[] = [
  {
    id: "star-casino-broadbeach",
    name: "The Star Casino",
    address: "1 Casino Dr, Broadbeach QLD 4218",
    pickupTime: "8:45am",
    region: "gold-coast",
    facilityType: "casino",
    isPreferred: true,
  },
  {
    id: "voco-gold-coast",
    name: "Voco Gold Coast",
    address: "31 Hamilton Ave, Surfers Paradise QLD 4217",
    pickupTime: "9:00am",
    region: "gold-coast",
    facilityType: "hotel",
  },
  {
    id: "jw-marriott",
    name: "JW Marriott",
    address: "Surfers Paradise QLD 4217",
    pickupTime: "9:10am",
    region: "gold-coast",
    facilityType: "hotel",
  },
  {
    id: "sheraton-grand-mirage",
    name: "Sheraton Grand Mirage",
    address: "71 Seaworld Dr, Main Beach QLD 4217",
    pickupTime: "9:15am",
    region: "gold-coast",
    facilityType: "hotel",
  },
];

const BRISBANE_CITY_LOOP: RezdyPickupLocation[] = [
  {
    id: "southbank",
    name: "Southbank",
    address: "267 Grey St, South Brisbane",
    pickupTime: "8:00am",
    region: "brisbane",
    facilityType: "transport-hub",
  },
  {
    id: "petrie-terrace",
    name: "Petrie Terrace",
    address: "Cnr Sexton st and Roma St (Petrie Tce at Windmill Cafe, stop 3)",
    pickupTime: "8:10am",
    region: "brisbane",
    facilityType: "transport-hub",
  },
  {
    id: "anzac-square",
    name: "No1 Anzac Square",
    address: "295 Ann St, Brisbane City",
    pickupTime: "8:20am",
    region: "brisbane",
    facilityType: "landmark",
  },
  {
    id: "howard-smith-wharves",
    name: "Howard Smith Wharves",
    address: "7 Boundary St, Brisbane City",
    pickupTime: "8:25am",
    region: "brisbane",
    facilityType: "landmark",
  },
  {
    id: "kangaroo-point-cliffs",
    name: "Kangaroo Point Cliffs",
    address: "66 River Terrace, Kangaroo Point QLD 4169",
    pickupTime: "8:30am",
    region: "brisbane",
    facilityType: "landmark",
  },
];

const TAMBORINE_CONNECTION: RezdyPickupLocation[] = [
  {
    id: "brisbane-connection",
    name: "Brisbane Connection",
    address: "Tamborine Mountain",
    pickupTime: "9:00am",
    region: "tamborine",
    facilityType: "transport-hub",
  },
];

// FIT Tour Booking Options
export const FIT_TOUR_BOOKING_OPTIONS: RezdyBookingOption[] = [
  {
    id: "brisbane-pickup-standard",
    name: "Brisbane Hotel Pickup",
    description:
      "Standard pickup from major Brisbane hotels and locations. Depart Brisbane at 9:10am, arrive Tamborine Mountain by 10:30am.",
    price: 89,
    currency: "AUD",
    pickupType: "brisbane",
    pickupLocations: BRISBANE_PICKUPS,
    maxParticipants: 24,
    availability: 18,
    includedServices: [
      "Hotel pickup",
      "Return transport",
      "Professional guide",
      "Air-conditioned vehicle",
    ],
    isPreferred: true,
  },
  {
    id: "gold-coast-pickup-standard",
    name: "Gold Coast Hotel Pickup",
    description:
      "Convenient pickup from Gold Coast hotels and attractions. Depart Gold Coast at 9:15am, arrive Tamborine Mountain by 10:30am.",
    price: 95,
    currency: "AUD",
    pickupType: "gold-coast",
    pickupLocations: GOLD_COAST_PICKUPS,
    maxParticipants: 24,
    availability: 16,
    includedServices: [
      "Hotel pickup",
      "Return transport",
      "Professional guide",
      "Air-conditioned vehicle",
    ],
  },
  {
    id: "brisbane-city-loop",
    name: "Brisbane City Loop Service",
    description:
      "Multiple convenient pickup points throughout Brisbane City. Perfect for those staying in the CBD. Early departure at 8:00am.",
    price: 85,
    currency: "AUD",
    pickupType: "brisbane-city-loop",
    pickupLocations: BRISBANE_CITY_LOOP,
    maxParticipants: 20,
    availability: 14,
    includedServices: [
      "City pickup points",
      "Return transport",
      "Professional guide",
      "Air-conditioned vehicle",
    ],
  },
  {
    id: "tamborine-direct",
    name: "Direct Tamborine Connection",
    description:
      "Meet directly at Tamborine Mountain for those with their own transport or staying locally. Tour starts at 10:30am.",
    price: 69,
    currency: "AUD",
    pickupType: "tamborine-direct",
    pickupLocations: TAMBORINE_CONNECTION,
    maxParticipants: 30,
    availability: 25,
    includedServices: [
      "Professional guide",
      "Tour activities",
      "Local expertise",
    ],
  },
];

// Service to get booking options for a product
export class FitTourDataService {
  /**
   * Get FIT tour booking options for a specific product
   * This would normally fetch from Rezdy API, but for demo purposes we return static data
   */
  static getBookingOptions(productCode: string): RezdyBookingOption[] {
    // In a real implementation, this would check if the product supports FIT tour options
    // and return the appropriate booking options from the Rezdy API

    // For demo purposes, return all options for any product that might be a FIT tour
    const fitTourProductCodes = [
      "TAMBORINE-FIT",
      "WINE-TOUR-FIT",
      "SCENIC-RIM-FIT",
      "GLOW-WORM-FIT",
    ];

    // Also check for common tour-related keywords to make it work with more products
    const tourKeywords = [
      "wine",
      "tour",
      "tamborine",
      "scenic",
      "mountain",
      "day",
      "experience",
      "trip",
      "journey",
      "adventure",
      "brisbane",
      "gold-coast",
      "pick",
      "transport",
    ];

    const productCodeLower = productCode.toLowerCase();

    // Return FIT options if product code matches specific codes or contains tour keywords
    if (
      fitTourProductCodes.some((code) => productCode.includes(code)) ||
      tourKeywords.some((keyword) => productCodeLower.includes(keyword)) ||
      productCode.length > 0 // For demo purposes, show for any non-empty product code
    ) {
      return FIT_TOUR_BOOKING_OPTIONS;
    }

    return [];
  }

  /**
   * Get pickup locations for a specific region
   */
  static getPickupLocationsByRegion(region: string): RezdyPickupLocation[] {
    switch (region) {
      case "brisbane":
        return BRISBANE_PICKUPS;
      case "gold-coast":
        return GOLD_COAST_PICKUPS;
      case "brisbane-city-loop":
        return BRISBANE_CITY_LOOP;
      case "tamborine":
        return TAMBORINE_CONNECTION;
      default:
        return [];
    }
  }

  /**
   * Get booking option by ID
   */
  static getBookingOptionById(optionId: string): RezdyBookingOption | null {
    return (
      FIT_TOUR_BOOKING_OPTIONS.find((option) => option.id === optionId) || null
    );
  }

  /**
   * Calculate total price including pickup option
   */
  static calculateTotalPrice(
    basePrice: number,
    optionPrice: number,
    participants: number,
    extras: Array<{ price: number; quantity: number }> = []
  ): {
    baseTotal: number;
    optionTotal: number;
    extrasTotal: number;
    grandTotal: number;
  } {
    const baseTotal = basePrice * participants;
    const optionTotal = optionPrice * participants;
    const extrasTotal = extras.reduce(
      (sum, extra) => sum + extra.price * extra.quantity,
      0
    );
    const grandTotal = baseTotal + optionTotal + extrasTotal;

    return {
      baseTotal,
      optionTotal,
      extrasTotal,
      grandTotal,
    };
  }

  /**
   * Validate booking option selection
   */
  static validateBookingSelection(
    option: RezdyBookingOption,
    participants: number,
    selectedPickupLocation: RezdyPickupLocation
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check availability
    if (participants > option.availability) {
      errors.push(
        `Only ${option.availability} seats available for this option`
      );
    }

    // Check max participants
    if (option.maxParticipants && participants > option.maxParticipants) {
      errors.push(
        `Maximum ${option.maxParticipants} participants allowed for this option`
      );
    }

    // Check pickup location belongs to option
    const validPickupIds = option.pickupLocations.map((loc) => loc.id);
    if (!validPickupIds.includes(selectedPickupLocation.id)) {
      errors.push(
        "Selected pickup location is not valid for this booking option"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
