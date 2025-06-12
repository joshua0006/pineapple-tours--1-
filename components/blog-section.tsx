import Link from "next/link";
import { BookOpen, MapPin, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog-card";
import { BLOG_CONFIG, getLatestPosts } from "@/lib/blog-data";

export function BlogSection() {
  const latestPosts = getLatestPosts(3);
  const { section } = BLOG_CONFIG;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center">
          <BookOpen className="h-6 w-6 text-brand-accent" />
        </div>
        <h2 className="font-secondary text-3xl sm:text-4xl font-normal tracking-tight text-brand-text">
          {section.title}
        </h2>
      </div>

      <p className="font-text text-lg text-muted-foreground leading-relaxed">
        {section.description}
      </p>

      <div className="space-y-6">
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
      </div>
    </div>
  );
}
