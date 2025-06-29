"use client";

import { useEffect, useState } from "react";
import { dataPreloader } from "@/lib/services/data-preloader";

interface DataPreloaderProps {
  /**
   * Enable preloading (default: true)
   */
  enabled?: boolean;

  /**
   * Preload priority (default: 'high')
   */
  priority?: "high" | "low";

  /**
   * Initial products to preload (default: 100)
   */
  initialLimit?: number;

  /**
   * Enable background preloading (default: true)
   */
  enableBackground?: boolean;

  /**
   * Enable cache warmup (default: true)
   */
  enableWarmup?: boolean;

  /**
   * Debug logging (default: false)
   */
  debug?: boolean;

  /**
   * Callback when preloading completes
   */
  onPreloadComplete?: (success: boolean, error?: string) => void;
}

export function DataPreloader({
  enabled = true,
  priority = "high",
  initialLimit = 100,
  enableBackground = true,
  enableWarmup = true,
  debug = false,
  onPreloadComplete,
}: DataPreloaderProps) {
  const [preloadStatus, setPreloadStatus] = useState<{
    loading: boolean;
    success: boolean;
    error?: string;
    stats?: any;
  }>({
    loading: false,
    success: false,
  });

  useEffect(() => {
    if (!enabled) {
      if (debug) console.log("🚀 DataPreloader: Disabled");
      return;
    }

    const performPreload = async () => {
      if (debug) console.log("🚀 DataPreloader: Starting preload...");

      setPreloadStatus({ loading: true, success: false });

      try {
        // Configure preloader
        dataPreloader.updateConfig({
          enablePreloading: true,
          preloadOnMount: true,
          preloadInBackground: enableBackground,
        });

        // Start primary preload
        const result = await dataPreloader.preloadProducts({
          limit: initialLimit,
          offset: 0,
          priority,
        });

        if (debug) {
          console.log("🚀 DataPreloader: Primary preload result:", result);
        }

        // Start cache warmup if enabled
        if (enableWarmup) {
          dataPreloader.warmupCache().catch((err) => {
            if (debug) console.warn("🚀 DataPreloader: Warmup failed:", err);
          });
        }

        // Start background preloading if enabled
        if (enableBackground) {
          dataPreloader.backgroundPreload().catch((err) => {
            if (debug)
              console.warn("🚀 DataPreloader: Background preload failed:", err);
          });
        }

        const stats = dataPreloader.getStats();

        setPreloadStatus({
          loading: false,
          success: result.success,
          error: result.error,
          stats,
        });

        onPreloadComplete?.(result.success, result.error);

        if (debug) {
          console.log("🚀 DataPreloader: Completed", {
            success: result.success,
            fromCache: result.fromCache,
            loadTime: result.loadTime,
            dataCount: result.data?.length || 0,
            stats,
          });
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";

        setPreloadStatus({
          loading: false,
          success: false,
          error: errorMsg,
        });

        onPreloadComplete?.(false, errorMsg);

        if (debug) {
          console.error("🚀 DataPreloader: Failed:", error);
        }
      }
    };

    performPreload();
  }, [
    enabled,
    priority,
    initialLimit,
    enableBackground,
    enableWarmup,
    debug,
    onPreloadComplete,
  ]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Server-side preload component for static generation
 */
export function ServerDataPreloader() {
  // This would be used in SSG/SSR contexts
  // For now, it's a placeholder that could be enhanced with server-side preloading
  return null;
}

/**
 * Preload status hook for debugging and monitoring
 */
export function usePreloadStatus() {
  const [status, setStatus] = useState({
    isPreloading: false,
    stats: dataPreloader.getStats(),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus({
        isPreloading: false, // This would need to be tracked in the preloader
        stats: dataPreloader.getStats(),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return status;
}
