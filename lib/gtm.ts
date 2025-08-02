// Google Tag Manager utility functions and types

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Enhanced GTM Event Types with better GA4 compliance
export interface GTMBaseEvent {
  event: string;
  [key: string]: any;
}

export interface GTMPurchaseEvent extends GTMBaseEvent {
  event: 'purchase';
  ecommerce: {
    transaction_id: string;
    value: number;
    currency: string;
    affiliation?: string;
    coupon?: string;
    shipping?: number;
    tax?: number;
    items: GTMPurchaseItem[];
  };
  user_data?: {
    email?: string;
    phone?: string;
  };
}

export interface GTMPurchaseItem {
  item_id: string;
  item_name: string;
  item_category: string;
  item_category2?: string;
  item_category3?: string;
  item_brand?: string;
  item_variant?: string;
  quantity: number;
  price: number;
  index?: number;
  affiliation?: string;
  coupon?: string;
  discount?: number;
  location_id?: string;
}

export interface GTMBeginCheckoutEvent extends GTMBaseEvent {
  event: 'begin_checkout';
  ecommerce: {
    currency: string;
    value: number;
    affiliation?: string;
    coupon?: string;
    items: GTMPurchaseItem[];
  };
}

export interface GTMAddPaymentInfoEvent extends GTMBaseEvent {
  event: 'add_payment_info';
  ecommerce: {
    currency: string;
    value: number;
    payment_type: string;
    affiliation?: string;
    coupon?: string;
    items: GTMPurchaseItem[];
  };
}

export interface GTMViewItemEvent extends GTMBaseEvent {
  event: 'view_item';
  ecommerce: {
    currency: string;
    value: number;
    items: GTMPurchaseItem[];
  };
}

export interface GTMCustomEvent extends GTMBaseEvent {
  event: string;
  event_category?: string;
  event_label?: string;
  value?: number;
}

// Debug mode control
const isDevelopment = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

// Initialize GTM Data Layer
export const initializeGTM = (): void => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    if (isDevelopment) {
      console.log('🏷️ GTM DataLayer initialized');
    }
  }
};

// Enhanced GTM event pusher with validation and debugging
export const pushGTMEvent = (event: GTMBaseEvent): void => {
  if (typeof window === 'undefined') {
    if (isDevelopment) {
      console.warn('🏷️ GTM: Server-side render, skipping event:', event.event);
    }
    return;
  }

  if (!window.dataLayer) {
    console.error('🏷️ GTM: dataLayer not available, initializing...');
    initializeGTM();
  }

  // Validate event structure
  if (!event.event) {
    console.error('🏷️ GTM: Event missing required "event" field:', event);
    return;
  }

  // Enhanced logging for development
  if (isDevelopment) {
    console.group(`🏷️ GTM Event: ${event.event}`);
    console.log('Event Data:', event);
    
    // Special logging for e-commerce events
    if (event.ecommerce) {
      console.log('💰 E-commerce Data:', {
        value: event.ecommerce.value,
        currency: event.ecommerce.currency,
        items: event.ecommerce.items?.length || 0,
        transaction_id: event.ecommerce.transaction_id
      });
      
      if (event.ecommerce.items?.length > 0) {
        console.table(event.ecommerce.items);
      }
    }
    console.groupEnd();
  }

  try {
    window.dataLayer.push(event);
    if (isDevelopment) {
      console.log(`✅ GTM Event pushed successfully: ${event.event}`);
    }
  } catch (error) {
    console.error('🏷️ GTM: Error pushing event:', error, event);
  }
};

// Purchase event - for successful bookings
export const trackPurchase = (data: {
  transactionId: string;
  value: number;
  currency: string;
  items: Array<{
    productCode: string;
    productName: string;
    category: string;
    subCategory?: string;
    quantity: number;
    price: number;
    pickupLocation?: string;
    tourDate?: string;
    sessionTime?: string;
  }>;
  customerEmail?: string;
  customerPhone?: string;
  affiliation?: string;
  coupon?: string;
  shipping?: number;
  tax?: number;
}): void => {
  const event: GTMPurchaseEvent = {
    event: 'purchase',
    ecommerce: {
      transaction_id: data.transactionId,
      value: formatCurrencyForGTM(data.value),
      currency: data.currency,
      affiliation: data.affiliation || 'Pineapple Tours',
      coupon: data.coupon,
      shipping: data.shipping ? formatCurrencyForGTM(data.shipping) : undefined,
      tax: data.tax ? formatCurrencyForGTM(data.tax) : undefined,
      items: data.items.map((item, index) => ({
        item_id: item.productCode,
        item_name: item.productName,
        item_category: item.category,
        item_category2: item.subCategory,
        item_category3: item.pickupLocation ? 'Pickup Service' : 'Meet at Location',
        item_brand: 'Pineapple Tours',
        item_variant: item.sessionTime,
        quantity: item.quantity,
        price: formatCurrencyForGTM(item.price),
        index: index,
        affiliation: data.affiliation || 'Pineapple Tours',
        location_id: item.pickupLocation,
      })),
    },
  };

  if (data.customerEmail || data.customerPhone) {
    event.user_data = {
      email: data.customerEmail,
      phone: data.customerPhone,
    };
  }

  pushGTMEvent(event);
};

// Begin checkout event - when user starts checkout process
export const trackBeginCheckout = (data: {
  value: number;
  currency: string;
  items: Array<{
    productCode: string;
    productName: string;
    category: string;
    subCategory?: string;
    quantity: number;
    price: number;
    pickupLocation?: string;
    tourDate?: string;
    sessionTime?: string;
  }>;
  affiliation?: string;
  coupon?: string;
}): void => {
  const event: GTMBeginCheckoutEvent = {
    event: 'begin_checkout',
    ecommerce: {
      currency: data.currency,
      value: formatCurrencyForGTM(data.value),
      affiliation: data.affiliation || 'Pineapple Tours',
      coupon: data.coupon,
      items: data.items.map((item, index) => ({
        item_id: item.productCode,
        item_name: item.productName,
        item_category: item.category,
        item_category2: item.subCategory,
        item_category3: item.pickupLocation ? 'Pickup Service' : 'Meet at Location',
        item_brand: 'Pineapple Tours',
        item_variant: item.sessionTime,
        quantity: item.quantity,
        price: formatCurrencyForGTM(item.price),
        index: index,
        affiliation: data.affiliation || 'Pineapple Tours',
        location_id: item.pickupLocation,
      })),
    },
  };

  pushGTMEvent(event);
};

// Add payment info event - when payment method is selected
export const trackAddPaymentInfo = (data: {
  value: number;
  currency: string;
  paymentType: string;
  items: Array<{
    productCode: string;
    productName: string;
    category: string;
    subCategory?: string;
    quantity: number;
    price: number;
    pickupLocation?: string;
    tourDate?: string;
    sessionTime?: string;
  }>;
  affiliation?: string;
  coupon?: string;
}): void => {
  const event: GTMAddPaymentInfoEvent = {
    event: 'add_payment_info',
    ecommerce: {
      currency: data.currency,
      value: formatCurrencyForGTM(data.value),
      payment_type: data.paymentType,
      affiliation: data.affiliation || 'Pineapple Tours',
      coupon: data.coupon,
      items: data.items.map((item, index) => ({
        item_id: item.productCode,
        item_name: item.productName,
        item_category: item.category,
        item_category2: item.subCategory,
        item_category3: item.pickupLocation ? 'Pickup Service' : 'Meet at Location',
        item_brand: 'Pineapple Tours',
        item_variant: item.sessionTime,
        quantity: item.quantity,
        price: formatCurrencyForGTM(item.price),
        index: index,
        affiliation: data.affiliation || 'Pineapple Tours',
        location_id: item.pickupLocation,
      })),
    },
  };

  pushGTMEvent(event);
};

// View item event - when user views a tour/product
export const trackViewItem = (data: {
  value: number;
  currency: string;
  items: Array<{
    productCode: string;
    productName: string;
    category: string;
    subCategory?: string;
    quantity: number;
    price: number;
  }>;
}): void => {
  const event: GTMViewItemEvent = {
    event: 'view_item',
    ecommerce: {
      currency: data.currency,
      value: data.value,
      items: data.items.map(item => ({
        item_id: item.productCode,
        item_name: item.productName,
        item_category: item.category,
        item_category2: item.subCategory,
        quantity: item.quantity,
        price: item.price,
      })),
    },
  };

  pushGTMEvent(event);
};

// Custom event tracking - for general events
export const trackCustomEvent = (data: {
  event: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}): void => {
  const event: GTMCustomEvent = {
    event: data.event,
    event_category: data.category,
    event_label: data.label,
    value: data.value,
    ...Object.fromEntries(
      Object.entries(data).filter(([key]) => 
        !['event', 'category', 'label', 'value'].includes(key)
      )
    ),
  };

  pushGTMEvent(event);
};

// Page view tracking
export const trackPageView = (data: {
  page_title: string;
  page_location: string;
  page_path: string;
}): void => {
  const event: GTMBaseEvent = {
    event: 'page_view',
    page_title: data.page_title,
    page_location: data.page_location,
    page_path: data.page_path,
  };

  pushGTMEvent(event);
};

// Lead generation tracking
export const trackGenerateLead = (data: {
  currency?: string;
  value?: number;
  form_name?: string;
  source?: string;
}): void => {
  const event: GTMBaseEvent = {
    event: 'generate_lead',
    currency: data.currency,
    value: data.value,
    form_name: data.form_name,
    source: data.source,
  };

  pushGTMEvent(event);
};

// Search tracking
export const trackSearch = (data: {
  search_term: string;
  category?: string;
  results_count?: number;
}): void => {
  const event: GTMBaseEvent = {
    event: 'search',
    search_term: data.search_term,
    category: data.category,
    results_count: data.results_count,
  };

  pushGTMEvent(event);
};

// Utility function to get product category from product data
export const getProductCategory = (productCode: string, productName: string): string => {
  const name = productName.toLowerCase();
  const code = productCode.toLowerCase();
  
  if (name.includes('wine') || name.includes('winery')) return 'Wine Tours';
  if (name.includes('brewery') || name.includes('beer')) return 'Brewery Tours';
  if (name.includes('hop on hop off') || name.includes('hoho')) return 'Hop On Hop Off';
  if (name.includes('private') || name.includes('charter')) return 'Private Tours';
  if (name.includes('corporate')) return 'Corporate Tours';
  if (name.includes('hen') || name.includes('bachelor')) return 'Special Events';
  if (name.includes('custom')) return 'Custom Tours';
  
  return 'Day Tours';
};

// Utility function to format currency amount for GTM
export const formatCurrencyForGTM = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};

// Utility function to calculate total quantity from guest counts
export const calculateTotalQuantity = (guestCounts: Record<string, number> | { adults?: number; children?: number; infants?: number }): number => {
  if (!guestCounts) return 1;
  
  // Handle standard format (adults, children, infants)
  if (typeof guestCounts.adults === 'number') {
    return (guestCounts.adults || 0) + (guestCounts.children || 0) + (guestCounts.infants || 0) || 1;
  }
  
  // Handle dynamic format (price option labels)
  const total = Object.values(guestCounts).reduce((sum, count) => {
    return sum + (typeof count === 'number' && count > 0 ? count : 0);
  }, 0);
  
  return total || 1;
};

// Utility function to format session time for GTM
export const formatSessionTimeForGTM = (startTime?: string, endTime?: string): string | undefined => {
  if (!startTime) return undefined;
  
  try {
    const start = new Date(startTime);
    const startFormatted = start.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    
    if (endTime) {
      const end = new Date(endTime);
      const endFormatted = end.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      return `${startFormatted} - ${endFormatted}`;
    }
    
    return startFormatted;
  } catch (error) {
    if (isDevelopment) {
      console.warn('🏷️ GTM: Error formatting session time:', error);
    }
    return startTime;
  }
};

// Utility function to get pickup location name for tracking
export const formatPickupLocationForGTM = (pickupLocation?: any): string | undefined => {
  if (!pickupLocation) return undefined;
  
  if (typeof pickupLocation === 'string') return pickupLocation;
  if (pickupLocation.locationName) return pickupLocation.locationName;
  if (pickupLocation.name) return pickupLocation.name;
  
  return undefined;
};

export default {
  initializeGTM,
  pushGTMEvent,
  trackPurchase,
  trackBeginCheckout,
  trackAddPaymentInfo,
  trackViewItem,
  trackCustomEvent,
  trackPageView,
  trackGenerateLead,
  trackSearch,
  getProductCategory,
  formatCurrencyForGTM,
  calculateTotalQuantity,
  formatSessionTimeForGTM,
  formatPickupLocationForGTM,
};