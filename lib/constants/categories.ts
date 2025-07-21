// Rezdy tour categories - direct integration with Rezdy API
export interface RezdyTourCategory {
  id: number;
  title: string;
  description: string;
  slug: string;
  categoryGroup: "tours" | "experiences" | "transportation";
}

// Rezdy tour categories - direct from Rezdy API with real category IDs
export const REZDY_TOUR_CATEGORIES: RezdyTourCategory[] = [
  {
    id: 620787,
    title: "Daily Wine Tours",
    description: "Daily scheduled wine tasting experiences at local wineries",
    slug: "daily-winery-tours",
    categoryGroup: "tours",
  },
  {
    id: 398952,
    title: "Private Wine Tours", 
    description: "Exclusive private wine tasting tours and experiences",
    slug: "private-winery-tours",
    categoryGroup: "tours",
  },
  {
    id: 566931,
    title: "Food and Wine - Private",
    description: "Private food and wine experiences with gourmet tastings",
    slug: "food-wine-private",
    categoryGroup: "tours",
  },
  {
    id: 546743,
    title: "Hop-On-Hop-Off",
    description: "Flexible sightseeing with hop-on hop-off bus services",
    slug: "hop-on-hop-off",
    categoryGroup: "transportation",
  },
  {
    id: 318664,
    title: "Hens Party",
    description: "Special celebrations for brides-to-be and their friends",
    slug: "hens-party",
    categoryGroup: "experiences",
  },
  {
    id: 292796,
    title: "Brewery Tours",
    description: "Craft beer experiences and brewery visits",
    slug: "brewery-tours",
    categoryGroup: "tours",
  },
  {
    id: 398329,
    title: "Bus Charter",
    description: "Private bus and coach charter services for groups",
    slug: "bus-charter",
    categoryGroup: "transportation",
  },
  {
    id: 395072,
    title: "Corporate Tours",
    description: "Business events, team building, and corporate experiences",
    slug: "corporate-tours",
    categoryGroup: "experiences",
  },
  {
    id: 466255,
    title: "Barefoot Luxury Tours",
    description: "Premium and luxury experiences with exclusive service",
    slug: "barefoot-luxury",
    categoryGroup: "tours",
  },
];

// Legacy support - map old slugs to real Rezdy category IDs
export const LEGACY_CATEGORY_MAPPING: Record<string, number> = {
  "winery-tours": 620787, // Default to daily wine tours
  "daily-wine": 620787, // Legacy slug
  "daily-winery-tours": 620787, // Current slug
  "private-wine-tours": 398952, // Legacy slug
  "private-winery-tours": 398952, // Current slug
  "food-wine-private": 566931,
  "hop-on-hop-off": 546743,
  "hens-party": 318664,
  "brewery-tours": 292796,
  "bus-charter": 398329,
  "corporate-tours": 395072,
  "barefoot-luxury": 466255,
  // Additional legacy mappings
  "food-wine": 566931,
  "private-tours": 398952,
  "daily-tours": 620787,
  adventure: 620787,
  cultural: 620787,
  nature: 620787,
  urban: 546743,
  family: 620787,
  romantic: 398952,
  luxury: 466255,
  photography: 398952,
  tastings: 620787,
  honeymoon: 398952,
};

// Get products for a specific Rezdy category using the API
export async function getProductsForCategory(categoryId: number): Promise<any[]> {
  try {
    const response = await fetch(`/api/rezdy/categories/${categoryId}/products`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products for category ${categoryId}`);
    }
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    return [];
  }
}

// Get category by slug
export function getCategoryBySlug(slug: string): RezdyTourCategory | undefined {
  return REZDY_TOUR_CATEGORIES.find((category) => category.slug === slug);
}

// Legacy function - map old category IDs to new Rezdy category IDs
function mapLegacyCategory(categoryId: string): number {
  return LEGACY_CATEGORY_MAPPING[categoryId] || parseInt(categoryId) || 620781;
}

// Get category by ID (with legacy support)
export function getCategoryById(
  id: string | number
): RezdyTourCategory | undefined {
  const categoryId = typeof id === 'string' ? mapLegacyCategory(id) : id;
  return REZDY_TOUR_CATEGORIES.find((category) => category.id === categoryId);
}

// Get all category IDs
export function getAllCategoryIds(): number[] {
  return REZDY_TOUR_CATEGORIES.map((category) => category.id);
}

// Get category display name
export function getCategoryDisplayName(id: string | number): string {
  const category = getCategoryById(id);
  return category?.title || String(id);
}

// Check if product belongs to a specific Rezdy category
export function doesProductMatchCategory(
  product: any,
  categoryId: string | number
): boolean {
  const rezdyCategoryId = typeof categoryId === 'string' ? mapLegacyCategory(categoryId) : categoryId;
  return product.categoryId === rezdyCategoryId;
}

// Get main tour categories (excluding support categories)
export function getMainTourCategories(): RezdyTourCategory[] {
  return REZDY_TOUR_CATEGORIES.filter(
    (category) => ["tours", "transportation"].includes(category.categoryGroup)
  );
}

// Get all categories for search dropdown
export function getSearchCategories(): RezdyTourCategory[] {
  return REZDY_TOUR_CATEGORIES;
}

// Get category statistics for Rezdy categories
export function getCategoryStatistics(
  rezdyCategoryProducts?: Record<number, any[]>
): Record<number, { productCount: number }> {
  const stats: Record<number, { productCount: number }> = {};

  for (const category of REZDY_TOUR_CATEGORIES) {
    const productCount = rezdyCategoryProducts?.[category.id]?.length || 0;
    stats[category.id] = {
      productCount,
    };
  }

  return stats;
}

// Get all categories
export function getAllCategories(): RezdyTourCategory[] {
  return REZDY_TOUR_CATEGORIES;
}

// Get category by Rezdy ID
export function getCategoryByRezdyId(rezdyId: number): RezdyTourCategory | undefined {
  return REZDY_TOUR_CATEGORIES.find((category) => category.id === rezdyId);
}
