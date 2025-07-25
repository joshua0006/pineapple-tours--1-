// Rezdy API Types

export interface RezdyCategory {
  id: number;
  name: string;
  description?: string;
  isVisible: boolean;
  image?: RezdyImage;
  seoTags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RezdyCategoryProduct {
  productCode: string;
  name: string;
  shortDescription?: string;
  description?: string;
  advertisedPrice?: number;
  priceOptions?: RezdyPriceOption[];
  images?: RezdyImage[];
  productType?: string;
  status?: string;
  categoryId: number;
}

export interface RezdyCategoriesResponse extends RezdyApiResponse<RezdyCategory[]> {
  categories?: RezdyCategory[];
}

export interface RezdyCategoryProductsResponse extends RezdyApiResponse<RezdyCategoryProduct[]> {
  products?: RezdyCategoryProduct[];
}

export interface RezdyAddress {
  addressLine?: string;
  postCode?: string;
  city?: string;
  state?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface RezdyTax {
  supplierId: number;
  label: string;
  taxFeeType: "TAX" | "FEE";
  taxType: "PERCENT" | "FIXED";
  taxPercent?: number;
  taxAmount?: number;
  priceInclusive: boolean;
  compound: boolean;
}

export interface RezdyPriceOption {
  price: number;
  label: string;
  id: number;
  seatsUsed: number;
  productCode?: string;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface RezdyExtra {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  priceType: "PER_PERSON" | "PER_BOOKING" | "PER_DAY";
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
  priceOptions?: RezdyPriceOption[];
  images?: RezdyImage[];
  quantityRequiredMin?: number;
  quantityRequiredMax?: number;
  productType?: string;
  locationAddress?: string | RezdyAddress;
  customFields?: Record<string, any>;
  status?: string;
  categories?: string[];
  extras?: RezdyExtra[];
  taxes?: RezdyTax[];
  pickupLocations?: string[];
  departsFrom?: string[];
  primaryPickupLocation?: string;
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
  pickupLocations?: RezdyPickupLocationLegacy[]; // Sessions use legacy format for backwards compatibility
  bookingOptions?: RezdyBookingOption[];
}

export interface RezdyBookingOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  pickupType:
    | "brisbane"
    | "gold-coast"
    | "brisbane-city-loop"
    | "tamborine-direct";
  pickupLocations: RezdyPickupLocation[];
  maxParticipants?: number;
  availability: number;
  requirements?: string[];
  includedServices?: string[];
  isPreferred?: boolean;
}

// Primary pickup location interface (matches Rezdy API format)
export interface RezdyPickupLocation {
  locationName: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  minutesPrior?: number;
  additionalInstructions?: string;
}

// Legacy interface for backward compatibility (used by session data)
export interface RezdyPickupLocationLegacy {
  id: string;
  name: string;
  pickupTime?: string;
  address?: string | RezdyAddress;
  latitude?: number;
  longitude?: number;
  region?: "brisbane" | "gold-coast" | "tamborine";
  facilityType?: "hotel" | "casino" | "landmark" | "transport-hub";
  isPreferred?: boolean;
}

// Utility type for components that need to handle both formats
export type RezdyPickupLocationUnion = RezdyPickupLocation | RezdyPickupLocationLegacy;

// Type guard to check if a location is in the legacy format
export function isLegacyPickupLocation(location: RezdyPickupLocationUnion): location is RezdyPickupLocationLegacy {
  return 'id' in location && 'name' in location;
}

// Helper to convert legacy format to API format
export function convertLegacyToApiFormat(legacy: RezdyPickupLocationLegacy): RezdyPickupLocation {
  return {
    locationName: legacy.name,
    address: typeof legacy.address === 'string' ? legacy.address : undefined,
    latitude: legacy.latitude,
    longitude: legacy.longitude,
    minutesPrior: undefined, // Legacy format doesn't have this
    additionalInstructions: undefined,
  };
}

export interface RezdyBooking {
  status?: "PROCESSING" | "CONFIRMED";
  customer: RezdyCustomer;
  items: RezdyBookingItem[];
  payments: RezdyPayment[];
  comments: string;
  fields: RezdyBookingField[];
  pickupLocation?: {
    locationName: string;
  };
}

// Direct Rezdy API booking request format
export interface RezdyDirectBookingRequest {
  resellerReference: string;
  resellerComments?: string;
  customer: RezdyCustomer;
  items: RezdyBookingItem[];
  fields?: RezdyBookingField[];
  payments: RezdyPayment[];
}

// Pickup location as a separate item in the items array
export interface RezdyPickupLocationItem {
  productCode: string;
  pickupLocation: {
    locationName: string;
  };
}

export interface RezdyCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/**
 * Main booking item with product details
 */
export interface RezdyProductBookingItem {
  productCode: string;
  startTimeLocal: string;
  quantities: RezdyQuantity[];
  /**
   * Optional pickup identifier returned from Rezdy availability endpoints. While not strictly
   * required in the create-booking payload, we often keep the id around for reference & logging.
   */
  pickupId?: string;

  /**
   * Optional pickup location information included within the main booking item
   * as per official Rezdy API documentation
   */
  pickupLocation?: {
    locationName: string;
  };

  /**
   * Optional extras array. Extras are supported by Rezdy but are not always utilised in every
   * product. Including the field here prevents TypeScript errors when we log or attach extras
   * data during the booking/validation phases.
   */
  extras?: RezdyBookingExtra[];
  participants: RezdyBookingParticipant[];
}

/**
 * Pickup location item (separate item in items array)
 */
export interface RezdyPickupLocationItem {
  productCode: string;
  pickupLocation: {
    locationName: string;
  };
}

/**
 * Union type for all possible items in the Rezdy booking items array
 */
export type RezdyBookingItem = RezdyProductBookingItem | RezdyPickupLocationItem;

export interface RezdyBookingExtra {
  extraId?: string;
  name: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface RezdyParticipant {
  type: string;
  number: number;
  priceOptionId?: number;
}

export interface RezdyParticipantField {
  label: string;
  value: string;
}

export interface RezdyBookingParticipant {
  fields: RezdyParticipantField[];
}

export interface RezdyBookingField {
  label: string;
  value: string;
}

export interface RezdyPayment {
  amount: number;
  type: "CASH" | "CREDITCARD";
  recipient: "SUPPLIER";
  label: string;
}

export interface RezdyQuantity {
  optionLabel: string;
  value: number;
}

export interface RezdyApiResponse<T> {
  data?: T;
  error?: string;
  totalCount?: number;
  limit?: number;
  offset?: number;
}

export interface RezdyProductsResponse
  extends RezdyApiResponse<RezdyProduct[]> {
  products?: RezdyProduct[];
}

export interface RezdyAvailabilityResponse
  extends RezdyApiResponse<RezdyAvailability[]> {
  availability?: RezdyAvailability[];
  sessions?: RezdySession[];
}

export interface RezdyBookingsResponse
  extends RezdyApiResponse<RezdyBooking[]> {
  bookings?: RezdyBooking[];
}

// Enhanced Data Management Types

// Data Categorization Interfaces
export interface ProductCategories {
  tours: {
    adventure: RezdyProduct[];
    cultural: RezdyProduct[];
    food_wine: RezdyProduct[];
    nature: RezdyProduct[];
    urban: RezdyProduct[];
  };
  experiences: {
    workshops: RezdyProduct[];
    classes: RezdyProduct[];
    tastings: RezdyProduct[];
  };
  transportation: {
    transfers: RezdyProduct[];
    day_trips: RezdyProduct[];
  };
}

export interface ProductMetrics {
  revenue_tier: {
    premium: RezdyProduct[];
    standard: RezdyProduct[];
    budget: RezdyProduct[];
  };
  popularity: {
    bestsellers: RezdyProduct[];
    seasonal: RezdyProduct[];
    niche: RezdyProduct[];
  };
  operational: {
    high_capacity: RezdyProduct[];
    boutique: RezdyProduct[];
    private: RezdyProduct[];
  };
}

export interface CustomerSegments {
  demographics: {
    age_groups: {
      millennials: RezdyCustomer[];
      gen_x: RezdyCustomer[];
      baby_boomers: RezdyCustomer[];
    };
    family_status: {
      families: RezdyCustomer[];
      couples: RezdyCustomer[];
      solo_travelers: RezdyCustomer[];
    };
  };
  behavioral: {
    booking_frequency: {
      frequent: RezdyCustomer[];
      occasional: RezdyCustomer[];
      first_time: RezdyCustomer[];
    };
    spending_patterns: {
      high_value: RezdyCustomer[];
      moderate: RezdyCustomer[];
      budget: RezdyCustomer[];
    };
  };
}

export interface BookingClassification {
  status: {
    confirmed: RezdyBooking[];
    pending: RezdyBooking[];
    cancelled: RezdyBooking[];
    completed: RezdyBooking[];
    no_show: RezdyBooking[];
  };
  timing: {
    advance_bookings: RezdyBooking[];
    standard: RezdyBooking[];
    last_minute: RezdyBooking[];
  };
  value: {
    high_value: RezdyBooking[];
    standard_value: RezdyBooking[];
    promotional: RezdyBooking[];
  };
}

// Filtering and Segmentation Types
export interface FilterCriteria {
  temporal: {
    date_range: { start: Date; end: Date };
    season: "spring" | "summer" | "autumn" | "winter";
    day_of_week: string[];
    time_of_day: "morning" | "afternoon" | "evening";
  };
  commercial: {
    price_range: { min: number; max: number };
    product_types: string[];
    capacity_range: { min: number; max: number };
  };
  geographical: {
    locations: string[];
    regions: string[];
    pickup_points: string[];
  };
  operational: {
    availability_status: "available" | "limited" | "sold_out";
    lead_time: number;
    group_size: { min: number; max: number };
  };
}

export interface ProductFilters {
  searchTerm: string;
  productType: string;
  priceRange: string;
  availability: string;
  location: string;
  category?: string;
  dateRange?: { start: Date; end: Date };
  participants?: number;
}

export interface SegmentedProducts {
  high_demand: RezdyProduct[];
  seasonal: RezdyProduct[];
  location_based: RezdyProduct[];
  price_optimized: RezdyProduct[];
}

export interface SegmentedCustomers {
  vip: RezdyCustomer[];
  at_risk: RezdyCustomer[];
  growth_potential: RezdyCustomer[];
}

// Data Quality and Validation Types
export interface DataQualityMetrics {
  completeness: {
    products_with_descriptions: number;
    products_with_images: number;
    products_with_pricing: number;
  };
  accuracy: {
    valid_email_addresses: number;
    valid_phone_numbers: number;
    valid_dates: number;
  };
  consistency: {
    standardized_product_types: number;
    consistent_pricing_format: number;
    uniform_date_formats: number;
  };
}

export interface DataIssue {
  type: string;
  productCode?: string;
  orderNumber?: string;
  message?: string;
  severity?: "low" | "medium" | "high" | "critical";
}

// Analytics and Reporting Types
export interface RevenueAnalytics {
  total_revenue: number;
  revenue_by_product: { productCode: string; revenue: number }[];
  revenue_by_period: { period: string; revenue: number }[];
  average_order_value: number;
  revenue_growth_rate: number;
}

export interface CustomerAnalytics {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  customer_lifetime_value: number;
  churn_rate: number;
  customer_segments: CustomerSegmentAnalytics[];
}

export interface CustomerSegmentAnalytics {
  segment_name: string;
  customer_count: number;
  average_order_value: number;
  total_revenue: number;
  booking_frequency: number;
}

export interface PerformanceMetrics {
  api_response_time: number;
  data_freshness: number;
  error_rate: number;
  cache_hit_ratio: number;
}

// Data Synchronization Types
export interface SyncStatus {
  last_sync: Date;
  sync_type: "full" | "incremental" | "real_time";
  status: "success" | "failed" | "in_progress";
  records_processed: number;
  errors: DataIssue[];
}

export interface ConflictResolutionStrategy {
  strategy: "latest_wins" | "manual_review" | "merge_fields";
  priority_fields: string[];
  auto_resolve: boolean;
}

// Cache Management Types
export interface CacheConfig {
  ttl: number;
  max_size: number;
  eviction_policy: "lru" | "fifo" | "ttl";
}

export interface CacheMetrics {
  hit_rate: number;
  miss_rate: number;
  eviction_count: number;
  memory_usage: number;
}

// Enhanced Data State Types
export interface RezdyDataState {
  products: RezdyProduct[];
  bookings: RezdyBooking[];
  availability: Record<string, RezdyAvailability>;
  customers: RezdyCustomer[];
  loading: boolean;
  error: string | null;
  last_updated: Date | null;
  sync_status: SyncStatus | null;
}

export interface ProcessedData {
  data: RezdyDataState;
  insights: DataInsights;
  metadata: DataMetadata;
}

export interface DataInsights {
  trending_products: RezdyProduct[];
  revenue_insights: RevenueAnalytics;
  customer_insights: CustomerAnalytics;
  performance_metrics: PerformanceMetrics;
}

export interface DataMetadata {
  processed_at: Date;
  record_count: number;
  quality_score: number;
  data_sources: string[];
}

// Webhook Types
export interface RezdyWebhook {
  productCode?: string;
  orderNumber?: string;
  action: string;
  data: any;
  timestamp: Date;
}

// Dashboard Data Types
export interface DashboardData {
  products: ProductSummary;
  bookings: BookingSummary;
  availability: AvailabilitySummary;
  analytics: AnalyticsSummary;
  last_updated: Date;
}

export interface ProductSummary {
  total_products: number;
  active_products: number;
  categories: Record<string, number>;
  average_price: number;
}

export interface BookingSummary {
  total_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  total_revenue: number;
  average_order_value: number;
}

export interface AvailabilitySummary {
  total_sessions: number;
  available_sessions: number;
  sold_out_sessions: number;
  capacity_utilization: number;
}

export interface AnalyticsSummary {
  top_products: { productCode: string; bookings: number }[];
  revenue_trend: { period: string; revenue: number }[];
  customer_segments: CustomerSegmentAnalytics[];
  performance_metrics: PerformanceMetrics;
}

// Error Handling Types
export interface DataError {
  type: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  context?: Record<string, any>;
}

// Refresh Options
export interface RefreshOptions {
  force?: boolean;
  include_analytics?: boolean;
  data_types?: ("products" | "bookings" | "availability" | "customers")[];
}
