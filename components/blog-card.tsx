import Link from "next/link"
import Image from "next/image"
import { Calendar, User, Clock, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface BlogPost {
  id: number
  title: string
  excerpt: string
  author: string
  date: string
  readTime: string
  category: string
  image: string
  featured?: boolean
  slug?: string
}

interface BlogCardProps {
  post: BlogPost
  variant?: "default" | "featured" | "compact"
  showImage?: boolean
  showAuthor?: boolean
  showReadTime?: boolean
}

export function BlogCard({ 
  post, 
  variant = "default", 
  showImage = true, 
  showAuthor = true, 
  showReadTime = true 
}: BlogCardProps) {
  const slug = post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  
  if (variant === "compact") {
    return (
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 flex-shrink-0"></div>
        <div>
          <Link href={`/blog/${slug}`}>
            <h4 className="font-text font-medium text-brand-text text-sm hover:text-brand-accent transition-colors cursor-pointer">
              {post.title}
            </h4>
          </Link>
          <p className="font-text text-xs text-muted-foreground">{post.excerpt}</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {showImage && (
        <div className="aspect-video relative">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
          />
          <Badge className="absolute top-4 left-4 bg-brand-accent text-white">
            {post.category}
          </Badge>
        </div>
      )}
      <CardHeader className={`flex-1 flex flex-col ${variant === "featured" ? "" : "p-6"}`}>
        <Link href={`/blog/${slug}`}>
          <h3 className={`font-semibold hover:text-brand-accent transition-colors cursor-pointer mb-3 ${
            variant === "featured" ? "text-xl" : "text-lg"
          }`} style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.4',
            minHeight: variant === "featured" ? '3.5rem' : '2.8rem'
          }}>
            {post.title}
          </h3>
        </Link>
        <p className="text-muted-foreground line-clamp-3 mb-6 flex-1 ">{post.excerpt}</p>
        <div className="space-y-4 mt-auto">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {showAuthor && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4 text-brand-accent" />
                {post.author}
              </div>
            )}
           
            {showReadTime && (
              <div className="flex items-center gap-1 ml-auto">
                <Clock className="h-4 w-4 text-brand-accent" />
                {post.readTime}
              </div>
            )}
          </div>
          <Link 
            href={`/blog/${slug}`}
            className="flex items-center text-sm font-medium text-brand-accent hover:text-brand-accent/80 font-work-sans"
          >
            Read More
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
    </Card>
  )
} 