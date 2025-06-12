"use client";

import Link from "next/link";
import {
  ChevronRight,
  Wine,
  Beer,
  Bus,
  Calendar,
  Building,
  Sparkles,
  Activity,
  Users,
  Car,
  GraduationCap,
  Ticket,
  Package,
  Gift,
  Heart,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";

// ... existing code ...
import { useEnhancedRezdyProducts } from "@/hooks/use-rezdy-enhanced";
import {
  TOUR_CATEGORIES,
  TourCategory,
  filterProductsByCategory,
} from "@/lib/constants/categories";
import { RezdyProduct } from "@/lib/types/rezdy";
import { cn } from "@/lib/utils";
import {
  ErrorBoundary,
  SimpleErrorFallback,
} from "@/components/ui/error-boundary";
import {
  CategoriesSectionSkeleton,
  LoadingProgressBar,
} from "@/components/ui/loading-skeletons";

// Top-level categories with static images
const TOP_LEVEL_CATEGORIES = [
  {
    id: "winery-tours",
    title: "Winery Tours",
    description: "Wine tasting experiences at local wineries and vineyards",
    icon: Wine,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    subcategories: ["winery-tours", "barefoot-luxury"] as string[],
  },
  {
    id: "brewery-tours",
    title: "Brewery Tours",
    description: "Craft beer experiences and brewery visits",
    icon: Beer,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    subcategories: ["brewery-tours", "day-tours"] as string[],
  },
  {
    id: "hop-on-hop-off",
    title: "Hop-On Hop-Off",
    description: "Flexible sightseeing with hop-on hop-off bus services",
    icon: Bus,
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    subcategories: ["hop-on-hop-off", "transfers", "day-tours"] as string[],
  },
  {
    id: "bus-charter",
    title: "Bus Charter",
    description: "Private bus and coach charter services for groups",
    icon: Bus,
    image:
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    subcategories: [
      "bus-charter",
      "corporate-tours",
      "private-tours",
    ] as string[],
  },
  {
    id: "day-tours",
    title: "Day Tours",
    description: "Full-day guided tours and excursions",
    icon: Calendar,
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    subcategories: [
      "day-tours",
      "winery-tours",
      "brewery-tours",
      "activities",
    ] as string[],
  },
  {
    id: "corporate-tours",
    title: "Corporate Tours",
    description: "Business events, team building, and corporate experiences",
    icon: Building,
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    subcategories: [
      "corporate-tours",
      "private-tours",
      "bus-charter",
      "activities",
    ] as string[],
  },
  {
    id: "hens-party",
    title: "Hens Party",
    description: "Special celebrations for brides-to-be and their friends",
    icon: Heart,
    image:
      "https://images.unsplash.com/photo-1529636798458-92182e662485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    subcategories: [
      "hens-party",
      "winery-tours",
      "brewery-tours",
      "barefoot-luxury",
    ] as string[],
  },
  {
    id: "barefoot-luxury",
    title: "Barefoot Luxury",
    description: "Premium and luxury experiences with exclusive service",
    icon: Sparkles,
    image:
      "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    subcategories: [
      "barefoot-luxury",
      "private-tours",
      "winery-tours",
      "corporate-tours",
    ] as string[],
  },
];

// Icon mapping for categories
const CATEGORY_ICONS = {
  "winery-tours": Wine,
  "brewery-tours": Beer,
  "hop-on-hop-off": Bus,
  "bus-charter": Bus,
  "day-tours": Calendar,
  "corporate-tours": Building,
  "hens-party": Heart,
  "barefoot-luxury": Sparkles,
  activities: Activity,
  "private-tours": Users,
  "multiday-tours": Package,
  transfers: Car,
  lessons: GraduationCap,
  tickets: Ticket,
  rentals: Car,
  "gift-cards": Gift,
  merchandise: Package,
} as const;

// ... existing code ...

// ... existing code ...

// ... existing code ...

// ... existing code ...

// ... existing code ...

export function CategoriesSection() {
  // Memoize the hook options to prevent unnecessary re-renders
  const hookOptions = useMemo(
    () => ({
      limit: 100,
      offset: 0,
      enableProgressiveLoading: true,
      preloadCategories: ["winery-tours", "brewery-tours", "day-tours"],
    }),
    []
  );

  const {
    data: products,
    loading,
    error,
    retry,
  } = useEnhancedRezdyProducts(hookOptions);

  const [categoriesWithCounts, setCategoriesWithCounts] = useState<
    TourCategory[]
  >([]);

  // Calculate tour counts for all categories
  useEffect(() => {
    if (products) {
      const allCategories = TOUR_CATEGORIES.map((category) => {
        const filteredProducts = filterProductsByCategory(products, category);
        const tourCount = filteredProducts.length;

        return {
          ...category,
          tourCount,
          icon: CATEGORY_ICONS[category.id as keyof typeof CATEGORY_ICONS],
        };
      });
      setCategoriesWithCounts(allCategories);
    }
  }, [products]);

  // Calculate product count for each top-level category
  const getCategoryProductCount = (
    category: (typeof TOP_LEVEL_CATEGORIES)[0]
  ) => {
    if (!products?.length) return 0;

    let filteredProducts = category.subcategories.reduce(
      (acc: RezdyProduct[], subcategoryId) => {
        const subcategory = categoriesWithCounts.find(
          (cat) => cat.id === subcategoryId
        );
        if (subcategory) {
          const subProducts = filterProductsByCategory(products, subcategory);
          subProducts.forEach((product) => {
            if (!acc.find((p) => p.productCode === product.productCode)) {
              acc.push(product);
            }
          });
        }
        return acc;
      },
      []
    );

    // Filter out gift vouchers/gift cards
    const validProducts = filteredProducts.filter(
      (product) =>
        product.productType !== "GIFT_CARD" &&
        product.productType !== "GIFT_VOUCHER" &&
        !product.name.toLowerCase().includes("gift card") &&
        !product.name.toLowerCase().includes("gift voucher")
    );

    return validProducts.length;
  };

  // Show initial loading skeleton
  if (loading.isInitialLoading && !products) {
    return <CategoriesSectionSkeleton />;
  }

  if (error) {
    return (
      <ErrorBoundary>
        <section className="bg-[#141312] py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4 font-['Barlow']">
                Tour Categories
              </h2>
              <p className="text-base lg:text-lg text-gray-300 font-['Work_Sans']">
                Discover your perfect adventure by category
              </p>
            </div>
            <SimpleErrorFallback
              error={error}
              onRetry={retry}
              className="max-w-md mx-auto"
            />
          </div>
        </section>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("CategoriesSection Error:", error, errorInfo);
      }}
      maxRetries={3}
    >
      <section className="bg-[#141312] py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-start mb-8 lg:mb-12">
            <h2 className="text-[42px] leading-[58px] font-semibold text-white mb-4 font-['Barlow']">
              Tour Categories
            </h2>
            <p className="text-base lg:text-lg text-white/80 font-['Work_Sans'] ">
              Pineapple Tours has worked hard over the years perfecting each and
              every one of our tours to make sure that they are not only world
              class experiences but also authentic experiences. Whether to
              adventure through scenic terrains that take your breath away or
              taste some of the finest selection of gourmet food and wine in
              Australia, experience all day unlike any other when you take a
              tour with Pineapple Tours.
            </p>

            {/* Loading Progress Bar */}
            {(loading.isRefreshing || loading.isRetrying) && (
              <div className="max-w-md mx-auto mt-6">
                <LoadingProgressBar
                  progress={loading.progress}
                  stage={loading.stage}
                />
              </div>
            )}
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {TOP_LEVEL_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const productCount = getCategoryProductCount(category);

              return (
                <Link
                  key={category.id}
                  href={`/tours/category/${category.id}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#FF585D]/20 h-full min-h-[280px] sm:min-h-[320px] flex flex-col">
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundImage: `url(${category.image})`,
                      }}
                    />

                    {/* Dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FF585D]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Content */}
                    <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col">
                      {/* Content */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 font-['Barlow'] drop-shadow-lg">
                          {category.title}
                        </h3>

                        <p className="text-sm sm:text-base text-white/90 font-['Work_Sans'] mb-4 sm:mb-6 flex-1 line-clamp-3 drop-shadow-md">
                          {category.description}
                        </p>

                        {/* Tour Count and Arrow */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs text-white/70 uppercase tracking-wide font-['Work_Sans'] mb-1 drop-shadow-sm">
                              Available Tours
                            </span>
                            <span className="text-lg sm:text-xl font-bold text-white font-['Barlow'] drop-shadow-lg">
                              {productCount}
                            </span>
                          </div>

                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-[#FF585D] flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white transition-colors duration-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="text-center mt-8 lg:mt-12">
            <p className="text-sm text-gray-400 font-['Work_Sans']">
              Can't find what you're looking for?{" "}
              <Link
                href="/contact"
                className="text-[#FF585D] hover:text-[#FF585D]/80 transition-colors duration-200 underline"
              >
                Contact us
              </Link>{" "}
              for custom tour arrangements.
            </p>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}
