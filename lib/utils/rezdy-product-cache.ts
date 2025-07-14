import { RezdyProduct, RezdyPriceOption } from "@/lib/types/rezdy";

interface CachedProduct {
  product: RezdyProduct;
  priceOptions: Map<string, RezdyPriceOption>;
  fetchedAt: number;
}

class RezdyProductCache {
  private cache: Map<string, CachedProduct> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 hour

  /**
   * Get cached product with its price options
   */
  getProduct(productCode: string): CachedProduct | null {
    const cached = this.cache.get(productCode);
    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.fetchedAt > this.CACHE_TTL) {
      this.cache.delete(productCode);
      return null;
    }

    return cached;
  }

  /**
   * Cache a product with its price options
   */
  setProduct(productCode: string, product: RezdyProduct): void {
    const priceOptionsMap = new Map<string, RezdyPriceOption>();
    
    // Create a map of normalized labels to price options
    if (product.priceOptions) {
      product.priceOptions.forEach(option => {
        // Store by exact label
        priceOptionsMap.set(option.label, option);
        
        // Also store by normalized label for fallback
        const normalizedLabel = this.normalizeLabel(option.label);
        priceOptionsMap.set(normalizedLabel, option);
      });
    }

    this.cache.set(productCode, {
      product,
      priceOptions: priceOptionsMap,
      fetchedAt: Date.now(),
    });
  }

  /**
   * Get price option by exact label or normalized label
   */
  getPriceOption(productCode: string, label: string): RezdyPriceOption | null {
    const cached = this.getProduct(productCode);
    if (!cached) return null;

    // Try exact match first
    let option = cached.priceOptions.get(label);
    if (option) return option;

    // Try normalized match
    const normalizedLabel = this.normalizeLabel(label);
    option = cached.priceOptions.get(normalizedLabel);
    if (option) return option;

    // Try to find by guest type
    const guestType = this.extractGuestType(label);
    if (guestType) {
      for (const [key, opt] of cached.priceOptions.entries()) {
        if (this.extractGuestType(key) === guestType) {
          return opt;
        }
      }
    }

    return null;
  }

  /**
   * Get all price options for a product
   */
  getAllPriceOptions(productCode: string): RezdyPriceOption[] {
    const cached = this.getProduct(productCode);
    if (!cached) return [];

    // Return unique price options (avoid duplicates from normalized keys)
    const uniqueOptions = new Map<number, RezdyPriceOption>();
    cached.priceOptions.forEach(option => {
      uniqueOptions.set(option.id, option);
    });

    return Array.from(uniqueOptions.values());
  }

  /**
   * Normalize label for comparison
   */
  private normalizeLabel(label: string): string {
    return label.toLowerCase().trim();
  }

  /**
   * Extract guest type from label
   */
  private extractGuestType(label: string): 'adult' | 'child' | 'infant' | 'senior' | null {
    const normalized = this.normalizeLabel(label);
    
    if (normalized.includes('adult')) return 'adult';
    if (normalized.includes('child')) return 'child';
    if (normalized.includes('infant') || normalized.includes('baby')) return 'infant';
    if (normalized.includes('senior') || normalized.includes('pensioner')) return 'senior';
    
    return null;
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear a specific product from cache
   */
  clearProduct(productCode: string): void {
    this.cache.delete(productCode);
  }
}

// Export singleton instance
export const rezdyProductCache = new RezdyProductCache();

/**
 * Fetch product from Rezdy API and cache it
 */
export async function fetchAndCacheProduct(productCode: string): Promise<RezdyProduct | null> {
  // Check cache first
  const cached = rezdyProductCache.getProduct(productCode);
  if (cached) {
    return cached.product;
  }

  try {
    // Fetch from API
    const response = await fetch(`/api/tours/${productCode}`);
    if (!response.ok) {
      console.error(`Failed to fetch product ${productCode}:`, response.status);
      return null;
    }

    const product = await response.json();
    
    // Cache the product
    rezdyProductCache.setProduct(productCode, product);
    
    return product;
  } catch (error) {
    console.error(`Error fetching product ${productCode}:`, error);
    return null;
  }
}

/**
 * Get the correct price option label for a guest type
 */
export function getCorrectPriceOptionLabel(
  productCode: string,
  guestType: 'adult' | 'child' | 'infant'
): string | null {
  const cached = rezdyProductCache.getProduct(productCode);
  if (!cached) return null;

  // Find the first price option that matches the guest type
  for (const [label, option] of cached.priceOptions.entries()) {
    // Skip normalized keys (they're lowercase)
    if (label === label.toLowerCase()) continue;
    
    const type = rezdyProductCache['extractGuestType'](label);
    if (type === guestType) {
      return option.label; // Return the exact label from Rezdy
    }
  }

  return null;
}