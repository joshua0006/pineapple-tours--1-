// Product Filter Service
// Centralized service for filtering Rezdy products based on various criteria

import { RezdyProduct } from '@/lib/types/rezdy';
import {
  PRODUCT_FILTER_CONFIG,
  containsExcludedKeyword,
  isExcludedProductName,
  shouldExcludeByPrice,
} from '@/lib/constants/product-filters';

export class ProductFilterService {
  /**
   * Filter an array of products based on all configured rules
   * @param products - Array of Rezdy products to filter
   * @param options - Optional filtering options
   * @returns Filtered array of products
   */
  static filterProducts(
    products: RezdyProduct[],
    options?: {
      includeGiftCards?: boolean;
      includeInactive?: boolean;
      skipWhitelist?: boolean;
      participants?: number;
    }
  ): RezdyProduct[] {
    let filtered = products.filter(product => !this.shouldExcludeProduct(product, options));
    
    // Apply participant filtering if specified
    if (options?.participants !== undefined && options.participants > 0) {
      filtered = this.filterByParticipants(filtered, options.participants);
    }
    
    return filtered;
  }

  /**
   * Filter products by participant count
   * @param products - Array of Rezdy products to filter
   * @param participantCount - Number of participants
   * @returns Products that can accommodate the participant count
   */
  static filterByParticipants(
    products: RezdyProduct[],
    participantCount: number
  ): RezdyProduct[] {
    return products.filter(product => {
      // Default values if not specified
      const minRequired = product.quantityRequiredMin || 1;
      const maxAllowed = product.quantityRequiredMax || 999;
      
      // Product is valid if participant count is within the allowed range
      return participantCount >= minRequired && participantCount <= maxAllowed;
    });
  }

  /**
   * Check if a single product should be excluded based on all rules
   * @param product - The product to check
   * @param options - Optional filtering options
   * @returns true if the product should be excluded, false otherwise
   */
  static shouldExcludeProduct(
    product: RezdyProduct,
    options?: {
      includeGiftCards?: boolean;
      includeInactive?: boolean;
      skipWhitelist?: boolean;
    }
  ): boolean {
    // Check whitelist first (unless skipped)
    if (!options?.skipWhitelist && this.isWhitelisted(product)) {
      return false;
    }

    // Check product code exclusions
    if (this.isExcludedByProductCode(product)) {
      return true;
    }

    // Check product type exclusions
    if (!options?.includeGiftCards && this.isExcludedByType(product)) {
      return true;
    }

    // Check product name exclusions
    if (this.isExcludedByName(product)) {
      return true;
    }

    // Check price exclusions
    if (this.isExcludedByPrice(product)) {
      return true;
    }

    // Check status exclusions
    if (!options?.includeInactive && this.isExcludedByStatus(product)) {
      return true;
    }

    // Check category exclusions
    if (this.isExcludedByCategory(product)) {
      return true;
    }

    // Check for excluded keywords in name and description
    if (this.containsExcludedContent(product)) {
      return true;
    }

    return false;
  }

  /**
   * Check if a product is whitelisted
   */
  private static isWhitelisted(product: RezdyProduct): boolean {
    return PRODUCT_FILTER_CONFIG.whitelistedProductCodes.includes(product.productCode);
  }

  /**
   * Check if a product should be excluded by its code
   */
  private static isExcludedByProductCode(product: RezdyProduct): boolean {
    return PRODUCT_FILTER_CONFIG.excludedProductCodes.includes(product.productCode);
  }

  /**
   * Check if a product should be excluded by its type
   */
  private static isExcludedByType(product: RezdyProduct): boolean {
    if (!product.productType) return false;
    
    return PRODUCT_FILTER_CONFIG.excludedProductTypes.includes(product.productType);
  }

  /**
   * Check if a product should be excluded by its name
   */
  private static isExcludedByName(product: RezdyProduct): boolean {
    if (!product.name) return false;

    // Check exact name matches
    if (isExcludedProductName(product.name)) {
      return true;
    }

    // Special case: Check for specific product names that should be excluded
    const lowerName = product.name.toLowerCase();
    
    // Example of the specific exclusion mentioned
    if (product.name === "3hr Koala and Kangaroo Wildlife Experience - From Brisbane") {
      return true;
    }

    return false;
  }

  /**
   * Check if a product should be excluded by its price
   */
  private static isExcludedByPrice(product: RezdyProduct): boolean {
    // Check advertised price
    if (shouldExcludeByPrice(product.advertisedPrice)) {
      return true;
    }

    // Additional check: If the product name contains "price on request" or similar
    const lowerName = product.name?.toLowerCase() || '';
    const lowerDesc = product.shortDescription?.toLowerCase() || '';
    
    const priceOnRequestPhrases = [
      'price on request',
      'poa',
      'p.o.a',
      'call for price',
      'contact for price',
      'price upon request',
    ];
    
    const hasPoaInText = priceOnRequestPhrases.some(phrase => 
      lowerName.includes(phrase) || lowerDesc.includes(phrase)
    );
    
    if (PRODUCT_FILTER_CONFIG.priceFilters.excludePriceOnRequest && hasPoaInText) {
      return true;
    }

    return false;
  }

  /**
   * Check if a product should be excluded by its status
   */
  private static isExcludedByStatus(product: RezdyProduct): boolean {
    if (!product.status) return false;
    
    return PRODUCT_FILTER_CONFIG.excludedStatuses.includes(product.status);
  }

  /**
   * Check if a product should be excluded by its categories
   */
  private static isExcludedByCategory(product: RezdyProduct): boolean {
    if (!product.categories || product.categories.length === 0) return false;
    
    return product.categories.some(category => 
      PRODUCT_FILTER_CONFIG.excludedCategories.some(excluded => 
        category.toLowerCase().includes(excluded.toLowerCase())
      )
    );
  }

  /**
   * Check if a product contains excluded keywords in its content
   */
  private static containsExcludedContent(product: RezdyProduct): boolean {
    // Check name
    if (containsExcludedKeyword(product.name)) {
      return true;
    }

    // Check short description
    if (product.shortDescription && containsExcludedKeyword(product.shortDescription)) {
      return true;
    }

    // Optionally check full description (might be too aggressive)
    // Uncomment if you want to check the full description as well
    // if (product.description && containsExcludedKeyword(product.description)) {
    //   return true;
    // }

    return false;
  }

  /**
   * Get statistics about filtered products
   * @param products - Original array of products
   * @returns Statistics about what was filtered
   */
  static getFilterStatistics(products: RezdyProduct[]): {
    total: number;
    filtered: number;
    byType: Record<string, number>;
    byReason: Record<string, number>;
  } {
    const stats = {
      total: products.length,
      filtered: 0,
      byType: {} as Record<string, number>,
      byReason: {
        productCode: 0,
        productType: 0,
        productName: 0,
        price: 0,
        status: 0,
        category: 0,
        keywords: 0,
      },
    };

    products.forEach(product => {
      if (this.shouldExcludeProduct(product)) {
        stats.filtered++;
        
        // Track by product type
        const type = product.productType || 'UNKNOWN';
        stats.byType[type] = (stats.byType[type] || 0) + 1;
        
        // Track by exclusion reason
        if (this.isExcludedByProductCode(product)) stats.byReason.productCode++;
        if (this.isExcludedByType(product)) stats.byReason.productType++;
        if (this.isExcludedByName(product)) stats.byReason.productName++;
        if (this.isExcludedByPrice(product)) stats.byReason.price++;
        if (this.isExcludedByStatus(product)) stats.byReason.status++;
        if (this.isExcludedByCategory(product)) stats.byReason.category++;
        if (this.containsExcludedContent(product)) stats.byReason.keywords++;
      }
    });

    return stats;
  }

  /**
   * Log filtered products for debugging
   * @param products - Array of products that were filtered out
   */
  static logFilteredProducts(products: RezdyProduct[]): void {
    const filtered = products.filter(p => this.shouldExcludeProduct(p));
    
    console.log('🚫 Filtered Products Summary:');
    console.log(`Total filtered: ${filtered.length} out of ${products.length}`);
    
    filtered.forEach(product => {
      const reasons = [];
      if (this.isExcludedByProductCode(product)) reasons.push('product code');
      if (this.isExcludedByType(product)) reasons.push('product type');
      if (this.isExcludedByName(product)) reasons.push('product name');
      if (this.isExcludedByPrice(product)) reasons.push('price');
      if (this.isExcludedByStatus(product)) reasons.push('status');
      if (this.isExcludedByCategory(product)) reasons.push('category');
      if (this.containsExcludedContent(product)) reasons.push('keywords');
      
      console.log(`- ${product.productCode}: ${product.name} (Reasons: ${reasons.join(', ')})`);
    });
  }
}