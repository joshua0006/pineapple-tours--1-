import { RezdyProduct } from "@/lib/types/rezdy";

// Comprehensive category definitions based on actual Rezdy data analysis
export interface CategoryDefinition {
  id: string;
  title: string;
  keywords: string[];
  productTypes: string[];
}

// Comprehensive categories mapping - VALIDATED with actual Rezdy data
export const CATEGORY_DEFINITIONS: Record<string, CategoryDefinition> = {
  "winery-tours": {
    id: "winery-tours",
    title: "Winery Tours",
    keywords: [
      "winery",
      "wine",
      "vineyard",
      "cellar",
      "vintage",
      "wine tasting",
      "wine tour",
    ],
    productTypes: ["DAYTOUR", "PRIVATE_TOUR", "GIFT_CARD", "CUSTOM"],
  },
  "brewery-tours": {
    id: "brewery-tours",
    title: "Brewery Tours",
    keywords: [
      "brewery",
      "beer",
      "craft beer",
      "brewing",
      "ale",
      "lager",
      "beer tasting",
      "brewery tour",
    ],
    productTypes: ["DAYTOUR", "PRIVATE_TOUR", "CUSTOM"],
  },
  "hop-on-hop-off": {
    id: "hop-on-hop-off",
    title: "Hop-On Hop-Off",
    keywords: [
      "hop-on",
      "hop off",
      "hop on hop off",
      "sightseeing bus",
      "city tour bus",
      "tourist bus",
    ],
    productTypes: ["CUSTOM", "TRANSFER", "ACTIVITY"],
  },
  "bus-charter": {
    id: "bus-charter",
    title: "Bus Charter",
    keywords: [
      "bus charter",
      "charter bus",
      "private bus",
      "group transport",
      "coach charter",
    ],
    productTypes: ["CHARTER", "CUSTOM"],
  },
  "day-tours": {
    id: "day-tours",
    title: "Day Tours",
    keywords: [
      "day tour",
      "full day",
      "day trip",
      "day excursion",
      "all day",
      "daily tour",
    ],
    productTypes: ["DAYTOUR", "GIFT_CARD"],
  },
  "corporate-tours": {
    id: "corporate-tours",
    title: "Corporate Tours",
    keywords: [
      "corporate",
      "business",
      "team building",
      "company",
      "corporate event",
      "business tour",
    ],
    productTypes: ["DAYTOUR", "CHARTER", "CUSTOM"],
  },
  "barefoot-luxury": {
    id: "barefoot-luxury",
    title: "Barefoot Luxury",
    keywords: [
      "barefoot luxury",
      "luxury",
      "premium",
      "exclusive",
      "vip",
      "high-end",
      "upscale",
    ],
    productTypes: ["DAYTOUR", "PRIVATE_TOUR", "GIFT_CARD"],
  },
  activities: {
    id: "activities",
    title: "Activities",
    keywords: ["activity", "experience", "adventure", "fun", "entertainment"],
    productTypes: ["ACTIVITY"],
  },
  "private-tours": {
    id: "private-tours",
    title: "Private Tours",
    keywords: ["private", "exclusive", "personal", "intimate", "customized"],
    productTypes: ["PRIVATE_TOUR"],
  },
  "multiday-tours": {
    id: "multiday-tours",
    title: "Multi-day Tours",
    keywords: [
      "multiday",
      "multi-day",
      "package",
      "extended",
      "overnight",
      "itinerary",
      "multiple days",
    ],
    productTypes: ["MULTIDAYTOUR"],
  },
  transfers: {
    id: "transfers",
    title: "Transfers",
    keywords: [
      "transfer",
      "transport",
      "shuttle",
      "airport",
      "pickup",
      "dropoff",
    ],
    productTypes: ["TRANSFER"],
  },
  lessons: {
    id: "lessons",
    title: "Lessons",
    keywords: [
      "lesson",
      "learn",
      "instruction",
      "teaching",
      "skill",
      "education",
    ],
    productTypes: ["LESSON"],
  },
  tickets: {
    id: "tickets",
    title: "Tickets",
    keywords: ["ticket", "entry", "admission", "event", "show", "attraction"],
    productTypes: ["TICKET"],
  },
  rentals: {
    id: "rentals",
    title: "Rentals",
    keywords: ["rental", "hire", "rent", "equipment", "vehicle"],
    productTypes: ["RENTAL"],
  },
  "gift-cards": {
    id: "gift-cards",
    title: "Gift Cards",
    keywords: ["gift", "voucher", "card", "present", "certificate"],
    productTypes: ["GIFT_CARD"],
  },
  merchandise: {
    id: "merchandise",
    title: "Merchandise",
    keywords: ["merchandise", "souvenir", "shop", "buy", "product", "branded"],
    productTypes: ["MERCHANDISE"],
  },

  // Legacy category support - mapped to new categories
  adventure: {
    id: "adventure",
    title: "Adventure Tours",
    keywords: ["activity", "experience", "adventure", "fun", "entertainment"],
    productTypes: ["ACTIVITY"],
  },
  cultural: {
    id: "cultural",
    title: "Cultural Tours",
    keywords: [
      "day tour",
      "full day",
      "day trip",
      "day excursion",
      "all day",
      "daily tour",
    ],
    productTypes: ["DAYTOUR", "GIFT_CARD"],
  },
  "food-wine": {
    id: "food-wine",
    title: "Food & Wine Tours",
    keywords: [
      "winery",
      "wine",
      "vineyard",
      "cellar",
      "vintage",
      "wine tasting",
      "wine tour",
    ],
    productTypes: ["DAYTOUR", "PRIVATE_TOUR", "GIFT_CARD", "CUSTOM"],
  },
  nature: {
    id: "nature",
    title: "Nature Tours",
    keywords: [
      "day tour",
      "full day",
      "day trip",
      "day excursion",
      "all day",
      "daily tour",
    ],
    productTypes: ["DAYTOUR", "GIFT_CARD"],
  },
  urban: {
    id: "urban",
    title: "Urban Tours",
    keywords: [
      "day tour",
      "full day",
      "day trip",
      "day excursion",
      "all day",
      "daily tour",
    ],
    productTypes: ["DAYTOUR", "GIFT_CARD"],
  },
  family: {
    id: "family",
    title: "Family Tours",
    keywords: [
      "day tour",
      "full day",
      "day trip",
      "day excursion",
      "all day",
      "daily tour",
    ],
    productTypes: ["DAYTOUR", "GIFT_CARD"],
  },
  romantic: {
    id: "romantic",
    title: "Romantic Tours",
    keywords: ["private", "exclusive", "personal", "intimate", "customized"],
    productTypes: ["PRIVATE_TOUR"],
  },
  luxury: {
    id: "luxury",
    title: "Luxury Tours",
    keywords: [
      "barefoot luxury",
      "luxury",
      "premium",
      "exclusive",
      "vip",
      "high-end",
      "upscale",
    ],
    productTypes: ["DAYTOUR", "PRIVATE_TOUR", "GIFT_CARD"],
  },
  photography: {
    id: "photography",
    title: "Photography Tours",
    keywords: ["private", "exclusive", "personal", "intimate", "customized"],
    productTypes: ["PRIVATE_TOUR"],
  },
  "water-activities": {
    id: "water-activities",
    title: "Water Activities",
    keywords: ["activity", "experience", "adventure", "fun", "entertainment"],
    productTypes: ["ACTIVITY"],
  },
  workshops: {
    id: "workshops",
    title: "Workshops",
    keywords: [
      "lesson",
      "learn",
      "instruction",
      "teaching",
      "skill",
      "education",
    ],
    productTypes: ["LESSON"],
  },
  classes: {
    id: "classes",
    title: "Classes",
    keywords: [
      "lesson",
      "learn",
      "instruction",
      "teaching",
      "skill",
      "education",
    ],
    productTypes: ["LESSON"],
  },
  tastings: {
    id: "tastings",
    title: "Tastings",
    keywords: [
      "winery",
      "wine",
      "vineyard",
      "cellar",
      "vintage",
      "wine tasting",
      "wine tour",
    ],
    productTypes: ["DAYTOUR", "PRIVATE_TOUR", "GIFT_CARD", "CUSTOM"],
  },
  honeymoon: {
    id: "honeymoon",
    title: "Honeymoon",
    keywords: ["private", "exclusive", "personal", "intimate", "customized"],
    productTypes: ["PRIVATE_TOUR"],
  },
};

/**
 * Check if a product matches a specific category using validated filtering logic
 */
export function matchesCategory(
  product: RezdyProduct,
  categoryId: string
): boolean {
  const category = CATEGORY_DEFINITIONS[categoryId];
  if (!category) return false;

  const searchText = `${product.name || ""} ${product.shortDescription || ""} ${
    product.description || ""
  }`.toLowerCase();
  const productTypeUpper = product.productType?.toUpperCase() || "";

  // Check keyword match in product text
  const keywordMatch = category.keywords.some((keyword) =>
    searchText.includes(keyword.toLowerCase())
  );

  // Check exact product type match
  const productTypeMatch = category.productTypes.some(
    (type) => productTypeUpper === type
  );

  return keywordMatch || productTypeMatch;
}

/**
 * Filter products by category using validated filtering logic
 */
export function filterProductsByCategory(
  products: RezdyProduct[],
  categoryId: string
): RezdyProduct[] {
  if (categoryId === "all") return products;

  return products.filter((product) => matchesCategory(product, categoryId));
}

/**
 * Get all available category IDs
 */
export function getAllCategoryIds(): string[] {
  return Object.keys(CATEGORY_DEFINITIONS);
}

/**
 * Get category definition by ID
 */
export function getCategoryDefinition(
  categoryId: string
): CategoryDefinition | undefined {
  return CATEGORY_DEFINITIONS[categoryId];
}

/**
 * Get main categories (excluding legacy and support categories)
 */
export function getMainCategories(): CategoryDefinition[] {
  const mainCategoryIds = [
    "winery-tours",
    "brewery-tours",
    "hop-on-hop-off",
    "bus-charter",
    "day-tours",
    "corporate-tours",
    "barefoot-luxury",
    "activities",
    "private-tours",
    "multiday-tours",
    "transfers",
    "lessons",
    "tickets",
    "rentals",
  ];

  return mainCategoryIds
    .map((id) => CATEGORY_DEFINITIONS[id])
    .filter((category): category is CategoryDefinition => Boolean(category));
}

/**
 * Categorize products into groups
 */
export function categorizeProducts(
  products: RezdyProduct[]
): Record<string, RezdyProduct[]> {
  const categorized: Record<string, RezdyProduct[]> = {};

  // Initialize all main categories
  getMainCategories().forEach((category) => {
    categorized[category.id] = [];
  });

  // Categorize each product
  products.forEach((product) => {
    getMainCategories().forEach((category) => {
      if (matchesCategory(product, category.id)) {
        categorized[category.id].push(product);
      }
    });
  });

  return categorized;
}

/**
 * Get product counts by category
 */
export function getProductCountsByCategory(
  products: RezdyProduct[]
): Record<string, number> {
  const counts: Record<string, number> = {};

  getMainCategories().forEach((category) => {
    counts[category.id] = filterProductsByCategory(
      products,
      category.id
    ).length;
  });

  return counts;
}
