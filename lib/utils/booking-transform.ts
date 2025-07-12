import {
  RezdyBooking,
  RezdyBookingItem,
  RezdyParticipant,
  RezdyBookingExtra,
  RezdyCustomer,
} from "@/lib/types/rezdy";

export interface BookingFormData {
  product: {
    code: string;
    name: string;
    description?: string;
  };
  session: {
    id: string;
    startTime: string;
    endTime: string;
    pickupLocation?: any;
    bookingOption?: any;
  };
  guests: Array<{
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    type: "ADULT" | "CHILD" | "INFANT";
  }>;
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
  };
  extras?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    totalPrice: number;
  }>;
  payment?: {
    method?: string;
    cardNumber?: string;
    [key: string]: any;
  };
  // Optional guest counts for simplified booking flow
  guestCounts?: {
    adults: number;
    children: number;
    infants: number;
  };
}

/**
 * Aggregates individual guest details into participant counts by type
 */
export function aggregateParticipants(
  guests: BookingFormData["guests"]
): RezdyParticipant[] {
  const participantCounts = guests.reduce((acc, guest) => {
    const type = guest.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(participantCounts).map(([type, number]) => ({
    type,
    number,
  }));
}

/**
 * Transforms selected extras to Rezdy booking extras format
 */
export function transformExtrasToRezdy(
  extras: BookingFormData["extras"] = []
): RezdyBookingExtra[] {
  return extras.map((extra) => ({
    extraId: extra.id,
    quantity: extra.quantity,
    unitPrice: extra.price,
    totalPrice: extra.totalPrice,
  }));
}

/**
 * Calculates pricing for extras based on quantity and price type
 */
export function calculateExtrasPricing(
  selectedExtras: Array<{
    id: string;
    name: string;
    price: number;
    priceType: "PER_PERSON" | "PER_BOOKING" | "PER_DAY";
    quantity: number;
  }>,
  participantCount: number = 1,
  days: number = 1
): Array<{
  id: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
}> {
  return selectedExtras.map((extra) => {
    let totalPrice = 0;

    switch (extra.priceType) {
      case "PER_PERSON":
        totalPrice = extra.price * extra.quantity * participantCount;
        break;
      case "PER_BOOKING":
        totalPrice = extra.price * extra.quantity;
        break;
      case "PER_DAY":
        totalPrice = extra.price * extra.quantity * days;
        break;
      default:
        totalPrice = extra.price * extra.quantity;
    }

    return {
      id: extra.id,
      name: extra.name,
      price: extra.price,
      quantity: extra.quantity,
      totalPrice,
    };
  });
}

/**
 * Transforms contact information to Rezdy customer format
 */
export function transformContactToCustomer(
  contact: BookingFormData["contact"]
): RezdyCustomer {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone || undefined,
  };
}

/**
 * Transforms booking form data to Rezdy booking format
 */
export function transformBookingDataToRezdy(
  bookingData: BookingFormData,
  orderNumber?: string
): RezdyBooking {
  // Aggregate participants
  const participants = aggregateParticipants(bookingData.guests);

  // Transform extras
  const extras = transformExtrasToRezdy(bookingData.extras);

  // Extract pickup ID if available
  const pickupId = bookingData.session.pickupLocation?.id || undefined;

  // Create booking item
  const bookingItem: RezdyBookingItem = {
    productCode: bookingData.product.code,
    startTimeLocal: bookingData.session.startTime,
    participants,
    amount: bookingData.pricing.total,
    pickupId,
    extras: extras.length > 0 ? extras : undefined,
  };

  // Transform customer
  const customer = transformContactToCustomer(bookingData.contact);

  // Create Rezdy booking
  const rezdyBooking: RezdyBooking = {
    orderNumber,
    customer,
    items: [bookingItem],
    totalAmount: bookingData.pricing.total,
    paymentOption: bookingData.payment?.method,
    status: "PENDING",
  };

  return rezdyBooking;
}

/**
 * Validates that booking data has all required fields for Rezdy submission
 */
export function validateBookingDataForRezdy(bookingData: BookingFormData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate product
  if (!bookingData.product.code) {
    errors.push("Product code is required");
  }

  // Validate session
  if (!bookingData.session.id) {
    errors.push("Session ID is required");
  }
  if (!bookingData.session.startTime) {
    errors.push("Session start time is required");
  }

  // Validate guests
  if (!bookingData.guests || bookingData.guests.length === 0) {
    errors.push("At least one guest is required");
  }

  // Validate contact
  if (!bookingData.contact.firstName) {
    errors.push("Contact first name is required");
  }
  if (!bookingData.contact.lastName) {
    errors.push("Contact last name is required");
  }
  if (!bookingData.contact.email) {
    errors.push("Contact email is required");
  }

  // Validate pricing
  if (!bookingData.pricing.total || bookingData.pricing.total <= 0) {
    errors.push("Total amount must be greater than 0");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Utility to get total participant count from guest list
 */
export function getTotalParticipantCount(
  guests: BookingFormData["guests"]
): number {
  return guests.length;
}

/**
 * Utility to get participant breakdown by type
 */
export function getParticipantBreakdown(guests: BookingFormData["guests"]): {
  adults: number;
  children: number;
  infants: number;
} {
  return guests.reduce(
    (acc, guest) => {
      switch (guest.type) {
        case "ADULT":
          acc.adults++;
          break;
        case "CHILD":
          acc.children++;
          break;
        case "INFANT":
          acc.infants++;
          break;
      }
      return acc;
    },
    { adults: 0, children: 0, infants: 0 }
  );
}
