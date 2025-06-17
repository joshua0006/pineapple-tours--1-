import { BlogPostData, WordPressCategory } from "@/hooks/use-wordpress-blog";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface BlogCacheData {
  posts: BlogPostData[];
  categories: WordPressCategory[];
  lastFetch: number;
}

export class BlogCacheManager {
  private static instance: BlogCacheManager;
  private memoryCache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_PREFIX = "pineapple_blog_";
  private readonly DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly POSTS_TTL = 15 * 60 * 1000; // 15 minutes for posts
  private readonly CATEGORIES_TTL = 30 * 60 * 1000; // 30 minutes for categories
  private readonly STORAGE_KEY = "pineapple_blog_cache";

  static getInstance(): BlogCacheManager {
    if (!BlogCacheManager.instance) {
      BlogCacheManager.instance = new BlogCacheManager();
    }
    return BlogCacheManager.instance;
  }

  private constructor() {
    this.loadFromStorage();
    this.setupStorageSync();
  }

  /**
   * Get cached data with automatic expiration check
   */
  get<T>(key: string): T | null {
    // Check memory cache first
    const memoryCached = this.memoryCache.get(key);
    if (memoryCached && memoryCached.expiresAt > Date.now()) {
      return memoryCached.data;
    }

    // Check localStorage
    const storageCached = this.getFromStorage(key);
    if (storageCached && storageCached.expiresAt > Date.now()) {
      // Restore to memory cache
      this.memoryCache.set(key, storageCached);
      return storageCached.data;
    }

    // Clean up expired entries
    if (memoryCached) {
      this.memoryCache.delete(key);
    }
    if (storageCached) {
      this.removeFromStorage(key);
    }

    return null;
  }

  /**
   * Set data in cache with custom TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const actualTTL = ttl || this.DEFAULT_TTL;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + actualTTL,
    };

    // Set in memory cache
    this.memoryCache.set(key, entry);

    // Set in localStorage
    this.setInStorage(key, entry);
  }

  /**
   * Get blog posts from cache
   */
  getPosts(): BlogPostData[] | null {
    return this.get<BlogPostData[]>("posts");
  }

  /**
   * Set blog posts in cache
   */
  setPosts(posts: BlogPostData[]): void {
    this.set("posts", posts, this.POSTS_TTL);
  }

  /**
   * Get categories from cache
   */
  getCategories(): WordPressCategory[] | null {
    return this.get<WordPressCategory[]>("categories");
  }

  /**
   * Set categories in cache
   */
  setCategories(categories: WordPressCategory[]): void {
    this.set("categories", categories, this.CATEGORIES_TTL);
  }

  /**
   * Get complete blog data from cache
   */
  getBlogData(): BlogCacheData | null {
    const posts = this.getPosts();
    const categories = this.getCategories();

    if (posts && categories) {
      const lastFetch = this.getLastFetchTime();
      return {
        posts,
        categories,
        lastFetch: lastFetch || 0,
      };
    }

    return null;
  }

  /**
   * Set complete blog data in cache
   */
  setBlogData(posts: BlogPostData[], categories: WordPressCategory[]): void {
    this.setPosts(posts);
    this.setCategories(categories);
    this.setLastFetchTime(Date.now());
  }

  /**
   * Check if cache is fresh (not expired)
   */
  isCacheFresh(): boolean {
    const posts = this.get<BlogPostData[]>("posts");
    const categories = this.get<WordPressCategory[]>("categories");
    return posts !== null && categories !== null;
  }

  /**
   * Get cache age in minutes
   */
  getCacheAge(): number {
    const lastFetch = this.getLastFetchTime();
    if (!lastFetch) return Infinity;
    return Math.floor((Date.now() - lastFetch) / (1000 * 60));
  }

  /**
   * Invalidate specific cache entries
   */
  invalidate(keys?: string[]): void {
    if (keys) {
      keys.forEach((key) => {
        this.memoryCache.delete(key);
        this.removeFromStorage(key);
      });
    } else {
      // Invalidate all blog-related cache
      this.memoryCache.clear();
      this.clearStorage();
    }
  }

  /**
   * Clear all cache data
   */
  clear(): void {
    this.memoryCache.clear();
    this.clearStorage();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const posts = this.getPosts();
    const categories = this.getCategories();
    const lastFetch = this.getLastFetchTime();

    return {
      hasPosts: posts !== null,
      hasCategories: categories !== null,
      postsCount: posts?.length || 0,
      categoriesCount: categories?.length || 0,
      lastFetch: lastFetch ? new Date(lastFetch) : null,
      cacheAge: this.getCacheAge(),
      isFresh: this.isCacheFresh(),
      memoryEntries: this.memoryCache.size,
    };
  }

  private getLastFetchTime(): number | null {
    return this.get<number>("lastFetch");
  }

  private setLastFetchTime(timestamp: number): void {
    this.set("lastFetch", timestamp, this.POSTS_TTL);
  }

  private getFromStorage(key: string): CacheEntry<any> | null {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Failed to get from localStorage:", error);
    }
    return null;
  }

  private setInStorage<T>(key: string, entry: CacheEntry<T>): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(`${this.CACHE_PREFIX}${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn("Failed to set in localStorage:", error);
      // If localStorage is full, try to clear old entries
      this.cleanupStorage();
    }
  }

  private removeFromStorage(key: string): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
    } catch (error) {
      console.warn("Failed to remove from localStorage:", error);
    }
  }

  private clearStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
    }
  }

  private loadFromStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((storageKey) => {
        if (storageKey.startsWith(this.CACHE_PREFIX)) {
          const cacheKey = storageKey.replace(this.CACHE_PREFIX, "");
          const entry = this.getFromStorage(cacheKey);
          if (entry && entry.expiresAt > Date.now()) {
            this.memoryCache.set(cacheKey, entry);
          } else if (entry) {
            // Remove expired entries
            this.removeFromStorage(cacheKey);
          }
        }
      });
    } catch (error) {
      console.warn("Failed to load from localStorage:", error);
    }
  }

  private setupStorageSync(): void {
    if (typeof window === "undefined") return;

    // Listen for storage changes from other tabs
    window.addEventListener("storage", (e) => {
      if (e.key?.startsWith(this.CACHE_PREFIX)) {
        const cacheKey = e.key.replace(this.CACHE_PREFIX, "");
        if (e.newValue) {
          try {
            const entry = JSON.parse(e.newValue);
            if (entry.expiresAt > Date.now()) {
              this.memoryCache.set(cacheKey, entry);
            }
          } catch (error) {
            console.warn("Failed to sync storage:", error);
          }
        } else {
          this.memoryCache.delete(cacheKey);
        }
      }
    });
  }

  private cleanupStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const keys = Object.keys(localStorage);
      const blogKeys = keys.filter((key) => key.startsWith(this.CACHE_PREFIX));

      // Remove expired entries
      blogKeys.forEach((storageKey) => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            const entry = JSON.parse(stored);
            if (entry.expiresAt <= Date.now()) {
              localStorage.removeItem(storageKey);
            }
          } catch {
            localStorage.removeItem(storageKey);
          }
        }
      });
    } catch (error) {
      console.warn("Failed to cleanup storage:", error);
    }
  }
}

// Export singleton instance
export const blogCache = BlogCacheManager.getInstance();
