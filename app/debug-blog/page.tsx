"use client";

import { useWordPressBlog } from "@/hooks/use-wordpress-blog";
import Link from "next/link";

export default function DebugBlogPage() {
  const { posts, loading, error } = useWordPressBlog();

  if (loading) {
    return <div className="container py-16">Loading blog posts...</div>;
  }

  if (error) {
    return <div className="container py-16">Error: {error}</div>;
  }

  return (
    <div className="container py-16">
      <h1 className="text-2xl font-bold mb-8">Debug: Blog Posts</h1>

      <div className="space-y-4">
        <p>Total posts found: {posts.length}</p>

        {posts.map((post) => (
          <div key={post.id} className="border p-4 rounded">
            <h3 className="font-semibold">ID: {post.id}</h3>
            <p>
              <strong>Title:</strong> {post.title}
            </p>
            <p>
              <strong>Slug:</strong> {post.slug}
            </p>
            <p>
              <strong>Generated URL:</strong>{" "}
              <Link
                href={`/blog/${post.slug}`}
                className="text-blue-600 hover:underline"
              >
                /blog/{post.slug}
              </Link>
            </p>
            <p>
              <strong>Excerpt:</strong> {post.excerpt.substring(0, 100)}...
            </p>
            <p>
              <strong>Date:</strong> {post.date}
            </p>
            <p>
              <strong>Author:</strong> {post.author}
            </p>
            <hr className="mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
