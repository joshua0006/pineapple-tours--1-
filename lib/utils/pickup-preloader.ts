import { RezdyPickupLocation } from "@/lib/types/rezdy";

interface PreloadResult {
  success: boolean;
  productCode: string;
  pickupCount: number;
  cached: boolean;
  error?: string;
}

interface PreloadStats {
  totalPreloaded: number;
  successfulPreloads: number;
  errors: string[];
  averageResponseTime: number;
}

/**
 * Preload pickup locations for a single product
 */
export async function preloadPickupLocations(productCode: string): Promise<PreloadResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`/api/rezdy/products/${productCode}/pickups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        productCode,
        pickupCount: 0,
        cached: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      productCode,
      pickupCount: data.pickups?.length || 0,
      cached: data.cached || false,
    };
  } catch (error) {
    return {
      success: false,
      productCode,
      pickupCount: 0,
      cached: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Preload pickup locations for multiple products
 */
export async function preloadMultiplePickupLocations(
  productCodes: string[],
  options: {
    maxConcurrent?: number;
    delayBetweenRequests?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<PreloadStats> {
  const { maxConcurrent = 3, delayBetweenRequests = 100, onProgress } = options;
  
  const results: PreloadResult[] = [];
  const errors: string[] = [];
  const startTime = Date.now();
  
  // Process products in batches to avoid overwhelming the API
  for (let i = 0; i < productCodes.length; i += maxConcurrent) {
    const batch = productCodes.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(productCode => preloadPickupLocations(productCode));
    const batchResults = await Promise.all(batchPromises);
    
    results.push(...batchResults);
    
    // Track errors
    batchResults.forEach(result => {
      if (!result.success && result.error) {
        errors.push(`${result.productCode}: ${result.error}`);
      }
    });
    
    // Call progress callback
    if (onProgress) {
      onProgress(Math.min(i + maxConcurrent, productCodes.length), productCodes.length);
    }
    
    // Add delay between batches to respect rate limits
    if (i + maxConcurrent < productCodes.length && delayBetweenRequests > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
    }
  }
  
  const totalTime = Date.now() - startTime;
  const successfulPreloads = results.filter(r => r.success).length;
  
  return {
    totalPreloaded: productCodes.length,
    successfulPreloads,
    errors,
    averageResponseTime: totalTime / productCodes.length,
  };
}

/**
 * Preload pickup locations for products that are likely to be viewed
 * This can be called when a user is browsing the product catalog
 */
export async function preloadPopularPickupLocations(
  productCodes: string[],
  maxToPreload: number = 10
): Promise<PreloadStats> {
  // Take only the first N products to avoid overwhelming the API
  const productsToPreload = productCodes.slice(0, maxToPreload);
  
  console.log(`Preloading pickup locations for ${productsToPreload.length} popular products`);
  
  return preloadMultiplePickupLocations(productsToPreload, {
    maxConcurrent: 2, // Lower concurrency for background preloading
    delayBetweenRequests: 200, // Longer delay to be respectful
    onProgress: (completed, total) => {
      console.log(`Preload progress: ${completed}/${total} products`);
    },
  });
}

/**
 * Preload pickup locations when user hovers over product cards
 * This provides just-in-time preloading for better perceived performance
 */
export async function preloadOnHover(productCode: string): Promise<void> {
  try {
    // Use a shorter timeout to avoid preloading if user quickly moves mouse
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const result = await preloadPickupLocations(productCode);
    
    if (result.success) {
      console.log(`✅ Preloaded pickup locations for ${productCode} (${result.pickupCount} locations)`);
    } else {
      console.warn(`⚠️ Failed to preload pickup locations for ${productCode}:`, result.error);
    }
  } catch (error) {
    console.error('Error in preloadOnHover:', error);
  }
}

/**
 * Preload pickup locations for products in a specific category
 */
export async function preloadCategoryPickupLocations(
  categoryProducts: { productCode: string; popularity?: number }[],
  maxToPreload: number = 5
): Promise<PreloadStats> {
  // Sort by popularity if available, otherwise use order
  const sortedProducts = categoryProducts
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, maxToPreload);
  
  const productCodes = sortedProducts.map(p => p.productCode);
  
  return preloadPopularPickupLocations(productCodes, maxToPreload);
}

/**
 * Smart preloader that determines what to preload based on user behavior
 */
export class SmartPickupPreloader {
  private preloadQueue: Set<string> = new Set();
  private preloadHistory: Map<string, number> = new Map();
  private isPreloading: boolean = false;
  
  /**
   * Add a product to the preload queue
   */
  queueForPreload(productCode: string, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    if (!this.preloadHistory.has(productCode)) {
      this.preloadQueue.add(productCode);
      this.processQueue();
    }
  }
  
  /**
   * Process the preload queue
   */
  private async processQueue(): Promise<void> {
    if (this.isPreloading || this.preloadQueue.size === 0) {
      return;
    }
    
    this.isPreloading = true;
    
    try {
      const productCodes = Array.from(this.preloadQueue);
      this.preloadQueue.clear();
      
      const stats = await preloadMultiplePickupLocations(productCodes, {
        maxConcurrent: 2,
        delayBetweenRequests: 500,
      });
      
      // Track what we've preloaded
      productCodes.forEach(code => {
        this.preloadHistory.set(code, Date.now());
      });
      
      console.log(`Smart preloader processed ${productCodes.length} products:`, stats);
    } catch (error) {
      console.error('Error in smart preloader:', error);
    } finally {
      this.isPreloading = false;
    }
  }
  
  /**
   * Clear old preload history to free memory
   */
  clearOldHistory(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [productCode, timestamp] of this.preloadHistory.entries()) {
      if (now - timestamp > maxAge) {
        this.preloadHistory.delete(productCode);
      }
    }
  }
}

// Export a singleton instance
export const smartPreloader = new SmartPickupPreloader();