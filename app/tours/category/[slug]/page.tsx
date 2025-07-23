"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Filter,
  Grid,
  List,
  Clock,
  Users,
  DollarSign,
  Wine,
  Beer,
  Bus,
  Building,
  Sparkles,
  Heart,
  Activity,
  Car,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { DynamicTourCard } from "@/components/dynamic-tour-card";
import { TourGridSkeleton } from "@/components/tour-grid-skeleton";
import { ErrorState } from "@/components/error-state";
import { useCategoryProducts } from "@/hooks/use-category-products";
import { RezdyProduct } from "@/lib/types/rezdy";
import {
  getCategoryById,
} from "@/lib/constants/categories";

// Category-specific configurations for PageHeader
const getCategoryHeaderConfig = (categorySlug: string, categoryConfig: any) => {
  const configs: Record<string, any> = {
    "winery-tours": {
      backgroundImage:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      featureCards: [
        { icon: Wine, title: "Wine Tasting" },
        { icon: Users, title: "Expert Guides" },
        { icon: Clock, title: "Full Experience" },
      ],
    },
    "daily-winery-tours": {
      backgroundImage:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      featureCards: [
        { icon: Wine, title: "Daily Wine Tours" },
        { icon: Users, title: "Shared Groups" },
        { icon: Clock, title: "Scheduled Times" },
      ],
    },
    "private-winery-tours": {
      backgroundImage:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      featureCards: [
        { icon: Wine, title: "Private Wine Tours" },
        { icon: Users, title: "Exclusive Groups" },
        { icon: Sparkles, title: "Premium Experience" },
      ],
    },
    "brewery-tours": {
      backgroundImage:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      featureCards: [
        { icon: Beer, title: "Craft Beer" },
        { icon: Users, title: "Local Breweries" },
        { icon: Clock, title: "Behind Scenes" },
      ],
    },
    "hop-on-hop-off": {
      backgroundImage:
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      featureCards: [
        { icon: Bus, title: "Flexible Routes" },
        { icon: Clock, title: "Your Schedule" },
        { icon: DollarSign, title: "Great Value" },
      ],
    },
    "bus-charter": {
      backgroundImage:
        "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      featureCards: [
        { icon: Bus, title: "Private Charter" },
        { icon: Users, title: "Group Travel" },
        { icon: Building, title: "Professional Service" },
      ],
    },
    "day-tours": {
      backgroundImage:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      featureCards: [
        { icon: Clock, title: "Full Day" },
        { icon: Users, title: "Small Groups" },
        { icon: DollarSign, title: "All Inclusive" },
      ],
    },
    "corporate-tours": {
      backgroundImage:
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      featureCards: [
        { icon: Building, title: "Team Building" },
        { icon: Users, title: "Professional" },
        { icon: Clock, title: "Customizable" },
      ],
    },
    "barefoot-luxury": {
      backgroundImage:
        "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      featureCards: [
        { icon: Sparkles, title: "Luxury Experience" },
        { icon: Users, title: "Premium Service" },
        { icon: Wine, title: "Exclusive Access" },
      ],
    },
    "hens-party": {
      backgroundImage:
        "https://images.unsplash.com/photo-1529636798458-92182e662485?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      featureCards: [
        { icon: Heart, title: "Special Celebration" },
        { icon: Users, title: "Girls Day Out" },
        { icon: Sparkles, title: "Memorable Fun" },
      ],
    },
    activities: {
      backgroundImage:
        "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      featureCards: [
        { icon: Activity, title: "Adventure" },
        { icon: Users, title: "Fun Activities" },
        { icon: Clock, title: "Exciting Experience" },
      ],
    },
    "private-tours": {
      backgroundImage: "/private-tours/brisbane-tours.webp",
      featureCards: [
        { icon: Users, title: "Private Group" },
        { icon: Clock, title: "Flexible Timing" },
        { icon: Car, title: "Personal Guide" },
      ],
    },
  };

  return (
    configs[categorySlug] || {
      backgroundImage:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      featureCards: [
        { icon: Clock, title: "Great Experience" },
        { icon: Users, title: "Expert Guides" },
        { icon: DollarSign, title: "Best Value" },
      ],
    }
  );
};

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const categorySlug = resolvedParams.slug;

  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Get category configuration
  const categoryConfig = getCategoryById(categorySlug);

  // Use direct category products API
  const { data: categoryProducts, loading, error } = useCategoryProducts(
    categoryConfig?.id || null,
    {
      enabled: !!categoryConfig,
    }
  );

  // Use products directly from Rezdy API without additional filtering
  const filteredProducts = categoryProducts || [];

  // Apply search filter with relevance scoring
  const searchFilteredProducts = filteredProducts
    .filter((product) => {
      if (!searchQuery.trim()) return true;

      const searchText = `${product.name} ${product.shortDescription || ""} ${
        product.description || ""
      } ${product.locationAddress || ""}`.toLowerCase();
      const queryTerms = searchQuery
        .toLowerCase()
        .split(" ")
        .filter((term) => term.length > 0);

      // Check if all query terms are found in the search text
      return queryTerms.every((term) => searchText.includes(term));
    })
    .map((product) => {
      // Calculate relevance score for sorting
      let relevanceScore = 0;
      
      if (searchQuery.trim()) {
        const productName = product.name.toLowerCase();
        const queryTerms = searchQuery
          .toLowerCase()
          .split(" ")
          .filter((term) => term.length > 0);

        // Check for exact name match (highest priority)
        if (queryTerms.every((term) => productName.includes(term))) {
          relevanceScore += 1000;
          
          // Bonus for exact phrase match
          if (productName.includes(searchQuery.toLowerCase())) {
            relevanceScore += 500;
          }
        }

        // Check for partial name matches
        queryTerms.forEach((term) => {
          if (productName.includes(term)) {
            relevanceScore += 100;
          }
        });

        // Lower score for description/location matches
        const descriptionText = `${product.shortDescription || ""} ${
          product.description || ""
        } ${product.locationAddress || ""}`.toLowerCase();
        
        queryTerms.forEach((term) => {
          if (descriptionText.includes(term) && !productName.includes(term)) {
            relevanceScore += 10;
          }
        });
      }

      return { ...product, relevanceScore };
    });

  // Sort products with search relevance and user selection
  const sortedProducts = [...searchFilteredProducts].sort((a, b) => {
    // If there's a search query, prioritize by search relevance first
    if (searchQuery.trim()) {
      const relevanceDiff = b.relevanceScore - a.relevanceScore;
      if (relevanceDiff !== 0) return relevanceDiff;
    }

    // Apply sorting based on user selection
    switch (sortBy) {
      case "price-low":
        return (a.advertisedPrice || 0) - (b.advertisedPrice || 0);
      case "price-high":
        return (b.advertisedPrice || 0) - (a.advertisedPrice || 0);
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  if (!categoryConfig) {
    return (
      <div className="container py-12">
        <ErrorState
          title="Category not found"
          message="The category you're looking for doesn't exist."
          onRetry={() => router.push("/tours")}
          showRetry={true}
        />
      </div>
    );
  }

  // Get header configuration for this category
  const headerConfig = getCategoryHeaderConfig(categorySlug, categoryConfig);

  return (
    <div>
      {/* Header using PageHeader component */}
      <PageHeader
        title={categoryConfig.title}
        subtitle={categoryConfig.description}
        backgroundImage={headerConfig.backgroundImage}
        overlayOpacity={0.6}
        featureCards={headerConfig.featureCards}
        backButton={{
          label: "Back to Tours",
          icon: ArrowLeft,
          onClick: () => router.push("/tours"),
        }}
      />

      {/* Filters Section */}
      <section className="border-b bg-white py-6">
        <div className="container">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tours in this category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="py-8">
        <div className="container">
          {loading && <TourGridSkeleton count={9} />}

          {error && (
            <ErrorState
              title="Unable to load tours"
              message="We're having trouble loading the tours. Please try again."
              onRetry={() => window.location.reload()}
            />
          )}

          {!loading && !error && (
            <>
              {sortedProducts.length > 0 ? (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1 max-w-4xl mx-auto"
                  }`}
                >
                  {sortedProducts.map((product) => (
                    <DynamicTourCard
                      key={product.productCode}
                      product={product}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <CardContent>
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      {searchQuery ? (
                        <Search className="h-6 w-6 text-muted-foreground" />
                      ) : (
                        <Filter className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery
                        ? "No tours match your search"
                        : "No tours found"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? (
                        <>
                          No {categoryConfig.title.toLowerCase()} match "
                          <span className="font-medium">{searchQuery}</span>".
                          Try adjusting your search terms.
                        </>
                      ) : (
                        <>
                          We don't have any {categoryConfig.title.toLowerCase()}{" "}
                          available at the moment.
                        </>
                      )}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      {searchQuery && (
                        <Button
                          variant="outline"
                          onClick={() => setSearchQuery("")}
                        >
                          Clear search
                        </Button>
                      )}
                      <Button onClick={() => router.push("/tours")}>
                        Browse all tours
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
