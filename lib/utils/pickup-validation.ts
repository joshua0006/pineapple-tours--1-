import { RezdyPickupLocation, RezdyPickupLocationLegacy, RezdyPickupLocationUnion } from "@/lib/types/rezdy";

export interface PickupValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PickupValidationOptions {
  isRequired?: boolean;
  requireAddress?: boolean;
  requireCoordinates?: boolean;
  requireInstructions?: boolean;
  maxDistance?: number; // In kilometers, for future use
}

/**
 * Validates a pickup location selection
 */
export function validatePickupLocation(
  selectedLocation: RezdyPickupLocation | null,
  availableLocations: RezdyPickupLocation[],
  options: PickupValidationOptions = {}
): PickupValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if pickup location is required
  if (options.isRequired && !selectedLocation) {
    errors.push("Pickup location is required");
    return { isValid: false, errors, warnings };
  }

  // If not required and no location selected, that's valid
  if (!selectedLocation) {
    return { isValid: true, errors, warnings };
  }

  // Check if the selected location is in the available locations list
  const isValidLocation = availableLocations.some(
    (location) => location.locationName === selectedLocation.locationName
  );

  if (!isValidLocation) {
    errors.push("Selected pickup location is not available");
  }

  // Validate required fields
  if (options.requireAddress && !selectedLocation.address) {
    errors.push("Pickup location must have an address");
  }

  if (options.requireCoordinates && (!selectedLocation.latitude || !selectedLocation.longitude)) {
    errors.push("Pickup location must have coordinates");
  }

  if (options.requireInstructions && !selectedLocation.additionalInstructions) {
    warnings.push("Pickup location has no additional instructions");
  }

  // Validate location name
  if (!selectedLocation.locationName || selectedLocation.locationName.trim().length === 0) {
    errors.push("Pickup location must have a valid name");
  }

  // Validate coordinates if provided
  if (selectedLocation.latitude !== undefined && selectedLocation.longitude !== undefined) {
    if (
      selectedLocation.latitude < -90 || selectedLocation.latitude > 90 ||
      selectedLocation.longitude < -180 || selectedLocation.longitude > 180
    ) {
      errors.push("Invalid coordinates for pickup location");
    }
  }

  // Validate minutes prior if provided
  if (selectedLocation.minutesPrior !== undefined) {
    if (selectedLocation.minutesPrior < -120 || selectedLocation.minutesPrior > 120) {
      warnings.push("Pickup timing seems unusual (more than 2 hours before/after tour)");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates that pickup locations are available for a booking
 */
export function validatePickupAvailability(
  pickupLocations: RezdyPickupLocation[],
  participantCount: number
): PickupValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (pickupLocations.length === 0) {
    errors.push("No pickup locations available for this tour");
    return { isValid: false, errors, warnings };
  }

  // Check if all locations have valid data
  const invalidLocations = pickupLocations.filter(
    (location) => !location.locationName || location.locationName.trim().length === 0
  );

  if (invalidLocations.length > 0) {
    warnings.push(`${invalidLocations.length} pickup location(s) have missing or invalid names`);
  }

  // Check for duplicate locations
  const locationNames = pickupLocations.map((l) => l.locationName);
  const duplicates = locationNames.filter((name, index) => locationNames.indexOf(name) !== index);
  
  if (duplicates.length > 0) {
    warnings.push(`Duplicate pickup locations found: ${duplicates.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates booking form pickup data
 */
export function validateBookingPickupData(
  selectedLocation: RezdyPickupLocation | null,
  effectiveLocations: RezdyPickupLocation[],
  isProductRequiresPickup: boolean,
  hasBookingOptions: boolean
): PickupValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // If product requires pickup but no locations available
  if (isProductRequiresPickup && effectiveLocations.length === 0) {
    errors.push("This tour requires pickup but no pickup locations are available");
    return { isValid: false, errors, warnings };
  }

  // If booking options are used, different validation rules apply
  if (hasBookingOptions) {
    // For booking options, the pickup location is handled by the booking option selector
    return { isValid: true, errors, warnings };
  }

  // Standard pickup validation
  const validationOptions: PickupValidationOptions = {
    isRequired: isProductRequiresPickup && effectiveLocations.length > 0,
    requireAddress: false, // Address is optional
    requireCoordinates: false, // Coordinates are optional
    requireInstructions: false, // Instructions are optional
  };

  return validatePickupLocation(selectedLocation, effectiveLocations, validationOptions);
}

/**
 * Get user-friendly error messages for pickup validation
 */
export function getPickupValidationMessage(result: PickupValidationResult): string {
  if (result.isValid) {
    return "";
  }

  if (result.errors.length === 1) {
    return result.errors[0];
  }

  return `Please fix the following issues: ${result.errors.join(", ")}`;
}

/**
 * Get user-friendly warning messages for pickup validation
 */
export function getPickupWarningMessage(result: PickupValidationResult): string {
  if (result.warnings.length === 0) {
    return "";
  }

  if (result.warnings.length === 1) {
    return result.warnings[0];
  }

  return `Note: ${result.warnings.join(", ")}`;
}