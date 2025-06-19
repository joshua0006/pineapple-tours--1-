/**
 * Utility functions for booking-related functionality
 */

/**
 * Generate a booking URL for a specific product
 * @param productCode - The product code to book
 * @param params - Optional URL parameters for pre-selection
 * @returns The booking URL
 */
export function generateBookingUrl(
  productCode: string,
  params?: {
    adults?: number;
    children?: number;
    infants?: number;
    sessionId?: string;
    extras?: any[];
  }
): string {
  const baseUrl = `/booking/${productCode}`;

  if (!params) {
    return baseUrl;
  }

  const searchParams = new URLSearchParams();

  if (params.adults && params.adults > 0) {
    searchParams.set("adults", params.adults.toString());
  }

  if (params.children && params.children > 0) {
    searchParams.set("children", params.children.toString());
  }

  if (params.infants && params.infants > 0) {
    searchParams.set("infants", params.infants.toString());
  }

  if (params.sessionId) {
    searchParams.set("sessionId", params.sessionId);
  }

  if (params.extras && params.extras.length > 0) {
    searchParams.set(
      "extras",
      encodeURIComponent(JSON.stringify(params.extras))
    );
  }

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Navigate to booking page programmatically
 * @param productCode - The product code to book
 * @param params - Optional URL parameters for pre-selection
 */
export function navigateToBooking(
  productCode: string,
  params?: {
    adults?: number;
    children?: number;
    infants?: number;
    sessionId?: string;
    extras?: any[];
  }
): void {
  const url = generateBookingUrl(productCode, params);
  window.location.href = url;
}

/**
 * Check if we're currently on a booking page
 * @param pathname - The current pathname (from usePathname or window.location.pathname)
 * @returns Boolean indicating if we're on a booking page
 */
export function isBookingPage(pathname: string): boolean {
  return (
    pathname.startsWith("/booking/") &&
    pathname !== "/booking/confirmation" &&
    pathname !== "/booking/cancelled"
  );
}

/**
 * Extract product code from booking page pathname
 * @param pathname - The current pathname
 * @returns The product code or null if not a booking page
 */
export function getProductCodeFromBookingPath(pathname: string): string | null {
  const match = pathname.match(/^\/booking\/([^\/]+)$/);
  return match ? match[1] : null;
}

/**
 * Generate a booking button component with proper linking
 * This is a utility for creating consistent booking buttons across the app
 */
export const bookingButtonDefaults = {
  className: "bg-brand-accent text-brand-secondary hover:bg-brand-accent/90",
  text: "Book Now",
  size: "default" as const,
};
