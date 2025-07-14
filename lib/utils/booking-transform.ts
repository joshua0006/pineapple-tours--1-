import {
  RezdyBooking,
  RezdyBookingItem,
  RezdyParticipant,
  RezdyBookingExtra,
  RezdyCustomer,
  RezdyQuantity,
  RezdyPayment,
  RezdyBookingField,
} from "@/lib/types/rezdy";
import { getCorrectPriceOptionLabel } from "@/lib/utils/rezdy-product-cache";

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
    certificationLevel?: string;
    certificationNumber?: string;
    certificationAgency?: string;
    barcode?: string;
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
    type?: "CASH" | "CREDITCARD";
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
  guestCounts?: BookingFormData["guestCounts"],
  productCode?: string
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
    if (counts.adults > 0) {
      let label = selectedPriceOptions?.adult?.label;
      
      // If no label or we need to validate, try to get the correct one from cache
      if (productCode && (!label || label === "Adult")) {
        const correctLabel = getCorrectPriceOptionLabel(productCode, 'adult');
        if (correctLabel) {
          label = correctLabel;
          console.log(`✅ Using correct adult label from product: "${label}"`);
        }
      }
      
      if (label) {
        quantities.push({
          optionLabel: label,
          value: counts.adults
        });
      }
    }

    if (counts.children > 0) {
      let label = selectedPriceOptions?.child?.label;
      
      // If no label or we need to validate, try to get the correct one from cache
      if (productCode && (!label || label === "Child")) {
        const correctLabel = getCorrectPriceOptionLabel(productCode, 'child');
        if (correctLabel) {
          label = correctLabel;
          console.log(`✅ Using correct child label from product: "${label}"`);
        }
      }
      
      if (label) {
        quantities.push({
          optionLabel: label,
          value: counts.children
        });
      }
    }

    if (counts.infants > 0) {
      let label = selectedPriceOptions?.infant?.label;
      
      // If no label or we need to validate, try to get the correct one from cache
      if (productCode && (!label || label === "Infant")) {
        const correctLabel = getCorrectPriceOptionLabel(productCode, 'infant');
        if (correctLabel) {
          label = correctLabel;
          console.log(`✅ Using correct infant label from product: "${label}"`);
        }
      }
      
      if (label) {
        quantities.push({
          optionLabel: label,
          value: counts.infants
        });
      }
    }

    // Fallback if no price options but we have counts
    if (quantities.length === 0 && (counts.adults > 0 || counts.children > 0 || counts.infants > 0)) {
      console.warn("⚠️ No price options selected, using default labels");
      
      // Create fallback quantities with default labels
      if (counts.adults > 0) {
        quantities.push({ optionLabel: "Adult", value: counts.adults });
      }
      if (counts.children > 0) {
        quantities.push({ optionLabel: "Child", value: counts.children });
      }
      if (counts.infants > 0) {
        quantities.push({ optionLabel: "Infant", value: counts.infants });
      }
      
      console.log("🔄 Created fallback quantities:", quantities);
    }

    // Final validation: ensure we have at least one quantity
    if (quantities.length === 0) {
      console.error("❌ CRITICAL: No quantities could be created!", {
        guestCounts,
        guestCount: guests?.length || 0,
        selectedPriceOptions
      });
      // Emergency fallback: create a single adult quantity
      quantities.push({ optionLabel: "Adult", value: 1 });
      console.log("🚨 EMERGENCY: Created single adult quantity to prevent API failure");
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
    name: extra.name,
    quantity: extra.quantity,
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
  // Ensure email is always populated (critical for Rezdy API)
  if (!contact.email) {
    console.error("❌ CRITICAL: Customer email is required for Rezdy booking");
    throw new Error("Customer email is required for booking creation");
  }

  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
  };
}

/**
 * Transforms booking form data to Rezdy booking format
 */
export function transformBookingDataToRezdy(
  bookingData: BookingFormData,
  paymentConfirmationId?: string
): RezdyBooking {
  // Safety: Ensure payment data exists before transformation
  if (!bookingData.payment) {
    console.warn("⚠️ SAFETY: No payment data in booking, adding default CREDITCARD payment");
    bookingData = {
      ...bookingData,
      payment: {
        method: "credit_card",
        type: "CREDITCARD" as const
      }
    };
  }
  
  console.log("🔄 Transforming booking data to Rezdy format:", {
    productCode: bookingData.product.code,
    guestCount: bookingData.guests?.length || 0,
    guestCounts: bookingData.guestCounts,
    hasSelectedPriceOptions: !!bookingData.selectedPriceOptions,
    totalAmount: bookingData.pricing.total,
    inputPayment: bookingData.payment
  });

  // Create quantities array using the new function
  const quantities = createRezdyQuantities(
    bookingData.guests, 
    bookingData.selectedPriceOptions, 
    bookingData.guestCounts,
    bookingData.product.code
  );
  
  console.log("👥 Created quantities:", quantities);

  // Note: Extras are not included in the basic booking structure as per Rezdy API docs

  // Note: pickupId is handled within the booking item structure

  // Validate quantities - critical for Rezdy API
  const totalQuantity = quantities.reduce((sum, q) => sum + q.value, 0);
  
  if (totalQuantity === 0) {
    console.error("❌ Total quantity is 0!", {
      quantities,
      guestCounts: bookingData.guestCounts,
      guests: bookingData.guests?.length
    });
    // Create a default quantity if needed - this prevents Rezdy Error Code 10
    quantities.push({ optionLabel: "Adult", value: 1 });
    console.log("⚠️ Added fallback quantity to prevent Rezdy API rejection");
  }

  // Validate each quantity has valid optionLabel and value
  for (const quantity of quantities) {
    if (!quantity.optionLabel || quantity.optionLabel.trim() === "") {
      console.error("❌ Invalid quantity: missing optionLabel", quantity);
      throw new Error("Invalid quantity: optionLabel is required");
    }
    if (!quantity.value || quantity.value <= 0) {
      console.error("❌ Invalid quantity: value must be > 0", quantity);
      throw new Error(`Invalid quantity: value must be greater than 0 for ${quantity.optionLabel}`);
    }
  }

  // Create booking item with quantities 
  const bookingItem: RezdyBookingItem = {
    productCode: bookingData.product.code,
    startTimeLocal: bookingData.session.startTime,
    quantities,
    participants: [], // Will be populated below
  };

  // Create participants array with detailed fields for each guest
  // This matches the exact structure from the Rezdy API specification
  if (bookingData.guests && bookingData.guests.length > 0) {
    bookingItem.participants = bookingData.guests.map(guest => ({
      fields: [
        { label: "First Name", value: guest.firstName },
        { label: "Last Name", value: guest.lastName },
        { label: "Certification level", value: guest.certificationLevel || "" },
        { label: "Certification number", value: guest.certificationNumber || "" },
        { label: "Certification agency", value: guest.certificationAgency || "" },
        { label: "Barcode", value: guest.barcode || "" }
      ]
    }));
  } else {
    // Ensure participants array exists even if empty to match API structure
    bookingItem.participants = [];
  }

  // Add extras if available
  if (bookingData.extras && bookingData.extras.length > 0) {
    bookingItem.extras = bookingData.extras.map(extra => ({
      name: extra.name,
      quantity: extra.quantity
    }));
  }
  
  console.log("📋 Created booking item:", {
    productCode: bookingItem.productCode,
    quantityCount: quantities.length,
    totalQuantity: quantities.reduce((sum, q) => sum + q.value, 0),
    quantities: quantities,
  });

  // Transform customer
  const customer = transformContactToCustomer(bookingData.contact);

  // Map payment method to Rezdy payment type with fallback safety
  const mapPaymentMethodToRezdy = (paymentData?: BookingFormData["payment"]): "CASH" | "CREDITCARD" => {
    console.log("💳 Payment mapping input:", {
      paymentData,
      hasType: !!paymentData?.type,
      hasMethod: !!paymentData?.method,
      type: paymentData?.type,
      method: paymentData?.method
    });

    // First check if type is already explicitly set and valid
    if (paymentData?.type) {
      console.log("💳 Using explicit payment type:", paymentData.type);
      // Ensure it's a valid Rezdy type
      if (paymentData.type === "CASH" || paymentData.type === "CREDITCARD") {
        return paymentData.type;
      } else {
        console.warn("⚠️ Invalid explicit payment type, falling back to method mapping:", paymentData.type);
      }
    }
    
    // Fallback to method mapping
    const paymentMethod = paymentData?.method;
    if (!paymentMethod) {
      console.warn("⚠️ No payment method found, defaulting to CREDITCARD for safety");
      return "CREDITCARD";
    }
    
    const lowerMethod = paymentMethod.toLowerCase();
    
    // Only cash payments should map to CASH
    if (lowerMethod === 'cash') {
      console.log("💳 Mapped cash method to CASH type");
      return 'CASH';
    }
    
    // All other payment methods including Stripe, cards, digital wallets map to CREDITCARD
    // This includes: stripe, card, credit_card, westpac, paypal, sepa_debit, etc.
    console.log("💳 Mapped method to CREDITCARD type:", paymentMethod);
    return 'CREDITCARD';
  };

  // Create payment entry for Rezdy (required even though payment is processed externally)
  const paymentType = mapPaymentMethodToRezdy(bookingData.payment);
  
  // Note: Let booking-service.ts handle payment type validation and fallbacks
  // This allows the safety net logic to fix any issues before Rezdy submission
  
  // Build a more descriptive payment label
  let paymentLabel = "";
  if (bookingData.payment?.method) {
    const method = bookingData.payment.method;
    const methodCapitalized = method.charAt(0).toUpperCase() + method.slice(1);
    
    // Create descriptive labels based on payment method
    switch(method.toLowerCase()) {
      case 'stripe':
        paymentLabel = `Paid via Stripe (${paymentType === 'CASH' ? 'Cash' : 'Card'})`;
        break;
      case 'westpac':
        paymentLabel = `Paid via Westpac Gateway`;
        break;
      case 'paypal':
        paymentLabel = `Paid via PayPal`;
        break;
      case 'cash':
        paymentLabel = `Paid in cash`;
        break;
      case 'card':
      case 'credit_card':
        paymentLabel = `Paid by Credit Card`;
        break;
      default:
        paymentLabel = `${methodCapitalized} Payment`;
    }
  } else {
    paymentLabel = paymentType === "CASH" ? "Cash Payment" : "Credit Card Payment";
  }

  const payment: RezdyPayment = {
    amount: bookingData.pricing.total,
    type: paymentType || "CREDITCARD", // Final fallback to ensure type is never empty
    recipient: "SUPPLIER",
    label: paymentLabel,
  };

  console.log("💳 Created payment entry:", {
    originalPaymentData: bookingData.payment,
    originalMethod: bookingData.payment?.method,
    originalType: bookingData.payment?.type,
    mappedType: paymentType,
    amount: payment.amount,
    recipient: payment.recipient,
    finalPaymentObject: payment
  });

  // CRITICAL VALIDATION: Ensure payment type is never empty
  if (!payment.type) {
    console.error("❌ CRITICAL ERROR: Payment type is empty after mapping!", {
      originalPaymentData: bookingData.payment,
      mappedType: paymentType,
      paymentObject: payment
    });
    payment.type = "CREDITCARD"; // Emergency fallback
    console.log("⚠️ Emergency fallback: Set payment type to CREDITCARD");
  }
  
  // Additional validation: Ensure payment type is valid
  if (payment.type !== "CASH" && payment.type !== "CREDITCARD") {
    console.error("❌ CRITICAL ERROR: Invalid payment type after mapping!", {
      paymentType: payment.type,
      originalPaymentData: bookingData.payment
    });
    payment.type = "CREDITCARD"; // Emergency fallback
    console.log("⚠️ Emergency fallback: Reset invalid payment type to CREDITCARD");
  }
  
  // Double-check payment structure is complete
  if (!payment.recipient) {
    payment.recipient = "SUPPLIER";
  }
  if (!payment.label) {
    payment.label = payment.type === "CASH" ? "Cash Payment" : "Credit Card Payment";
  }

  // Add pickup location at top level if available (moved before booking creation)
  const pickupLocation = bookingData.session.pickupLocation ? {
    locationName: bookingData.session.pickupLocation.name || bookingData.session.pickupLocation.locationName || ""
  } : undefined;

  // Create Rezdy booking - must match official API structure exactly
  const rezdyBooking: RezdyBooking = {
    status: "CONFIRMED", // Required field: booking status
    customer,
    items: [bookingItem],
    payments: [payment],
    comments: "",
    fields: [],
    ...(pickupLocation && { pickupLocation })
  };

  // Add fields array with all special requirements and additional information
  const fields: RezdyBookingField[] = [];
  
  // Special Requirements field combining all customer needs
  const specialRequirements = [
    bookingData.contact.specialRequests,
    bookingData.contact.dietaryRequirements && `Dietary: ${bookingData.contact.dietaryRequirements}`,
    bookingData.contact.accessibilityNeeds && `Accessibility: ${bookingData.contact.accessibilityNeeds}`
  ].filter(Boolean).join(". ");
  
  if (specialRequirements) {
    fields.push({
      label: "Special Requirements",
      value: specialRequirements
    });
  }
  
  // Add emergency contact if provided
  if (bookingData.contact.emergencyContact && bookingData.contact.emergencyPhone) {
    fields.push({
      label: "Emergency Contact",
      value: `${bookingData.contact.emergencyContact} - ${bookingData.contact.emergencyPhone}`
    });
  }
  
  // Add country if provided
  if (bookingData.contact.country) {
    fields.push({
      label: "Country",
      value: bookingData.contact.country
    });
  }
  
  // Always assign fields array even if empty
  rezdyBooking.fields = fields;
  
  // Add internal comments with booking metadata
  const commentParts: string[] = [];
  
  // Add payment confirmation ID if provided
  if (paymentConfirmationId) {
    commentParts.push(`Payment Confirmation: ${paymentConfirmationId}`);
  }
  
  // Add booking timestamp
  commentParts.push(`Booked at: ${new Date().toISOString()}`);
  
  // Add total guest count
  const totalGuests = quantities.reduce((sum, q) => sum + q.value, 0);
  commentParts.push(`Total Guests: ${totalGuests}`);
  
  // Add payment method info
  if (bookingData.payment?.method) {
    commentParts.push(`Payment Method: ${bookingData.payment.method}`);
  }
  
  // Join all comments - ensure comments is never empty to match API specification
  rezdyBooking.comments = commentParts.length > 0 ? commentParts.join(" | ") : "Booking created via online platform";

  console.log("📋 Generated Rezdy booking:", {
    status: rezdyBooking.status,
    customerName: `${customer.firstName} ${customer.lastName}`,
    customerPhone: customer.phone,
    customerEmail: customer.email,
    productCode: bookingItem.productCode,
    startTime: bookingItem.startTimeLocal,
    quantityCount: quantities.length,
    totalQuantity: quantities.reduce((sum, q) => sum + q.value, 0),
    quantities: quantities,
    paymentsCount: rezdyBooking.payments.length,
    paymentAmount: rezdyBooking.payments[0]?.amount,
    paymentType: rezdyBooking.payments[0]?.type,
    hasPickupLocation: !!rezdyBooking.pickupLocation,
    hasFields: rezdyBooking.fields.length > 0,
    hasParticipants: bookingItem.participants.length > 0,
    commentsLength: rezdyBooking.comments.length
  });

  // CRITICAL: Log the complete payment object structure being sent to Rezdy
  console.log("💳 FINAL PAYMENT STRUCTURE:", {
    paymentsArray: rezdyBooking.payments,
    firstPaymentDetails: rezdyBooking.payments[0] ? {
      amount: rezdyBooking.payments[0].amount,
      type: rezdyBooking.payments[0].type,
      recipient: rezdyBooking.payments[0].recipient,
      label: rezdyBooking.payments[0].label,
      typeExists: rezdyBooking.payments[0].type !== undefined,
      typeValue: typeof rezdyBooking.payments[0].type,
      typeString: String(rezdyBooking.payments[0].type)
    } : "NO_PAYMENT_FOUND"
  });

  // Final validation before returning
  if (!rezdyBooking.payments || rezdyBooking.payments.length === 0) {
    console.error("❌ CRITICAL: No payments in Rezdy booking!");
    throw new Error("Booking transformation failed: No payments found");
  } else if (!rezdyBooking.payments[0].type) {
    console.error("❌ CRITICAL: Payment type is undefined/empty in final booking!", {
      payment: rezdyBooking.payments[0],
      originalPaymentData: bookingData.payment
    });
    throw new Error("Booking transformation failed: Payment type is missing");
  }

  // Validate required status field
  if (!rezdyBooking.status) {
    console.error("❌ CRITICAL: Booking status is missing in final booking!");
    throw new Error("Booking transformation failed: Status is required");
  }

  // Validate customer email is present
  if (!rezdyBooking.customer.email) {
    console.error("❌ CRITICAL: Customer email is missing in final booking!", {
      customer: rezdyBooking.customer
    });
    throw new Error("Booking transformation failed: Customer email is required");
  }

  // Validate quantities
  const finalTotalQuantity = quantities.reduce((sum, q) => sum + q.value, 0);
  if (finalTotalQuantity === 0) {
    console.error("❌ CRITICAL: Total quantity is 0 in final booking!", {
      quantities: rezdyBooking.items[0]?.quantities
    });
    throw new Error("Booking transformation failed: Total quantity must be greater than 0");
  }

  console.log("✅ Booking transformation completed successfully");
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
