import { RezdyPriceOption, RezdyProduct } from "@/lib/types/rezdy";
import { GuestInfo, PriceOptionConfig } from "@/components/ui/guest-manager";
import { BookingFormData } from "@/lib/utils/booking-transform";

/**
 * Validation result interface for dynamic pricing
 */
export interface DynamicPricingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Validates that guest counts match product price options
 */
export function validateGuestCountsAgainstPriceOptions(
  guestCounts: Record<string, number>,
  priceOptions: RezdyPriceOption[],
  product: RezdyProduct
): DynamicPricingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Calculate totals
  const totalGuests = Object.values(guestCounts).reduce((sum, count) => sum + count, 0);
  const totalSeats = Object.entries(guestCounts).reduce((sum, [label, count]) => {
    const option = priceOptions.find(opt => opt.label === label);
    return sum + (count * (option?.seatsUsed || 1));
  }, 0);

  // Check minimum requirements
  if (product.quantityRequiredMin && totalGuests < product.quantityRequiredMin) {
    errors.push(`Minimum ${product.quantityRequiredMin} guests required (currently ${totalGuests})`);
  }

  // Check maximum limits
  if (product.quantityRequiredMax && totalSeats > product.quantityRequiredMax) {
    errors.push(`Maximum ${product.quantityRequiredMax} seats available (currently ${totalSeats})`);
  }

  // Ensure at least one guest
  if (totalGuests === 0) {
    errors.push('At least one guest is required');
  }

  // Validate each price option exists
  Object.entries(guestCounts).forEach(([label, count]) => {
    if (count > 0) {
      const option = priceOptions.find(opt => opt.label === label);
      if (!option) {
        errors.push(`Price option "${label}" not found in product`);
      } else if (count < 0) {
        errors.push(`Invalid count for ${label}: cannot be negative`);
      }
    }
  });

  // Check for unused price options
  const unusedOptions = priceOptions.filter(option => 
    !Object.keys(guestCounts).includes(option.label) || guestCounts[option.label] === 0
  );
  
  if (unusedOptions.length > 0 && totalGuests > 0) {
    const optionNames = unusedOptions.map(opt => opt.label).join(', ');
    suggestions.push(`Consider using available price options: ${optionNames}`);
  }

  // Check for adult supervision requirements
  const hasMinorTypes = Object.entries(guestCounts).some(([label, count]) => {
    if (count === 0) return false;
    const labelLower = label.toLowerCase();
    return labelLower.includes('child') || labelLower.includes('infant');
  });

  const hasAdultTypes = Object.entries(guestCounts).some(([label, count]) => {
    if (count === 0) return false;
    const labelLower = label.toLowerCase();
    return labelLower.includes('adult') || labelLower.includes('senior');
  });

  if (hasMinorTypes && !hasAdultTypes) {
    warnings.push('Children or infants require adult supervision');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Validates guest details against price option configurations
 */
export function validateGuestDetailsAgainstConfigs(
  guests: GuestInfo[],
  configs: PriceOptionConfig[]
): DynamicPricingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  guests.forEach((guest, index) => {
    const guestNumber = index + 1;
    
    // Basic field validation
    if (!guest.firstName.trim()) {
      errors.push(`Guest ${guestNumber}: First name is required`);
    }
    
    if (!guest.lastName.trim()) {
      errors.push(`Guest ${guestNumber}: Last name is required`);
    }
    
    if (guest.age <= 0 || guest.age > 120) {
      errors.push(`Guest ${guestNumber}: Age must be between 1 and 120`);
    }

    // Price option specific validation
    if (guest.priceOptionId) {
      const config = configs.find(c => c.id === guest.priceOptionId);
      
      if (!config) {
        errors.push(`Guest ${guestNumber}: Invalid price option ID ${guest.priceOptionId}`);
      } else {
        // Age range validation
        if (config.ageRange) {
          if (guest.age < config.ageRange.min || guest.age > config.ageRange.max) {
            errors.push(
              `Guest ${guestNumber}: Age ${guest.age} is outside the allowed range (${config.ageRange.min}-${config.ageRange.max}) for ${config.label}`
            );
          }
        }
        
        // Certification validation
        if (config.requiresCertification) {
          if (!guest.certificationLevel || !guest.certificationNumber || !guest.certificationAgency) {
            errors.push(`Guest ${guestNumber}: Certification details are required for ${config.label}`);
          }
        }
        
        // Custom validation
        if (config.customValidation) {
          const customError = config.customValidation(guest);
          if (customError) {
            errors.push(`Guest ${guestNumber}: ${customError}`);
          }
        }
      }
    } else if (configs.length > 0) {
      warnings.push(`Guest ${guestNumber}: No price option assigned`);
    }
  });

  // Check for distribution consistency
  const guestCountsByOption: Record<string, number> = {};
  guests.forEach(guest => {
    if (guest.priceOptionLabel) {
      guestCountsByOption[guest.priceOptionLabel] = (guestCountsByOption[guest.priceOptionLabel] || 0) + 1;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Validates complete booking data for dynamic pricing compatibility
 */
export function validateBookingDataForDynamicPricing(
  bookingData: BookingFormData,
  product: RezdyProduct
): DynamicPricingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check if we have price options
  if (!product.priceOptions || product.priceOptions.length === 0) {
    warnings.push('Product has no price options defined');
    return { isValid: true, errors, warnings, suggestions };
  }

  // Validate guest counts format
  if (bookingData.guestCounts) {
    if ('adults' in bookingData.guestCounts) {
      // Standard format - ensure compatibility
      const standardCounts = bookingData.guestCounts as { adults: number; children: number; infants: number };
      
      // Map to price options
      const adultOption = product.priceOptions.find(opt => opt.label.toLowerCase().includes('adult'));
      const childOption = product.priceOptions.find(opt => opt.label.toLowerCase().includes('child'));
      const infantOption = product.priceOptions.find(opt => opt.label.toLowerCase().includes('infant'));
      
      if (standardCounts.adults > 0 && !adultOption) {
        warnings.push('Adult guests specified but no adult price option available');
      }
      
      if (standardCounts.children > 0 && !childOption) {
        warnings.push('Child guests specified but no child price option available');
      }
      
      if (standardCounts.infants > 0 && !infantOption) {
        warnings.push('Infant guests specified but no infant price option available');
      }
    } else {
      // Dynamic format - validate against price options
      const dynamicCounts = bookingData.guestCounts as Record<string, number>;
      const validation = validateGuestCountsAgainstPriceOptions(dynamicCounts, product.priceOptions, product);
      
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
      suggestions.push(...validation.suggestions);
    }
  }

  // Validate individual guests if present
  if (bookingData.guests && bookingData.guests.length > 0) {
    const configs = product.priceOptions.map(option => ({
      id: option.id,
      label: option.label,
      price: option.price,
      seatsUsed: option.seatsUsed,
      mappedGuestType: 'ADULT' as const, // Default mapping
      requiresCertification: option.label.toLowerCase().includes('dive') || option.label.toLowerCase().includes('scuba')
    }));

    const guestValidation = validateGuestDetailsAgainstConfigs(bookingData.guests, configs);
    
    errors.push(...guestValidation.errors);
    warnings.push(...guestValidation.warnings);
    suggestions.push(...guestValidation.suggestions);
  }

  // Validate pricing calculations
  if (bookingData.pricing && bookingData.pricing.total <= 0) {
    errors.push('Total pricing must be greater than zero');
  }

  // Check for missing selected price options
  if (!bookingData.selectedPriceOptions || Object.keys(bookingData.selectedPriceOptions).length === 0) {
    warnings.push('No price options selected - may affect booking accuracy');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Suggests price option mappings based on guest information
 */
export function suggestPriceOptionMappings(
  guests: GuestInfo[],
  priceOptions: RezdyPriceOption[]
): Array<{ guestId: string; suggestedOptionId: number; confidence: number; reason: string }> {
  const suggestions: Array<{ guestId: string; suggestedOptionId: number; confidence: number; reason: string }> = [];

  guests.forEach(guest => {
    if (guest.priceOptionId) return; // Already has an option

    let bestMatch: { optionId: number; confidence: number; reason: string } | null = null;

    priceOptions.forEach(option => {
      const label = option.label.toLowerCase();
      let confidence = 0;
      let reason = '';

      // Age-based matching
      if (guest.age >= 18 && guest.age < 65 && label.includes('adult')) {
        confidence = 0.9;
        reason = 'Age matches adult category';
      } else if (guest.age >= 65 && label.includes('senior')) {
        confidence = 0.95;
        reason = 'Age matches senior category';
      } else if (guest.age >= 3 && guest.age < 18 && label.includes('child')) {
        confidence = 0.9;
        reason = 'Age matches child category';
      } else if (guest.age >= 0 && guest.age < 3 && label.includes('infant')) {
        confidence = 0.95;
        reason = 'Age matches infant category';
      }

      // Type-based matching
      if (guest.type === 'ADULT' && label.includes('adult')) {
        confidence = Math.max(confidence, 0.8);
        reason = reason || 'Guest type matches option';
      } else if (guest.type === 'CHILD' && label.includes('child')) {
        confidence = Math.max(confidence, 0.8);
        reason = reason || 'Guest type matches option';
      } else if (guest.type === 'INFANT' && label.includes('infant')) {
        confidence = Math.max(confidence, 0.8);
        reason = reason || 'Guest type matches option';
      } else if (guest.type === 'SENIOR' && label.includes('senior')) {
        confidence = Math.max(confidence, 0.8);
        reason = reason || 'Guest type matches option';
      } else if (guest.type === 'STUDENT' && label.includes('student')) {
        confidence = Math.max(confidence, 0.8);
        reason = reason || 'Guest type matches option';
      }

      // Certification-based matching
      if (guest.certificationLevel && (label.includes('dive') || label.includes('scuba'))) {
        confidence = Math.max(confidence, 0.7);
        reason = reason || 'Has required certification';
      }

      // Update best match
      if (confidence > 0 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { optionId: option.id, confidence, reason };
      }
    });

    if (bestMatch) {
      suggestions.push({
        guestId: guest.id,
        suggestedOptionId: bestMatch.optionId,
        confidence: bestMatch.confidence,
        reason: bestMatch.reason
      });
    }
  });

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Validates pricing calculations for dynamic guest counts
 */
export function validateDynamicPricingCalculations(
  guestCounts: Record<string, number>,
  priceOptions: RezdyPriceOption[],
  calculatedTotal: number
): { isValid: boolean; expectedTotal: number; discrepancy: number } {
  let expectedTotal = 0;

  Object.entries(guestCounts).forEach(([label, count]) => {
    const option = priceOptions.find(opt => opt.label === label);
    if (option) {
      expectedTotal += option.price * count;
    }
  });

  const discrepancy = Math.abs(calculatedTotal - expectedTotal);
  const isValid = discrepancy < 0.01; // Allow for small rounding differences

  return {
    isValid,
    expectedTotal,
    discrepancy
  };
}