"use client";

import Link from "next/link";
import { BookOpen, MapPin, Star, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog-card";
import { useWordPressBlog } from "@/hooks/use-wordpress-blog";

import { BlogError } from "@/components/ui/blog-error";

export function BlogSection() {
  const { posts, loading, error, featuredPosts, regularPosts, refetch } =
    useWordPressBlog();

  // Get the latest 3 posts (prioritize featured posts, then regular ones)
  const getLatestPosts = () => {
    const allPosts = [...featuredPosts, ...regularPosts];
    return allPosts.slice(0, 3);
  };

  const latestPosts = getLatestPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center">
          <BookOpen className="h-6 w-6 text-brand-accent" />
        </div>
        <h2 className="font-secondary text-3xl sm:text-4xl font-normal tracking-tight text-brand-text">
          Discover
        </h2>
      </div>

      <p className="font-text text-lg text-muted-foreground leading-relaxed">
        Discover insider tips, destination guides, and inspiring travel stories
        from our expert team at Pineapple Tours. Get the most out of your
        adventures with our comprehensive travel resources and local insights.
      </p>

      <div className="space-y-6">
        {/* Error State */}
        {error && <BlogError error={error} onRetry={refetch} variant="card" />}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-80">
                <div className="animate-pulse">
                  <div className="bg-gray-200 aspect-video rounded-md mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {!error && !loading && (
          <>
            {latestPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestPosts.map((post) => (
                  <BlogCard
                    key={post.id}
                    post={post}
                    variant="default"
                    showImage={true}
                    showAuthor={true}
                    showReadTime={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No blog posts available at the moment.
                </p>
              </div>
            )}

            {/* View All Button */}
            {latestPosts.length > 0 && (
              <div className="text-center">
                <Button asChild variant="outline" size="lg">
                  <Link href="/blog">
                    View All Articles
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
