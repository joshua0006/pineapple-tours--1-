"use client";

import Link from "next/link";
import { Calendar, User, ChevronRight, Clock, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { BlogCard } from "@/components/blog-card";
import { BlogInfoSection } from "@/components/blog-info-section";
import { BLOG_CONFIG, BLOG_POSTS, getFeaturedPosts } from "@/lib/blog-data";

// Using centralized blog data from lib/blog-data.ts

export default function BlogPage() {
  const featuredPosts = getFeaturedPosts();
  const regularPosts = BLOG_POSTS.filter((post) => !post.featured);
  const { page, newsletter } = BLOG_CONFIG;

  return (
    <>
      {/* Hero Section */}
      <PageHeader
        title={page.title}
        subtitle={page.subtitle}
        icon={BookOpen}
        variant="default"
      />

      {/* Content Types Info Section */}
      <section className="container py-8">
        <BlogInfoSection position="top" />
      </section>

      {/* Categories */}
      <section className="container py-8">
        <div className="flex flex-wrap gap-2">
          {page.categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              size="sm"
              className={
                category === "All"
                  ? "bg-brand-accent text-white hover:bg-brand-accent/90"
                  : "hover:bg-brand-accent hover:text-white border-brand-accent/20"
              }
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="container pb-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Featured Posts */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-6 text-brand-text font-barlow">
                Featured Articles
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {featuredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} variant="featured" />
                ))}
              </div>
            </div>

            {/* All Posts */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-6 text-brand-text font-barlow">
                Latest Articles
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {regularPosts.map((post) => (
                  <BlogCard key={post.id} post={post} variant="default" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BlogInfoSection position="sidebar" />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 py-16">
        <div className="container">
          <BlogInfoSection position="bottom" />
        </div>
      </section>
    </>
  );
}
