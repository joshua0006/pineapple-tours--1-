"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, User, Clock, ChevronLeft, Share2, BookOpen, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BlogCard } from "@/components/blog-card"
import { BlogInfoSection } from "@/components/blog-info-section"
import { 
  BLOG_POSTS, 
  getBlogPostBySlug, 
  getBlogPostContent, 
  getAuthorInfo 
} from "@/lib/blog-data"
// Using centralized blog data from lib/blog-data.ts

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  
  // Find the blog post by slug
  const post = getBlogPostBySlug(slug)
  
  if (!post) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 container py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
            <Link href="/blog">
              <Button>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }
  
  const contentData = getBlogPostContent(slug)
  const content = contentData?.content || "<p>Content not found.</p>"
  const relatedPosts = BLOG_POSTS.filter(p => p.id !== post.id).slice(0, 3)
  const authorInfo = getAuthorInfo(post.author)
  
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <Link href="/blog" className="inline-flex items-center text-brand-accent hover:text-brand-accent/80 mb-6">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
              
              <div className="space-y-4">
                <Badge className="bg-brand-accent text-white">
                  {post.category}
                </Badge>
                
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-brand-text font-barlow">
                  {post.title}
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {post.readTime}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 pt-4">
                  <Button size="sm" variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Article
                  </Button>
                  <Button size="sm" variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Save for Later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Image */}
        <section className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video relative rounded-xl overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>
        
        {/* Article Content */}
        <section className="container pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="p-8">
                    <div 
                      className="prose prose-lg max-w-none prose-headings:text-brand-text prose-p:text-muted-foreground prose-a:text-brand-accent"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </CardContent>
                </Card>
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Author Info */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4">About the Author</h3>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-brand-accent" />
                        </div>
                        <div>
                          <p className="font-medium">{post.author}</p>
                          <p className="text-sm text-muted-foreground">Travel Expert</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Passionate about discovering hidden gems and sharing authentic travel experiences.
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Tags */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Tag className="mr-1 h-3 w-3" />
                          {post.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Tag className="mr-1 h-3 w-3" />
                          Travel Tips
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Tag className="mr-1 h-3 w-3" />
                          Adventure
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Related Posts */}
        <section className="bg-gray-50 py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold tracking-tight mb-8 text-brand-text font-barlow">
                Related Articles
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard 
                    key={relatedPost.id} 
                    post={relatedPost} 
                    variant="default"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
} 