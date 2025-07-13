import {
  RezdyBooking,
  RezdyBookingItem,
  RezdyParticipant,
  RezdyBookingExtra,
  RezdyCustomer,
  RezdyQuantity,
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
  // Track selected priceOptions from Rezdy
  selectedPriceOptions?: {
    adult?: { id: number; label: string; price: number };
    child?: { id: number; label: string; price: number };
    infant?: { id: number; label: string; price: number };
  };
}

/**
 * Creates Rezdy quantities array from guest data and selected price options
 */
export function createRezdyQuantities(
  guests: BookingFormData["guests"],
  selectedPriceOptions?: BookingFormData["selectedPriceOptions"],
  guestCounts?: BookingFormData["guestCounts"]
): RezdyQuantity[] {
  console.log("🔄 Creating Rezdy quantities:", {
    guestCount: guests?.length || 0,
    hasGuestCounts: !!guestCounts,
    guestCounts: guestCounts,
    hasSelectedPriceOptions: !!selectedPriceOptions,
    selectedPriceOptions
  });

  const quantities: RezdyQuantity[] = [];

  // Use guest counts or individual guests to determine quantities
  if (guestCounts || (guests && guests.length > 0)) {
    // Calculate counts
    const counts = {
      adults: 0,
      children: 0,
      infants: 0
    };

    if (guestCounts) {
      counts.adults = guestCounts.adults;
      counts.children = guestCounts.children;
      counts.infants = guestCounts.infants;
    } else if (guests) {
      guests.forEach(guest => {
        if (guest.type === "ADULT") counts.adults++;
        else if (guest.type === "CHILD") counts.children++;
        else if (guest.type === "INFANT") counts.infants++;
      });
    }

    // Create quantities using the exact price option labels
    if (counts.adults > 0 && selectedPriceOptions?.adult) {
      quantities.push({
        optionLabel: selectedPriceOptions.adult.label,
        value: counts.adults
      });
    }

    if (counts.children > 0 && selectedPriceOptions?.child) {
      quantities.push({
        optionLabel: selectedPriceOptions.child.label,
        value: counts.children
      });
    }

    if (counts.infants > 0 && selectedPriceOptions?.infant) {
      quantities.push({
        optionLabel: selectedPriceOptions.infant.label,
        value: counts.infants
      });
    }

    // Fallback if no price options but we have counts
    if (quantities.length === 0 && (counts.adults > 0 || counts.children > 0 || counts.infants > 0)) {
      console.warn("⚠️ No price options selected, using default labels");
      if (counts.adults > 0) {
        quantities.push({ optionLabel: "Adult", value: counts.adults });
      }
      if (counts.children > 0) {
        quantities.push({ optionLabel: "Child", value: counts.children });
      }
      if (counts.infants > 0) {
        quantities.push({ optionLabel: "Infant", value: counts.infants });
      }
    }
  }

  console.log("✅ Created quantities:", quantities);
  return quantities;
}

/**
 * Aggregates individual guest details into participant counts by type
 * Falls back to guestCounts if individual guest details aren't available
 * @deprecated Use createRezdyQuantities instead
 */
export function aggregateParticipants(
  guests: BookingFormData["guests"],
  selectedPriceOptions?: BookingFormData["selectedPriceOptions"],
  guestCounts?: BookingFormData["guestCounts"]
): RezdyParticipant[] {
  console.log("🔄 Aggregating participants:", {
    guestCount: guests?.length || 0,
    hasGuestCounts: !!guestCounts,
    guestCounts: guestCounts,
    hasSelectedPriceOptions: !!selectedPriceOptions
  });

  // If we have individual guest details, use them
  if (guests && guests.length > 0) {
    console.log("📝 Using individual guest details");
    const participantCounts = guests.reduce((acc, guest) => {
      const type = guest.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const participants = Object.entries(participantCounts).map(([type, number]) => {
      const participant: RezdyParticipant = {
        type,
        number,
      };

      // Add priceOptionId if available
      if (selectedPriceOptions) {
        if (type === "ADULT" && selectedPriceOptions.adult) {
          participant.priceOptionId = selectedPriceOptions.adult.id;
        } else if (type === "CHILD" && selectedPriceOptions.child) {
          participant.priceOptionId = selectedPriceOptions.child.id;
        } else if (type === "INFANT" && selectedPriceOptions.infant) {
          participant.priceOptionId = selectedPriceOptions.infant.id;
        }
      }

      return participant;
    });

    console.log("✅ Participants from guest details:", participants);
    return participants;
  }

  // Fallback: Use guestCounts if individual guest details aren't available
  if (guestCounts) {
    console.log("📊 Using guest counts fallback");
    const participants: RezdyParticipant[] = [];

    if (guestCounts.adults > 0) {
      const participant: RezdyParticipant = {
        type: "ADULT",
        number: guestCounts.adults,
      };
      if (selectedPriceOptions?.adult) {
        participant.priceOptionId = selectedPriceOptions.adult.id;
      }
      participants.push(participant);
    }

    if (guestCounts.children > 0) {
      const participant: RezdyParticipant = {
        type: "CHILD",
        number: guestCounts.children,
      };
      if (selectedPriceOptions?.child) {
        participant.priceOptionId = selectedPriceOptions.child.id;
      }
      participants.push(participant);
    }

    if (guestCounts.infants > 0) {
      const participant: RezdyParticipant = {
        type: "INFANT",
        number: guestCounts.infants,
      };
      if (selectedPriceOptions?.infant) {
        participant.priceOptionId = selectedPriceOptions.infant.id;
      }
      participants.push(participant);
    }

    console.log("✅ Participants from guest counts:", participants);
    return participants;
  }

  // If neither guests nor guestCounts are available, return empty array
  console.log("❌ No guests or guest counts available - returning empty participants");
  return [];
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
  console.log("🔄 Transforming booking data to Rezdy format:", {
    productCode: bookingData.product.code,
    guestCount: bookingData.guests?.length || 0,
    guestCounts: bookingData.guestCounts,
    hasSelectedPriceOptions: !!bookingData.selectedPriceOptions,
    totalAmount: bookingData.pricing.total
  });

  // Create quantities array using the new function
  const quantities = createRezdyQuantities(bookingData.guests, bookingData.selectedPriceOptions, bookingData.guestCounts);
  
  console.log("👥 Created quantities:", quantities);

  // Transform extras
  const extras = transformExtrasToRezdy(bookingData.extras);

  // Extract pickup ID if available
  const pickupId = bookingData.session.pickupLocation?.id || undefined;

  // Validate quantities
  const totalQuantity = quantities.reduce((sum, q) => sum + q.value, 0);
  
  if (totalQuantity === 0) {
    console.error("❌ Total quantity is 0!", {
      quantities,
      guestCounts: bookingData.guestCounts,
      guests: bookingData.guests?.length
    });
    // Create a default quantity if needed
    quantities.push({ optionLabel: "Adult", value: 1 });
    console.log("⚠️ Added fallback quantity");
  }

  // Create booking item with quantities instead of participants
  const bookingItem: RezdyBookingItem = {
    productCode: bookingData.product.code,
    startTimeLocal: bookingData.session.startTime,
    quantities,
    amount: bookingData.pricing.total,
    pickupId,
    extras: extras.length > 0 ? extras : undefined,
  };
  
  console.log("📋 Created booking item:", {
    productCode: bookingItem.productCode,
    quantityCount: quantities.length,
    totalQuantity: quantities.reduce((sum, q) => sum + q.value, 0),
    quantities: quantities,
    amount: bookingItem.amount
  });

  // Transform customer
  const customer = transformContactToCustomer(bookingData.contact);

  // Create Rezdy booking
  const rezdyBooking: RezdyBooking = {
    orderNumber,
    customer,
    items: [bookingItem],
    totalAmount: bookingData.pricing.total,
    paymentOption: bookingData.payment?.method || "CREDITCARD",
    status: "PENDING",
  };

  console.log("📋 Generated Rezdy booking:", {
    orderNumber: rezdyBooking.orderNumber,
    participantCount: participants.length,
    totalParticipants: participants.reduce((sum, p) => sum + p.number, 0),
    totalAmount: rezdyBooking.totalAmount,
    paymentOption: rezdyBooking.paymentOption,
    status: rezdyBooking.status
  });

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

  console.log("🔍 Validating booking data for Rezdy:", {
    productCode: bookingData.product.code,
    sessionId: bookingData.session.id,
    sessionStartTime: bookingData.session.startTime,
    guestCount: bookingData.guests?.length || 0,
    guestCounts: bookingData.guestCounts,
    contactEmail: bookingData.contact.email,
    totalAmount: bookingData.pricing.total
  });

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

  // Validate guests/participants - check both individual guests and guest counts
  const hasIndividualGuests = bookingData.guests && bookingData.guests.length > 0;
  const hasGuestCounts = bookingData.guestCounts && 
    (bookingData.guestCounts.adults > 0 || bookingData.guestCounts.children > 0 || bookingData.guestCounts.infants > 0);

  if (!hasIndividualGuests && !hasGuestCounts) {
    errors.push("At least one guest or guest counts are required");
  } else {
    // Ensure participants have valid quantities
    const participants = aggregateParticipants(bookingData.guests, bookingData.selectedPriceOptions, bookingData.guestCounts);
    if (!participants || participants.length === 0) {
      errors.push("Participant aggregation failed - no valid participants");
    } else {
      // Validate each participant has a number > 0
      for (const participant of participants) {
        if (!participant.number || participant.number <= 0) {
          errors.push(`Invalid participant count for ${participant.type}: ${participant.number}`);
        }
        if (!participant.type) {
          errors.push("Participant type is required");
        }
      }
    }
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

  const isValid = errors.length === 0;
  
  console.log("✅ Booking data validation result:", {
    isValid,
    errorCount: errors.length,
    errors: errors.length > 0 ? errors : undefined
  });

  return {
    isValid,
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
