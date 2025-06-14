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

import { PageHeader } from "@/components/page-header";
import { DynamicTourCard } from "@/components/dynamic-tour-card";
import { TourGridSkeleton } from "@/components/tour-grid-skeleton";
import { ErrorState } from "@/components/error-state";
import { useAllProducts } from "@/hooks/use-all-products";
import { useCityProducts } from "@/hooks/use-city-products";
import {
  getSearchCategories,
  getCategoryDisplayName,
  doesProductMatchCategory,
} from "@/lib/constants/categories";
import { RezdyProduct } from "@/lib/types/rezdy";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Filters {
  query: string;
  category: string;
  priceRange: string;
  participants: string;
  sortBy: string;
  checkIn: string;
  checkOut: string;
  city: string;
  location: string;
  limit: string;
  offset: string;
}

export default function ToursPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get city data for the dropdown
  const { cities, loading: citiesLoading } = useCityProducts();

  // Get search categories for the dropdown
  const searchCategories = getSearchCategories();

  // Fetch all products using the new hook
  const { products, loading, error, refreshProducts, totalCount, isCached } =
    useAllProducts();

  // Local filter state
  const [filters, setFilters] = useState<Filters>({
    query: searchParams.get("query") || "",
    category: searchParams.get("category") || "all",
    priceRange: searchParams.get("priceRange") || "all",
    participants: searchParams.get("participants") || "2",
    sortBy: searchParams.get("sortBy") || "relevance",
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
    city: searchParams.get("city") || "",
    location: searchParams.get("location") || "",
    limit: searchParams.get("limit") || "100",
    offset: searchParams.get("offset") || "0",
  });

  const [localQuery, setLocalQuery] = useState(filters.query);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Client-side filtering and sorting
  const { filteredProducts, totalFilteredCount, currentPage, totalPages } =
    useMemo(() => {
      let filtered = [...products];

      // Exclude gift cards from tours page
      filtered = filtered.filter(
        (product) =>
          product.productType !== "GIFT_CARD" &&
          !product.name.toLowerCase().includes("gift card") &&
          !product.name.toLowerCase().includes("gift voucher")
      );

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

      // Category filter
      if (filters.category !== "all") {
        filtered = filtered.filter((product) =>
          doesProductMatchCategory(product, filters.category)
        );
      }

      // Price range filter
      if (filters.priceRange !== "all") {
        switch (filters.priceRange) {
          case "under-99":
            filtered = filtered.filter(
              (product) => (product.advertisedPrice || 0) < 99
            );
            break;
          case "99-159":
            filtered = filtered.filter((product) => {
              const price = product.advertisedPrice || 0;
              return price >= 99 && price <= 159;
            });
            break;
          case "159-299":
            filtered = filtered.filter((product) => {
              const price = product.advertisedPrice || 0;
              return price >= 159 && price <= 299;
            });
            break;
          case "over-299":
            filtered = filtered.filter(
              (product) => (product.advertisedPrice || 0) > 299
            );
            break;
        }
      }

      // City/location filter
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

      // Sorting
      switch (filters.sortBy) {
        case "name":
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "price-low":
          filtered.sort(
            (a, b) => (a.advertisedPrice || 0) - (b.advertisedPrice || 0)
          );
          break;
        case "price-high":
          filtered.sort(
            (a, b) => (b.advertisedPrice || 0) - (a.advertisedPrice || 0)
          );
          break;
        case "newest":
          // Sort by productCode as a proxy for newest (if no dateCreated)
          filtered.sort((a, b) => b.productCode.localeCompare(a.productCode));
          break;
        default:
          // Relevance - keep original order
          break;
      }

      // Pagination
      const limit = parseInt(filters.limit) || 100;
      const offset = parseInt(filters.offset) || 0;
      const totalFilteredCount = filtered.length;
      const currentPage = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(totalFilteredCount / limit);

      // Apply pagination
      const paginatedProducts = filtered.slice(offset, offset + limit);

      return {
        filteredProducts: paginatedProducts,
        totalFilteredCount,
        currentPage,
        totalPages,
      };
    }, [products, filters]);

  // Sync URL parameters with filters when searchParams change
  useEffect(() => {
    const urlFilters: Filters = {
      query: searchParams.get("query") || "",
      category: searchParams.get("category") || "all",
      priceRange: searchParams.get("priceRange") || "all",
      participants: searchParams.get("participants") || "2",
      sortBy: searchParams.get("sortBy") || "relevance",
      checkIn: searchParams.get("checkIn") || "",
      checkOut: searchParams.get("checkOut") || "",
      city: searchParams.get("city") || "",
      location: searchParams.get("location") || "",
      limit: searchParams.get("limit") || "100",
      offset: searchParams.get("offset") || "0",
    };

    setFilters(urlFilters);
    setLocalQuery(urlFilters.query);
  }, [searchParams]);

  // Update URL when filters change
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
      category: "all",
      priceRange: "all",
      participants: "2",
      sortBy: "relevance",
      checkIn: "",
      checkOut: "",
      city: "",
      location: "",
      limit: "100",
      offset: "0",
    };
    updateFilter(key, defaultValues[key]);
  };

  const clearSearch = () => {
    setFilters({
      query: "",
      category: "all",
      priceRange: "all",
      participants: "2",
      sortBy: "relevance",
      checkIn: "",
      checkOut: "",
      city: "",
      location: "",
      limit: "100",
      offset: "0",
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
    filters.category !== "all" ||
    filters.priceRange !== "all" ||
    filters.checkIn !== "" ||
    filters.checkOut !== "" ||
    filters.city !== "" ||
    filters.location !== "";

  const hasResults = filteredProducts.length > 0;
  const totalResults = totalFilteredCount;

  const getFilterDisplayName = (key: string, value: string) => {
    const displayNames: Record<string, Record<string, string>> = {
      category: Object.fromEntries(
        searchCategories.map((cat) => [cat.id, cat.title])
      ),
      priceRange: {
        "under-99": "Under $99",
        "99-159": "$99 - $159",
        "159-299": "$159 - $299",
        "over-299": "Over $299",
      },
    };

    return displayNames[key]?.[value] || value;
  };

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Discover Amazing Tours"
        subtitle={
          hasResults
            ? `Found ${totalResults} tour${
                totalResults !== 1 ? "s" : ""
              } for your perfect adventure`
            : "Explore our collection of handpicked tours and experiences from around the world"
        }
        variant="coral"
      />

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
              <div className="sticky top-8 space-y-6">
                {/* Filter Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2">
                        {
                          Object.entries(filters).filter(
                            ([key, value]) =>
                              value &&
                              value !== "" &&
                              value !== "all" &&
                              value !== "any" &&
                              value !== "2" &&
                              value !== "relevance"
                          ).length
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

                {/* Filter Stack */}
                <div className="space-y-4">
                  {/* Tour Location Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Tour Location
                    </label>
                    <Select
                      value={filters.city || filters.location || "all"}
                      onValueChange={(value) => {
                        if (value === "all") {
                          clearFilter("city");
                          clearFilter("location");
                        } else {
                          updateFilter("city", value);
                          clearFilter("location");
                        }
                      }}
                      disabled={citiesLoading}
                    >
                      <SelectTrigger className="w-full h-10">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <SelectValue
                            placeholder={
                              citiesLoading ? "Loading..." : "All Locations"
                            }
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Check-in Date Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Check-in Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        date={
                          filters.checkIn
                            ? new Date(filters.checkIn)
                            : undefined
                        }
                        onDateChange={(date) => {
                          if (date) {
                            updateFilter("checkIn", format(date, "yyyy-MM-dd"));
                            if (filters.checkOut) {
                              const checkOutDate = new Date(filters.checkOut);
                              if (checkOutDate <= date) {
                                updateFilter(
                                  "checkOut",
                                  format(addDays(date, 1), "yyyy-MM-dd")
                                );
                              }
                            }
                          } else {
                            clearFilter("checkIn");
                          }
                        }}
                        placeholder="Select date"
                        minDate={new Date()}
                        maxDate={
                          filters.checkOut
                            ? addDays(new Date(filters.checkOut), -1)
                            : addDays(new Date(), 365)
                        }
                        className="w-full h-10"
                      />
                    </div>
                  </div>

                  {/* Check-out Date Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Check-out Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        date={
                          filters.checkOut
                            ? new Date(filters.checkOut)
                            : undefined
                        }
                        onDateChange={(date) => {
                          if (date) {
                            updateFilter(
                              "checkOut",
                              format(date, "yyyy-MM-dd")
                            );
                          } else {
                            clearFilter("checkOut");
                          }
                        }}
                        placeholder="Select date"
                        minDate={
                          filters.checkIn
                            ? addDays(new Date(filters.checkIn), 1)
                            : addDays(new Date(), 1)
                        }
                        maxDate={addDays(new Date(), 365)}
                        className="w-full h-10"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Category
                    </label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => updateFilter("category", value)}
                    >
                      <SelectTrigger className="w-full h-10">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="All Categories" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {searchCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Price Range
                    </label>
                    <Select
                      value={filters.priceRange}
                      onValueChange={(value) =>
                        updateFilter("priceRange", value)
                      }
                    >
                      <SelectTrigger className="w-full h-10">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">$</span>
                          <SelectValue placeholder="All Prices" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="under-99">Under $99</SelectItem>
                        <SelectItem value="99-159">$99 - $159</SelectItem>
                        <SelectItem value="159-299">$159 - $299</SelectItem>
                        <SelectItem value="over-299">Over $299</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Sort By
                    </label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => updateFilter("sortBy", value)}
                    >
                      <SelectTrigger className="w-full h-10">
                        <div className="flex items-center gap-2">
                          <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                          <SelectValue placeholder="Relevance" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="name">Name A-Z</SelectItem>
                        <SelectItem value="price-low">
                          Price: Low to High
                        </SelectItem>
                        <SelectItem value="price-high">
                          Price: High to Low
                        </SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active filters */}
                <div className="space-y-2">
                  {filters.query && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 w-full justify-between"
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
                  {(filters.city || filters.location) && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 w-full justify-between"
                    >
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {filters.city || filters.location}
                      </span>
                      <button
                        onClick={() => {
                          clearFilter("city");
                          clearFilter("location");
                        }}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.category !== "all" && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 w-full justify-between"
                    >
                      <span>
                        {getFilterDisplayName("category", filters.category)}
                      </span>
                      <button
                        onClick={() => clearFilter("category")}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.priceRange !== "all" && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 w-full justify-between"
                    >
                      <span>
                        {getFilterDisplayName("priceRange", filters.priceRange)}
                      </span>
                      <button
                        onClick={() => clearFilter("priceRange")}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.checkIn && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 w-full justify-between bg-orange-100 text-orange-800 border-orange-200"
                    >
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Check-in: {filters.checkIn}
                      </span>
                      <button
                        onClick={() => clearFilter("checkIn")}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.checkOut && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 w-full justify-between bg-orange-100 text-orange-800 border-orange-200"
                    >
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Check-out: {filters.checkOut}
                      </span>
                      <button
                        onClick={() => clearFilter("checkOut")}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
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
                        {filters.checkIn && filters.checkOut
                          ? "Checking availability..."
                          : "Loading tours..."}
                      </span>
                    ) : (
                      <>
                        {totalResults > 1
                          ? `${totalResults} tours found`
                          : `${totalResults} tour found`}
                        {totalPages > 1 && (
                          <span className="text-muted-foreground">
                            {` • Page ${currentPage} of ${totalPages}`}
                          </span>
                        )}
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
