"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Star,
  X,
  Calendar,
  Clock,
  Grid,
  List,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default function DailyToursPage() {
  const router = useRouter();
  const { cities, loading: citiesLoading } = useCityProducts();
  const searchCategories = getSearchCategories();

  const [filters, setFilters] = useState({
    query: "",
    category: "all",
    priceRange: "all",
    city: "all",
    sortBy: "popularity",
    viewMode: "grid" as "grid" | "list",
  });

  const [localQuery, setLocalQuery] = useState(filters.query);
  const { products, loading, error, refreshProducts } = useAllProducts();

  const dailyTours = useMemo(() => {
    return products.filter((product) => {
      // Only show products with productType "DAYTOUR"
      return product.productType === "DAYTOUR";
    });
  }, [products]);

  const filteredTours = useMemo(() => {
    let filtered = [...dailyTours];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.shortDescription?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
      );
    }

    if (filters.category !== "all") {
      filtered = filtered.filter((product) =>
        doesProductMatchCategory(product, filters.category)
      );
    }

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

    if (filters.city && filters.city !== "all") {
      filtered = filtered.filter((product) => {
        const address = product.locationAddress;
        if (typeof address === "string") {
          return address.toLowerCase().includes(filters.city.toLowerCase());
        } else if (address && typeof address === "object") {
          return (
            address.city?.toLowerCase().includes(filters.city.toLowerCase()) ||
            address.state?.toLowerCase().includes(filters.city.toLowerCase())
          );
        }
        return false;
      });
    }

    switch (filters.sortBy) {
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
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [dailyTours, filters]);

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      query: "",
      category: "all",
      priceRange: "all",
      city: "all",
      sortBy: "popularity",
      viewMode: "grid",
    });
    setLocalQuery("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("query", localQuery);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "viewMode" || key === "sortBy") return false;
    return value !== "" && value !== "all";
  }).length;

  if (error) {
    return (
      <div className="container py-8">
        <ErrorState
          title="Failed to load daily tours"
          message="We couldn't load the daily tours at the moment. Please try again."
          onRetry={refreshProducts}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <PageHeader
          title="Daily Tours"
          subtitle="Discover our scheduled daily tours with fixed departure times and shared experiences. Perfect for meeting fellow travelers and exploring Queensland's best destinations."
        />

        <div className="container py-8">
          <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search daily tours..."
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>

              <div className="flex items-center gap-2">
                <Button
                  variant={filters.viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter("viewMode", "grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={filters.viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter("viewMode", "list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Select
                value={filters.category}
                onValueChange={(value) => updateFilter("category", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
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

              <Select
                value={filters.priceRange}
                onValueChange={(value) => updateFilter("priceRange", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-99">Under $99</SelectItem>
                  <SelectItem value="99-159">$99 - $159</SelectItem>
                  <SelectItem value="159-299">$159 - $299</SelectItem>
                  <SelectItem value="over-299">Over $299</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.city}
                onValueChange={(value) => updateFilter("city", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {!citiesLoading &&
                    cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.sortBy}
                onValueChange={(value) => updateFilter("sortBy", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              {activeFiltersCount > 0 && (
                <Button variant="outline" onClick={clearAllFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {loading
                  ? "Loading..."
                  : `${filteredTours.length} Daily Tours Available`}
              </h2>
              <p className="text-muted-foreground">
                Scheduled tours with fixed departure times
              </p>
            </div>
          </div>

          {loading && <TourGridSkeleton />}

          {!loading && (
            <>
              {filteredTours.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto max-w-md">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">
                      No daily tours found
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Try adjusting your filters or search terms to find more
                      tours.
                    </p>
                    <Button onClick={clearAllFilters} className="mt-4">
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredTours.map((product) => (
                    <DynamicTourCard
                      key={product.productCode}
                      product={product}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
