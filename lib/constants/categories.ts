// Rezdy tour categories - direct integration with Rezdy API
export interface RezdyTourCategory {
  id: number;
  title: string;
  description: string;
  slug: string;
  categoryGroup: "tours" | "experiences" | "transportation";
}

// Rezdy tour categories - direct from Rezdy API with specific category IDs
export const REZDY_TOUR_CATEGORIES: RezdyTourCategory[] = [
  {
    id: 620779,
    title: "Winery Tours",
    description: "Wine tasting experiences at local wineries and vineyards",
    slug: "winery-tours",
    categoryGroup: "tours",
  },
  {
    id: 620780,
    title: "Hop-On-Hop-Off",
    description: "Flexible sightseeing with hop-on hop-off bus services",
    slug: "hop-on-hop-off",
    categoryGroup: "transportation",
  },
  {
    id: 620781,
    title: "Day Tours",
    description: "Full-day guided tours and excursions",
    slug: "day-tours",
    categoryGroup: "tours",
  },
  {
    id: 620782,
    title: "Hens Party",
    description: "Special celebrations for brides-to-be and their friends",
    slug: "hens-party",
    categoryGroup: "experiences",
  },
  {
    id: 620783,
    title: "Brewery Tours",
    description: "Craft beer experiences and brewery visits",
    slug: "brewery-tours",
    categoryGroup: "tours",
  },
  {
    id: 620784,
    title: "Bus Charter",
    description: "Private bus and coach charter services for groups",
    slug: "bus-charter",
    categoryGroup: "transportation",
  },
  {
    id: 620785,
    title: "Corporate Tours",
    description: "Business events, team building, and corporate experiences",
    slug: "corporate-tours",
    categoryGroup: "experiences",
  },
  {
    id: 620786,
    title: "Barefoot Luxury",
    description: "Premium and luxury experiences with exclusive service",
    slug: "barefoot-luxury",
    categoryGroup: "tours",
  },
  {
    id: 620787,
    title: "Daily Tours",
    description: "Daily scheduled tours and regular departures",
    slug: "daily-tours",
    categoryGroup: "tours",
  },
  {
    id: 620788,
    title: "Private Tours",
    description: "Exclusive private guided tours and experiences",
    slug: "private-tours",
    categoryGroup: "tours",
  },
];

// Legacy support - map old slugs to new Rezdy category IDs
export const LEGACY_CATEGORY_MAPPING: Record<string, number> = {
  "winery-tours": 620779,
  "hop-on-hop-off": 620780,
  "day-tours": 620781,
  "hens-party": 620782,
  "brewery-tours": 620783,
  "bus-charter": 620784,
  "corporate-tours": 620785,
  "barefoot-luxury": 620786,
  "daily-tours": 620787,
  "private-tours": 620788,
  // Additional legacy mappings
  adventure: 620781,
  cultural: 620781,
  "food-wine": 620779,
  nature: 620781,
  urban: 620781,
  family: 620781,
  romantic: 620788,
  luxury: 620786,
  photography: 620788,
  tastings: 620779,
  honeymoon: 620788,
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
