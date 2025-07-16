import { useState, useEffect } from 'react';
import { LocalPickupIndexService } from '@/lib/services/local-pickup-index';

interface PickupIndexStats {
  totalProducts: number;
  productsWithPickups: number;
  locationCounts: Record<string, number>;
  coverage: number;
}

interface PickupIndexMetadata {
  isBuilt: boolean;
  lastUpdated: string | null;
  totalProducts: number;
  productsWithPickups: number;
  availableLocations: string[];
}

/**
 * Hook for managing local pickup data index
 * Preloads the index for optimal filtering performance
 */
export function useLocalPickupIndex() {
  const [isLoading, setIsLoading] = useState(true);
  const [isBuilt, setIsBuilt] = useState(false);
  const [stats, setStats] = useState<PickupIndexStats | null>(null);
  const [metadata, setMetadata] = useState<PickupIndexMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize index on mount
  useEffect(() => {
    let isMounted = true;

    const initializeIndex = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if index is already built
        const currentMetadata = await LocalPickupIndexService.getIndexMetadata();
        
        if (!currentMetadata.isBuilt) {
          // Build index if not exists
          console.log('Building local pickup index...');
          await LocalPickupIndexService.buildIndex();
        }

        // Get fresh metadata and stats
        const [newMetadata, newStats] = await Promise.all([
          LocalPickupIndexService.getIndexMetadata(),
          LocalPickupIndexService.getLocationStats(),
        ]);

        if (isMounted) {
          setMetadata(newMetadata);
          setStats(newStats);
          setIsBuilt(newMetadata.isBuilt);
          setIsLoading(false);

          console.log('Local pickup index ready:', {
            totalProducts: newStats.totalProducts,
            productsWithPickups: newStats.productsWithPickups,
            coverage: `${newStats.coverage.toFixed(1)}%`,
            locations: newMetadata.availableLocations,
          });
        }
      } catch (err) {
        console.error('Failed to initialize pickup index:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize pickup index');
          setIsLoading(false);
        }
      }
    };

    initializeIndex();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Refresh the pickup index
   */
  const refreshIndex = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await LocalPickupIndexService.refreshIndex();

      const [newMetadata, newStats] = await Promise.all([
        LocalPickupIndexService.getIndexMetadata(),
        LocalPickupIndexService.getLocationStats(),
      ]);

      setMetadata(newMetadata);
      setStats(newStats);
      setIsBuilt(newMetadata.isBuilt);
      
      console.log('Pickup index refreshed successfully');
    } catch (err) {
      console.error('Failed to refresh pickup index:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh pickup index');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if a product has pickup data available locally
   */
  const hasLocalPickupData = async (productCode: string): Promise<boolean> => {
    try {
      const productData = await LocalPickupIndexService.getProductPickupData(productCode);
      return productData?.hasPickupData ?? false;
    } catch {
      return false;
    }
  };

  /**
   * Get pickup data for a specific product
   */
  const getProductPickupData = async (productCode: string) => {
    try {
      return await LocalPickupIndexService.getProductPickupData(productCode);
    } catch (err) {
      console.warn(`Failed to get pickup data for ${productCode}:`, err);
      return null;
    }
  };

  /**
   * Get products that have pickup from a specific location
   */
  const getProductsWithPickupFromLocation = async (location: string): Promise<string[]> => {
    try {
      return await LocalPickupIndexService.getProductsWithPickupFromLocation(location);
    } catch (err) {
      console.warn(`Failed to get products for location ${location}:`, err);
      return [];
    }
  };

  return {
    // State
    isLoading,
    isBuilt,
    stats,
    metadata,
    error,
    
    // Actions
    refreshIndex,
    hasLocalPickupData,
    getProductPickupData,
    getProductsWithPickupFromLocation,
    
    // Computed values
    isReady: isBuilt && !isLoading && !error,
    dataQuality: stats ? (
      stats.coverage >= 80 ? 'excellent' :
      stats.coverage >= 60 ? 'good' :
      stats.coverage >= 30 ? 'fair' : 'poor'
    ) as 'excellent' | 'good' | 'fair' | 'poor' : 'poor',
  };
}

/**
 * Lightweight hook that just checks if the index is ready
 * Use this when you only need to know if local data is available
 */
export function usePickupIndexStatus() {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    LocalPickupIndexService.getIndexMetadata()
      .then(metadata => {
        setIsReady(metadata.isBuilt);
        setIsLoading(false);
      })
      .catch(() => {
        setIsReady(false);
        setIsLoading(false);
      });
  }, []);

  return { isReady, isLoading };
}