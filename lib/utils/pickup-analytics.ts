import { RezdyPickupLocation } from "@/lib/types/rezdy";
import { useCallback, useMemo } from "react";

export interface PickupAnalyticsEvent {
  eventType: 'pickup_api_request' | 'pickup_selected' | 'pickup_validation_error' | 'pickup_preload' | 'pickup_cache_hit' | 'pickup_cache_miss';
  productCode: string;
  timestamp: number;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface PickupMetrics {
  totalApiRequests: number;
  totalPickupSelections: number;
  totalValidationErrors: number;
  totalPreloads: number;
  cacheHitRate: number;
  averageApiResponseTime: number;
  popularPickupLocations: { locationName: string; count: number }[];
  errorRate: number;
  lastUpdated: number;
}

/**
 * Analytics collector for pickup location events
 */
class PickupAnalytics {
  private events: PickupAnalyticsEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Track a pickup-related event
   */
  track(event: Omit<PickupAnalyticsEvent, 'timestamp' | 'sessionId'>): void {
    const trackingEvent: PickupAnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.events.push(trackingEvent);

    // Keep only recent events to prevent memory issues
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Pickup Analytics:', trackingEvent);
    }

    // Send to external analytics service (implement as needed)
    this.sendToAnalyticsService(trackingEvent);
  }

  /**
   * Track API request event
   */
  trackApiRequest(productCode: string, responseTime: number, cached: boolean, success: boolean): void {
    this.track({
      eventType: cached ? 'pickup_cache_hit' : 'pickup_api_request',
      productCode,
      metadata: {
        responseTime,
        cached,
        success,
      },
    });

    if (!cached && !success) {
      this.track({
        eventType: 'pickup_cache_miss',
        productCode,
        metadata: {
          responseTime,
          error: true,
        },
      });
    }
  }

  /**
   * Track pickup location selection
   */
  trackPickupSelection(productCode: string, pickupLocation: RezdyPickupLocation): void {
    this.track({
      eventType: 'pickup_selected',
      productCode,
      metadata: {
        locationName: pickupLocation.locationName,
        hasCoordinates: !!(pickupLocation.latitude && pickupLocation.longitude),
        hasAddress: !!pickupLocation.address,
        hasInstructions: !!pickupLocation.additionalInstructions,
        minutesPrior: pickupLocation.minutesPrior,
      },
    });
  }

  /**
   * Track validation error
   */
  trackValidationError(productCode: string, error: string): void {
    this.track({
      eventType: 'pickup_validation_error',
      productCode,
      metadata: {
        error,
      },
    });
  }

  /**
   * Track preload event
   */
  trackPreload(productCode: string, success: boolean, pickupCount: number, cached: boolean): void {
    this.track({
      eventType: 'pickup_preload',
      productCode,
      metadata: {
        success,
        pickupCount,
        cached,
      },
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): PickupMetrics {
    const now = Date.now();
    const recentEvents = this.events.filter(e => now - e.timestamp < 24 * 60 * 60 * 1000); // Last 24 hours

    // Calculate metrics
    const apiRequestEvents = recentEvents.filter(e => e.eventType === 'pickup_api_request');
    const cacheHitEvents = recentEvents.filter(e => e.eventType === 'pickup_cache_hit');
    const selectionEvents = recentEvents.filter(e => e.eventType === 'pickup_selected');
    const validationErrorEvents = recentEvents.filter(e => e.eventType === 'pickup_validation_error');
    const preloadEvents = recentEvents.filter(e => e.eventType === 'pickup_preload');

    // Calculate cache hit rate
    const totalCacheableRequests = apiRequestEvents.length + cacheHitEvents.length;
    const cacheHitRate = totalCacheableRequests > 0 ? (cacheHitEvents.length / totalCacheableRequests) * 100 : 0;

    // Calculate average response time
    const responseTimes = apiRequestEvents
      .map(e => e.metadata?.responseTime)
      .filter(t => typeof t === 'number') as number[];
    const averageApiResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    // Calculate popular pickup locations
    const locationCounts = new Map<string, number>();
    selectionEvents.forEach(e => {
      const locationName = e.metadata?.locationName;
      if (locationName) {
        locationCounts.set(locationName, (locationCounts.get(locationName) || 0) + 1);
      }
    });
    const popularPickupLocations = Array.from(locationCounts.entries())
      .map(([locationName, count]) => ({ locationName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate error rate
    const totalRequests = apiRequestEvents.length;
    const errorRequests = apiRequestEvents.filter(e => !e.metadata?.success).length;
    const errorRate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;

    return {
      totalApiRequests: apiRequestEvents.length,
      totalPickupSelections: selectionEvents.length,
      totalValidationErrors: validationErrorEvents.length,
      totalPreloads: preloadEvents.length,
      cacheHitRate,
      averageApiResponseTime,
      popularPickupLocations,
      errorRate,
      lastUpdated: now,
    };
  }

  /**
   * Get events for a specific product
   */
  getProductEvents(productCode: string): PickupAnalyticsEvent[] {
    return this.events.filter(e => e.productCode === productCode);
  }

  /**
   * Export analytics data
   */
  exportData(): {
    events: PickupAnalyticsEvent[];
    metrics: PickupMetrics;
    exportedAt: number;
  } {
    return {
      events: this.events,
      metrics: this.getMetrics(),
      exportedAt: Date.now(),
    };
  }

  /**
   * Generate a session ID
   */
  private generateSessionId(): string {
    return `pickup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send event to external analytics service
   */
  private sendToAnalyticsService(event: PickupAnalyticsEvent): void {
    // This would integrate with your analytics service (e.g., Google Analytics, Mixpanel, etc.)
    // For now, we'll just store it for potential future use
    
    // Example: Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.eventType, {
        event_category: 'pickup_locations',
        event_label: event.productCode,
        custom_parameter_1: event.metadata ? JSON.stringify(event.metadata) : undefined,
      });
    }

    // Example: Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/pickup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }).catch(error => {
        console.error('Failed to send analytics event:', error);
      });
    }
  }
}

// Export singleton instance
export const pickupAnalytics = new PickupAnalytics();

/**
 * React hook for pickup analytics
 */
export function usePickupAnalytics() {
  // Stable wrappers around singleton methods to avoid identity changes between renders
  const trackApiRequest = useCallback(
    (productCode: string, responseTime: number, cached: boolean, success: boolean) => {
      pickupAnalytics.trackApiRequest(productCode, responseTime, cached, success);
    },
    []
  );

  const trackPickupSelection = useCallback(
    (productCode: string, pickupLocation: RezdyPickupLocation) => {
      pickupAnalytics.trackPickupSelection(productCode, pickupLocation);
    },
    []
  );

  const trackValidationError = useCallback(
    (productCode: string, error: string) => {
      pickupAnalytics.trackValidationError(productCode, error);
    },
    []
  );

  const trackPreload = useCallback(
    (productCode: string, success: boolean, pickupCount: number, cached: boolean) => {
      pickupAnalytics.trackPreload(productCode, success, pickupCount, cached);
    },
    []
  );

  const getMetrics = useCallback(() => pickupAnalytics.getMetrics(), []);
  const exportData = useCallback(() => pickupAnalytics.exportData(), []);

  // Memoize object so reference stays stable between renders
  return useMemo(
    () => ({
      trackApiRequest,
      trackPickupSelection,
      trackValidationError,
      trackPreload,
      getMetrics,
      exportData,
    }),
    [
      trackApiRequest,
      trackPickupSelection,
      trackValidationError,
      trackPreload,
      getMetrics,
      exportData,
    ]
  );
}