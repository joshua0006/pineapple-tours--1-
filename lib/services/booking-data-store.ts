import { BookingFormData } from "@/lib/utils/booking-transform";

interface StoredBookingData {
  data: BookingFormData;
  timestamp: number;
  expiresAt: number;
}

/**
 * In-memory booking data store for temporary storage during payment processing
 * In production, this should be replaced with Redis or a database
 */
class BookingDataStore {
  private dataStore = new Map<string, StoredBookingData>();
  private readonly TTL_MS = 60 * 60 * 1000; // 1 hour
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup interval to remove expired entries
    this.startCleanup();
  }

  /**
   * Store booking data with automatic expiration
   */
  async store(
    orderNumber: string,
    bookingData: BookingFormData
  ): Promise<void> {
    const now = Date.now();
    const expiresAt = now + this.TTL_MS;

    // Normalize the order number for consistent storage
    const normalizedOrderNumber = normalizeOrderNumber(orderNumber);

    this.dataStore.set(normalizedOrderNumber, {
      data: bookingData,
      timestamp: now,
      expiresAt,
    });

    console.log(
      `📦 Stored booking data for order ${orderNumber} (normalized to ${normalizedOrderNumber}), expires at ${new Date(
        expiresAt
      ).toISOString()}`
    );

    // Also store under original order number if different from normalized
    if (orderNumber !== normalizedOrderNumber) {
      this.dataStore.set(orderNumber, {
        data: bookingData,
        timestamp: now,
        expiresAt,
      });
      console.log(`📦 Also stored under original order number: ${orderNumber}`);
    }
  }

  /**
   * Retrieve booking data if it exists and hasn't expired
   */
  async retrieve(orderNumber: string): Promise<BookingFormData | null> {
    console.log(`🔍 Looking for booking data for order: ${orderNumber}`);
    console.log(`📊 Current store stats:`, this.getStats());
    console.log(`🗂️ Available order numbers in store:`, Array.from(this.dataStore.keys()));

    const stored = this.dataStore.get(orderNumber);

    if (!stored) {
      console.log(`❌ No booking data found for order ${orderNumber}`);
      
      // Try fuzzy matching for similar order numbers
      const similarOrders = Array.from(this.dataStore.keys()).filter(key => 
        key.includes(orderNumber.substring(0, 10)) || orderNumber.includes(key.substring(0, 10))
      );
      
      if (similarOrders.length > 0) {
        console.log(`🔧 Found similar order numbers that might be related:`, similarOrders);
      }
      
      return null;
    }

    const now = Date.now();
    const timeUntilExpiry = stored.expiresAt - now;
    
    if (now > stored.expiresAt) {
      console.log(`⏰ Booking data for order ${orderNumber} has expired ${Math.abs(timeUntilExpiry)}ms ago`);
      console.log(`📅 Data was stored at: ${new Date(stored.timestamp).toISOString()}`);
      console.log(`📅 Data expired at: ${new Date(stored.expiresAt).toISOString()}`);
      this.dataStore.delete(orderNumber);
      return null;
    }

    console.log(`✅ Retrieved booking data for order ${orderNumber}`);
    console.log(`⏱️ Time until expiry: ${timeUntilExpiry}ms (${Math.round(timeUntilExpiry / 1000 / 60)} minutes)`);
    return stored.data;
  }

  /**
   * Advanced retrieve with fallback strategies for different order number formats
   */
  async retrieveWithFallbacks(orderNumber: string): Promise<BookingFormData | null> {
    console.log(`🔄 Attempting retrieval with fallbacks for order: ${orderNumber}`);
    
    // Try exact match first
    let result = await this.retrieve(orderNumber);
    if (result) return result;

    // Generate possible order number variations
    const variations = this.generateOrderNumberVariations(orderNumber);
    console.log(`🔀 Trying ${variations.length} order number variations:`, variations);

    for (const variation of variations) {
      if (variation !== orderNumber) {
        console.log(`🔍 Trying variation: ${variation}`);
        const stored = this.dataStore.get(variation);
        if (stored && Date.now() <= stored.expiresAt) {
          console.log(`✅ Found booking data using variation: ${variation}`);
          return stored.data;
        }
      }
    }

    console.log(`❌ No booking data found for any variation of order ${orderNumber}`);
    return null;
  }

  /**
   * Generate possible order number variations based on common patterns
   */
  private generateOrderNumberVariations(orderNumber: string): string[] {
    return getOrderNumberVariations(orderNumber);
  }

  /**
   * Remove booking data (called after successful processing)
   */
  async remove(orderNumber: string): Promise<void> {
    const deleted = this.dataStore.delete(orderNumber);
    if (deleted) {
      console.log(`🗑️ Removed booking data for order ${orderNumber}`);
    }
  }

  /**
   * Get store statistics for monitoring
   */
  getStats(): {
    totalEntries: number;
    expiredEntries: number;
    oldestEntry: Date | null;
  } {
    const now = Date.now();
    let expiredCount = 0;
    let oldestTimestamp = Infinity;

    for (const [, stored] of this.dataStore) {
      if (now > stored.expiresAt) {
        expiredCount++;
      }
      if (stored.timestamp < oldestTimestamp) {
        oldestTimestamp = stored.timestamp;
      }
    }

    return {
      totalEntries: this.dataStore.size,
      expiredEntries: expiredCount,
      oldestEntry:
        oldestTimestamp === Infinity ? null : new Date(oldestTimestamp),
    };
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    // Clean up every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  /**
   * Remove expired entries from the store
   */
  private cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [orderNumber, stored] of this.dataStore) {
      if (now > stored.expiresAt) {
        this.dataStore.delete(orderNumber);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} expired booking data entries`);
    }
  }

  /**
   * Shutdown cleanup interval (for testing)
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

/**
 * Utility function to normalize order numbers across the system
 */
export function normalizeOrderNumber(orderNumber: string): string {
  if (!orderNumber) return orderNumber;
  
  // Remove any existing prefixes and normalize to ORD- format
  const cleanNumber = orderNumber.replace(/^(ORD-|ORDER-|REF-)/i, '');
  return `ORD-${cleanNumber}`;
}

/**
 * Get all possible order number variations for lookups
 */
export function getOrderNumberVariations(orderNumber: string): string[] {
  if (!orderNumber) return [];
  
  const variations = new Set<string>();
  const normalized = normalizeOrderNumber(orderNumber);
  
  // Add the normalized version
  variations.add(normalized);
  
  // Add the original
  variations.add(orderNumber);
  
  // Add without prefix
  const withoutPrefix = normalized.replace(/^ORD-/, '');
  variations.add(withoutPrefix);
  
  // Add other common formats
  variations.add(`ORDER-${withoutPrefix}`);
  variations.add(`REF-${withoutPrefix}`);
  
  // Extract timestamp if present (13-digit timestamp pattern)
  const timestampMatch = withoutPrefix.match(/(\d{13})/);
  if (timestampMatch) {
    const timestamp = timestampMatch[1];
    variations.add(timestamp);
    variations.add(`ORD-${timestamp}`);
    variations.add(`ORDER-${timestamp}`);
  }
  
  return Array.from(variations);
}

// Singleton instance
const bookingDataStore = new BookingDataStore();

export { bookingDataStore, BookingDataStore };
export type { StoredBookingData };
