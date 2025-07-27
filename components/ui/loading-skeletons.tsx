import React from "react";
import { cn } from "@/lib/utils";

// Base skeleton component
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-800/50", className)}
      {...props}
    />
  );
}

// Enhanced skeleton with breathing effect
export function BreathingSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-800/50", className)}
      {...props}
    />
  );
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-72 sm:w-80 md:w-72 lg:w-80 xl:w-72 2xl:w-80">
      <div className="relative overflow-hidden rounded-xl shadow-lg h-96 sm:h-[420px] md:h-96 lg:h-[420px] xl:h-96 2xl:h-[420px] bg-gray-800/50">
        {/* Image skeleton */}
        <BreathingSkeleton className="absolute inset-0" />

        {/* Content skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 to-transparent">
          {/* Title skeleton */}
          <div className="mb-3 sm:mb-4 space-y-2">
            <Skeleton className="h-5 sm:h-6 w-3/4 bg-gray-600/50" />
            <Skeleton className="h-4 sm:h-5 w-1/2 bg-gray-600/50" />
          </div>

          {/* Price and button skeleton */}
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-3 w-20 bg-gray-600/50" />
              <Skeleton className="h-6 sm:h-8 w-16 bg-gray-600/50" />
            </div>
            <Skeleton className="h-8 sm:h-9 w-16 bg-[#FF585D]/30 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Category navigation skeleton
export function CategoryNavigationSkeleton({
  isCollapsed = false,
}: {
  isCollapsed?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-[#141312] border-r border-gray-700 flex flex-col",
        isCollapsed ? "w-16" : "w-72 xl:w-80"
      )}
    >
      {/* Header skeleton */}
      <div className="p-3 xl:p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-5 xl:h-6 w-32 bg-gray-700/50" />
              <Skeleton className="h-3 xl:h-4 w-40 bg-gray-700/50" />
            </div>
          )}
          <Skeleton className="h-8 w-8 bg-gray-700/50 rounded flex-shrink-0" />
        </div>

        {/* Search skeleton */}
        {!isCollapsed && (
          <div className="mt-3">
            <Skeleton className="h-9 w-full bg-gray-700/50 rounded" />
          </div>
        )}
      </div>

      {/* Navigation items skeleton */}
      <nav className="flex-1 p-2 space-y-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-3 p-2.5 xl:p-3 rounded-lg",
              isCollapsed && "justify-center p-2"
            )}
          >
            <Skeleton className="h-4 w-4 xl:h-5 xl:w-5 bg-[#FF585D]/30 rounded flex-shrink-0" />

            {!isCollapsed && (
              <div className="flex-1 min-w-0 space-y-1">
                <Skeleton className="h-4 w-24 bg-gray-700/50" />
                <Skeleton className="h-3 w-16 bg-gray-700/50" />
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}

// Category row skeleton
export function CategoryRowSkeleton() {
  return (
    <div className="mb-6 lg:mb-8">
      {/* Category header skeleton */}
      <div className="flex items-center justify-between mb-3 lg:mb-4 px-1">
        <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
          <Skeleton className="h-5 w-5 lg:h-6 lg:w-6 bg-[#FF585D]/30 rounded flex-shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 lg:h-8 xl:h-9 w-48 bg-gray-700/50" />
            <Skeleton className="h-4 lg:h-5 w-64 bg-gray-700/50" />
            <Skeleton className="h-3 lg:h-4 w-32 bg-gray-700/50" />
          </div>
        </div>

        {/* Scroll controls skeleton */}
        <div className="flex gap-1 lg:gap-2 flex-shrink-0">
          <Skeleton className="h-7 w-7 lg:h-8 lg:w-8 bg-gray-700/50 rounded" />
          <Skeleton className="h-7 w-7 lg:h-8 lg:w-8 bg-gray-700/50 rounded" />
        </div>
      </div>

      {/* Product cards skeleton */}
      <div className="flex gap-3 lg:gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

// Mobile category selector skeleton
export function MobileCategorySelectorSkeleton() {
  return (
    <div className="bg-[#141312] border-b border-gray-700 p-3 sm:p-4">
      <div className="flex gap-2 overflow-hidden pb-1">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-2 rounded-full flex-shrink-0"
          >
            <Skeleton className="h-4 w-4 bg-[#FF585D]/30 rounded flex-shrink-0" />
            <Skeleton className="h-4 w-16 bg-gray-700/50" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Category card skeleton for grid layout
export function CategoryCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl h-full min-h-[280px] sm:min-h-[320px] flex flex-col">
      {/* Background image skeleton */}
      <Skeleton className="absolute inset-0 bg-gray-700/50" />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      {/* Content skeleton */}
      <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col">
        {/* Icon skeleton */}
        <div className="mb-4 sm:mb-6">
          <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Title skeleton */}
          <Skeleton className="h-6 sm:h-7 w-32 sm:w-40 mb-2 sm:mb-3 bg-white/30" />

          {/* Description skeleton */}
          <div className="mb-4 sm:mb-6 flex-1 space-y-2">
            <Skeleton className="h-4 w-full bg-white/20" />
            <Skeleton className="h-4 w-3/4 bg-white/20" />
            <Skeleton className="h-4 w-1/2 bg-white/20" />
          </div>

          {/* Tour count and arrow skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-3 w-20 bg-white/20" />
              <Skeleton className="h-5 sm:h-6 w-8 bg-white/30" />
            </div>

            <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Full categories section skeleton
export function CategoriesSectionSkeleton() {
  return (
    <section className="bg-[#141312] py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        {/* Header skeleton */}
        <div className="text-start mb-8 lg:mb-12 space-y-4">
          <Skeleton className="h-9 sm:h-11 w-64 bg-gray-700/50" />
          <div className="space-y-2">
            <Skeleton className="h-5 lg:h-6 w-full max-w-4xl bg-gray-700/50" />
            <Skeleton className="h-5 lg:h-6 w-3/4 max-w-3xl bg-gray-700/50" />
            <Skeleton className="h-5 lg:h-6 w-1/2 max-w-2xl bg-gray-700/50" />
          </div>
        </div>

        {/* Category Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <CategoryCardSkeleton key={index} />
          ))}
        </div>

        {/* Additional info skeleton */}
        <div className="text-center mt-8 lg:mt-12">
          <Skeleton className="h-4 w-64 mx-auto bg-gray-700/50" />
        </div>
      </div>
    </section>
  );
}

// Loading progress bar
export function LoadingProgressBar({
  progress,
  stage,
  className,
}: {
  progress: number;
  stage: string;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300 font-['Work_Sans'] capitalize">
          {stage}...
        </span>
        <span className="text-sm text-gray-400 font-['Work_Sans']">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-[#FF585D] to-[#FF585D]/80 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
}

// Enhanced loading indicator with branding
export function BrandedLoadingIndicator({
  stage = "Loading",
  progress = 0,
  message,
  showProgress = true,
  className,
}: {
  stage?: string;
  progress?: number;
  message?: string;
  showProgress?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("text-center py-8 lg:py-12", className)}>
      {/* Animated logo/icon */}
      <div className="relative mb-6">
        <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto rounded-full bg-gradient-to-r from-[#FF585D] to-[#FF585D]/80 flex items-center justify-center animate-pulse">
          <div className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
        {/* Ripple effect */}
        <div className="absolute inset-0 w-16 h-16 lg:w-20 lg:h-20 mx-auto rounded-full border-2 border-[#FF585D]/30 animate-ping" />
      </div>

      {/* Loading text */}
      <h3 className="text-lg lg:text-xl font-semibold text-white mb-2 font-['Barlow']">
        {stage}
      </h3>

      {message && (
        <p className="text-sm lg:text-base text-gray-300 font-['Work_Sans'] mb-4 max-w-md mx-auto">
          {message}
        </p>
      )}

      {/* Progress bar */}
      {showProgress && (
        <div className="max-w-xs mx-auto">
          <LoadingProgressBar progress={progress} stage={stage.toLowerCase()} />
        </div>
      )}

      {/* Loading dots animation */}
      <div className="flex justify-center space-x-1 mt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 bg-[#FF585D] rounded-full animate-bounce"
            style={{ animationDelay: `${index * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
