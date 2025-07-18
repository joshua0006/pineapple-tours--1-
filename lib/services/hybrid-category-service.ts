import { RezdyCategory, RezdyCategoryProduct, RezdyProduct } from "@/lib/types/rezdy";
import { rezdyCategoriesService } from "./rezdy-categories";
import {
  RezdyTourCategory,
  REZDY_TOUR_CATEGORIES,
  getCategoryStatistics,
  getCategoryById,
  getAllCategories,
} from "@/lib/constants/categories";

interface RezdyCategoryData {
  category: RezdyTourCategory;
  products: any[];
  productCount: number;
  stats: {
    productCount: number;
  };
}

export class RezdyCategoryService {
  private rezdyCategoryProductsCache: Record<number, RezdyCategoryProduct[]> = {};

  async initialize(): Promise<void> {
    try {
      console.log(`Using ${REZDY_TOUR_CATEGORIES.length} predefined Rezdy categories`);
    } catch (error) {
      console.error("Failed to initialize Rezdy category service:", error);
    }
  }

  async getRezdyCategoryData(
    categoryId: string | number
  ): Promise<RezdyCategoryData | null> {
    const category = getCategoryById(categoryId);
    if (!category) {
      return null;
    }

    // Get products from Rezdy API
    let products: RezdyCategoryProduct[] = [];
    try {
      products = await rezdyCategoriesService.getCategoryProducts(category.id);
      this.rezdyCategoryProductsCache[category.id] = products;
    } catch (error) {
      console.error(`Failed to load products for Rezdy category ${category.id}:`, error);
    }

    // Calculate statistics
    const stats = {
      productCount: products.length,
    };

    return {
      category,
      products,
      productCount: products.length,
      stats,
    };
  }

  async getAllRezdyCategories(): Promise<RezdyCategoryData[]> {
    const rezdyCategories: RezdyCategoryData[] = [];

    for (const category of REZDY_TOUR_CATEGORIES) {
      const rezdyData = await this.getRezdyCategoryData(category.id);
      if (rezdyData) {
        rezdyCategories.push(rezdyData);
      }
    }

    return rezdyCategories;
  }

  async getEnhancedCategoryStats(): Promise<{
    totalCategories: number;
    categoriesWithProducts: number;
    totalProducts: number;
    stats: Record<number, { productCount: number }>;
  }> {
    const stats = getCategoryStatistics(this.rezdyCategoryProductsCache);
    
    const categoriesWithProducts = Object.values(stats).filter(
      stat => stat.productCount > 0
    ).length;

    const totalProducts = Object.values(stats).reduce(
      (sum, stat) => sum + stat.productCount,
      0
    );

    return {
      totalCategories: REZDY_TOUR_CATEGORIES.length,
      categoriesWithProducts,
      totalProducts,
      stats,
    };
  }

  async searchRezdyCategories(
    query: string
  ): Promise<RezdyCategoryData[]> {
    const searchTerm = query.toLowerCase();
    const matchingCategories: RezdyCategoryData[] = [];

    for (const category of REZDY_TOUR_CATEGORIES) {
      const matchesName = category.title.toLowerCase().includes(searchTerm);
      const matchesDescription = category.description.toLowerCase().includes(searchTerm);
      const matchesSlug = category.slug.toLowerCase().includes(searchTerm);

      if (matchesName || matchesDescription || matchesSlug) {
        const rezdyData = await this.getRezdyCategoryData(category.id);
        if (rezdyData) {
          matchingCategories.push(rezdyData);
        }
      }
    }

    return matchingCategories;
  }

  async getProductsForCategory(
    categoryId: string | number,
    limit = 100,
    offset = 0
  ): Promise<{
    products: any[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
      hasMore: boolean;
    };
  }> {
    const rezdyData = await this.getRezdyCategoryData(categoryId);
    
    if (!rezdyData) {
      return {
        products: [],
        pagination: {
          limit,
          offset,
          total: 0,
          hasMore: false,
        },
      };
    }

    const startIndex = offset;
    const endIndex = offset + limit;
    const paginatedProducts = rezdyData.products.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      pagination: {
        limit,
        offset,
        total: rezdyData.products.length,
        hasMore: endIndex < rezdyData.products.length,
      },
    };
  }

  async getTopCategories(
    limit = 10
  ): Promise<RezdyCategoryData[]> {
    const allRezdyCategories = await this.getAllRezdyCategories();
    
    return allRezdyCategories
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, limit);
  }

  async getRezdyCategoryMapping(): Promise<RezdyTourCategory[]> {
    return REZDY_TOUR_CATEGORIES;
  }

  async refreshCache(): Promise<void> {
    this.rezdyCategoryProductsCache = {};
    await this.initialize();
  }

  getCategories(): RezdyTourCategory[] {
    return REZDY_TOUR_CATEGORIES;
  }
}

// Export singleton instance
export const rezdyCategoryService = new RezdyCategoryService();

// Legacy export for backwards compatibility
export const hybridCategoryService = rezdyCategoryService;