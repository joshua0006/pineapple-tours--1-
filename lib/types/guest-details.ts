import { GuestInfo } from "@/components/ui/guest-manager";

/**
 * Contact information structure for stored guest details
 */
export interface StoredContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  dietaryRequirements?: string;
  accessibilityNeeds?: string;
  specialRequests?: string;
}

/**
 * Metadata about when and how the guest details were stored
 */
export interface GuestDetailsMetadata {
  timestamp: number;
  lastBookingId?: string;
  lastProductName?: string;
  guestCount: number;
  expiresAt: number;
  version: string; // For future schema migrations
}

/**
 * Complete stored guest details structure
 */
export interface StoredGuestDetails {
  contact: StoredContactInfo;
  guests: GuestInfo[];
  metadata: GuestDetailsMetadata;
}

/**
 * Configuration for guest details storage
 */
export interface GuestDetailsStorageConfig {
  storageKey: string;
  expirationDays: number;
  version: string;
}

/**
 * Result of guest details validation
 */
export interface GuestDetailsValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canPrefill: boolean;
}

/**
 * Options for saving guest details
 */
export interface SaveGuestDetailsOptions {
  bookingId?: string;
  productName?: string;
  overwrite?: boolean;
}

/**
 * Pre-fill data structure for URL parameters
 */
export interface GuestDetailsPrefillData {
  contact: StoredContactInfo;
  guests: Pick<GuestInfo, 'firstName' | 'lastName' | 'age' | 'type'>[];
  metadata: {
    source: 'stored_details';
    timestamp: number;
  };
}

/**
 * URL parameter structure for guest details
 */
export interface GuestDetailsUrlParams {
  guestDetails?: string; // base64 encoded GuestDetailsPrefillData
  prefill?: string; // 'true' to enable prefill
}

/**
 * Guest details reuse popup props
 */
export interface GuestDetailsReusePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUseStoredDetails: (details: StoredGuestDetails) => void;
  onEnterNewDetails: () => void;
  storedDetails: StoredGuestDetails;
}

/**
 * Hook return type for useGuestDetails
 */
export interface UseGuestDetailsReturn {
  storedDetails: StoredGuestDetails | null;
  hasStoredDetails: boolean;
  isValid: boolean;
  saveGuestDetails: (
    contact: StoredContactInfo, 
    guests: GuestInfo[], 
    options?: SaveGuestDetailsOptions
  ) => Promise<boolean>;
  getStoredDetails: () => StoredGuestDetails | null;
  clearStoredDetails: () => void;
  validateStoredDetails: (details?: StoredGuestDetails) => GuestDetailsValidation;
  isExpired: (details?: StoredGuestDetails) => boolean;
}

/**
 * Default configuration values
 */
export const GUEST_DETAILS_CONFIG: GuestDetailsStorageConfig = {
  storageKey: 'pineapple_tours_guest_details',
  expirationDays: 30,
  version: '1.0.0'
};

/**
 * Utility type for extracting contact info from booking form data
 */
export type ContactInfoFromBooking = Pick<
  StoredContactInfo,
  'firstName' | 'lastName' | 'email' | 'phone' | 'country'
>;

/**
 * Type guard to check if stored details are valid
 */
export function isValidStoredGuestDetails(data: any): data is StoredGuestDetails {
  return (
    data &&
    typeof data === 'object' &&
    data.contact &&
    typeof data.contact.firstName === 'string' &&
    typeof data.contact.lastName === 'string' &&
    typeof data.contact.email === 'string' &&
    typeof data.contact.phone === 'string' &&
    Array.isArray(data.guests) &&
    data.metadata &&
    typeof data.metadata.timestamp === 'number' &&
    typeof data.metadata.guestCount === 'number' &&
    typeof data.metadata.expiresAt === 'number'
  );
}

/**
 * Type guard to check if prefill data is valid
 */
export function isValidPrefillData(data: any): data is GuestDetailsPrefillData {
  return (
    data &&
    typeof data === 'object' &&
    data.contact &&
    typeof data.contact.firstName === 'string' &&
    typeof data.contact.lastName === 'string' &&
    typeof data.contact.email === 'string' &&
    Array.isArray(data.guests) &&
    data.metadata &&
    typeof data.metadata.timestamp === 'number'
  );
}