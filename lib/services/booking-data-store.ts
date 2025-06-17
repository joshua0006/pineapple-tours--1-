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

    this.dataStore.set(orderNumber, {
      data: bookingData,
      timestamp: now,
      expiresAt,
    });

    console.log(
      `📦 Stored booking data for order ${orderNumber}, expires at ${new Date(
        expiresAt
      ).toISOString()}`
    );
  }

  /**
   * Retrieve booking data if it exists and hasn't expired
   */
  async retrieve(orderNumber: string): Promise<BookingFormData | null> {
    const stored = this.dataStore.get(orderNumber);

    if (!stored) {
      console.log(`❌ No booking data found for order ${orderNumber}`);
      return null;
    }

    const now = Date.now();
    if (now > stored.expiresAt) {
      console.log(`⏰ Booking data for order ${orderNumber} has expired`);
      this.dataStore.delete(orderNumber);
      return null;
    }

    console.log(`✅ Retrieved booking data for order ${orderNumber}`);
    return stored.data;
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

// Singleton instance
const bookingDataStore = new BookingDataStore();

export { bookingDataStore, BookingDataStore };
export type { StoredBookingData };
