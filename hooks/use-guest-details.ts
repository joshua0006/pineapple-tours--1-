"use client";

import { useState, useEffect, useCallback } from "react";
import { GuestInfo } from "@/components/ui/guest-manager";
import {
  StoredGuestDetails,
  StoredContactInfo,
  GuestDetailsValidation,
  SaveGuestDetailsOptions,
  UseGuestDetailsReturn,
  GUEST_DETAILS_CONFIG,
  isValidStoredGuestDetails,
} from "@/lib/types/guest-details";

/**
 * Hook for managing guest details storage and retrieval
 */
export function useGuestDetails(): UseGuestDetailsReturn {
  const [storedDetails, setStoredDetails] = useState<StoredGuestDetails | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load stored details on mount
  useEffect(() => {
    const loadStoredDetails = () => {
      try {
        const stored = localStorage.getItem(GUEST_DETAILS_CONFIG.storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (isValidStoredGuestDetails(parsed)) {
            // Check if expired
            if (Date.now() > parsed.metadata.expiresAt) {
              // Remove expired data
              localStorage.removeItem(GUEST_DETAILS_CONFIG.storageKey);
              setStoredDetails(null);
            } else {
              setStoredDetails(parsed);
            }
          } else {
            // Invalid data format, remove it
            localStorage.removeItem(GUEST_DETAILS_CONFIG.storageKey);
            setStoredDetails(null);
          }
        }
      } catch (error) {
        console.warn('Failed to load stored guest details:', error);
        // Clear potentially corrupted data
        localStorage.removeItem(GUEST_DETAILS_CONFIG.storageKey);
        setStoredDetails(null);
      } finally {
        setIsLoaded(true);
      }
    };

    loadStoredDetails();
  }, []);

  /**
   * Save guest details to localStorage
   */
  const saveGuestDetails = useCallback(async (
    contact: StoredContactInfo,
    guests: GuestInfo[],
    options: SaveGuestDetailsOptions = {}
  ): Promise<boolean> => {
    try {
      // Validate input data
      if (!contact.firstName?.trim() || !contact.lastName?.trim() || !contact.email?.trim()) {
        console.warn('Cannot save guest details: missing required contact information');
        return false;
      }

      if (!guests.length) {
        console.warn('Cannot save guest details: no guests provided');
        return false;
      }

      // Check if we should overwrite existing data
      if (!options.overwrite && storedDetails) {
        console.log('Guest details already exist and overwrite is disabled');
        return false;
      }

      const now = Date.now();
      const expiresAt = now + (GUEST_DETAILS_CONFIG.expirationDays * 24 * 60 * 60 * 1000);

      const detailsToStore: StoredGuestDetails = {
        contact: {
          ...contact,
          // Ensure required fields are strings
          firstName: contact.firstName.trim(),
          lastName: contact.lastName.trim(),
          email: contact.email.trim(),
          phone: contact.phone?.trim() || '',
          country: contact.country?.trim() || 'Australia',
        },
        guests: guests.map(guest => ({
          ...guest,
          firstName: guest.firstName.trim(),
          lastName: guest.lastName.trim(),
        })),
        metadata: {
          timestamp: now,
          lastBookingId: options.bookingId,
          lastProductName: options.productName,
          guestCount: guests.length,
          expiresAt,
          version: GUEST_DETAILS_CONFIG.version,
        },
      };

      // Save to localStorage
      localStorage.setItem(
        GUEST_DETAILS_CONFIG.storageKey,
        JSON.stringify(detailsToStore)
      );

      // Update state
      setStoredDetails(detailsToStore);

      console.log('✅ Guest details saved successfully', {
        guestCount: guests.length,
        contactName: `${contact.firstName} ${contact.lastName}`,
        expiresAt: new Date(expiresAt).toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Failed to save guest details:', error);
      return false;
    }
  }, [storedDetails]);

  /**
   * Get stored details (direct access)
   */
  const getStoredDetails = useCallback((): StoredGuestDetails | null => {
    return storedDetails;
  }, [storedDetails]);

  /**
   * Clear stored guest details
   */
  const clearStoredDetails = useCallback(() => {
    try {
      localStorage.removeItem(GUEST_DETAILS_CONFIG.storageKey);
      setStoredDetails(null);
      console.log('🗑️ Guest details cleared successfully');
    } catch (error) {
      console.error('Failed to clear guest details:', error);
    }
  }, []);

  /**
   * Validate stored guest details
   */
  const validateStoredDetails = useCallback((details?: StoredGuestDetails): GuestDetailsValidation => {
    const dataToValidate = details || storedDetails;
    
    if (!dataToValidate) {
      return {
        isValid: false,
        errors: ['No guest details found'],
        warnings: [],
        canPrefill: false,
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate contact information
    if (!dataToValidate.contact.firstName?.trim()) {
      errors.push('Contact first name is required');
    }
    if (!dataToValidate.contact.lastName?.trim()) {
      errors.push('Contact last name is required');
    }
    if (!dataToValidate.contact.email?.trim()) {
      errors.push('Contact email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dataToValidate.contact.email)) {
      errors.push('Contact email format is invalid');
    }

    // Validate guests
    if (!dataToValidate.guests.length) {
      errors.push('At least one guest is required');
    } else {
      dataToValidate.guests.forEach((guest, index) => {
        if (!guest.firstName?.trim()) {
          errors.push(`Guest ${index + 1} first name is required`);
        }
        if (!guest.lastName?.trim()) {
          errors.push(`Guest ${index + 1} last name is required`);
        }
        if (guest.age < 0 || guest.age > 120) {
          warnings.push(`Guest ${index + 1} age seems unusual: ${guest.age}`);
        }
      });
    }

    // Check expiration
    if (Date.now() > dataToValidate.metadata.expiresAt) {
      errors.push('Guest details have expired');
    }

    // Check if data is too old (warn if older than 7 days)
    const daysSinceStored = (Date.now() - dataToValidate.metadata.timestamp) / (24 * 60 * 60 * 1000);
    if (daysSinceStored > 7) {
      warnings.push(`Guest details are ${Math.floor(daysSinceStored)} days old`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canPrefill: errors.length === 0, // Can prefill if no errors
    };
  }, [storedDetails]);

  /**
   * Check if stored details are expired
   */
  const isExpired = useCallback((details?: StoredGuestDetails): boolean => {
    const dataToCheck = details || storedDetails;
    if (!dataToCheck) return true;
    
    return Date.now() > dataToCheck.metadata.expiresAt;
  }, [storedDetails]);

  // Computed properties
  const hasStoredDetails = isLoaded && storedDetails !== null && !isExpired();
  const isValid = hasStoredDetails && validateStoredDetails().isValid;

  return {
    storedDetails,
    hasStoredDetails,
    isValid,
    saveGuestDetails,
    getStoredDetails,
    clearStoredDetails,
    validateStoredDetails,
    isExpired,
  };
}

/**
 * Utility function to encode guest details for URL parameters
 */
export function encodeGuestDetailsForUrl(details: StoredGuestDetails): string {
  try {
    const prefillData = {
      contact: details.contact,
      guests: details.guests.map(guest => ({
        firstName: guest.firstName,
        lastName: guest.lastName,
        age: guest.age,
        type: guest.type,
      })),
      metadata: {
        source: 'stored_details',
        timestamp: Date.now(),
      },
    };

    return btoa(JSON.stringify(prefillData));
  } catch (error) {
    console.error('Failed to encode guest details for URL:', error);
    return '';
  }
}

/**
 * Utility function to decode guest details from URL parameters
 */
export function decodeGuestDetailsFromUrl(encoded: string): any | null {
  try {
    const decoded = atob(encoded);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode guest details from URL:', error);
    return null;
  }
}