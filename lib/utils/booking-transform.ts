import {
  RezdyBooking,
  RezdyBookingItem,
  RezdyProductBookingItem,
  RezdyPickupLocationItem,
  RezdyParticipant,
  RezdyParticipantField,
  RezdyBookingExtra,
  RezdyCustomer,
  RezdyQuantity,
  RezdyPayment,
  RezdyBookingField,
  RezdyDirectBookingRequest,
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
    type: "ADULT" | "CHILD" | "INFANT" | "SENIOR" | "STUDENT" | "CONCESSION" | "FAMILY" | "GROUP" | "QUANTITY" | "CUSTOM";
    priceOptionId?: number;
    priceOptionLabel?: string;
    certificationLevel?: string;
    certificationNumber?: string;
    certificationAgency?: string;
    barcode?: string;
    customFieldValues?: Record<string, string>;
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
  // Guest counts - can be either standard format or dynamic price option based
  guestCounts?: {
    adults: number;
    children: number;
    infants: number;
  } | Record<string, number>;
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
  guestCounts?: BookingFormData["guestCounts"] | Record<string, number>,
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
  
  // Check if we have dynamic guest counts (from price options)
  if (guestCounts && !('adults' in guestCounts) && typeof guestCounts === 'object') {
    // Dynamic guest counts - create quantities directly from price option labels
    Object.entries(guestCounts).forEach(([label, count]) => {
      if (count > 0) {
        quantities.push({
          optionLabel: label,
          value: count
        });
      }
    });
    
    console.log("✅ Created quantities from dynamic guest counts:", quantities);
    return quantities;
  }

  // Use guest counts or individual guests to determine quantities
  if (guestCounts || (guests && guests.length > 0)) {
    // Calculate counts
    const counts = {
      adults: 0,
      children: 0,
      infants: 0
    };

    if (guestCounts && 'adults' in guestCounts) {
      const standardGuestCounts = guestCounts as BookingFormData["guestCounts"];
      counts.adults = standardGuestCounts?.adults || 0;
      counts.children = standardGuestCounts?.children || 0;
      counts.infants = standardGuestCounts?.infants || 0;
    } else if (guests) {
      guests.forEach(guest => {
        if (guest.type === "ADULT") counts.adults++;
        else if (guest.type === "CHILD") counts.children++;
        else if (guest.type === "INFANT") counts.infants++;
      });
    }

    // Create quantities using the exact price option labels
    if (counts.adults > 0) {
      let label = selectedPriceOptions?.adult?.label || "Adult";
      
      // If no label or we need to validate, try to get the correct one from cache
      if (productCode && label === "Adult") {
        const correctLabel = getCorrectPriceOptionLabel(productCode, 'adult');
        if (correctLabel) {
          label = correctLabel;
          console.log(`✅ Using correct adult label from product: "${label}"`);
        }
      }
      
      quantities.push({
        optionLabel: label,
        value: counts.adults
      });
    }

    if (counts.children > 0) {
      let label = selectedPriceOptions?.child?.label || "Child";
      
      // If no label or we need to validate, try to get the correct one from cache
      if (productCode && label === "Child") {
        const correctLabel = getCorrectPriceOptionLabel(productCode, 'child');
        if (correctLabel) {
          label = correctLabel;
          console.log(`✅ Using correct child label from product: "${label}"`);
        }
      }
      
      quantities.push({
        optionLabel: label,
        value: counts.children
      });
    }

    if (counts.infants > 0) {
      let label = selectedPriceOptions?.infant?.label || "Infant";
      
      // If no label or we need to validate, try to get the correct one from cache
      if (productCode && label === "Infant") {
        const correctLabel = getCorrectPriceOptionLabel(productCode, 'infant');
        if (correctLabel) {
          label = correctLabel;
          console.log(`✅ Using correct infant label from product: "${label}"`);
        }
      }
      
      quantities.push({
        optionLabel: label,
        value: counts.infants
      });
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
  guestCounts?: BookingFormData["guestCounts"] | Record<string, number>
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
 * Creates properly structured participant fields for Rezdy API
 * Filters out empty fields to ensure clean data structure
 */
export function createRezdyParticipantFields(
  guest: BookingFormData["guests"][0]
): RezdyParticipantField[] {
  const fields: RezdyParticipantField[] = [];
  
  // Always include required name fields
  if (guest.firstName && guest.firstName.trim()) {
    fields.push({ label: "First Name", value: guest.firstName.trim() });
  }
  
  if (guest.lastName && guest.lastName.trim()) {
    fields.push({ label: "Last Name", value: guest.lastName.trim() });
  }
  
  // Only include certification fields if they have values
  if (guest.certificationLevel && guest.certificationLevel.trim()) {
    fields.push({ label: "Certification level", value: guest.certificationLevel.trim() });
  }
  
  if (guest.certificationNumber && guest.certificationNumber.trim()) {
    fields.push({ label: "Certification number", value: guest.certificationNumber.trim() });
  }
  
  if (guest.certificationAgency && guest.certificationAgency.trim()) {
    fields.push({ label: "Certification agency", value: guest.certificationAgency.trim() });
  }
  
  // Only include barcode if it has a value
  if (guest.barcode && guest.barcode.trim()) {
    fields.push({ label: "Barcode", value: guest.barcode.trim() });
  }
  
  // Include any custom field values that have content
  if (guest.customFieldValues) {
    Object.entries(guest.customFieldValues).forEach(([key, value]) => {
      if (value && typeof value === 'string' && value.trim()) {
        fields.push({ label: key, value: value.trim() });
      }
    });
  }
  
  console.log(`Created ${fields.length} participant fields for ${guest.firstName} ${guest.lastName}:`, 
    fields.map(f => `${f.label}: ${f.value}`));
  
  return fields;
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
 * Transforms booking form data to direct Rezdy booking format with specified field mappings
 * @param bookingData - The booking form data from the pre-payment page
 * @param stripePaymentId - The Stripe payment intent ID to use as resellerReference
 */
export function transformBookingDataToDirectRezdy(
  bookingData: BookingFormData,
  stripePaymentId: string
): RezdyDirectBookingRequest {
  console.group("🔄 TRANSFORM FUNCTION - BookingFormData to Direct RezdyBookingRequest");
  console.log("📥 Input Data Analysis:", {
    product: {
      code: bookingData.product.code,
      name: bookingData.product.name
    },
    session: {
      id: bookingData.session.id,
      startTime: bookingData.session.startTime,
      hasPickupLocation: !!bookingData.session.pickupLocation
    },
    guests: {
      count: bookingData.guests?.length || 0,
      hasIndividualGuests: !!bookingData.guests && bookingData.guests.length > 0,
      guestTypes: bookingData.guests?.map(g => g.type) || []
    },
    guestCounts: bookingData.guestCounts,
    contact: bookingData.contact,
    pricing: bookingData.pricing,
    stripePaymentId
  });

  // Create quantities array using the existing function
  const quantities = createRezdyQuantities(
    bookingData.guests, 
    bookingData.selectedPriceOptions, 
    bookingData.guestCounts,
    bookingData.product.code
  );
  
  console.log("👥 Created quantities:", quantities);

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

  // Transform customer data from pre-payment page
  const customer = transformContactToCustomer(bookingData.contact);

  // Create main booking item with quantities and pickup location
  const bookingItem: RezdyProductBookingItem = {
    productCode: bookingData.product.code,
    startTimeLocal: bookingData.session.startTime,
    quantities,
    participants: [], // Will be populated below
  };

  // Add pickup location to the main booking item if present (as per official Rezdy API specification)
  if (bookingData.session.pickupLocation) {
    const locationName = bookingData.session.pickupLocation.locationName || 
                        bookingData.session.pickupLocation.name || 
                        bookingData.session.pickupLocation.id || 
                        "Pickup Location";
    
    bookingItem.pickupLocation = {
      locationName: locationName
    };
    
    console.log("📍 Added pickup location to main booking item:", {
      pickupLocationName: locationName,
      originalLocationName: bookingData.session.pickupLocation.locationName,
      originalName: bookingData.session.pickupLocation.name,
      originalLocationId: bookingData.session.pickupLocation.id
    });
  }

  // Create participants array with detailed fields for each guest
  // Only include fields that have actual values to ensure proper Rezdy display
  if (bookingData.guests && bookingData.guests.length > 0) {
    bookingItem.participants = bookingData.guests.map(guest => {
      const fields = createRezdyParticipantFields(guest);
      
      // Ensure we have at least name fields for valid participant
      if (fields.length === 0 || !fields.some(f => f.label === "First Name") || !fields.some(f => f.label === "Last Name")) {
        console.warn(`Participant ${guest.firstName} ${guest.lastName} missing required fields, creating minimal participant`);
        return {
          fields: [
            { label: "First Name", value: guest.firstName || "Guest" },
            { label: "Last Name", value: guest.lastName || "Unknown" }
          ]
        };
      }
      
      return { fields };
    });
    
    console.log(`Created ${bookingItem.participants.length} participants with field counts:`, 
      bookingItem.participants.map((p, i) => `Participant ${i + 1}: ${p.fields.length} fields`));
  } else {
    // Ensure participants array exists even if empty to match API structure
    bookingItem.participants = [];
    console.log('No individual guests provided, participants array is empty');
  }

  // Add extras if available
  if (bookingData.extras && bookingData.extras.length > 0) {
    bookingItem.extras = bookingData.extras.map(extra => ({
      name: extra.name,
      quantity: extra.quantity
    }));
  }

  // Pickup location will be handled as a separate item in the items array below

  // Map payment method to Rezdy payment type
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
      if (paymentData.type === "CASH" || paymentData.type === "CREDITCARD") {
        return paymentData.type;
      } else {
        console.warn("⚠️ Invalid explicit payment type, falling back to method mapping:", paymentData.type);
      }
    }
    
    // Fallback to method mapping
    const paymentMethod = paymentData?.method;
    if (!paymentMethod) {
      console.warn("⚠️ No payment method found, defaulting to CREDITCARD for Stripe payments");
      return "CREDITCARD";
    }
    
    const lowerMethod = paymentMethod.toLowerCase();
    
    // Only cash payments should map to CASH
    if (lowerMethod === 'cash') {
      console.log("💳 Mapped cash method to CASH type");
      return 'CASH';
    }
    
    // All Stripe payments map to CREDITCARD
    console.log("💳 Mapped method to CREDITCARD type:", paymentMethod);
    return 'CREDITCARD';
  };

  // Create payment entry from Stripe payment data
  const paymentType = mapPaymentMethodToRezdy(bookingData.payment);
  
  const payment: RezdyPayment = {
    amount: bookingData.pricing.total,
    type: paymentType || "CREDITCARD", // Final fallback for Stripe payments
    recipient: "SUPPLIER",
    label: `Paid via Stripe (${paymentType === 'CASH' ? 'Cash' : 'Card'})`,
  };

  console.log("💳 Created payment entry:", {
    originalPaymentData: bookingData.payment,
    mappedType: paymentType,
    amount: payment.amount,
    recipient: payment.recipient,
    finalPaymentObject: payment
  });

  // Create items array with only the main booking item (pickup location is now included within it)
  const items: RezdyBookingItem[] = [bookingItem];

  // Create direct Rezdy booking request with specified field mappings
  const rezdyDirectRequest: RezdyDirectBookingRequest = {
    resellerReference: stripePaymentId, // Stripe payment intent ID as requested
    resellerComments: "", // Leave blank as requested
    customer, // Customer data from pre-payment page
    items, // Items from selected product data
    fields: [], // Leave data blank as requested
    payments: [payment] // Payments from Stripe payment
  };

  console.log("📋 Generated Direct Rezdy Request:", {
    resellerReference: rezdyDirectRequest.resellerReference,
    resellerComments: rezdyDirectRequest.resellerComments,
    customerName: `${customer.firstName} ${customer.lastName}`,
    customerEmail: customer.email,
    itemsCount: items.length,
    fieldsCount: rezdyDirectRequest.fields?.length || 0,
    paymentsCount: rezdyDirectRequest.payments.length,
    paymentAmount: rezdyDirectRequest.payments[0]?.amount,
    paymentType: rezdyDirectRequest.payments[0]?.type
  });

  // Final validation
  if (!rezdyDirectRequest.resellerReference) {
    console.error("❌ CRITICAL: Reseller reference (Stripe payment ID) is missing!");
    throw new Error("Reseller reference is required");
  }

  if (!rezdyDirectRequest.customer.email) {
    console.error("❌ CRITICAL: Customer email is missing!");
    throw new Error("Customer email is required");
  }

  if (!rezdyDirectRequest.payments || rezdyDirectRequest.payments.length === 0) {
    console.error("❌ CRITICAL: No payments in request!");
    throw new Error("Payment is required");
  }

  // Final payload debugging summary
  console.group("🔍 FINAL PAYLOAD DEBUG SUMMARY");
  console.log("📊 Payload Statistics:", {
    resellerReferenceLength: rezdyDirectRequest.resellerReference?.length || 0,
    customerEmailValid: rezdyDirectRequest.customer?.email?.includes('@') || false,
    totalItemsCount: rezdyDirectRequest.items?.length || 0,
    totalPaymentsCount: rezdyDirectRequest.payments?.length || 0,
    totalFieldsCount: rezdyDirectRequest.fields?.length || 0,
    mainItemQuantityCount: ('quantities' in rezdyDirectRequest.items[0] ? rezdyDirectRequest.items[0]?.quantities?.length : 0) || 0,
    mainItemTotalQuantity: ('quantities' in rezdyDirectRequest.items[0] ? rezdyDirectRequest.items[0]?.quantities?.reduce((sum: number, q: RezdyQuantity) => sum + q.value, 0) : 0) || 0
  });
  
  console.log("🚨 Critical Validation Checks:", {
    allPaymentTypesValid: rezdyDirectRequest.payments?.every(p => p.type === "CASH" || p.type === "CREDITCARD"),
    allQuantitiesPositive: ('quantities' in rezdyDirectRequest.items[0] ? rezdyDirectRequest.items[0]?.quantities?.every((q: RezdyQuantity) => q.value > 0) : true),
    allQuantityLabelsPresent: ('quantities' in rezdyDirectRequest.items[0] ? rezdyDirectRequest.items[0]?.quantities?.every((q: RezdyQuantity) => q.optionLabel?.trim()) : true),
    hasRequiredCustomerFields: !!(rezdyDirectRequest.customer?.firstName && rezdyDirectRequest.customer?.lastName && rezdyDirectRequest.customer?.email),
    hasValidStartTime: !!('startTimeLocal' in rezdyDirectRequest.items[0] ? rezdyDirectRequest.items[0]?.startTimeLocal : false),
    hasValidProductCode: !!('productCode' in rezdyDirectRequest.items[0] ? rezdyDirectRequest.items[0]?.productCode : false)
  });
  console.groupEnd();

  console.log("✅ Direct Rezdy request validation passed");
  console.groupEnd();
  
  return rezdyDirectRequest;
}

/**
 * Legacy function - transforms booking form data to Rezdy booking format
 * @deprecated Use transformBookingDataToDirectRezdy instead
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
  
  console.group("🔄 TRANSFORM FUNCTION - BookingFormData to RezdyBooking");
  console.log("📥 Input Data Analysis:", {
    product: {
      code: bookingData.product.code,
      name: bookingData.product.name
    },
    session: {
      id: bookingData.session.id,
      startTime: bookingData.session.startTime,
      hasPickupLocation: !!bookingData.session.pickupLocation
    },
    guests: {
      count: bookingData.guests?.length || 0,
      hasIndividualGuests: !!bookingData.guests && bookingData.guests.length > 0,
      guestTypes: bookingData.guests?.map(g => g.type) || []
    },
    guestCounts: bookingData.guestCounts,
    contact: bookingData.contact,
    pricing: bookingData.pricing,
    payment: {
      method: bookingData.payment?.method,
      type: bookingData.payment?.type,
      hasPaymentData: !!bookingData.payment
    },
    selectedPriceOptions: bookingData.selectedPriceOptions,
    extras: bookingData.extras?.length || 0
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


  // Create main booking item with quantities and pickup location for legacy function
  const legacyBookingItem: RezdyProductBookingItem = {
    productCode: bookingData.product.code,
    startTimeLocal: bookingData.session.startTime,
    quantities,
    participants: [], // Will be populated below
  };

  // Add pickup location to the main booking item if present (as per official Rezdy API specification)
  if (bookingData.session.pickupLocation) {
    const locationName = bookingData.session.pickupLocation.locationName || 
                        bookingData.session.pickupLocation.name || 
                        bookingData.session.pickupLocation.id || 
                        "Pickup Location";
    
    legacyBookingItem.pickupLocation = {
      locationName: locationName
    };
    
    console.log("📍 Added pickup location to legacy main booking item:", {
      pickupLocationName: locationName,
      originalLocationName: bookingData.session.pickupLocation.locationName,
      originalName: bookingData.session.pickupLocation.name,
      originalLocationId: bookingData.session.pickupLocation.id
    });
  }

  // Create participants array with detailed fields for each guest
  // This matches the exact structure from the Rezdy API specification
  // Only include fields that have actual values to ensure proper Rezdy display
  if (bookingData.guests && bookingData.guests.length > 0) {
    legacyBookingItem.participants = bookingData.guests.map(guest => {
      const fields = createRezdyParticipantFields(guest);
      
      // Ensure we have at least name fields for valid participant
      if (fields.length === 0 || !fields.some(f => f.label === "First Name") || !fields.some(f => f.label === "Last Name")) {
        console.warn(`Legacy participant ${guest.firstName} ${guest.lastName} missing required fields, creating minimal participant`);
        return {
          fields: [
            { label: "First Name", value: guest.firstName || "Guest" },
            { label: "Last Name", value: guest.lastName || "Unknown" }
          ]
        };
      }
      
      return { fields };
    });
    
    console.log(`Created ${legacyBookingItem.participants.length} legacy participants with field counts:`, 
      legacyBookingItem.participants.map((p, i) => `Participant ${i + 1}: ${p.fields.length} fields`));
  } else {
    // Ensure participants array exists even if empty to match API structure
    legacyBookingItem.participants = [];
    console.log('No individual guests provided for legacy booking, participants array is empty');
  }

  // Add extras if available
  if (bookingData.extras && bookingData.extras.length > 0) {
    legacyBookingItem.extras = bookingData.extras.map(extra => ({
      name: extra.name,
      quantity: extra.quantity
    }));
  }
  
  console.log("📋 Created legacy booking item:", {
    productCode: legacyBookingItem.productCode,
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

  // Create items array with only the main booking item (pickup location is now included within it)
  const legacyItems: RezdyBookingItem[] = [legacyBookingItem];

  // Create Rezdy booking - must match official API structure exactly
  const rezdyBooking: RezdyBooking = {
    status: "CONFIRMED", // Required field: booking status
    customer,
    items: legacyItems,
    payments: [payment],
    comments: "",
    fields: []
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
    productCode: legacyBookingItem.productCode,
    startTime: legacyBookingItem.startTimeLocal,
    quantityCount: quantities.length,
    totalQuantity: quantities.reduce((sum, q) => sum + q.value, 0),
    quantities: quantities,
    paymentsCount: rezdyBooking.payments.length,
    paymentAmount: rezdyBooking.payments[0]?.amount,
    paymentType: rezdyBooking.payments[0]?.type,
    pickupId: legacyBookingItem.pickupId,
    hasFields: rezdyBooking.fields.length > 0,
    hasParticipants: legacyBookingItem.participants.length > 0,
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
      quantities: ('quantities' in rezdyBooking.items[0] ? rezdyBooking.items[0]?.quantities : undefined)
    });
    throw new Error("Booking transformation failed: Total quantity must be greater than 0");
  }

  console.log("✅ TRANSFORM OUTPUT - Final RezdyBooking Structure:");
  console.log("📤 Complete Transformed RezdyBooking:", rezdyBooking);
  
  console.log("🔍 Final Structure Validation:", {
    hasValidStatus: !!rezdyBooking.status && (rezdyBooking.status === "CONFIRMED" || rezdyBooking.status === "PROCESSING"),
    hasValidCustomer: !!(rezdyBooking.customer?.firstName && rezdyBooking.customer?.lastName && rezdyBooking.customer?.email && rezdyBooking.customer?.phone),
    hasValidItems: !!(rezdyBooking.items && rezdyBooking.items.length > 0),
    hasValidQuantities: !!(rezdyBooking.items?.[0] && 'quantities' in rezdyBooking.items[0] && rezdyBooking.items[0].quantities && rezdyBooking.items[0].quantities.length > 0),
    totalQuantity: finalTotalQuantity,
    hasValidPayments: !!(rezdyBooking.payments && rezdyBooking.payments.length > 0),
    paymentTypesValid: rezdyBooking.payments?.every(p => p.type === "CASH" || p.type === "CREDITCARD") || false,
    hasRequiredArrays: !!(Array.isArray(rezdyBooking.fields) && typeof rezdyBooking.comments === 'string')
  });
  
  console.groupEnd();
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
