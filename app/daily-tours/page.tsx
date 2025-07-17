"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Star,
  RefreshCw,
  Clock,
  Calendar,
  Users,
  DollarSign,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { PageHeader } from "@/components/page-header";
import { DynamicTourCard } from "@/components/dynamic-tour-card";
import { TourGridSkeleton } from "@/components/tour-grid-skeleton";
import { ErrorState } from "@/components/error-state";
import { useAllProducts } from "@/hooks/use-all-products";
import { RezdyProduct } from "@/lib/types/rezdy";

export default function DailyToursPage() {
  const router = useRouter();

  // Local state for search
  const [searchQuery, setSearchQuery] = useState("");
  const [localQuery, setLocalQuery] = useState("");

  // Fetch all products
  const { products, loading, error, refreshProducts, totalCount, isCached } =
    useAllProducts();

  // Filter for daily tours (only include tours with productType: "DAYTOUR")
  const dailyTours = useMemo(() => {
    let filtered = [...products];

    // Filter for daily tours only - use productType for accurate filtering
    filtered = filtered.filter((product) => {
      // Primary filter: only include DAYTOUR products
      return product.productType === "DAYTOUR";
    });

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.shortDescription?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
      );
    }

    // Sort by name for consistency
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    return filtered;
  }, [products, searchQuery]);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
  };

  const handleRetry = () => {
    refreshProducts();
  };


  const clearSearch = () => {
    setSearchQuery("");
    setLocalQuery("");
  };

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Daily Tours"
        subtitle="Join our scheduled group tours departing daily. Perfect for meeting fellow travelers and exploring with expert guides at fixed departure times."
        backgroundImage="/private-tours/brisbane-tours.webp"
        overlayOpacity={0.6}
        featureCards={[
          {
            icon: Clock,
            title: "Fixed Schedules",
          },
          {
            icon: Users,
            title: "Social Experience",
          },
          {
            icon: DollarSign,
            title: "Great Value",
          },
        ]}
        backButton={{
          label: "Back to Tours",
          icon: Clock,
          onClick: () => router.push("/tours"),
        }}
      />

      {/* Search Bar */}
      <section className="border-b bg-white py-6">
        <div className="container">
          <form onSubmit={handleSearchSubmit} className="mb-0">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search daily tours..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="pl-10 pr-20 h-12 text-base"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                Search
              </Button>
            </div>
          </form>
          {searchQuery && (
            <div className="text-center mt-4">
              <Badge variant="secondary" className="px-4 py-2">
                Searching for: "{searchQuery}"
                <button
                  onClick={clearSearch}
                  className="ml-2 hover:text-destructive"
                >
                  ✕
                </button>
              </Badge>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container">
          {/* Results count and status */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading daily tours...
                  </span>
                ) : (
                  <>
                    {dailyTours.length > 0
                      ? `Showing ${dailyTours.length} daily tours`
                      : "No daily tours found"}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          {error && (
            <ErrorState
              title="Daily Tours Loading Error"
              message={error}
              onRetry={handleRetry}
            />
          )}

          {loading && <TourGridSkeleton count={6} />}

          {!loading && !error && (
            <>
              {dailyTours.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {dailyTours.map((product: RezdyProduct) => (
                    <DynamicTourCard
                      key={product.productCode}
                      product={product}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto max-w-md">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery
                        ? "No daily tours found"
                        : "Loading daily tours..."}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery
                        ? "Try adjusting your search terms or browse all daily tours."
                        : "Our daily tours feature scheduled departures and group experiences."}
                    </p>
                    <div className="space-y-2">
                      {searchQuery && (
                        <Button
                          onClick={clearSearch}
                          variant="outline"
                          className="w-full"
                        >
                          Clear search
                        </Button>
                      )}
                      <Button
                        onClick={() => router.push("/tours")}
                        className="w-full"
                      >
                        Browse all tours
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-muted py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Need a Private Experience?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Looking for a more personalized tour experience? Check out our
            private tours with flexible schedules and customized itineraries.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={() => router.push("/private-tours")}>
              Explore Private Tours
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/contact")}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
