"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  MapPin,
  Star,
  X,
  ArrowLeft,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Globe,
  Award,
  Clock,
  Users,
  CalendarDays,
} from "lucide-react";
import { addDays, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { matchesPickupLocationFilter } from "@/lib/utils/pickup-location-utils";
import { ProductFilterService } from "@/lib/services/product-filter-service";

import { PageHeader } from "@/components/page-header";
import { DynamicTourCard } from "@/components/dynamic-tour-card";
import { TourGridSkeleton } from "@/components/tour-grid-skeleton";
import { ErrorState } from "@/components/error-state";
import { useAllProducts } from "@/hooks/use-all-products";
import { useCityProducts } from "@/hooks/use-city-products";
import { useBookingPrompt } from "@/hooks/use-booking-prompt";
import { RezdyProduct } from "@/lib/types/rezdy";

// Static pickup locations (matching search form)
const STATIC_PICKUP_LOCATIONS = ["Brisbane", "Gold Coast", "Mount Tamborine"];

interface Filters {
  query: string;
  participants: string;
  checkIn: string;
  checkOut: string;
  city: string;
  location: string;
  limit: string;
  offset: string;
  tourDate: string;
  pickupLocation: string;
}

export default function ToursPage() {
  const router = useRouter();
  const searchParams = useSearchParams();



  // Local filter state
  const [filters, setFilters] = useState<Filters>({
    query: searchParams.get("query") || "",
    participants: searchParams.get("participants") || "2",
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
    city: searchParams.get("city") || "",
    location: searchParams.get("location") || "",
    limit: searchParams.get("limit") || "100",
    offset: searchParams.get("offset") || "0",
    tourDate: searchParams.get("tourDate") || searchParams.get("checkIn") || "",
    pickupLocation:
      searchParams.get("pickupLocation") ||
      searchParams.get("location") ||
      "all",
  });

  const [localQuery, setLocalQuery] = useState(filters.query);

  // Get booking prompt data
  const { promptData, hasPromptData } = useBookingPrompt();

  // Check if this page was accessed from the booking prompt
  const isFromBookingPrompt =
    hasPromptData &&
    ((searchParams.get("participants") &&
      searchParams.get("participants") === promptData?.groupSize?.toString()) ||
      (searchParams.get("checkIn") && promptData?.bookingDate));

  // Fetch the entire catalogue (cached) once; we will paginate client-side
  const { products, loading, error, refreshProducts } = useAllProducts();

  // Client-side filtering and sorting (applied to current page of server-side paginated data)
  const {
    filteredProducts,
    totalFilteredCount,
    currentPage,
    totalPages,
    hasMore,
  } = useMemo(() => {
    let filtered = [...products];

    // Apply comprehensive product filtering using the ProductFilterService
    filtered = ProductFilterService.filterProducts(filtered);

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.shortDescription?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
      );
    }


    // Pickup Location filter - Using structured pickup data
    if (filters.pickupLocation !== "all") {
      filtered = filtered.filter((product) => 
        matchesPickupLocationFilter(product, filters.pickupLocation)
      );
    }

    // City/location filter (fallback for legacy URL params)
    if (filters.city || filters.location) {
      const locationFilter = filters.city || filters.location;
      filtered = filtered.filter((product) => {
        const address = product.locationAddress;
        if (typeof address === "string") {
          return address.toLowerCase().includes(locationFilter.toLowerCase());
        } else if (address && typeof address === "object") {
          return (
            address.city
              ?.toLowerCase()
              .includes(locationFilter.toLowerCase()) ||
            address.state
              ?.toLowerCase()
              .includes(locationFilter.toLowerCase()) ||
            address.addressLine
              ?.toLowerCase()
              .includes(locationFilter.toLowerCase())
          );
        }
        return false;
      });
    }

    // Tour Date filter - check if product has availability on selected date
    // Note: This is a basic filter. For real availability, you'd need to call Rezdy API
    if (filters.tourDate) {
      // For now, we'll include all products if a date is selected
      // In a real implementation, you'd filter based on actual availability
      // This could be enhanced with availability checking logic
    }

    // Participants filter - check if product supports the number of participants
    // Note: This is basic validation. Real implementation would check capacity
    if (filters.participants && parseInt(filters.participants) > 0) {
      // Most tours can accommodate the typical participant counts
      // You could add specific capacity checks here if available in product data
    }


    // --- Client-side pagination ---
    const limit = parseInt(filters.limit) || 100;
    const offset = parseInt(filters.offset) || 0;

    const currentPage = Math.floor(offset / limit) + 1;

    // Slice the current page after all filters/sorting are applied
    const paginated = filtered.slice(offset, offset + limit);

    const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
    const hasMore = currentPage < totalPages;

    return {
      filteredProducts: paginated,
      totalFilteredCount: paginated.length,
      currentPage,
      totalPages,
      hasMore,
    };
  }, [products, filters]);

  // Sync URL parameters with filters when searchParams change
  useEffect(() => {
    const urlFilters: Filters = {
      query: searchParams.get("query") || "",
      participants: searchParams.get("participants") || "2",
      checkIn: searchParams.get("checkIn") || "",
      checkOut: searchParams.get("checkOut") || "",
      city: searchParams.get("city") || "",
      location: searchParams.get("location") || "",
      limit: searchParams.get("limit") || "100",
      offset: searchParams.get("offset") || "0",
      tourDate: searchParams.get("tourDate") || searchParams.get("checkIn") || "",
      pickupLocation:
        searchParams.get("pickupLocation") ||
        searchParams.get("location") ||
        "all",
    };

    setFilters(urlFilters);
    setLocalQuery(urlFilters.query);
  }, [searchParams]);

  // No need to refetch on every page change – we already have the full dataset.

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => {
      // Reset offset when changing filters (except when changing offset itself)
      if (key !== "offset" && key !== "limit") {
        return { ...prev, [key]: value, offset: "0" };
      }
      return { ...prev, [key]: value };
    });
  };

  const goToPage = (page: number) => {
    const limit = parseInt(filters.limit) || 100;
    const newOffset = (page - 1) * limit;
    updateFilter("offset", newOffset.toString());
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const clearFilter = (key: keyof Filters) => {
    const defaultValues: Record<keyof Filters, string> = {
      query: "",
      participants: "2",
      checkIn: "",
      checkOut: "",
      city: "",
      location: "",
      limit: "100",
      offset: "0",
      tourDate: "",
      pickupLocation: "all",
    };
    updateFilter(key, defaultValues[key]);
  };

  const clearSearch = () => {
    setFilters({
      query: "",
      participants: "2",
      checkIn: "",
      checkOut: "",
      city: "",
      location: "",
      limit: "100",
      offset: "0",
      tourDate: "",
      pickupLocation: "all",
    });
    setLocalQuery("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("query", localQuery);
  };

  const handleRetry = () => {
    refreshProducts();
  };

  // Computed values
  const hasActiveFilters =
    filters.query !== "" ||
    filters.checkIn !== "" ||
    filters.checkOut !== "" ||
    filters.city !== "" ||
    filters.location !== "" ||
    filters.tourDate !== "" ||
    filters.pickupLocation !== "all";

  const hasResults = filteredProducts.length > 0;


  // Keep the URL in sync with the current filters so the page is shareable / bookmarkable
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (
        value &&
        value !== "" &&
        value !== "all" &&
        value !== "any" &&
        value !== "2" &&
        !(key === "limit" && value === "100") &&
        !(key === "offset" && value === "0")
      ) {
        params.append(key, value.toString());
      }
    });

    const newUrl = params.toString() ? `/tours?${params.toString()}` : "/tours";
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Scroll to top whenever the pagination offset changes so users start at the top of the list
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [filters.offset]);

  return (
    <>
      {/* Header */}
      <PageHeader
        title={
          isFromBookingPrompt ? "Your Perfect Tours" : "Discover Amazing Tours"
        }
        subtitle="Explore our collection of handpicked tours and experiences from around the world"
        backgroundImage="/scenic-rim-landscape.jpg"
        overlayOpacity={0.5}
        featureCards={[
          {
            icon: Globe,
            title: "Complete Catalog",
          },
          {
            icon: Award,
            title: "Expert Curation",
          },
          {
            icon: MapPin,
            title: "Multiple Destinations",
          },
        ]}
        backButton={{
          label: "Back to Home",
          icon: ArrowLeft,
          onClick: () => router.push("/"),
        }}
      />

      {/* Booking Prompt Success Banner */}
      {isFromBookingPrompt && (
        <section className="bg-yellow-50 border-b border-yellow-200 py-4">
          <div className="container">
            <div className="flex items-center justify-center gap-3 text-yellow-800">
              <Heart className="h-5 w-5 text-yellow-600" />
              <span className="font-medium">Great choice!</span>
              <span>We've found tours matching your preferences.</span>
              {(filters.tourDate || filters.checkIn) && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-200 text-yellow-800"
                >
                  Available for your dates
                </Badge>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Search Bar */}
      <section className="border-b bg-white py-6">
        <div className="container">
          <form onSubmit={handleSearchSubmit} className="mb-0">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tours, locations, activities..."
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
        </div>
      </section>

      {/* Main Content - 2 Column Layout */}
      <section className="py-8">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Filter Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2">
                        {
                          Object.entries(filters).filter(([key, value]) => {
                            // Skip internal pagination and default values
                            if (
                              key === "limit" ||
                              key === "offset"
                            )
                              return false;
                            if (key === "checkIn" || key === "checkOut")
                              return false; // Legacy params
                            if (key === "city" || key === "location")
                              return false; // Legacy params

                            // Count active filters
                            return (
                              value &&
                              value !== "" &&
                              value !== "all" &&
                              value !== "2"
                            ); // Default participants
                          }).length
                        }
                      </Badge>
                    )}
                  </h3>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Active filters */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2">
                    {filters.query && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1 rounded-full"
                      >
                        <span>Search: "{filters.query}"</span>
                        <button
                          onClick={() => {
                            clearFilter("query");
                            setLocalQuery("");
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.pickupLocation !== "all" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1 rounded-full"
                      >
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {filters.pickupLocation}
                        </span>
                        <button
                          onClick={() => clearFilter("pickupLocation")}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.participants !== "2" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1 rounded-full"
                      >
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {filters.participants} participants
                        </span>
                        <button
                          onClick={() => clearFilter("participants")}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.tourDate && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-800 border-orange-200"
                      >
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {format(new Date(filters.tourDate), "MMM dd, yyyy")}
                        </span>
                        <button
                          onClick={() => clearFilter("tourDate")}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                )}

                {/* Filter Stack - Updated to match search form */}
                <div className="space-y-4">
                  {/* Participants Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Participants
                    </Label>
                    <Select
                      value={filters.participants}
                      onValueChange={(value) =>
                        updateFilter("participants", value)
                      }
                    >
                      <SelectTrigger className="w-full h-10">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Select participants" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "Participant" : "Participants"}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tour Date Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Tour Date
                    </Label>
                    <div className="relative">
                      <DatePicker
                        date={
                          filters.tourDate
                            ? new Date(filters.tourDate)
                            : undefined
                        }
                        onDateChange={(date) => {
                          if (date) {
                            updateFilter(
                              "tourDate",
                              format(date, "yyyy-MM-dd")
                            );
                          } else {
                            clearFilter("tourDate");
                          }
                        }}
                        placeholder="Select tour date"
                        minDate={new Date()}
                        maxDate={addDays(new Date(), 365)}
                        className="w-full h-10"
                      />
                    </div>
                  </div>

                  {/* Pick up Location Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Pick up Location
                    </Label>
                    <Select
                      value={filters.pickupLocation}
                      onValueChange={(value) =>
                        updateFilter("pickupLocation", value)
                      }
                    >
                      <SelectTrigger className="w-full h-10">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Select pickup location" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {STATIC_PICKUP_LOCATIONS.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="lg:col-span-3">
              {/* Results count and status */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        {filters.tourDate
                          ? "Checking availability..."
                          : "Loading tours..."}
                      </span>
                    ) : (
                      <>
                       
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Results */}
              {error && (
                <ErrorState
                  title="Tour Loading Error"
                  message={error}
                  onRetry={handleRetry}
                />
              )}

              {loading && <TourGridSkeleton count={6} />}

              {!loading && !error && products.length > 0 && (
                <>
                  {hasResults ? (
                    <>
                      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredProducts.map((product: RezdyProduct) => (
                          <DynamicTourCard
                            key={product.productCode}
                            product={product}
                            selectedDate={filters.tourDate}
                            participants={filters.participants}
                            selectedLocation={filters.pickupLocation}
                          />
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>

                          <div className="flex items-center gap-1">
                            {Array.from(
                              { length: Math.min(5, totalPages) },
                              (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }

                                return (
                                  <Button
                                    key={pageNum}
                                    variant={
                                      currentPage === pageNum
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() => goToPage(pageNum)}
                                    className="w-10 h-10 p-0"
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              }
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto max-w-md">
                        <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No tours found
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          We couldn't find any tours matching your search
                          criteria. Try adjusting your filters or search terms.
                        </p>
                        <div className="space-y-2">
                          <Button
                            onClick={clearSearch}
                            variant="outline"
                            className="w-full"
                          >
                            Clear all filters
                          </Button>
                          <Button
                            onClick={() => router.push("/")}
                            className="w-full"
                          >
                            Browse featured tours
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!loading &&
                !error &&
                products.length === 0 &&
                !hasActiveFilters && (
                  <div className="text-center py-12">
                    <div className="mx-auto max-w-md">
                      <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Start exploring tours
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Use the search and filters above to find your perfect
                        tour experience.
                      </p>
                      <Button onClick={() => refreshProducts()}>
                        Load all tours
                      </Button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-muted py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Can't find what you're looking for?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Our travel experts can help you create a custom tour package
            tailored to your preferences and budget.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg">Contact Our Experts</Button>
            <Button size="lg" variant="outline">
              View Special Offers
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
