// WordPress REST API Service
// Base URL: https://pineappletours.com.au/wp-json/wp/v2/

const WORDPRESS_API_BASE = "https://pineappletours.com.au/wp-json/wp/v2";

// Types for WordPress API responses
export interface WordPressPage {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_media: number;
  modified: string;
  status: string;
  link: string;
}

export interface WordPressPost {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_media: number;
  date: string;
  modified: string;
  categories: number[];
  tags: number[];
  status: string;
  link: string;
  author: number;
}

export interface WordPressMedia {
  id: number;
  source_url: string;
  alt_text: string;
  title: {
    rendered: string;
  };
  caption: {
    rendered: string;
  };
  media_type: string;
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    sizes: Record<
      string,
      {
        file: string;
        width: number;
        height: number;
        source_url: string;
      }
    >;
  };
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  parent: number;
}

export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export interface WordPressUser {
  id: number;
  name: string;
  slug: string;
  description: string;
  avatar_urls: Record<string, string>;
}

// Categorized WordPress data structure
export interface CategorizedWordPressData {
  pages: {
    data: WordPressPage[];
    count: number;
    lastUpdated: string;
  };
  posts: {
    data: WordPressPost[];
    count: number;
    lastUpdated: string;
    categories: WordPressCategory[];
    tags: WordPressTag[];
  };
  media: {
    data: WordPressMedia[];
    count: number;
    lastUpdated: string;
  };
  users: {
    data: WordPressUser[];
    count: number;
    lastUpdated: string;
  };
  metadata: {
    fetchedAt: string;
    apiVersion: string;
    baseUrl: string;
    totalItems: number;
  };
}

// API fetch functions
export class WordPressAPIService {
  private static async fetchWithErrorHandling<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  // Fetch all pages
  static async fetchPages(perPage: number = 100): Promise<WordPressPage[]> {
    const url = `${WORDPRESS_API_BASE}/pages?per_page=${perPage}&status=publish`;
    return this.fetchWithErrorHandling<WordPressPage[]>(url);
  }

  // Fetch specific page by slug
  static async fetchPageBySlug(slug: string): Promise<WordPressPage[]> {
    const url = `${WORDPRESS_API_BASE}/pages?slug=${slug}&status=publish`;
    return this.fetchWithErrorHandling<WordPressPage[]>(url);
  }

  // Fetch all posts
  static async fetchPosts(perPage: number = 100): Promise<WordPressPost[]> {
    const url = `${WORDPRESS_API_BASE}/posts?per_page=${perPage}&status=publish`;
    return this.fetchWithErrorHandling<WordPressPost[]>(url);
  }

  // Fetch posts by category
  static async fetchPostsByCategory(
    categoryId: number,
    perPage: number = 100
  ): Promise<WordPressPost[]> {
    const url = `${WORDPRESS_API_BASE}/posts?categories=${categoryId}&per_page=${perPage}&status=publish`;
    return this.fetchWithErrorHandling<WordPressPost[]>(url);
  }

  // Fetch specific post by slug
  static async fetchPostBySlug(slug: string): Promise<WordPressPost[]> {
    const url = `${WORDPRESS_API_BASE}/posts?slug=${slug}&status=publish`;
    return this.fetchWithErrorHandling<WordPressPost[]>(url);
  }

  // Fetch media by ID
  static async fetchMediaById(id: number): Promise<WordPressMedia> {
    const url = `${WORDPRESS_API_BASE}/media/${id}`;
    return this.fetchWithErrorHandling<WordPressMedia>(url);
  }

  // Fetch all media
  static async fetchAllMedia(perPage: number = 100): Promise<WordPressMedia[]> {
    const url = `${WORDPRESS_API_BASE}/media?per_page=${perPage}`;
    return this.fetchWithErrorHandling<WordPressMedia[]>(url);
  }

  // Fetch categories
  static async fetchCategories(): Promise<WordPressCategory[]> {
    const url = `${WORDPRESS_API_BASE}/categories?per_page=100`;
    return this.fetchWithErrorHandling<WordPressCategory[]>(url);
  }

  // Fetch tags
  static async fetchTags(): Promise<WordPressTag[]> {
    const url = `${WORDPRESS_API_BASE}/tags?per_page=100`;
    return this.fetchWithErrorHandling<WordPressTag[]>(url);
  }

  // Fetch users/authors
  static async fetchUsers(): Promise<WordPressUser[]> {
    const url = `${WORDPRESS_API_BASE}/users?per_page=100`;
    return this.fetchWithErrorHandling<WordPressUser[]>(url);
  }

  // Fetch all WordPress data and categorize it
  static async fetchAllCategorizedData(): Promise<CategorizedWordPressData> {
    try {
      console.log("Fetching WordPress data...");

      // Fetch all data in parallel for better performance
      const [pages, posts, media, users, categories, tags] = await Promise.all([
        this.fetchPages(),
        this.fetchPosts(),
        this.fetchAllMedia(),
        this.fetchUsers(),
        this.fetchCategories(),
        this.fetchTags(),
      ]);

      const now = new Date().toISOString();

      return {
        pages: {
          data: pages,
          count: pages.length,
          lastUpdated: now,
        },
        posts: {
          data: posts,
          count: posts.length,
          lastUpdated: now,
          categories,
          tags,
        },
        media: {
          data: media,
          count: media.length,
          lastUpdated: now,
        },
        users: {
          data: users,
          count: users.length,
          lastUpdated: now,
        },
        metadata: {
          fetchedAt: now,
          apiVersion: "wp/v2",
          baseUrl: WORDPRESS_API_BASE,
          totalItems: pages.length + posts.length + media.length + users.length,
        },
      };
    } catch (error) {
      console.error("Error fetching categorized WordPress data:", error);
      throw error;
    }
  }

  // Helper function to get featured image URL for a post/page
  static async getFeaturedImageUrl(mediaId: number): Promise<string | null> {
    if (!mediaId) return null;

    try {
      const media = await this.fetchMediaById(mediaId);
      return media.source_url;
    } catch (error) {
      console.error(`Error fetching media ${mediaId}:`, error);
      return null;
    }
  }

  // Helper function to enrich posts/pages with featured image URLs
  static async enrichWithFeaturedImages<T extends { featured_media: number }>(
    items: T[]
  ): Promise<(T & { featured_image_url?: string })[]> {
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        if (item.featured_media) {
          const imageUrl = await this.getFeaturedImageUrl(item.featured_media);
          return { ...item, featured_image_url: imageUrl };
        }
        return item;
      })
    );

    return enrichedItems;
  }
}

export default WordPressAPIService;
