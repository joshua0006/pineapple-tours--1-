import { useEffect, useCallback } from 'react';
import { 
  preloadPickupLocations, 
  preloadOnHover, 
  smartPreloader,
  preloadPopularPickupLocations 
} from '@/lib/utils/pickup-preloader';

/**
 * Hook for preloading pickup locations
 */
export function usePickupPreloader() {
  // Preload pickup locations for a single product
  const preloadProduct = useCallback(async (productCode: string) => {
    return preloadPickupLocations(productCode);
  }, []);

  // Preload on hover (with debounce)
  const preloadOnHoverDebounced = useCallback((productCode: string) => {
    preloadOnHover(productCode);
  }, []);

  // Add to smart preloader queue
  const queueForPreload = useCallback((productCode: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    smartPreloader.queueForPreload(productCode, priority);
  }, []);

  // Preload popular products
  const preloadPopular = useCallback(async (productCodes: string[], maxToPreload: number = 10) => {
    return preloadPopularPickupLocations(productCodes, maxToPreload);
  }, []);

  // Cleanup old preload history periodically
  useEffect(() => {
    const interval = setInterval(() => {
      smartPreloader.clearOldHistory();
    }, 60 * 60 * 1000); // Clean up every hour

    return () => clearInterval(interval);
  }, []);

  return {
    preloadProduct,
    preloadOnHover: preloadOnHoverDebounced,
    queueForPreload,
    preloadPopular,
  };
}

/**
 * Hook for preloading pickup locations when component mounts
 */
export function usePickupPreloadOnMount(productCodes: string[], enabled: boolean = true) {
  const { preloadPopular } = usePickupPreloader();

  useEffect(() => {
    if (enabled && productCodes.length > 0) {
      preloadPopular(productCodes).then(stats => {
        console.log('Preload on mount completed:', stats);
      }).catch(error => {
        console.error('Preload on mount failed:', error);
      });
    }
  }, [productCodes, enabled, preloadPopular]);
}

/**
 * Hook for preloading pickup locations on hover
 */
export function usePickupPreloadOnHover() {
  const { preloadOnHover } = usePickupPreloader();

  return useCallback((productCode: string) => {
    const handleMouseEnter = () => {
      preloadOnHover(productCode);
    };

    return {
      onMouseEnter: handleMouseEnter,
    };
  }, [preloadOnHover]);
}

/**
 * Hook for smart preloading based on user behavior
 */
export function useSmartPickupPreloader() {
  const { queueForPreload } = usePickupPreloader();

  // Preload when user views a product
  const preloadOnView = useCallback((productCode: string) => {
    queueForPreload(productCode, 'medium');
  }, [queueForPreload]);

  // Preload when user starts booking process
  const preloadOnBookingStart = useCallback((productCode: string) => {
    queueForPreload(productCode, 'high');
  }, [queueForPreload]);

  // Preload related products
  const preloadRelated = useCallback((productCodes: string[]) => {
    productCodes.forEach(code => queueForPreload(code, 'low'));
  }, [queueForPreload]);

  return {
    preloadOnView,
    preloadOnBookingStart,
    preloadRelated,
  };
}