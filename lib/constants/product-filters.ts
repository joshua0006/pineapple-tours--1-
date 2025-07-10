// Product Filter Configuration
// This file contains all the rules for filtering out products from display

export const PRODUCT_FILTER_CONFIG = {
  // Product name keywords that should be excluded (case-insensitive)
  excludedKeywords: [
    // Administrative/Internal products
    'cancelled',
    'cancel',
    'test',
    'demo',
    'sample',
    'dummy',
    
    // Fees and charges
    'cleaning fee',
    'driver tip',
    'tip',
    'gratuity',
    'service charge',
    'booking fee',
    'processing fee',
    
    // Custom/Private products
    'custom tour',
    'private tour',
    'bespoke',
    'tailor made',
    'tailormade',
    
    // Industry/Trade products
    'famil',
    'familiarisation',
    'trade',
    'agent',
    'wholesale',
    
    // Special codes and placeholders
    'zzzz',
    'xxx',
    'placeholder',
    'do not use',
    'not available',
    'discontinued',
    'expired',
    
    // Non-drinker variants (assuming these are internal variants)
    'non drinker',
    'non-drinker',
    'fdwt',
    
    // Other administrative
    'use',
    'admin',
    'internal',
    'staff',
    'employee',
  ],
  
  // Exact product names to exclude (case-insensitive)
  excludedProductNames: [
    'Gift Card',
    'Gift Voucher',
    'Gift Certificate',
    'E-Gift Card',
    'Physical Gift Card',
  ],
  
  // Product codes to exclude (exact match)
  excludedProductCodes: [
    // Add specific product codes here if needed
  ],
  
  // Product types to exclude
  excludedProductTypes: [
    'GIFT_CARD',
    'VOUCHER',
    'MERCHANDISE',
  ],
  
  // Price-related filters
  priceFilters: {
    // Exclude products with these price characteristics
    excludePriceOnRequest: true,
    excludeZeroPrice: true,
    excludeNullPrice: true,
    
    // Optional: Set min/max price thresholds
    // minPrice: 0,
    // maxPrice: 10000,
  },
  
  // Product status filters
  excludedStatuses: [
    'INACTIVE',
    'DISABLED',
    'ARCHIVED',
    'DELETED',
    'DRAFT',
  ],
  
  // Categories to exclude
  excludedCategories: [
    'internal',
    'test',
    'demo',
  ],
  
  // Whitelist: Product codes that should always be included, even if they match exclusion rules
  whitelistedProductCodes: [
    // Add product codes here that should bypass all filters
  ],
};

// Helper function to check if a string contains any excluded keywords
export function containsExcludedKeyword(text: string): boolean {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  return PRODUCT_FILTER_CONFIG.excludedKeywords.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
}

// Helper function to check if a product name should be excluded
export function isExcludedProductName(name: string): boolean {
  if (!name) return false;
  
  const lowerName = name.toLowerCase();
  return PRODUCT_FILTER_CONFIG.excludedProductNames.some(excludedName => 
    lowerName === excludedName.toLowerCase()
  );
}

// Helper function to check if a product should be excluded based on price
export function shouldExcludeByPrice(price: number | null | undefined): boolean {
  const { priceFilters } = PRODUCT_FILTER_CONFIG;
  
  // Check for null/undefined price
  if (price === null || price === undefined) {
    return priceFilters.excludeNullPrice;
  }
  
  // Check for zero price
  if (price === 0) {
    return priceFilters.excludeZeroPrice;
  }
  
  // Check min/max thresholds if defined
  if (priceFilters.minPrice !== undefined && price < priceFilters.minPrice) {
    return true;
  }
  
  if (priceFilters.maxPrice !== undefined && price > priceFilters.maxPrice) {
    return true;
  }
  
  return false;
}