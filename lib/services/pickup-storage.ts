import fs from 'fs';
import path from 'path';
import { RezdyPickupLocation } from '@/lib/types/rezdy';

interface StoredPickupData {
  productCode: string;
  pickups: RezdyPickupLocation[];
  fetchedAt: string;
  source: 'rezdy_api' | 'manual' | 'imported';
  lastAccessed?: string;
  accessCount?: number;
}

/**
 * Permanent file-based storage service for pickup location data
 * Stores pickup data permanently to eliminate repeated API calls
 */
export class PickupStorage {
  private static readonly PICKUP_DIR = path.join(process.cwd(), 'data', 'pickups');
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 100; // ms
  private static readonly STALE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours in ms
  private static readonly BACKGROUND_REFRESH_THRESHOLD = 12 * 60 * 60 * 1000; // 12 hours in ms
  
  // Track background refresh operations to avoid duplicates
  private static refreshPromises = new Map<string, Promise<void>>();

  /**
   * Initialize pickup storage (create directory if needed)
   */
  static async initialize(): Promise<void> {
    try {
      await fs.promises.mkdir(this.PICKUP_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create pickup storage directory:', error);
      throw new Error('Could not initialize pickup storage');
    }
  }

  /**
   * Get the file path for a product's pickup data
   */
  private static getFilePath(productCode: string): string {
    // Sanitize product code for safe filename
    const safeProductCode = productCode.replace(/[^a-zA-Z0-9\-_]/g, '_');
    return path.join(this.PICKUP_DIR, `${safeProductCode}.json`);
  }

  /**
   * Check if pickup data exists for a product
   */
  static async hasPickupData(productCode: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(productCode);
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Load pickup data from file
   */
  static async loadPickupData(productCode: string): Promise<RezdyPickupLocation[] | null> {
    try {
      const filePath = this.getFilePath(productCode);
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      const data: StoredPickupData = JSON.parse(fileContent);

      // Validate data structure
      if (!data.pickups || !Array.isArray(data.pickups) || data.productCode !== productCode) {
        console.warn(`Invalid pickup data structure for ${productCode}, removing file`);
        await this.deletePickupData(productCode);
        return null;
      }

      // Update access tracking
      await this.updateAccessStats(productCode, data);

      return data.pickups;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        // File doesn't exist, which is fine
        return null;
      }
      
      console.warn(`Failed to load pickup data for ${productCode}:`, error);
      
      // If file is corrupted, remove it
      try {
        await this.deletePickupData(productCode);
      } catch {
        // Ignore delete errors
      }
      
      return null;
    }
  }

  /**
   * Save pickup data to file
   */
  static async savePickupData(
    productCode: string, 
    pickups: RezdyPickupLocation[],
    source: StoredPickupData['source'] = 'rezdy_api'
  ): Promise<void> {
    await this.initialize();

    const data: StoredPickupData = {
      productCode,
      pickups,
      fetchedAt: new Date().toISOString(),
      source,
      lastAccessed: new Date().toISOString(),
      accessCount: 1,
    };

    const filePath = this.getFilePath(productCode);
    
    // Retry mechanism for file writes
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Saved pickup data for ${productCode} (${pickups.length} locations)`);
        return;
      } catch (error) {
        console.warn(`Attempt ${attempt} failed to save pickup data for ${productCode}:`, error);
        
        if (attempt < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
        } else {
          throw new Error(`Failed to save pickup data after ${this.MAX_RETRIES} attempts: ${error}`);
        }
      }
    }
  }

  /**
   * Delete pickup data file for a product
   */
  static async deletePickupData(productCode: string): Promise<void> {
    try {
      const filePath = this.getFilePath(productCode);
      await fs.promises.unlink(filePath);
      console.log(`🗑️ Deleted pickup data for ${productCode}`);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        console.warn(`Failed to delete pickup data for ${productCode}:`, error);
      }
    }
  }

  /**
   * Update access statistics for tracking usage
   */
  private static async updateAccessStats(productCode: string, currentData: StoredPickupData): Promise<void> {
    try {
      const updatedData: StoredPickupData = {
        ...currentData,
        lastAccessed: new Date().toISOString(),
        accessCount: (currentData.accessCount || 0) + 1,
      };

      const filePath = this.getFilePath(productCode);
      await fs.promises.writeFile(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
    } catch (error) {
      // Don't fail the main operation if we can't update stats
      console.warn(`Failed to update access stats for ${productCode}:`, error);
    }
  }

  /**
   * Get pickup data with automatic API fallback
   */
  static async getPickupData(
    productCode: string,
    apiClient?: {
      fetchFromApi: (productCode: string) => Promise<RezdyPickupLocation[]>;
    }
  ): Promise<RezdyPickupLocation[]> {
    // Try loading from file first
    const cachedData = await this.loadPickupData(productCode);
    if (cachedData !== null) {
      return cachedData;
    }

    // If no cached data and API client provided, fetch from API
    if (apiClient) {
      try {
        const apiData = await apiClient.fetchFromApi(productCode);
        
        // Save to file for future use
        await this.savePickupData(productCode, apiData, 'rezdy_api');
        
        return apiData;
      } catch (error) {
        console.error(`Failed to fetch pickup data from API for ${productCode}:`, error);
        return [];
      }
    }

    // No data available
    return [];
  }

  /**
   * Force refresh pickup data from API
   */
  static async refreshPickupData(
    productCode: string,
    apiClient: {
      fetchFromApi: (productCode: string) => Promise<RezdyPickupLocation[]>;
    }
  ): Promise<RezdyPickupLocation[]> {
    try {
      console.log(`🔄 Refreshing pickup data for ${productCode}`);
      
      const apiData = await apiClient.fetchFromApi(productCode);
      await this.savePickupData(productCode, apiData, 'rezdy_api');
      
      return apiData;
    } catch (error) {
      console.error(`Failed to refresh pickup data for ${productCode}:`, error);
      
      // Fall back to cached data if available
      const cachedData = await this.loadPickupData(productCode);
      return cachedData || [];
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    oldestFile: string | null;
    newestFile: string | null;
    files: Array<{
      productCode: string;
      fileSize: number;
      fetchedAt: string;
      lastAccessed?: string;
      accessCount?: number;
      pickupCount: number;
    }>;
  }> {
    try {
      await this.initialize();
      
      const files = await fs.promises.readdir(this.PICKUP_DIR);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      const stats = {
        totalFiles: jsonFiles.length,
        totalSize: 0,
        oldestFile: null as string | null,
        newestFile: null as string | null,
        files: [] as any[],
      };

      let oldestDate = new Date();
      let newestDate = new Date(0);

      for (const file of jsonFiles) {
        try {
          const filePath = path.join(this.PICKUP_DIR, file);
          const fileStat = await fs.promises.stat(filePath);
          const fileContent = await fs.promises.readFile(filePath, 'utf8');
          const data: StoredPickupData = JSON.parse(fileContent);

          stats.totalSize += fileStat.size;

          const fetchedDate = new Date(data.fetchedAt);
          if (fetchedDate < oldestDate) {
            oldestDate = fetchedDate;
            stats.oldestFile = file;
          }
          if (fetchedDate > newestDate) {
            newestDate = fetchedDate;
            stats.newestFile = file;
          }

          stats.files.push({
            productCode: data.productCode,
            fileSize: fileStat.size,
            fetchedAt: data.fetchedAt,
            lastAccessed: data.lastAccessed,
            accessCount: data.accessCount,
            pickupCount: data.pickups.length,
          });
        } catch (error) {
          console.warn(`Failed to read stats for ${file}:`, error);
        }
      }

      return stats;
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        oldestFile: null,
        newestFile: null,
        files: [],
      };
    }
  }

  /**
   * Cleanup old or unused pickup data files
   */
  static async cleanup(options: {
    maxAge?: number; // milliseconds
    minAccessCount?: number;
    dryRun?: boolean;
  } = {}): Promise<{
    deletedFiles: string[];
    savedSpace: number;
    errors: string[];
  }> {
    const { maxAge, minAccessCount = 0, dryRun = false } = options;
    const result = {
      deletedFiles: [] as string[],
      savedSpace: 0,
      errors: [] as string[],
    };

    try {
      const stats = await this.getStorageStats();
      
      for (const fileInfo of stats.files) {
        let shouldDelete = false;
        
        // Check age criteria
        if (maxAge && fileInfo.fetchedAt) {
          const fileAge = Date.now() - new Date(fileInfo.fetchedAt).getTime();
          if (fileAge > maxAge) {
            shouldDelete = true;
          }
        }
        
        // Check access count criteria
        if (minAccessCount > 0 && (fileInfo.accessCount || 0) < minAccessCount) {
          shouldDelete = true;
        }
        
        if (shouldDelete) {
          try {
            if (!dryRun) {
              await this.deletePickupData(fileInfo.productCode);
            }
            result.deletedFiles.push(fileInfo.productCode);
            result.savedSpace += fileInfo.fileSize;
          } catch (error) {
            result.errors.push(`Failed to delete ${fileInfo.productCode}: ${error}`);
          }
        }
      }
    } catch (error) {
      result.errors.push(`Cleanup failed: ${error}`);
    }

    return result;
  }

  /**
   * Bulk preload pickup data for multiple products
   */
  static async preloadPickupData(
    productCodes: string[],
    apiClient: {
      fetchFromApi: (productCode: string) => Promise<RezdyPickupLocation[]>;
    },
    options: {
      skipExisting?: boolean;
      maxConcurrent?: number;
      onProgress?: (completed: number, total: number, productCode: string) => void;
    } = {}
  ): Promise<{
    successful: string[];
    failed: string[];
    skipped: string[];
  }> {
    const { skipExisting = true, maxConcurrent = 5, onProgress } = options;
    const result = {
      successful: [] as string[],
      failed: [] as string[],
      skipped: [] as string[],
    };

    const processProduct = async (productCode: string): Promise<void> => {
      try {
        // Skip if exists and skipExisting is true
        if (skipExisting && await this.hasPickupData(productCode)) {
          result.skipped.push(productCode);
          return;
        }

        const pickups = await apiClient.fetchFromApi(productCode);
        await this.savePickupData(productCode, pickups, 'rezdy_api');
        result.successful.push(productCode);
        
        if (onProgress) {
          onProgress(
            result.successful.length + result.failed.length + result.skipped.length,
            productCodes.length,
            productCode
          );
        }
      } catch (error) {
        console.error(`Failed to preload pickup data for ${productCode}:`, error);
        result.failed.push(productCode);
      }
    };

    // Process in batches to limit concurrent API calls
    for (let i = 0; i < productCodes.length; i += maxConcurrent) {
      const batch = productCodes.slice(i, i + maxConcurrent);
      await Promise.all(batch.map(processProduct));
    }

    return result;
  }

  /**
   * Check if pickup data is stale and needs background refresh
   */
  private static isDataStale(fetchedAt: string, threshold: number = this.BACKGROUND_REFRESH_THRESHOLD): boolean {
    const fetchTime = new Date(fetchedAt).getTime();
    const now = Date.now();
    return (now - fetchTime) > threshold;
  }

  /**
   * Check if pickup data should be considered expired
   */
  private static isDataExpired(fetchedAt: string): boolean {
    return this.isDataStale(fetchedAt, this.STALE_THRESHOLD);
  }

  /**
   * Get pickup data with background refresh capability
   * Returns cached data immediately, but triggers background refresh if stale
   */
  static async getPickupDataWithBackgroundRefresh(
    productCode: string,
    apiClient: {
      fetchFromApi: (productCode: string) => Promise<RezdyPickupLocation[]>;
    }
  ): Promise<RezdyPickupLocation[]> {
    try {
      // Try to load existing data
      const existingData = await this.loadPickupDataRaw(productCode);
      
      if (existingData) {
        // If data is expired, force refresh
        if (this.isDataExpired(existingData.fetchedAt)) {
          console.log(`📦 Pickup data expired for ${productCode}, refreshing...`);
          return await this.refreshPickupData(productCode, apiClient);
        }
        
        // If data is stale but not expired, trigger background refresh
        if (this.isDataStale(existingData.fetchedAt)) {
          console.log(`🔄 Triggering background refresh for ${productCode}`);
          this.backgroundRefreshPickupData(productCode, apiClient);
        }
        
        // Return existing data immediately
        return existingData.pickups;
      }
      
      // No existing data, fetch fresh
      console.log(`🆕 No cached data for ${productCode}, fetching fresh data...`);
      return await this.refreshPickupData(productCode, apiClient);
      
    } catch (error) {
      console.error(`Error in getPickupDataWithBackgroundRefresh for ${productCode}:`, error);
      // Fallback to regular API call
      return await apiClient.fetchFromApi(productCode);
    }
  }

  /**
   * Trigger background refresh without blocking
   */
  private static backgroundRefreshPickupData(
    productCode: string,
    apiClient: {
      fetchFromApi: (productCode: string) => Promise<RezdyPickupLocation[]>;
    }
  ): void {
    // Check if refresh is already in progress
    if (this.refreshPromises.has(productCode)) {
      return;
    }

    const refreshPromise = (async () => {
      try {
        console.log(`🔄 Background refresh started for ${productCode}`);
        await this.refreshPickupData(productCode, apiClient);
        console.log(`✅ Background refresh completed for ${productCode}`);
      } catch (error) {
        console.warn(`⚠️ Background refresh failed for ${productCode}:`, error);
      } finally {
        // Clean up the promise reference
        this.refreshPromises.delete(productCode);
      }
    })();

    this.refreshPromises.set(productCode, refreshPromise);
  }

  /**
   * Load raw pickup data including metadata
   */
  private static async loadPickupDataRaw(productCode: string): Promise<StoredPickupData | null> {
    try {
      const filePath = this.getFilePath(productCode);
      const data = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(data) as StoredPickupData;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  static async getCacheStats(): Promise<{
    totalProducts: number;
    freshData: number;
    staleData: number;
    expiredData: number;
    totalSize: number;
  }> {
    try {
      await this.initialize();
      const files = await fs.promises.readdir(this.PICKUP_DIR);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      let totalSize = 0;
      let freshData = 0;
      let staleData = 0;
      let expiredData = 0;
      
      for (const file of jsonFiles) {
        try {
          const filePath = path.join(this.PICKUP_DIR, file);
          const stats = await fs.promises.stat(filePath);
          totalSize += stats.size;
          
          const data = await fs.promises.readFile(filePath, 'utf-8');
          const pickupData = JSON.parse(data) as StoredPickupData;
          
          if (this.isDataExpired(pickupData.fetchedAt)) {
            expiredData++;
          } else if (this.isDataStale(pickupData.fetchedAt)) {
            staleData++;
          } else {
            freshData++;
          }
        } catch (error) {
          // Skip invalid files
          continue;
        }
      }
      
      return {
        totalProducts: jsonFiles.length,
        freshData,
        staleData,
        expiredData,
        totalSize,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalProducts: 0,
        freshData: 0,
        staleData: 0,
        expiredData: 0,
        totalSize: 0,
      };
    }
  }
}