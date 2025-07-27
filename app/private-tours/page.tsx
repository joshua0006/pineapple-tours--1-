"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Star,
  RefreshCw,
  Crown,
  Users,
  Calendar,
  Sparkles,
  Settings,
  ArrowLeft,
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

export default function PrivateToursPage() {
  const router = useRouter();

  // Local state for search
  const [searchQuery, setSearchQuery] = useState("");
  const [localQuery, setLocalQuery] = useState("");

  // Fetch all products
  const { products, loading, error, refreshProducts, totalCount, isCached } =
    useAllProducts();

  // Filter for private tours (include private tours, custom tours, charters)
  const privateTours = useMemo(() => {
    let filtered = [...products];

    // Filter for private tours only
    filtered = filtered.filter((product) => {
      const name = product.name.toLowerCase();
      const description = product.shortDescription?.toLowerCase() || "";

      // Include private tours, custom tours, charters
      const isPrivate =
        name.includes("private") ||
        name.includes("charter") ||
        description.includes("private");
      const isCustom =
        name.includes("custom") ||
        name.includes("bespoke") ||
        description.includes("custom");
      const isLuxury =
        name.includes("luxury") ||
        name.includes("premium") ||
        description.includes("luxury");

      // Exclude gift cards
      const isGiftCard =
        product.productType === "GIFT_CARD" ||
        name.includes("gift card") ||
        name.includes("gift voucher");

      // Include private, custom, or luxury tours
      return (isPrivate || isCustom || isLuxury) && !isGiftCard;
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
        title="Private Tours"
        subtitle="Experience personalized luxury with our private tours. Flexible schedules, custom itineraries, and dedicated guides for an exclusive adventure."
        backgroundImage="/private-tours/gold-coast.avif"
        overlayOpacity={0.5}
        featureCards={[
          {
            icon: Crown,
            title: "Luxury Experience",
          },
          {
            icon: Settings,
            title: "Custom Itineraries",
          },
          {
            icon: Users,
            title: "Private Groups",
          },
        ]}
        backButton={{
          label: "Back to Tours",
          icon: ArrowLeft,
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
                placeholder="Search tours..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="pl-10 pr-20 h-10 md:h-12"
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
                    Loading private tours...
                  </span>
                ) : (
                  <>
                    {privateTours.length > 0
                      ? `Showing ${privateTours.length} private tours`
                      : "No private tours found"}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          {error && (
            <ErrorState
              title="Private Tours Loading Error"
              message={error}
              onRetry={handleRetry}
            />
          )}

          {loading && <TourGridSkeleton count={6} />}

          {!loading && !error && (
            <>
              {privateTours.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {privateTours.map((product: RezdyProduct) => (
                    <DynamicTourCard
                      key={product.productCode}
                      product={product}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto max-w-md">
                    <Crown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery
                        ? "No private tours found"
                        : "Loading private tours..."}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery
                        ? "Try adjusting your search terms or browse all private tours."
                        : "Our private tours offer exclusive experiences tailored to your preferences."}
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
                        onClick={() => router.push("/contact")}
                        className="w-full"
                      >
                        Request Custom Tour
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Custom Tour Request Section */}
          {!loading && !error && privateTours.length > 0 && (
            <section className="mt-16 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-8">
              <div className="max-w-3xl mx-auto text-center">
                <Crown className="mx-auto h-12 w-12 text-amber-600 mb-4" />
                <h3 className="text-2xl font-bold mb-4">
                  Don't See What You're Looking For?
                </h3>
                <p className="text-muted-foreground mb-6">
                  We specialize in creating completely custom private tours
                  tailored to your specific interests, schedule, and budget. Let
                  our experts design the perfect experience for you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => router.push("/contact")}>
                    Request Custom Tour
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push("/custom-tours")}
                  >
                    Tour Builder
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-muted py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Looking for Group Tours?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Join our daily scheduled tours for a more social experience with
            fellow travelers and competitive pricing for smaller groups.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={() => router.push("/daily-tours")}>
              Explore Daily Tours
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/tours")}
            >
              Browse All Tours
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
