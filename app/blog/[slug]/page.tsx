"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  User,
  Clock,
  ChevronLeft,
  Share2,
  BookOpen,
  Tag,
  ArrowRight,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { SiteFooter } from "@/components/site-footer";
import { BlogCard } from "@/components/blog-card";
import { BlogError } from "@/components/ui/blog-error";
import { Skeleton } from "@/components/ui/skeleton";
import { HtmlContent } from "@/components/ui/html-content";
import { useWordPressBlog, BlogPostData } from "@/hooks/use-wordpress-blog";
import { decodeHtmlEntities } from "@/lib/utils/html-entities";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function BlogPostSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section Skeleton */}
        <section className="relative h-96 bg-gray-300">
          <div className="container relative z-10 py-16 md:py-24">
            <div className="max-w-4xl space-y-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Skeleton */}
        <section className="container py-16">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-8">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [slug, setSlug] = useState<string>("");
  const { posts, loading, error, getPostBySlug, refetch } = useWordPressBlog();
  const [post, setPost] = useState<BlogPostData | null>(null);

  useEffect(() => {
    params.then(({ slug }) => {
      setSlug(slug);
    });
  }, [params]);

  useEffect(() => {
    if (slug && !loading) {
      const foundPost = getPostBySlug(slug);

      // Debug logging
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Blog detail page - searching for slug:", slug);
        console.log(
          "📝 Available posts:",
          posts.map((p) => ({ id: p.id, slug: p.slug, title: p.title }))
        );
        console.log(
          "✅ Found post:",
          foundPost ? `${foundPost.title} (ID: ${foundPost.id})` : "NOT FOUND"
        );
      }

      setPost(foundPost || null);
    }
  }, [slug, posts, loading, getPostBySlug]);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Get related posts
  const relatedPosts = posts
    .filter(
      (p) =>
        p.id !== post?.id &&
        post?.categories.some((cat) => p.categories.includes(cat))
    )
    .slice(0, 3);

  // Share functionality
  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: decodeHtmlEntities(post.title),
          text: decodeHtmlEntities(post.excerpt),
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return <BlogPostSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-16">
          <BlogError error={error} onRetry={refetch} variant="full" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist.
            </p>

            {/* Debug info */}
            {process.env.NODE_ENV === "development" && (
              <div className="bg-gray-100 p-4 rounded mb-4 text-left">
                <h3 className="font-semibold mb-2">Debug Info:</h3>
                <p>
                  <strong>Requested slug:</strong> {slug}
                </p>
                <p>
                  <strong>Total posts loaded:</strong> {posts.length}
                </p>
                <p>
                  <strong>Available slugs:</strong>
                </p>
                <ul className="list-disc list-inside text-sm">
                  {posts.slice(0, 5).map((p) => (
                    <li key={p.id}>
                      {p.slug} - {p.title}
                    </li>
                  ))}
                  {posts.length > 5 && <li>... and {posts.length - 5} more</li>}
                </ul>
              </div>
            )}

            <Link href="/blog">
              <Button>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>

            <div className="mt-4">
              <Link
                href="/debug-blog"
                className="text-blue-600 hover:underline"
              >
                View Debug Page
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section with Featured Image */}
        <section className="relative">
          <div className="absolute inset-0 z-0">
            <Image
              src={post.image || "/placeholder.svg"}
              alt={decodeHtmlEntities(post.imageAlt)}
              fill
              className="object-cover brightness-[0.4]"
              priority
            />
          </div>
          <div className="container relative z-10 py-16 md:py-24 lg:py-32">
            <div className="max-w-4xl space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-brand-accent text-brand-secondary hover:bg-coral-600">
                  {decodeHtmlEntities(post.category)}
                </Badge>
                <div className="flex items-center gap-4 text-white/80">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{formatDate(post.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{post.readTime}</span>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl font-barlow">
                {decodeHtmlEntities(post.title)}
              </h1>

              <p className="text-xl text-white/90 font-work-sans leading-relaxed max-w-3xl">
                {decodeHtmlEntities(post.excerpt)}
              </p>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    {post.authorAvatar ? (
                      <Image
                        src={post.authorAvatar}
                        alt={decodeHtmlEntities(post.author)}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-brand-accent/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {decodeHtmlEntities(post.author)}
                    </p>
                    <p className="text-sm text-white/70">Travel Expert</p>
                  </div>
                </div>
                <Separator
                  orientation="vertical"
                  className="h-12 bg-white/20"
                />
                <div className="flex items-center gap-4 text-white/70">
                  <span className="text-sm">{post.views || "1.2K"} views</span>
                  <span className="text-sm">{post.likes || "85"} likes</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Preview */}
        <section className="container py-16">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <HtmlContent
                        content={post.content}
                        className="prose-lg prose-headings:text-brand-text prose-p:text-muted-foreground prose-a:text-brand-accent prose-img:rounded-lg prose-headings:font-barlow prose-p:font-work-sans prose-li:font-work-sans"
                      />
                    </div>

                    <Separator />

                    <div className="bg-gradient-to-r from-coral-50 to-yellow-50 p-6 rounded-lg">
                      <h4 className="font-semibold font-barlow mb-2">
                        Featured Topics:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {decodeHtmlEntities(tag)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center pt-6">
                      <Button
                        size="lg"
                        className="bg-brand-accent text-brand-secondary hover:bg-coral-600 font-work-sans font-medium px-8"
                        onClick={handleShare}
                      >
                        Share This Article
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <p className="text-sm text-muted-foreground mt-3 font-work-sans">
                        Share this amazing content with fellow travelers
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div className="sticky top-24 space-y-8">
                {/* Share Article */}
                <Card className="bg-gradient-to-br from-brand-accent/5 to-coral-50/30 border-brand-accent/20">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="font-semibold font-barlow mb-3 text-brand-text">
                        Share This Article
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 font-work-sans">
                        Help others discover this amazing content
                      </p>
                      <Button
                        onClick={handleShare}
                        className="w-full bg-brand-accent text-brand-secondary hover:bg-coral-600 font-work-sans font-medium"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Article
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Author Info */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold font-barlow mb-4">
                      About the Author
                    </h3>
                    <div className="flex items-start gap-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full">
                        {post.authorAvatar ? (
                          <Image
                            src={post.authorAvatar}
                            alt={decodeHtmlEntities(post.author)}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-brand-accent/10 rounded-full flex items-center justify-center">
                            <User className="h-8 w-8 text-brand-accent" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium font-work-sans">
                          {decodeHtmlEntities(post.author)}
                        </h4>
                        <p className="text-sm text-muted-foreground font-work-sans">
                          Travel Expert
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 font-work-sans">
                          {decodeHtmlEntities(post.authorBio) ||
                            "Passionate about discovering hidden gems and sharing authentic travel experiences."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Newsletter Signup */}
                <Card className="bg-gradient-to-br from-brand-accent to-coral-600">
                  <CardContent className="p-6 text-white">
                    <h3 className="font-semibold font-barlow mb-2">
                      Never Miss an Adventure
                    </h3>
                    <p className="text-sm text-white/90 mb-4 font-work-sans">
                      Get our latest travel guides and exclusive tips delivered
                      to your inbox.
                    </p>
                    <Button className="w-full bg-white text-brand-accent hover:bg-gray-100 font-work-sans">
                      Subscribe Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="bg-muted py-16">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight font-barlow">
                  Related Articles
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-muted-foreground font-work-sans">
                  Discover more travel insights and destination guides
                </p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Card
                    key={relatedPost.id}
                    className="overflow-hidden group hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={relatedPost.image || "/placeholder.svg"}
                        alt={decodeHtmlEntities(relatedPost.title)}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 font-work-sans">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(relatedPost.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{relatedPost.readTime}</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold font-barlow mb-3 group-hover:text-brand-accent transition-colors">
                        {decodeHtmlEntities(relatedPost.title)}
                      </h3>
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        className="inline-flex items-center text-sm font-medium text-brand-accent hover:text-coral-600 font-work-sans"
                      >
                        Read More
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-12">
                <Link href="/blog">
                  <Button
                    variant="outline"
                    size="lg"
                    className="font-work-sans"
                  >
                    View All Blogs
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Compact CTA Card */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src="/cea291bc40ef4c8a8ac060ed77c6fd3cLuxury_Wine_Tour_lg.avif"
                    alt="Scenic tour destination views"
                    fill
                    className="object-cover object-center"
                    priority
                  />
                  {/* Enhanced gradient overlay for better text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 px-8 py-12 sm:px-12 sm:py-16">
                  {/* Compact Heading with enhanced styling */}
                  <h2 className="font-primary text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-secondary mb-4 drop-shadow-2xl shadow-2xl">
                    Start Your Adventure Today
                  </h2>

                  {/* Brief Description with better contrast */}
                  <p className="font-text max-w-lg text-base sm:text-lg text-brand-secondary/95 mb-8 leading-relaxed drop-shadow-lg">
                    Book now and discover why we're the top-rated tour company
                    with over 10,000 happy customers.
                  </p>

                  {/* Single Primary CTA */}
                  <div className="flex justify-start mb-6">
                    <Link href="/tours">
                      <Button
                        size="lg"
                        className="group bg-brand-accent text-brand-secondary hover:bg-brand-accent/90 font-semibold px-10 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-brand-accent/20 hover:border-brand-accent/40"
                      >
                        Explore Tours
                        <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
