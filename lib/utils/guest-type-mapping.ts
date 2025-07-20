import { RezdyPriceOption } from "@/lib/types/rezdy";
import { GuestInfo, GuestTypeMapping, PriceOptionConfig } from "@/components/ui/guest-manager";

/**
 * Maps Rezdy price options to guest types and validation rules
 */
export function createPriceOptionConfigs(priceOptions: RezdyPriceOption[]): PriceOptionConfig[] {
  return priceOptions.map(option => {
    const label = option.label.toLowerCase();
    let mappedGuestType: GuestInfo['type'] = 'ADULT';
    let ageRange: { min: number; max: number } | undefined;
    let requiresCertification = false;
    let description = option.label;

    // Map price option labels to guest types
    if (label.includes('adult')) {
      mappedGuestType = 'ADULT';
      ageRange = { min: 18, max: 120 };
      description = 'Adult (18+)';
    } else if (label.includes('child')) {
      mappedGuestType = 'CHILD';
      ageRange = { min: 3, max: 17 };
      description = 'Child (3-17 years)';
    } else if (label.includes('infant')) {
      mappedGuestType = 'INFANT';
      ageRange = { min: 0, max: 2 };
      description = 'Infant (0-2 years)';
    } else if (label.includes('senior')) {
      mappedGuestType = 'SENIOR';
      ageRange = { min: 65, max: 120 };
      description = 'Senior (65+)';
    } else if (label.includes('student')) {
      mappedGuestType = 'STUDENT';
      ageRange = { min: 13, max: 30 };
      description = 'Student (with valid ID)';
    } else if (label.includes('concession')) {
      mappedGuestType = 'CONCESSION';
      ageRange = { min: 13, max: 120 };
      description = 'Concession (with valid card)';
    } else if (label.includes('family')) {
      mappedGuestType = 'FAMILY';
      description = 'Family package';
    } else if (label.includes('group')) {
      mappedGuestType = 'GROUP';
      description = 'Group booking';
    } else if (label.includes('quantity')) {
      mappedGuestType = 'QUANTITY';
      description = 'Per person';
    } else {
      mappedGuestType = 'CUSTOM';
      description = option.label;
    }

    // Special handling for diving/certification requirements
    if (label.includes('dive') || label.includes('scuba') || label.includes('cert')) {
      requiresCertification = true;
    }

    return {
      id: option.id,
      label: option.label,
      price: option.price,
      seatsUsed: option.seatsUsed,
      mappedGuestType,
      description,
      ageRange,
      requiresCertification,
      customValidation: createCustomValidation(option.label)
    };
  });
}

/**
 * Creates custom validation functions based on price option type
 */
function createCustomValidation(optionLabel: string): ((guest: GuestInfo) => string | null) | undefined {
  const label = optionLabel.toLowerCase();
  
  if (label.includes('student')) {
    return (guest: GuestInfo) => {
      if (guest.age > 30) {
        return 'Student pricing typically requires valid student ID and age under 30';
      }
      return null;
    };
  }
  
  if (label.includes('concession')) {
    return (guest: GuestInfo) => {
      if (guest.age < 13 && guest.age > 64) {
        return 'Concession pricing requires valid concession card';
      }
      return null;
    };
  }
  
  if (label.includes('dive') || label.includes('scuba')) {
    return (guest: GuestInfo) => {
      if (!guest.certificationLevel || !guest.certificationNumber || !guest.certificationAgency) {
        return 'Diving activities require valid certification details';
      }
      return null;
    };
  }
  
  return undefined;
}

/**
 * Determines the optimal guest type distribution for a given guest count and price options
 */
export function distributeGuestsAcrossPriceOptions(
  totalGuests: number,
  priceOptions: RezdyPriceOption[],
  preferredDistribution?: Record<string, number>
): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  // Initialize all options to 0
  priceOptions.forEach(option => {
    distribution[option.label] = 0;
  });
  
  // If preferred distribution is provided, use it
  if (preferredDistribution) {
    return { ...distribution, ...preferredDistribution };
  }
  
  // Default distribution logic
  const adultOption = priceOptions.find(opt => opt.label.toLowerCase().includes('adult'));
  const quantityOption = priceOptions.find(opt => opt.label.toLowerCase().includes('quantity'));
  
  if (adultOption) {
    distribution[adultOption.label] = totalGuests;
  } else if (quantityOption) {
    distribution[quantityOption.label] = totalGuests;
  } else if (priceOptions.length > 0) {
    // Default to first option
    distribution[priceOptions[0].label] = totalGuests;
  }
  
  return distribution;
}

/**
 * Generates guest instances based on guest counts and price option configurations
 */
export function generateGuestInstancesFromCounts(
  guestCounts: Record<string, number>,
  priceOptionConfigs: PriceOptionConfig[]
): GuestInfo[] {
  const guests: GuestInfo[] = [];
  
  Object.entries(guestCounts).forEach(([optionLabel, count]) => {
    if (count <= 0) return;
    
    const config = priceOptionConfigs.find(c => c.label === optionLabel);
    if (!config) return;
    
    for (let i = 0; i < count; i++) {
      const defaultAge = config.ageRange ? config.ageRange.min : 
                        (config.mappedGuestType === 'CHILD' ? 10 :
                         config.mappedGuestType === 'INFANT' ? 1 :
                         config.mappedGuestType === 'SENIOR' ? 65 : 25);
      
      guests.push({
        id: `${Date.now()}-${optionLabel}-${i}`,
        firstName: '',
        lastName: '',
        age: defaultAge,
        type: config.mappedGuestType,
        priceOptionId: config.id,
        priceOptionLabel: config.label,
        customFieldValues: {}
      });
    }
  });
  
  return guests;
}

/**
 * Validates guest distribution against price option constraints
 */
export function validateGuestDistribution(
  guestCounts: Record<string, number>,
  priceOptions: RezdyPriceOption[],
  productConstraints?: { min?: number; max?: number }
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Calculate total guests and seats
  const totalGuests = Object.values(guestCounts).reduce((sum, count) => sum + count, 0);
  const totalSeats = Object.entries(guestCounts).reduce((sum, [label, count]) => {
    const option = priceOptions.find(opt => opt.label === label);
    return sum + (count * (option?.seatsUsed || 1));
  }, 0);
  
  // Check minimum requirements
  if (productConstraints?.min && totalGuests < productConstraints.min) {
    errors.push(`Minimum ${productConstraints.min} guests required`);
  }
  
  // Check maximum limits
  if (productConstraints?.max && totalSeats > productConstraints.max) {
    errors.push(`Maximum ${productConstraints.max} seats available`);
  }
  
  // Ensure at least one guest
  if (totalGuests === 0) {
    errors.push('At least one guest is required');
  }
  
  // Validate each price option
  Object.entries(guestCounts).forEach(([label, count]) => {
    if (count < 0) {
      errors.push(`Invalid count for ${label}: cannot be negative`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Converts dynamic guest counts to standard booking format
 */
export function convertDynamicGuestCountsToStandard(
  guestCounts: Record<string, number>,
  priceOptions: RezdyPriceOption[]
): { adults: number; children: number; infants: number } {
  const standardCounts = { adults: 0, children: 0, infants: 0 };
  
  Object.entries(guestCounts).forEach(([label, count]) => {
    const labelLower = label.toLowerCase();
    
    if (labelLower.includes('adult') || labelLower.includes('senior') || 
        labelLower.includes('concession') || labelLower.includes('student')) {
      standardCounts.adults += count;
    } else if (labelLower.includes('child')) {
      standardCounts.children += count;
    } else if (labelLower.includes('infant')) {
      standardCounts.infants += count;
    } else if (labelLower.includes('family')) {
      // Family packages typically count as multiple guests
      standardCounts.adults += count * 2;
      standardCounts.children += count * 2;
    } else {
      // Default unknown types to adults
      standardCounts.adults += count;
    }
  });
  
  return standardCounts;
}