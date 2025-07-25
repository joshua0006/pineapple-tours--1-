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
    
    // Custom/Private products (be more specific to avoid false positives)
    'custom tour only',
    'private tour only',
    'bespoke tour',
    'tailor made tour',
    'tailormade tour',
    'custom booking',
    'private booking only',
    
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
    
    // Other administrative (be more specific)
    'admin use only',
    'internal use',
    'staff only',
    'employee only',
    'do not use',
    'admin only',
  ],
  
  // Exact product names to exclude (case-insensitive)
  excludedProductNames: [
    'Gift Card',
    'Gift Voucher',
    'Gift Certificate',
    'E-Gift Card',
    'Physical Gift Card',
    'Custom Tour',
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
    'TRANSFER',
    'CHARTER',
    // Note: RENTAL removed - now handled with more sophisticated logic
  ],
  
  // Price-related filters
  priceFilters: {
    // Exclude products with these price characteristics
    excludePriceOnRequest: true,
    excludeZeroPrice: true,
    excludeNullPrice: true,
    
    // Optional: Set min/max price thresholds
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
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
  
  // Rental product filters
  rentalFilters: {
    // Exclude rental products with repeated price option labels
    excludeRepeatedQuantityLabels: true,
    // Minimum number of repeated labels to trigger exclusion
    repeatedLabelThreshold: 2,
  },

  // Whitelist: Product codes that should always be included, even if they match exclusion rules
  whitelistedProductCodes: [
    // Hop on Hop off products that should not be filtered
    'PBRFH9', // Hop on Hop off Winery adventure - Tamborine Mountain - Gold Coast
    // Add more product codes here that should bypass all filters
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

// Helper function to check if a rental product has repeated quantity labels
export function hasRepeatedQuantityLabels(priceOptions: any[]): boolean {
  if (!priceOptions || priceOptions.length < 2) {
    return false;
  }
  
  const { rentalFilters } = PRODUCT_FILTER_CONFIG;
  if (!rentalFilters.excludeRepeatedQuantityLabels) {
    return false;
  }
  
  // Count occurrences of each label
  const labelCounts: Record<string, number> = {};
  
  priceOptions.forEach(option => {
    if (option.label) {
      const label = option.label.toLowerCase().trim();
      labelCounts[label] = (labelCounts[label] || 0) + 1;
    }
  });
  
  // Check if any label appears multiple times, meeting the threshold
  const quantityLabel = 'quantity';
  const quantityCount = labelCounts[quantityLabel] || 0;
  
  return quantityCount >= rentalFilters.repeatedLabelThreshold;
}