import {
  RezdyCategory,
  RezdyCategoryProduct,
  RezdyCategoriesResponse,
  RezdyCategoryProductsResponse,
} from "@/lib/types/rezdy";
import { simpleCacheManager } from "@/lib/utils/simple-cache-manager";

export class RezdyCategoriesService {
  private baseUrl = "/api/rezdy";

  async getCategories(options: {
    visibleOnly?: boolean;
    forceRefresh?: boolean;
  } = {}): Promise<RezdyCategory[]> {
    const { visibleOnly = false, forceRefresh = false } = options;
    
    const cacheKey = visibleOnly ? "categories:visible" : "categories:all";
    
    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cachedCategories = await simpleCacheManager.getCategories(cacheKey);
      if (cachedCategories) {
        return cachedCategories;
      }
    }

    const params = new URLSearchParams();
    if (visibleOnly) {
      params.append("visibleOnly", "true");
    }

    const url = `${this.baseUrl}/categories?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const data: RezdyCategoriesResponse = await response.json();
    const categories = data.categories || [];

    // Cache the results
    await simpleCacheManager.cacheCategories(categories, cacheKey);

    return categories;
  }

  async getCategoryById(categoryId: number): Promise<RezdyCategory | null> {
    const cacheKey = `category:${categoryId}`;
    
    // Check cache first
    const cachedCategory = await simpleCacheManager.get<RezdyCategory>(cacheKey);
    if (cachedCategory) {
      return cachedCategory;
    }

    // If not in cache, fetch all categories and find the one we need
    const categories = await this.getCategories();
    const category = categories.find(cat => cat.id === categoryId);
    
    if (category) {
      // Cache the individual category
      await simpleCacheManager.set(cacheKey, category);
    }
    
    return category || null;
  }

  async getCategoryProducts(
    categoryId: number,
    options: {
      limit?: number;
      offset?: number;
      forceRefresh?: boolean;
    } = {}
  ): Promise<RezdyCategoryProduct[]> {
    const { limit = 100, offset = 0, forceRefresh = false } = options;
    
    const cacheKey = `category:${categoryId}:products:${limit}:${offset}`;
    
    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cachedProducts = await simpleCacheManager.getCategoryProducts(cacheKey);
      if (cachedProducts) {
        return cachedProducts;
      }
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const url = `${this.baseUrl}/categories/${categoryId}/products?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch category products: ${response.statusText}`);
    }

    const data: RezdyCategoryProductsResponse = await response.json();
    const products = data.products || [];

    // Cache the results
    await simpleCacheManager.cacheCategoryProducts(products, cacheKey);

    return products;
  }

  async getVisibleCategories(): Promise<RezdyCategory[]> {
    return this.getCategories({ visibleOnly: true });
  }

  async getAllCategories(): Promise<RezdyCategory[]> {
    return this.getCategories({ visibleOnly: false });
  }

  async getCategoryProductsBySlug(
    categorySlug: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<RezdyCategoryProduct[]> {
    // First, get all categories to find the one with matching slug
    const categories = await this.getCategories();
    const category = categories.find(cat => 
      cat.name.toLowerCase().replace(/\s+/g, '-') === categorySlug.toLowerCase()
    );

    if (!category) {
      throw new Error(`Category with slug "${categorySlug}" not found`);
    }

    return this.getCategoryProducts(category.id, options);
  }

  async searchCategories(query: string): Promise<RezdyCategory[]> {
    const categories = await this.getCategories();
    const searchTerm = query.toLowerCase();
    
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm) ||
      (category.description && category.description.toLowerCase().includes(searchTerm))
    );
  }

  async getCategoryStats(): Promise<{
    totalCategories: number;
    visibleCategories: number;
    hiddenCategories: number;
    categoriesWithProducts: number;
  }> {
    const categories = await this.getCategories();
    const visibleCategories = categories.filter(cat => cat.isVisible);
    
    // Get product counts for each category (simplified - in real app might want to cache this)
    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        try {
          const products = await this.getCategoryProducts(category.id, { limit: 1 });
          return products.length > 0;
        } catch {
          return false;
        }
      })
    );

    return {
      totalCategories: categories.length,
      visibleCategories: visibleCategories.length,
      hiddenCategories: categories.length - visibleCategories.length,
      categoriesWithProducts: categoriesWithProducts.filter(Boolean).length,
    };
  }

  async invalidateCache(categoryId?: number): Promise<void> {
    if (categoryId) {
      // Invalidate specific category cache
      await simpleCacheManager.invalidateRelated("category", categoryId.toString());
    } else {
      // Invalidate all category caches
      await simpleCacheManager.invalidateRelated("categories");
      await simpleCacheManager.invalidateRelated("category");
    }
  }
}

// Export singleton instance
export const rezdyCategoriesService = new RezdyCategoriesService();