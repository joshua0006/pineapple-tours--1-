// Rezdy API Types

export interface RezdyAddress {
  addressLine?: string;
  postCode?: string;
  city?: string;
  state?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface RezdyExtra {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  priceType: 'PER_PERSON' | 'PER_BOOKING' | 'PER_DAY';
  maxQuantity?: number;
  minQuantity?: number;
  isRequired?: boolean;
  isAvailable?: boolean;
  category?: string;
  image?: RezdyImage;
}

export interface RezdyProduct {
  productCode: string;
  name: string;
  shortDescription?: string;
  description?: string;
  advertisedPrice?: number;
  images?: RezdyImage[];
  quantityRequiredMin?: number;
  quantityRequiredMax?: number;
  productType?: string;
  locationAddress?: string | RezdyAddress;
  customFields?: Record<string, any>;
  status?: string;
  categories?: string[];
  extras?: RezdyExtra[];
}

export interface RezdyImage {
  id: number;
  itemUrl: string;
  thumbnailUrl: string;
  mediumSizeUrl: string;
  largeSizeUrl: string;
  caption?: string;
  isPrimary?: boolean;
}

export interface RezdyAvailability {
  productCode: string;
  sessions: RezdySession[];
}

export interface RezdySession {
  id: string;
  startTimeLocal: string;
  endTimeLocal: string;
  seatsAvailable: number;
  totalPrice?: number;
  pickupId?: string;
  pickupLocations?: RezdyPickupLocation[];
}

export interface RezdyPickupLocation {
  id: string;
  name: string;
  pickupTime?: string;
  address?: string | RezdyAddress;
  latitude?: number;
  longitude?: number;
}

export interface RezdyBooking {
  orderNumber?: string;
  customer: RezdyCustomer;
  items: RezdyBookingItem[];
  totalAmount: number;
  paymentOption?: string;
  status?: string;
  createdDate?: string;
  modifiedDate?: string;
}

export interface RezdyCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface RezdyBookingItem {
  productCode: string;
  startTimeLocal: string;
  participants: RezdyParticipant[];
  amount: number;
  pickupId?: string;
  extras?: RezdyBookingExtra[];
}

export interface RezdyBookingExtra {
  extraId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface RezdyParticipant {
  type: string;
  number: number;
}

export interface RezdyApiResponse<T> {
  data?: T;
  error?: string;
  totalCount?: number;
  limit?: number;
  offset?: number;
}

export interface RezdyProductsResponse extends RezdyApiResponse<RezdyProduct[]> {
  products?: RezdyProduct[];
}

export interface RezdyAvailabilityResponse extends RezdyApiResponse<RezdyAvailability[]> {
  availability?: RezdyAvailability[];
  sessions?: RezdySession[];
}

export interface RezdyBookingsResponse extends RezdyApiResponse<RezdyBooking[]> {
  bookings?: RezdyBooking[];
} 