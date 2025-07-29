"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  MapPin,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Globe,
  Award,
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
  SelectItemNoCheck,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { ProductFilterService } from "@/lib/services/product-filter-service";
import { RegionFilterService } from "@/lib/services/region-filter-service";
import { REGION_OPTIONS, PickupRegion } from "@/lib/constants/pickup-regions";

import { PageHeader } from "@/components/page-header";
import { DynamicTourCard } from "@/components/dynamic-tour-card";
import { TourGridSkeleton } from "@/components/tour-grid-skeleton";
import { ErrorState } from "@/components/error-state";
import { useAllProducts } from "@/hooks/use-all-products";
import { useBookingPrompt } from "@/hooks/use-booking-prompt";
import { RezdyProduct } from "@/lib/types/rezdy";

interface Filters {
  query: string;
  participants: string;
  checkIn: string;
  checkOut: string;
  region: string;
  limit: string;
  offset: string;
  tourDate: string;
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
    region: searchParams.get("region") || searchParams.get("location") || searchParams.get("city") || "",
    limit: searchParams.get("limit") || "100",
    offset: searchParams.get("offset") || "0",
    tourDate: searchParams.get("tourDate") || searchParams.get("checkIn") || "",
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


  // Enhanced client-side filtering using region-based filtering
  const {
    filteredProducts,
    currentPage,
    totalPages,
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

    // Region-based location filter
    if (filters.region && filters.region !== PickupRegion.ALL) {
      const regionResult = RegionFilterService.filterProductsByRegion(
        filtered, 
        filters.region,
        { fallbackToCity: true }
      );
      filtered = regionResult.filteredProducts;
    }

    // Tour Date filter - check if product has availability on selected date
    // Note: This is a basic filter. For real availability, you'd need to call Rezdy API
    if (filters.tourDate) {
      // For now, we'll include all products if a date is selected
      // In a real implementation, you'd filter based on actual availability
      // This could be enhanced with availability checking logic
    }

    // Participants filter - check if product supports the number of participants
    if (filters.participants && parseInt(filters.participants) > 0) {
      const participantCount = parseInt(filters.participants);
      filtered = filtered.filter((product) => {
        // Default values if not specified
        const minRequired = product.quantityRequiredMin || 1;
        const maxAllowed = product.quantityRequiredMax || 999;
        
        // Product is valid if participant count is within the allowed range
        return participantCount >= minRequired && participantCount <= maxAllowed;
      });
    }

    // --- Client-side pagination ---
    const limit = parseInt(filters.limit) || 100;
    const offset = parseInt(filters.offset) || 0;

    const currentPage = Math.floor(offset / limit) + 1;

    // Slice the current page after all filters/sorting are applied
    const paginated = filtered.slice(offset, offset + limit);

    const totalPages = Math.max(1, Math.ceil(filtered.length / limit));

    return {
      filteredProducts: paginated,
      currentPage,
      totalPages,
    };
  }, [products, filters]);

  // Sync URL parameters with filters when searchParams change
  useEffect(() => {
    const urlFilters: Filters = {
      query: searchParams.get("query") || "",
      participants: searchParams.get("participants") || "2",
      checkIn: searchParams.get("checkIn") || "",
      checkOut: searchParams.get("checkOut") || "",
      region: searchParams.get("region") || searchParams.get("location") || searchParams.get("city") || "",
      limit: searchParams.get("limit") || "100",
      offset: searchParams.get("offset") || "0",
      tourDate: searchParams.get("tourDate") || searchParams.get("checkIn") || "",
    };

    setFilters(urlFilters);
    setLocalQuery(urlFilters.query);
  }, [searchParams]);

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
      region: "",
      limit: "100",
      offset: "0",
      tourDate: "",
    };
    updateFilter(key, defaultValues[key]);
  };

  const clearSearch = () => {
    setFilters({
      query: "",
      participants: "2",
      checkIn: "",
      checkOut: "",
      region: "",
      limit: "100",
      offset: "0",
      tourDate: "",
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
    filters.region !== "" ||
    filters.tourDate !== "";

  const hasResults = filteredProducts.length > 0;

  // Keep the URL in sync with the current filters so the page is shareable / bookmarkable
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (
        value &&
        value !== "" &&
        value !== PickupRegion.ALL &&
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
        </div>
      </section>

      {/* Main Content - 2 Column Layout */}
      <section className="py-8 my-6">
        <div className="container-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
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
                            if (key === "location")
                              return false; // Legacy param

                            // Count active filters
                            return (
                              value &&
                              value !== "" &&
                              value !== PickupRegion.ALL &&
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
                        className="flex items-center gap-1 px-3 py-1.5 md:py-1 rounded-full text-xs md:text-sm"
                      >
                        <span className="truncate max-w-[120px] md:max-w-none">Search: "{filters.query}"</span>
                        <button
                          onClick={() => {
                            clearFilter("query");
                            setLocalQuery("");
                          }}
                          className="ml-1 hover:text-destructive flex-shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.region && filters.region !== PickupRegion.ALL && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1.5 md:py-1 rounded-full text-xs md:text-sm"
                      >
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-[120px] md:max-w-none">
                            {REGION_OPTIONS.find(opt => opt.value === filters.region)?.label || filters.region}
                          </span>
                        </span>
                        <button
                          onClick={() => clearFilter("region")}
                          className="ml-1 hover:text-destructive flex-shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.participants !== "2" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1.5 md:py-1 rounded-full text-xs md:text-sm"
                      >
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{filters.participants} participants</span>
                        </span>
                        <button
                          onClick={() => clearFilter("participants")}
                          className="ml-1 hover:text-destructive flex-shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.tourDate && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1.5 md:py-1 rounded-full bg-orange-100 text-orange-800 border-orange-200 text-xs md:text-sm"
                      >
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{format(new Date(filters.tourDate), "MMM dd, yyyy")}</span>
                        </span>
                        <button
                          onClick={() => clearFilter("tourDate")}
                          className="ml-1 hover:text-destructive flex-shrink-0"
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
                    <Label className="text-sm md:text-base font-medium text-muted-foreground">
                      Participants
                    </Label>
                    <Select
                      value={filters.participants}
                      onValueChange={(value) =>
                        updateFilter("participants", value)
                      }
                    >
                      <SelectTrigger className="w-full h-12 md:h-11 px-3 md:px-4">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <SelectValue 
                            placeholder="Select participants" 
                            className="text-sm md:text-base truncate"
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="min-w-[280px] md:min-w-[320px] max-w-[95vw]">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (num) => (
                            <SelectItem 
                              key={num} 
                              value={num.toString()}
                              className="py-3 md:py-2 px-3 md:px-4"
                            >
                              <span className="text-sm md:text-base">
                                {num} {num === 1 ? "Participant" : "Participants"}
                              </span>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tour Date Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm md:text-base font-medium text-muted-foreground">
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

                  {/* Location/Region Filter - Enhanced with region-based filtering */}
                  <div className="space-y-2">
                    <Label className="text-sm md:text-base font-medium text-muted-foreground">
                      Pickup Location
                    </Label>
                    
                    <Select
                      value={filters.region || PickupRegion.ALL}
                      onValueChange={(value) => {
                        if (value === PickupRegion.ALL) {
                          updateFilter("region", "");
                        } else {
                          updateFilter("region", value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full h-12 md:h-11 px-3 md:px-4">
                        <div className="flex items-center text-start gap-2 min-w-0 flex-1">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm md:text-base truncate">
                            {filters.region && filters.region !== PickupRegion.ALL
                              ? REGION_OPTIONS.find(opt => opt.value === filters.region)?.label || filters.region
                              : "Select pickup region"
                            }
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="min-w-[280px] md:min-w-[320px] max-w-[90vw]">
                        {REGION_OPTIONS.map((option) => (
                          <SelectItemNoCheck 
                            key={option.value} 
                            value={option.value}
                            className="h-auto min-h-[3rem] py-3 md:py-2.5 px-3 md:px-4"
                          >
                            <div className="flex flex-col gap-1 min-w-0 w-full">
                              <span className="text-sm font-medium leading-normal truncate">{option.label}</span>
                              {option.description && (
                                <span className="text-xs text-muted-foreground leading-tight line-clamp-2">
                                  {option.description}
                                </span>
                              )}
                            </div>
                          </SelectItemNoCheck>
                        ))}
                      </SelectContent>
                    </Select>
                    
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="lg:col-span-4">
              {/* Results count and status */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                
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
                      <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 ">
                        {filteredProducts.map((product: RezdyProduct) => (
                          <DynamicTourCard
                            key={product.productCode}
                            product={product}
                            selectedDate={filters.tourDate}
                            participants={filters.participants}
                            selectedLocation={filters.region}
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
