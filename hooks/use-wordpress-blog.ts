import { useState, useEffect, useCallback } from "react";
import { blogCache } from "@/lib/utils/blog-cache-manager";
import { decodeHtmlEntities, stripHtmlTags } from "@/lib/utils/html-entities";

export interface WordPressBlogPost {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  date: string;
  modified: string;
  slug: string;
  status: string;
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    author?: Array<{
      id: number;
      name: string;
      description: string;
      avatar_urls: {
        "24": string;
        "48": string;
        "96": string;
      };
    }>;
    "wp:featuredmedia"?: Array<{
      id: number;
      source_url: string;
      alt_text: string;
      media_details: {
        width: number;
        height: number;
      };
    }>;
    "wp:term"?: Array<
      Array<{
        id: number;
        name: string;
        slug: string;
        taxonomy: string;
      }>
    >;
  };
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WordPressAuthor {
  id: number;
  name: string;
  description: string;
  avatar_urls: {
    "24": string;
    "48": string;
    "96": string;
  };
}

export interface BlogPostData {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorId: number;
  authorAvatar: string;
  authorBio: string;
  date: string;
  modified: string;
  readTime: string;
  category: string;
  categories: string[];
  tags: string[];
  image: string;
  imageAlt: string;
  slug: string;
  featured: boolean;
}

interface UseBlogResult {
  posts: BlogPostData[];
  categories: WordPressCategory[];
  loading: boolean;
  error: string | null;
  featuredPosts: BlogPostData[];
  regularPosts: BlogPostData[];
  refetch: () => void;
  clearCache: () => void;
  getPostBySlug: (slug: string) => BlogPostData | undefined;
  cacheStats: {
    hasPosts: boolean;
    hasCategories: boolean;
    postsCount: number;
    categoriesCount: number;
    lastFetch: Date | null;
    cacheAge: number;
    isFresh: boolean;
    memoryEntries: number;
  };
}

// Utility function to calculate read time
const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, "");
  const wordCount = text.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readTime} min read`;
};

// Transform WordPress post to our blog format
const transformWordPressPost = (post: WordPressBlogPost): BlogPostData => {
  const author = post._embedded?.author?.[0];
  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  const terms = post._embedded?.["wp:term"];
  const categories = terms?.[0] || [];
  const tags = terms?.[1] || [];

  return {
    id: post.id,
    title: decodeHtmlEntities(stripHtmlTags(post.title.rendered)),
    excerpt: decodeHtmlEntities(stripHtmlTags(post.excerpt.rendered)),
    content: decodeHtmlEntities(post.content.rendered),
    author: decodeHtmlEntities(author?.name || "Unknown Author"),
    authorId: post.author,
    authorAvatar: author?.avatar_urls?.["96"] || "",
    authorBio: decodeHtmlEntities(author?.description || ""),
    date: post.date,
    modified: post.modified,
    readTime: calculateReadTime(post.content.rendered),
    category: decodeHtmlEntities(categories[0]?.name || "Uncategorized"),
    categories: categories.map((cat) => decodeHtmlEntities(cat.name)),
    tags: tags.map((tag) => decodeHtmlEntities(tag.name)),
    image: featuredMedia?.source_url || "/placeholder.jpg",
    imageAlt: decodeHtmlEntities(
      featuredMedia?.alt_text || stripHtmlTags(post.title.rendered)
    ),
    slug: post.slug,
    featured: categories.some((cat) => cat.slug === "featured") || false,
  };
};

export function useWordPressBlog(): UseBlogResult {
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [categories, setCategories] = useState<WordPressCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = blogCache.getBlogData();
        if (cachedData) {
          console.log("📱 Loading blog data from cache", {
            postsCount: cachedData.posts.length,
            categoriesCount: cachedData.categories.length,
            cacheAge: blogCache.getCacheAge(),
          });
          setPosts(cachedData.posts);
          setCategories(cachedData.categories);
          setLoading(false);
          return;
        }
      }

      console.log("🌐 Fetching fresh blog data from WordPress API");

      // Fetch posts with embedded author and media data
      const postsResponse = await fetch(
        "https://pineappletours.com.au/wp-json/wp/v2/posts?_embed&per_page=50&status=publish",
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!postsResponse.ok) {
        throw new Error(`Failed to fetch posts: ${postsResponse.statusText}`);
      }

      const postsData: WordPressBlogPost[] = await postsResponse.json();

      // Fetch categories
      const categoriesResponse = await fetch(
        "https://pineappletours.com.au/wp-json/wp/v2/categories?per_page=50",
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!categoriesResponse.ok) {
        throw new Error(
          `Failed to fetch categories: ${categoriesResponse.statusText}`
        );
      }

      const categoriesData: WordPressCategory[] =
        await categoriesResponse.json();

      // Transform and set data
      const transformedPosts = postsData.map(transformWordPressPost);

      // Cache the data
      blogCache.setBlogData(transformedPosts, categoriesData);

      console.log("💾 Cached fresh blog data", {
        postsCount: transformedPosts.length,
        categoriesCount: categoriesData.length,
      });

      setPosts(transformedPosts);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error fetching blog data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch blog data"
      );

      // Try to load from cache as fallback on error
      const cachedData = blogCache.getBlogData();
      if (cachedData) {
        console.log("⚠️ Loading stale cache data due to fetch error");
        setPosts(cachedData.posts);
        setCategories(cachedData.categories);
        // Still show error but with cached data
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogData();
  }, [fetchBlogData]);

  const featuredPosts = posts.filter((post) => post.featured);
  const regularPosts = posts.filter((post) => !post.featured);

  const getPostBySlug = (slug: string): BlogPostData | undefined => {
    return posts.find((post) => post.slug === slug);
  };

  const refetch = useCallback(() => {
    fetchBlogData(true); // Force refresh
  }, [fetchBlogData]);

  const clearCache = useCallback(() => {
    blogCache.clear();
    fetchBlogData(true);
  }, [fetchBlogData]);

  return {
    posts,
    categories,
    loading,
    error,
    featuredPosts,
    regularPosts,
    refetch,
    clearCache,
    getPostBySlug,
    cacheStats: blogCache.getStats(),
  };
}
