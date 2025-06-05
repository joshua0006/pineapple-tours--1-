"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, User, ChevronRight, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const blogPosts = [
  {
    id: 1,
    title: "10 Must-Visit Beaches in Hawaii",
    excerpt: "Discover the most stunning beaches across the Hawaiian islands, from the black sands of Punalu'u to the pristine waters of Lanikai Beach.",
    author: "Sarah Johnson",
    date: "2024-01-15",
    readTime: "5 min read",
    category: "Hawaii",
    image: "/placeholder.jpg",
    featured: true
  },
  {
    id: 2,
    title: "Caribbean Food Guide: Local Delicacies You Must Try",
    excerpt: "Explore the vibrant culinary landscape of the Caribbean with our comprehensive guide to local dishes and hidden food gems.",
    author: "Marcus Rodriguez",
    date: "2024-01-12",
    readTime: "7 min read",
    category: "Caribbean",
    image: "/placeholder.jpg",
    featured: true
  },
  {
    id: 3,
    title: "Packing Tips for Your Tropical Vacation",
    excerpt: "Essential packing advice for tropical tours, including what to bring, what to leave behind, and how to pack efficiently.",
    author: "Emily Chen",
    date: "2024-01-10",
    readTime: "4 min read",
    category: "Travel Tips",
    image: "/placeholder.jpg",
    featured: false
  },
  {
    id: 4,
    title: "Best Time to Visit Fiji: A Seasonal Guide",
    excerpt: "Learn about Fiji's seasons, weather patterns, and the best times to visit for different activities and experiences.",
    author: "David Thompson",
    date: "2024-01-08",
    readTime: "6 min read",
    category: "Fiji",
    image: "/placeholder.jpg",
    featured: false
  },
  {
    id: 5,
    title: "Snorkeling vs Scuba Diving: Which is Right for You?",
    excerpt: "Compare snorkeling and scuba diving to help you choose the best underwater adventure for your tropical vacation.",
    author: "Lisa Park",
    date: "2024-01-05",
    readTime: "5 min read",
    category: "Activities",
    image: "/placeholder.jpg",
    featured: false
  },
  {
    id: 6,
    title: "Hidden Gems of Bali: Off the Beaten Path",
    excerpt: "Discover lesser-known attractions and experiences in Bali that offer authentic culture and stunning natural beauty.",
    author: "James Wilson",
    date: "2024-01-03",
    readTime: "8 min read",
    category: "Bali",
    image: "/placeholder.jpg",
    featured: false
  }
]

const categories = ["All", "Hawaii", "Caribbean", "Fiji", "Bali", "Travel Tips", "Activities"]

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted py-16">
          <div className="container">
            <div className="max-w-3xl">
              <Badge className="bg-coral-500 text-white hover:bg-coral-600 mb-4">Travel Blog</Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Travel Stories & Tips
              </h1>
              <p className="mt-4 text-xl text-muted-foreground">
                Discover insider tips, tour guides, and inspiring travel stories from our tropical paradise experts.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="container py-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
                className={category === "All" ? "bg-coral-500 text-white hover:bg-coral-600" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </section>

        {/* Featured Posts */}
        <section className="container pb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Featured Articles</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {blogPosts.filter(post => post.featured).map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-coral-500 text-white">
                    {post.category}
                  </Badge>
                </div>
                <CardHeader>
                  <h3 className="text-xl font-semibold line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readTime}
                    </div>
                  </div>
                  <Link 
                    href={`/blog/${post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className="flex items-center text-sm font-medium text-primary hover:text-coral-600"
                  >
                    Read More
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* All Posts */}
        <section className="container pb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Latest Articles</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.filter(post => !post.featured).map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-coral-500 text-white">
                    {post.category}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold line-clamp-2 mb-2">{post.title}</h3>
                  <p className="text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                  <Link 
                    href={`/blog/${post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className="flex items-center text-sm font-medium text-primary hover:text-coral-600"
                  >
                    Read More
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="bg-muted py-16">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Stay Updated</h2>
              <p className="text-muted-foreground mb-6">
                Subscribe to our newsletter for the latest travel tips, tour guides, and exclusive offers.
              </p>
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-input rounded-md bg-background"
                />
                <Button className="bg-coral-500 text-white hover:bg-coral-600">
                  Subscribe to Blog
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
} 