// Google Tag Manager utility functions and types

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// GTM Event Types
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
    items: GTMPurchaseItem[];
  };
  user_data?: {
    email?: string;
  };
}

export interface GTMPurchaseItem {
  item_id: string;
  item_name: string;
  item_category: string;
  item_category2?: string;
  quantity: number;
  price: number;
}

export interface GTMBeginCheckoutEvent extends GTMBaseEvent {
  event: 'begin_checkout';
  ecommerce: {
    currency: string;
    value: number;
    items: GTMPurchaseItem[];
  };
}

export interface GTMAddPaymentInfoEvent extends GTMBaseEvent {
  event: 'add_payment_info';
  ecommerce: {
    currency: string;
    value: number;
    payment_type: string;
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

// Initialize GTM Data Layer
export const initializeGTM = (): void => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
  }
};

// Generic GTM event pusher
export const pushGTMEvent = (event: GTMBaseEvent): void => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    console.log('Pushing GTM event:', event);
    window.dataLayer.push(event);
  } else {
    console.warn('GTM dataLayer not available');
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
  }>;
  customerEmail?: string;
}): void => {
  const event: GTMPurchaseEvent = {
    event: 'purchase',
    ecommerce: {
      transaction_id: data.transactionId,
      value: data.value,
      currency: data.currency,
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

  if (data.customerEmail) {
    event.user_data = {
      email: data.customerEmail,
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
  }>;
}): void => {
  const event: GTMBeginCheckoutEvent = {
    event: 'begin_checkout',
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
  }>;
}): void => {
  const event: GTMAddPaymentInfoEvent = {
    event: 'add_payment_info',
    ecommerce: {
      currency: data.currency,
      value: data.value,
      payment_type: data.paymentType,
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

// Utility function to format currency amount
export const formatCurrencyForGTM = (amount: number): number => {
  return Math.round(amount * 100) / 100;
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
};