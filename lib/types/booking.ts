import {
  RezdyProduct,
  RezdySession,
  RezdyPickupLocation,
  RezdyBookingOption,
} from "./rezdy";

export interface BookingData {
  id?: string;
  product: {
    code: string;
    name: string;
    hasPickupServices: boolean;
    pickupServiceType:
      | "door-to-door"
      | "designated-points"
      | "shuttle"
      | "none";
  };
  session: {
    id: string;
    startTime: string;
    endTime: string;
  };
  selectedBookingOption?: RezdyBookingOption;
  pickupLocation?: RezdyPickupLocation | null;
  participants: {
    adults: number;
    children?: number;
    infants?: number;
  };
  contact: {
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
  };
  pricing: {
    basePrice: number;
    sessionPrice: number;
    subtotal: number;
    taxAndFees: number;
    total: number;
    optionPrice?: number;
    optionName?: string;
  };
  payment?: {
    method: string;
    status: "pending" | "confirmed" | "failed";
    transactionId?: string;
  };
  status: "draft" | "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  updatedAt?: string;
  confirmationNumber?: string;
  notes?: string;
}

export interface PickupLocationSelection {
  location: RezdyPickupLocation;
  isRequired: boolean;
  serviceType: "door-to-door" | "designated-points" | "shuttle" | "none";
}

export interface BookingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BookingOptionSelection {
  option: RezdyBookingOption;
  selectedPickupLocation: RezdyPickupLocation;
  isRequired: boolean;
}

// BookingFormData has been moved to @/lib/utils/booking-transform
// to consolidate interfaces and preserve individual guest details.
// Import from there instead: import { BookingFormData } from '@/lib/utils/booking-transform'
