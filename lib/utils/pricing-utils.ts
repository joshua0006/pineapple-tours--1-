import { RezdyProduct, RezdySession, RezdyExtra, RezdyTax } from "@/lib/types/rezdy";

export interface SelectedExtra {
  extra: RezdyExtra;
  quantity: number;
}

export interface PricingOptions {
  adults: number;
  children: number;
  infants: number;
  extras?: SelectedExtra[];
  taxRate?: number;
  serviceFeesRate?: number;
  childDiscountRate?: number;
  infantDiscountRate?: number;
}

export interface PricingBreakdown {
  adults: number;
  children: number;
  infants: number;
  basePrice: number;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  subtotal: number;
  extrasSubtotal: number;
  taxes: number;
  serviceFees: number;
  total: number;
  savings?: number;
  selectedExtras?: SelectedExtra[];
  // Booking option pricing (for FIT tours)
  bookingOptionPrice?: number;
  bookingOptionTotal?: number;
  bookingOptionName?: string;
}

export interface TaxInfo {
  name: string;
  rate: number;
  amount: number;
  description?: string;
}

export interface FeeInfo {
  name: string;
  rate?: number;
  amount: number;
  description?: string;
}

const DEFAULT_PRICING_CONFIG = {
  taxRate: 0.08, // 8% tax (fallback if no Rezdy tax data)
  serviceFeesRate: 0.019, // 1.9% service fee
  childDiscountRate: 0.25, // 25% discount for children
  infantDiscountRate: 1.0, // 100% discount for infants (free)
};

/**
 * Extract tax rate from Rezdy product tax data
 */
export function getTaxRateFromProduct(product: RezdyProduct): number {
  if (!product.taxes || product.taxes.length === 0) {
    return DEFAULT_PRICING_CONFIG.taxRate;
  }

  // Find the primary tax (usually GST for Australian products)
  const primaryTax = product.taxes.find(tax => 
    tax.taxFeeType === "TAX" && tax.taxType === "PERCENT"
  ) || product.taxes[0];

  if (primaryTax && primaryTax.taxPercent) {
    return primaryTax.taxPercent / 100; // Convert percentage to decimal
  }

  return DEFAULT_PRICING_CONFIG.taxRate;
}

/**
 * Get tax information from Rezdy product
 */
export function getTaxInfoFromProduct(product: RezdyProduct): TaxInfo | null {
  if (!product.taxes || product.taxes.length === 0) {
    return null;
  }

  const primaryTax = product.taxes.find(tax => 
    tax.taxFeeType === "TAX" && tax.taxType === "PERCENT"
  ) || product.taxes[0];

  if (primaryTax && primaryTax.taxPercent) {
    return {
      name: primaryTax.label,
      rate: primaryTax.taxPercent / 100,
      amount: 0, // Will be calculated later
      description: `${primaryTax.label} (${primaryTax.priceInclusive ? 'inclusive' : 'exclusive'})`,
    };
  }

  return null;
}

/**
 * Calculate comprehensive pricing breakdown for a tour booking
 */
export function calculatePricing(
  product: RezdyProduct,
  session: RezdySession | null,
  options: PricingOptions
): PricingBreakdown {
  // Use Rezdy tax rate if available, otherwise fall back to provided option or default
  const taxRate = options.taxRate || getTaxRateFromProduct(product);
  const config = { ...DEFAULT_PRICING_CONFIG, taxRate, ...options };

  // Base price calculation
  const basePrice = product.advertisedPrice || 0;
  const sessionPrice = session?.totalPrice || basePrice;

  // Calculate individual prices
  const adultPrice = sessionPrice;
  const childPrice = Math.round(sessionPrice * (1 - config.childDiscountRate));
  const infantPrice = Math.round(
    sessionPrice * (1 - config.infantDiscountRate)
  );

  // Calculate subtotal for main tour
  const subtotal =
    options.adults * adultPrice +
    options.children * childPrice +
    options.infants * infantPrice;

  // Calculate extras subtotal
  let extrasSubtotal = 0;
  const selectedExtras = options.extras || [];

  selectedExtras.forEach(({ extra, quantity }) => {
    let extraPrice = 0;

    switch (extra.priceType) {
      case "PER_PERSON":
        extraPrice =
          extra.price *
          (options.adults + options.children + options.infants) *
          quantity;
        break;
      case "PER_BOOKING":
        extraPrice = extra.price * quantity;
        break;
      case "PER_DAY":
        // Assuming 1 day for now, could be extended to calculate based on tour duration
        extraPrice = extra.price * quantity;
        break;
      default:
        extraPrice = extra.price * quantity;
    }

    extrasSubtotal += extraPrice;
  });

  // Calculate total subtotal including extras
  const totalSubtotal = subtotal + extrasSubtotal;

  // Calculate taxes and fees on total subtotal
  const taxes = Math.round(totalSubtotal * taxRate);
  const serviceFees = Math.round(totalSubtotal * config.serviceFeesRate);

  // Calculate total
  const total = totalSubtotal + taxes + serviceFees;

  // Calculate potential savings
  const fullPriceTotal =
    (options.adults + options.children + options.infants) * adultPrice;
  const savings = fullPriceTotal > subtotal ? fullPriceTotal - subtotal : 0;

  return {
    adults: options.adults,
    children: options.children,
    infants: options.infants,
    basePrice,
    adultPrice,
    childPrice,
    infantPrice,
    subtotal,
    extrasSubtotal,
    taxes,
    serviceFees,
    total,
    savings: savings > 0 ? savings : undefined,
    selectedExtras,
  };
}

/**
 * Get detailed tax breakdown
 */
export function getTaxBreakdown(
  subtotal: number,
  product?: RezdyProduct,
  taxRate?: number
): TaxInfo[] {
  // If we have product tax info, use that
  const taxInfo = product ? getTaxInfoFromProduct(product) : null;
  
  if (taxInfo) {
    return [
      {
        name: taxInfo.name,
        rate: taxInfo.rate,
        amount: Math.round(subtotal * taxInfo.rate),
        description: taxInfo.description,
      },
    ];
  }

  // Fall back to default tax breakdown
  const finalTaxRate = taxRate || DEFAULT_PRICING_CONFIG.taxRate;
  const stateTax = Math.round(subtotal * (finalTaxRate * 0.6)); // 60% state tax
  const localTax = Math.round(subtotal * (finalTaxRate * 0.4)); // 40% local tax

  return [
    {
      name: "State Tax",
      rate: finalTaxRate * 0.6,
      amount: stateTax,
      description: "State tourism tax",
    },
    {
      name: "Local Tax",
      rate: finalTaxRate * 0.4,
      amount: localTax,
      description: "Local municipality tax",
    },
  ];
}

/**
 * Get detailed fee breakdown
 */
export function getFeeBreakdown(
  subtotal: number,
  serviceFeesRate: number = DEFAULT_PRICING_CONFIG.serviceFeesRate
): FeeInfo[] {
  const processingFee = Math.round(subtotal * (serviceFeesRate * 0.75)); // 75% processing fee
  const bookingFee = Math.round(subtotal * (serviceFeesRate * 0.25)); // 25% booking fee

  return [
    {
      name: "Processing Fee",
      rate: serviceFeesRate * 0.75,
      amount: processingFee,
      description: "Payment processing and handling",
    },
    {
      name: "Booking Fee",
      rate: serviceFeesRate * 0.25,
      amount: bookingFee,
      description: "Reservation and booking service",
    },
  ];
}

/**
 * Format price for display
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate price per person for display
 */
export function calculatePricePerPerson(
  total: number,
  totalGuests: number
): number {
  if (totalGuests === 0) return 0;
  return Math.round(total / totalGuests);
}

/**
 * Get pricing summary text
 */
export function getPricingSummaryText(breakdown: PricingBreakdown): string {
  const totalGuests = breakdown.adults + breakdown.children + breakdown.infants;
  const parts = [];

  if (breakdown.adults > 0) {
    parts.push(`${breakdown.adults} adult${breakdown.adults > 1 ? "s" : ""}`);
  }
  if (breakdown.children > 0) {
    parts.push(
      `${breakdown.children} child${breakdown.children > 1 ? "ren" : ""}`
    );
  }
  if (breakdown.infants > 0) {
    parts.push(
      `${breakdown.infants} infant${breakdown.infants > 1 ? "s" : ""}`
    );
  }

  const guestText = parts.join(", ");
  const totalText = formatCurrency(breakdown.total);

  return `${totalText} for ${guestText} (${totalGuests} total)`;
}

/**
 * Validate pricing options
 */
export function validatePricingOptions(
  options: PricingOptions,
  product: RezdyProduct
): string[] {
  const errors: string[] = [];

  const totalGuests = options.adults + options.children + options.infants;

  if (totalGuests === 0) {
    errors.push("At least one guest is required");
  }

  if (
    product.quantityRequiredMin &&
    totalGuests < product.quantityRequiredMin
  ) {
    errors.push(`Minimum ${product.quantityRequiredMin} guests required`);
  }

  if (
    product.quantityRequiredMax &&
    totalGuests > product.quantityRequiredMax
  ) {
    errors.push(`Maximum ${product.quantityRequiredMax} guests allowed`);
  }

  if (options.adults < 1 && (options.children > 0 || options.infants > 0)) {
    errors.push(
      "At least one adult is required when booking for children or infants"
    );
  }

  return errors;
}

/**
 * Get discount information
 */
export function getDiscountInfo(breakdown: PricingBreakdown): {
  hasDiscounts: boolean;
  discountText?: string;
} {
  const hasChildDiscount =
    breakdown.children > 0 && breakdown.childPrice < breakdown.adultPrice;
  const hasInfantDiscount =
    breakdown.infants > 0 && breakdown.infantPrice < breakdown.adultPrice;

  if (!hasChildDiscount && !hasInfantDiscount) {
    return { hasDiscounts: false };
  }

  const discountParts = [];

  if (hasChildDiscount) {
    const childDiscountPercent = Math.round(
      ((breakdown.adultPrice - breakdown.childPrice) / breakdown.adultPrice) *
        100
    );
    discountParts.push(`${childDiscountPercent}% off for children`);
  }

  if (hasInfantDiscount && breakdown.infantPrice === 0) {
    discountParts.push("Infants travel free");
  } else if (hasInfantDiscount) {
    const infantDiscountPercent = Math.round(
      ((breakdown.adultPrice - breakdown.infantPrice) / breakdown.adultPrice) *
        100
    );
    discountParts.push(`${infantDiscountPercent}% off for infants`);
  }

  return {
    hasDiscounts: true,
    discountText: discountParts.join(", "),
  };
}
