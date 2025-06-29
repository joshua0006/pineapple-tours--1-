"use client";

import { useFeaturedProducts } from "@/hooks/use-preloaded-products";
import { RezdyProductCard } from "@/components/rezdy-product-card";
import { TourGridSkeleton } from "@/components/tour-grid-skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertCircle, Clock, Database } from "lucide-react";
import Link from "next/link";

interface FeaturedProductsSectionProps {
  /**
   * Maximum number of products to display (default: 8)
   */
  maxProducts?: number;

  /**
   * Show loading state (default: true)
   */
  showLoading?: boolean;

  /**
   * Show cache status (default: false)
   */
  showCacheStatus?: boolean;

  /**
   * Enable refresh button (default: true)
   */
  enableRefresh?: boolean;

  /**
   * Custom title (default: "Featured Tours")
   */
  title?: string;

  /**
   * Custom description
   */
  description?: string;

  /**
   * Show "View All" button (default: true)
   */
  showViewAll?: boolean;
}

export function FeaturedProductsSection({
  maxProducts = 8,
  showLoading = true,
  showCacheStatus = false,
  enableRefresh = true,
  title = "Featured Tours",
  description = "Discover our most popular tours and experiences",
  showViewAll = true,
}: FeaturedProductsSectionProps) {
  const {
    products,
    loading,
    error,
    fromCache,
    lastUpdated,
    refresh,
    preloadStats,
  } = useFeaturedProducts();

  const displayProducts = products.slice(0, maxProducts);
  const hasProducts = displayProducts.length > 0;

  const handleRefresh = async () => {
    try {
      await refresh();
    } catch (err) {
      console.error("Failed to refresh products:", err);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="font-secondary text-3xl sm:text-4xl font-normal tracking-tight text-brand-text">
              {title}
            </h2>

            {/* Cache Status Indicator */}
            {showCacheStatus && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {fromCache ? (
                  <>
                    <Database className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Cached</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-600">Live</span>
                  </>
                )}
              </div>
            )}

            {/* Refresh Button */}
            {enableRefresh && hasProducts && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="ml-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            )}
          </div>

          {description && (
            <p className="font-text text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}

          {/* Performance Stats (Debug) */}
          {showCacheStatus && preloadStats && (
            <div className="mt-4 text-xs text-muted-foreground space-x-4">
              <span>
                Cache Hit Rate: {(preloadStats.cacheHitRate * 100).toFixed(1)}%
              </span>
              <span>
                Avg Load Time: {Math.round(preloadStats.averageLoadTime)}ms
              </span>
              <span>Total Preloads: {preloadStats.totalPreloads}</span>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && !hasProducts && (
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Unable to load featured tours: {error}</span>
                {enableRefresh && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                    Retry
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && !hasProducts && showLoading && (
          <div className="space-y-4">
            <TourGridSkeleton count={maxProducts} />
          </div>
        )}

        {/* Products Grid */}
        {hasProducts && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {displayProducts.map((product) => (
                <RezdyProductCard
                  key={product.productCode}
                  product={product}
                  onViewDetails={(product) => {
                    // Navigate to product details or open booking modal
                    window.location.href = `/booking/${product.productCode}`;
                  }}
                />
              ))}
            </div>

            {/* View All Button */}
            {showViewAll && (
              <div className="text-center">
                <Button asChild size="lg" className="min-w-[200px]">
                  <Link href="/tours">View All Tours</Link>
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !hasProducts && !error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No featured tours available at the moment.
            </p>
            <Button asChild variant="outline">
              <Link href="/tours">Browse All Tours</Link>
            </Button>
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && showCacheStatus && (
          <div className="text-center mt-8 text-xs text-muted-foreground">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Compact version for smaller sections
 */
export function FeaturedProductsCompact({
  maxProducts = 4,
  title = "Popular Tours",
}: {
  maxProducts?: number;
  title?: string;
}) {
  return (
    <FeaturedProductsSection
      maxProducts={maxProducts}
      title={title}
      showLoading={false}
      showCacheStatus={false}
      enableRefresh={false}
      showViewAll={false}
      description=""
    />
  );
}
