import Link from "next/link";
import Image from "next/image";
import { Calendar, User, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlogPostData } from "@/hooks/use-wordpress-blog";
import { decodeHtmlEntities } from "@/lib/utils/html-entities";

// Legacy interface for backwards compatibility
export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  featured?: boolean;
  slug?: string;
}

interface BlogCardProps {
  post: BlogPost | BlogPostData;
  variant?: "default" | "featured" | "compact";
  showImage?: boolean;
  showAuthor?: boolean;
  showReadTime?: boolean;
}

// Type guard to check if post is WordPress data
function isWordPressPost(post: BlogPost | BlogPostData): post is BlogPostData {
  return "authorAvatar" in post && "categories" in post;
}

export function BlogCard({
  post,
  variant = "default",
  showImage = true,
  showAuthor = true,
  showReadTime = true,
}: BlogCardProps) {
  // For WordPress posts, use the actual slug from the API
  // For legacy posts, generate a slug from the title as fallback
  const slug =
    post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Debug logging to check slugs
  if (process.env.NODE_ENV === "development") {
    console.log("Blog card slug:", {
      postId: post.id,
      title: post.title,
      slug: slug,
      originalSlug: post.slug,
    });
  }

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

  if (variant === "compact") {
    return (
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 flex-shrink-0"></div>
        <div>
          <Link href={`/blog/${slug}`}>
            <h4 className="font-text font-medium text-brand-text text-sm hover:text-brand-accent transition-colors cursor-pointer">
              {decodeHtmlEntities(post.title)}
            </h4>
          </Link>
          <p className="font-text text-xs text-muted-foreground">
            {decodeHtmlEntities(post.excerpt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {showImage && (
        <div className="aspect-video relative">
          <Image
            src={post.image}
            alt={isWordPressPost(post) ? post.imageAlt : post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <Badge className="absolute top-4 left-4 bg-brand-accent text-white">
            {post.category}
          </Badge>
        </div>
      )}
      <CardHeader
        className={`flex-1 flex flex-col ${
          variant === "featured" ? "" : "p-6"
        }`}
      >
        <Link href={`/blog/${slug}`}>
          <h3
            className={`font-semibold hover:text-brand-accent transition-colors cursor-pointer mb-3 ${
              variant === "featured" ? "text-xl" : "text-lg"
            }`}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: "1.4",
              minHeight: variant === "featured" ? "3.5rem" : "2.8rem",
            }}
          >
            {decodeHtmlEntities(post.title)}
          </h3>
        </Link>
        <p className="text-muted-foreground line-clamp-3 mb-6 flex-1">
          {decodeHtmlEntities(post.excerpt)}
        </p>
        <div className="space-y-4 mt-auto">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {showAuthor && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4 text-brand-accent" />
                {decodeHtmlEntities(post.author)}
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
  );
}
