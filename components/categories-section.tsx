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

// Top-level categories with static images and real Rezdy category IDs
const TOP_LEVEL_CATEGORIES = [
  {
    id: "winery-tours",
    title: "Winery Tours",
    description: "Wine tasting experiences at local wineries and vineyards",
    icon: Wine,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    subcategories: ["daily-wine", "private-wine-tours", "food-wine-private", "barefoot-luxury"] as string[],
    hasSubOptions: true,
    subOptions: [
      { name: "Daily Tours", icon: Calendar, categoryId: 620787 },
      { name: "Private Tours", icon: Sparkles, categoryId: 398952 },
    ],
  },
  {
    id: "brewery-tours", 
    title: "Brewery Tours",
    description: "Craft beer experiences and brewery visits",
    icon: Beer,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    categoryId: 292796,
  },
  {
    id: "hop-on-hop-off",
    title: "Hop-On Hop-Off",
    description: "Flexible sightseeing with hop-on hop-off bus services",
    icon: Bus,
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    categoryId: 546743,
  },
  {
    id: "day-tours",
    title: "Day Tours",
    description: "Full-day adventures and sightseeing experiences",
    icon: Calendar,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    categoryId: 620787,
  },
  {
    id: "bus-charter",
    title: "Bus Charter",
    description: "Private bus and coach charter services for groups",
    icon: Bus,
    image:
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    categoryId: 398329,
  },
  {
    id: "corporate-tours",
    title: "Corporate Tours",
    description: "Business events, team building, and corporate experiences",
    icon: Building,
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    categoryId: 395072,
  },
  {
    id: "hens-party",
    title: "Hens Party",
    description: "Special celebrations for brides-to-be and their friends",
    icon: Heart,
    image:
      "https://images.unsplash.com/photo-1529636798458-92182e662485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    categoryId: 318664,
  },
  {
    id: "barefoot-luxury",
    title: "Barefoot Luxury",
    description: "Premium and luxury experiences with exclusive service",
    icon: Sparkles,
    image:
      "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    categoryId: 466255,
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
              Australia, experience all day unlike any other when you take a{" "}
              <Link
                href="/tours"
                className="text-brand-accent hover:text-brand-accent/80 transition-colors duration-200 underline"
              >
                tour
              </Link>{" "}
              with Pineapple Tours.
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

              // Special handling for winery tours with animated split layout
              if (category.id === "winery-tours" && category.hasSubOptions) {
                return (
                  <div
                    key={category.id}
                    className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#FF585D]/30 h-full min-h-[280px] sm:min-h-[320px] flex flex-col bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#FF585D]/50"
                  >
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                      style={{
                        backgroundImage: `url(${category.image})`,
                      }}
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />

                    {/* Hover gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF585D]/20 via-[#FF585D]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Icon */}
                    <div className="relative z-10 p-6 sm:p-8 group-hover:opacity-0 transition-opacity duration-500">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md group-hover:bg-[#FF585D]/20 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 border border-white/20 group-hover:border-[#FF585D]/50">
                        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white group-hover:text-[#FF585D] transition-colors duration-500" />
                      </div>
                    </div>

                    {/* Content positioned to match other cards */}
                    <div className="relative z-10 p-6 sm:p-8 pt-0 h-full flex flex-col justify-end">
                      <div className="space-y-3 sm:space-y-4">
                        {/* Title */}
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 font-['Barlow'] drop-shadow-lg group-hover:text-[#FF585D] transition-all duration-300 group-hover:-translate-y-20 group-hover:opacity-0">
                          {category.title}
                        </h3>

                        {/* Description - visible by default */}
                        <p className="text-sm sm:text-base text-white/90 font-['Work_Sans'] line-clamp-3 drop-shadow-md leading-relaxed h-[4.5rem] sm:h-[5.25rem] group-hover:opacity-0 transition-opacity duration-300">
                          {category.description}
                        </p>

                        {/* Animated Split Layout - hidden by default, shows on hover */}
                        <div className="absolute top-[-100px] md:top-[-120px] lg:top-[-140px] inset-0 p-4 sm:p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                          <div className="h-full flex flex-col gap-3 sm:gap-4">
                            {/* Daily Tours Section - Top 50% */}
                            <Link
                              href={`/tours/category/daily-winery-tours`}
                              className="flex-1 relative group/daily overflow-hidden rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-[#FF585D]/70 hover:shadow-lg hover:shadow-[#FF585D]/20 transition-all duration-500 hover:scale-[1.02] hover:bg-white/15 min-h-[120px] sm:min-h-[140px] md:min-h-[150px] lg:min-h-[160px]"
                            >
                              {/* Enhanced background gradient overlays */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/daily:opacity-100 transition-opacity duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-br from-[#FF585D]/10 via-[#FF585D]/5 to-transparent opacity-0 group-hover/daily:opacity-100 transition-opacity duration-500" />
                              
                              {/* Ripple effect */}
                              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-[#FF585D]/20 opacity-0 group-hover/daily:opacity-100 transition-all duration-700" />
                              
                              <div className="h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 text-center">
                                <span className="text-lg sm:text-xl md:text-2xl font-semibold text-white group-hover/daily:text-[#FF585D] transition-all duration-500 font-['Barlow'] group-hover/daily:scale-105 mb-2">
                                  Daily Wine Tours
                                </span>
                                <p className="text-sm sm:text-base md:text-lg text-white/80 group-hover/daily:text-white/90 font-['Work_Sans'] transition-all duration-500">
                                  Scheduled group experiences
                                </p>
                              </div>
                            </Link>

                            {/* Private Tours Section - Bottom 50% */}
                            <Link
                              href={`/tours/category/private-winery-tours`}
                              className="flex-1 relative group/private overflow-hidden rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-[#FF585D]/70 hover:shadow-lg hover:shadow-[#FF585D]/20 transition-all duration-500 hover:scale-[1.02] hover:bg-white/15 min-h-[120px] sm:min-h-[140px] md:min-h-[150px] lg:min-h-[160px] block"
                            >
                              {/* Enhanced background gradient overlays */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/private:opacity-100 transition-opacity duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-br from-[#FF585D]/10 via-[#FF585D]/5 to-transparent opacity-0 group-hover/private:opacity-100 transition-opacity duration-500" />
                              
                              {/* Ripple effect */}
                              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-[#FF585D]/20 opacity-0 group-hover/private:opacity-100 transition-all duration-700" />
                              
                              <div className="h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 transition-all duration-500 delay-75 text-center">
                                <span className="text-lg sm:text-xl md:text-2xl font-semibold text-white group-hover/private:text-[#FF585D] transition-all duration-500 font-['Barlow'] group-hover/private:scale-105 mb-2">
                                  Private Wine Tours
                                </span>
                                <p className="text-sm sm:text-base md:text-lg text-white/80 group-hover/private:text-white/90 font-['Work_Sans'] transition-all duration-500">
                                  Exclusive personalized experiences
                                </p>
                              </div>
                            </Link>
                          </div>
                        </div>

                        {/* Call to action - positioned like other cards */}
                        <div className="flex items-center justify-between w-full pt-2 group-hover:opacity-0 transition-opacity duration-300">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-300 font-['Work_Sans']">
                              View Options
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-[#FF585D] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:translate-x-1">
                              <ChevronRight className="h-4 w-4 text-white transition-all duration-300" />
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-white/60">
                            <span>2 options</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Default card layout for other categories
              return (
                <Link
                  key={category.id}
                  href={`/tours/category/${category.id}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#FF585D]/30 h-full min-h-[280px] sm:min-h-[320px] flex flex-col bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#FF585D]/50">
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                      style={{
                        backgroundImage: `url(${category.image})`,
                      }}
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />

                    {/* Hover gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF585D]/20 via-[#FF585D]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Icon */}
                    <div className="relative z-10 p-6 sm:p-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md group-hover:bg-[#FF585D]/20 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 border border-white/20 group-hover:border-[#FF585D]/50">
                        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white group-hover:text-[#FF585D] transition-colors duration-500" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-6 sm:p-8 pt-0 h-full flex flex-col justify-end">
                      <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 font-['Barlow'] drop-shadow-lg group-hover:text-[#FF585D] transition-colors duration-300">
                          {category.title}
                        </h3>

                        <p className="text-sm sm:text-base text-white/90 font-['Work_Sans'] line-clamp-3 drop-shadow-md leading-relaxed h-[4.5rem] sm:h-[5.25rem]">
                          {category.description}
                        </p>

                        {/* Sub-options indicator - show on hover */}
                        {category.hasSubOptions && category.subOptions && (
                          <div className="flex gap-2 flex-wrap opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            {category.subOptions.map((option, index) => {
                              const OptionIcon = option.icon;
                              return (
                                <div
                                  key={index}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs text-white border border-white/30 hover:bg-white/30 hover:border-white/40 transition-all duration-200 cursor-pointer"
                                >
                                  <OptionIcon className="w-3 h-3" />
                                  <span className="font-medium">{option.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Call to action */}
                        <div className="flex items-center justify-between w-full pt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-300 font-['Work_Sans']">
                              {category.hasSubOptions ? "View Options" : "Explore Tours"}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-[#FF585D] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:translate-x-1">
                              <ChevronRight className="h-4 w-4 text-white transition-all duration-300" />
                            </div>
                          </div>
                          {category.hasSubOptions && (
                            <div className="flex items-center gap-1 text-xs text-white/60 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                              <span>2 options</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}
