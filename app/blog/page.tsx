"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  User,
  ChevronRight,
  Clock,
  BookOpen,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { BlogCard } from "@/components/blog-card";
import {
  BlogLoadingGrid,
  BlogCategoriesSkeleton,
} from "@/components/ui/blog-loading";
import { BlogError } from "@/components/ui/blog-error";
import { useWordPressBlog } from "@/hooks/use-wordpress-blog";

export default function BlogPage() {
  const {
    posts,
    categories,
    loading,
    error,
    featuredPosts,
    regularPosts,
    refetch,
    clearCache,
    cacheStats,
  } = useWordPressBlog();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);

  // Check if we're doing a background update (have data but cache is old)
  const hasData = posts.length > 0;
  const isInitialLoad = loading && !hasData;
  const isBackgroundUpdate = hasData && cacheStats.cacheAge > 5 * 60 * 1000; // 5 minutes

  // Filter posts by selected category
  const filteredFeaturedPosts = useMemo(() => {
    if (selectedCategory === "All") return featuredPosts;
    return featuredPosts.filter((post) =>
      post.categories.some(
        (cat) => cat.toLowerCase() === selectedCategory.toLowerCase()
      )
    );
  }, [featuredPosts, selectedCategory]);

  const filteredRegularPosts = useMemo(() => {
    if (selectedCategory === "All") return regularPosts;
    return regularPosts.filter((post) =>
      post.categories.some(
        (cat) => cat.toLowerCase() === selectedCategory.toLowerCase()
      )
    );
  }, [regularPosts, selectedCategory]);

  // Prepare categories for filtering
  const allCategories = useMemo(() => {
    const cats = ["All"];
    categories.forEach((cat) => {
      if (cat.count > 0 && !cats.includes(cat.name)) {
        cats.push(cat.name);
      }
    });
    return cats;
  }, [categories]);

  return (
    <>
      {/* Hero Section */}
      <PageHeader
        title="Travel Stories & Tips"
        subtitle="Discover insider tips, destination guides, and inspiring travel stories from our expert team at Pineapple Tours."
        icon={BookOpen}
        variant="default"
      />

      {/* Background Loading Indicator */}
      {isBackgroundUpdate && (
        <div className="container">
          <div className="flex items-center justify-center py-2 bg-brand-accent/5 border border-brand-accent/10 rounded-lg mb-4">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-accent mr-2" />
            <span className="text-sm text-brand-accent">
              Refreshing content in background...
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !hasData && (
        <section className="container py-8">
          <BlogError error={error} onRetry={refetch} variant="full" />
        </section>
      )}

      {/* Error State with Cached Data */}
      {error && hasData && (
        <div className="container">
          <div className="flex items-center justify-between py-3 px-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <div className="flex items-center">
              <RefreshCw className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                Showing cached content. Unable to fetch latest updates.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Loading or Content */}
      {!error || hasData ? (
        <>
          {/* Categories Filter */}
          <section className="container py-8">
            {isInitialLoad ? (
              <BlogCategoriesSkeleton />
            ) : (
              <div className="flex flex-wrap gap-2">
                {allCategories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      category === selectedCategory ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={
                      category === selectedCategory
                        ? "bg-brand-accent text-white hover:bg-brand-accent/90"
                        : "hover:bg-brand-accent hover:text-white border-brand-accent/20"
                    }
                  >
                    {category}
                    {category !== "All" &&
                      categories.find((cat) => cat.name === category) && (
                        <span className="ml-1 text-xs opacity-70">
                          (
                          {
                            categories.find((cat) => cat.name === category)
                              ?.count
                          }
                          )
                        </span>
                      )}
                  </Button>
                ))}
              </div>
            )}
          </section>

          {/* Main Content */}
          <section className="container pb-16">
            {isInitialLoad ? (
              <BlogLoadingGrid />
            ) : (
              <div className="space-y-12">
                {/* Featured Posts */}
                {filteredFeaturedPosts.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold tracking-tight text-brand-text font-barlow">
                        Featured Articles
                      </h2>
                      {selectedCategory !== "All" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCategory("All")}
                          className="text-brand-accent hover:text-brand-accent/80"
                        >
                          View All
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      {filteredFeaturedPosts.map((post) => (
                        <BlogCard
                          key={post.id}
                          post={post}
                          variant="featured"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Posts */}
                {filteredRegularPosts.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-6 text-brand-text font-barlow">
                      Latest Articles
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredRegularPosts.map((post) => (
                        <BlogCard key={post.id} post={post} variant="default" />
                      ))}
                    </div>
                  </div>
                )}

                {/* No Posts Found */}
                {!isInitialLoad &&
                  filteredFeaturedPosts.length === 0 &&
                  filteredRegularPosts.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No articles found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {selectedCategory === "All"
                          ? "We're working on adding new content. Please check back soon!"
                          : `No articles found in the "${selectedCategory}" category.`}
                      </p>
                      {selectedCategory !== "All" && (
                        <Button
                          onClick={() => setSelectedCategory("All")}
                          className="bg-brand-accent hover:bg-brand-accent/90"
                        >
                          View All Articles
                        </Button>
                      )}
                    </div>
                  )}
              </div>
            )}
          </section>
        </>
      ) : null}
    </>
  );
}
