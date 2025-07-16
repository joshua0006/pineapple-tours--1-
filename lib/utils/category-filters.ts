import { RezdyProduct } from "@/lib/types/rezdy";

// Enhanced category definitions with confidence scoring support
export interface CategoryDefinition {
  id: string;
  title: string;
  keywords: string[];
  productTypes: string[];
  // Enhanced confidence scoring properties
  strictKeywords?: string[]; // High-priority keywords that significantly boost confidence
  excludeKeywords?: string[]; // Keywords that reduce confidence or exclude the product
  minimumConfidence?: number; // Minimum confidence threshold for this category (0-100)
  keywordWeights?: {
    primary?: string[];   // Highest weight keywords
    secondary?: string[]; // Medium weight keywords  
    contextual?: string[]; // Lower weight keywords
  };
}

// Product match result with confidence scoring
export interface CategoryMatch {
  categoryId: string;
  confidence: number;
  matchedKeywords: string[];
  matchSources: {
    nameMatches: string[];
    descriptionMatches: string[];
    typeMatch: boolean;
  };
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
    strictKeywords: ["winery", "wine tour", "wine tasting", "vineyard"],
    excludeKeywords: ["beer", "brewery", "bus charter", "hop on", "hop-on", "city tour", "sightseeing bus"],
    minimumConfidence: 15,
    keywordWeights: {
      primary: ["winery", "wine tour", "wine tasting"],
      secondary: ["vineyard", "cellar"],
      contextual: ["wine", "vintage"]
    }
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
    strictKeywords: ["brewery", "brewery tour", "beer tasting", "craft beer"],
    excludeKeywords: ["wine", "winery", "bus charter"],
    minimumConfidence: 15,
    keywordWeights: {
      primary: ["brewery", "brewery tour", "beer tasting"],
      secondary: ["beer", "craft beer", "brewing"],
      contextual: ["ale", "lager"]
    }
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
    strictKeywords: ["hop on hop off", "hop-on", "hop off"],
    excludeKeywords: ["private", "charter", "winery", "brewery"],
    minimumConfidence: 20,
    keywordWeights: {
      primary: ["hop on hop off", "hop-on", "hop off"],
      secondary: ["sightseeing bus", "city tour bus"],
      contextual: ["tourist bus"]
    }
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
    strictKeywords: ["bus charter", "charter bus", "coach charter"],
    excludeKeywords: ["hop-on", "hop off", "winery", "brewery"],
    minimumConfidence: 15,
    keywordWeights: {
      primary: ["bus charter", "charter bus", "coach charter"],
      secondary: ["private bus", "group transport"],
      contextual: []
    }
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
    strictKeywords: ["barefoot luxury", "luxury", "premium", "exclusive"],
    excludeKeywords: ["budget", "cheap", "basic"],
    minimumConfidence: 10,
    keywordWeights: {
      primary: ["barefoot luxury", "luxury", "premium"],
      secondary: ["exclusive", "vip", "high-end"],
      contextual: ["upscale"]
    }
  },
  "hens-party": {
    id: "hens-party",
    title: "Hens Party",
    keywords: [
      "hens party",
      "hen party",
      "bachelorette",
      "bridal party",
      "girls night",
      "ladies night",
      "celebration",
    ],
    productTypes: ["DAYTOUR", "PRIVATE_TOUR", "CUSTOM"],
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
 * Calculate confidence score for how well a product matches a category
 * @param product - The product to analyze
 * @param categoryId - The category ID to match against
 * @returns Confidence score from 0-100, or 0 if no match
 */
export function getCategoryMatchConfidence(
  product: RezdyProduct,
  categoryId: string
): number {
  const category = CATEGORY_DEFINITIONS[categoryId];
  if (!category) return 0;

  const productName = (product.name || "").toLowerCase();
  const shortDescription = (product.shortDescription || "").toLowerCase();
  const fullDescription = (product.description || "").toLowerCase();
  const productTypeUpper = product.productType?.toUpperCase() || "";

  let confidence = 0;
  const matchedKeywords: string[] = [];
  const nameMatches: string[] = [];
  const descriptionMatches: string[] = [];

  // Check for excluded keywords first - these significantly reduce confidence
  if (category.excludeKeywords) {
    const allText = `${productName} ${shortDescription} ${fullDescription}`;
    for (const excludeKeyword of category.excludeKeywords) {
      if (allText.includes(excludeKeyword.toLowerCase())) {
        confidence -= 50; // Severe penalty for excluded keywords
      }
    }
  }

  // Helper function to get keyword weight
  const getKeywordWeight = (keyword: string): number => {
    if (category.keywordWeights?.primary?.includes(keyword)) return 30;
    if (category.keywordWeights?.secondary?.includes(keyword)) return 20;
    if (category.keywordWeights?.contextual?.includes(keyword)) return 10;
    return 15; // default weight
  };

  // Check keyword matches with different weights based on location
  for (const keyword of category.keywords) {
    const keywordLower = keyword.toLowerCase();
    const baseWeight = getKeywordWeight(keyword);
    
    // Name matches (highest priority) - 80-100 points
    if (productName.includes(keywordLower)) {
      nameMatches.push(keyword);
      matchedKeywords.push(keyword);
      
      // Exact phrase match in name gets maximum score
      if (productName === keywordLower || productName.includes(` ${keywordLower} `)) {
        confidence += baseWeight * 3; // 90 points for primary keywords
      } else {
        confidence += baseWeight * 2.5; // 75 points for primary keywords
      }
    }
    // Short description matches (medium priority) - 40-70 points
    else if (shortDescription.includes(keywordLower)) {
      descriptionMatches.push(keyword);
      matchedKeywords.push(keyword);
      confidence += baseWeight * 1.5; // 45 points for primary keywords
    }
    // Full description matches (lower priority) - 20-50 points
    else if (fullDescription.includes(keywordLower)) {
      descriptionMatches.push(keyword);
      matchedKeywords.push(keyword);
      confidence += baseWeight; // 30 points for primary keywords
    }
  }

  // Bonus for strict keywords - these are required for high confidence
  if (category.strictKeywords) {
    let strictMatches = 0;
    let strictNameMatches = 0;
    
    for (const strictKeyword of category.strictKeywords) {
      const strictLower = strictKeyword.toLowerCase();
      
      // Check for name matches first (highest priority)
      if (productName.includes(strictLower)) {
        strictNameMatches++;
        strictMatches++;
      }
      // Then check descriptions
      else if (shortDescription.includes(strictLower) || 
               fullDescription.includes(strictLower)) {
        strictMatches++;
      }
    }
    
    // MASSIVE bonus for strict keywords in product name - ensures they rank first
    if (strictNameMatches > 0) {
      confidence += strictNameMatches * 50; // 50 bonus points per strict name match
    }
    
    // Regular bonus for strict keyword matches in descriptions
    if (strictMatches > strictNameMatches) {
      confidence += (strictMatches - strictNameMatches) * 15; // 15 points for description matches
    }
    
    // Penalty if no strict keywords found anywhere
    if (strictMatches === 0 && category.strictKeywords.length > 0) {
      confidence -= 20;
    }
  }

  // Product type matching (10-30 points)
  const typeMatch = category.productTypes.some(
    (type) => productTypeUpper === type
  );
  
  if (typeMatch) {
    confidence += 25;
  }

  // Bonus for multiple keyword matches
  if (matchedKeywords.length > 1) {
    confidence += Math.min(matchedKeywords.length * 5, 20); // Up to 20 bonus points
  }

  // Apply minimum confidence threshold
  const minConfidence = category.minimumConfidence || 0;
  if (confidence < minConfidence) {
    confidence = 0;
  }

  // Name-match requirement for high confidence scores
  // Products must have strict keywords in name to get >80 confidence
  if (confidence > 80 && category.strictKeywords) {
    const hasStrictNameMatch = category.strictKeywords.some(strictKeyword => 
      productName.includes(strictKeyword.toLowerCase())
    );
    
    if (!hasStrictNameMatch) {
      // Cap confidence at 80 for products without name matches
      confidence = Math.min(confidence, 80);
    }
  }

  // Cap confidence at 100
  confidence = Math.min(confidence, 100);
  
  // Return 0 for negative confidence
  return Math.max(confidence, 0);
}

/**
 * Get detailed category match information including confidence score
 * @param product - The product to analyze  
 * @param categoryId - The category ID to match against
 * @returns Detailed match information or null if no match
 */
export function getCategoryMatch(
  product: RezdyProduct,
  categoryId: string
): CategoryMatch | null {
  const confidence = getCategoryMatchConfidence(product, categoryId);
  
  if (confidence === 0) return null;

  const category = CATEGORY_DEFINITIONS[categoryId];
  const productName = (product.name || "").toLowerCase();
  const shortDescription = (product.shortDescription || "").toLowerCase();
  const fullDescription = (product.description || "").toLowerCase();
  const productTypeUpper = product.productType?.toUpperCase() || "";

  const matchedKeywords: string[] = [];
  const nameMatches: string[] = [];
  const descriptionMatches: string[] = [];

  // Collect matched keywords for debugging
  for (const keyword of category.keywords) {
    const keywordLower = keyword.toLowerCase();
    
    if (productName.includes(keywordLower)) {
      nameMatches.push(keyword);
      matchedKeywords.push(keyword);
    } else if (shortDescription.includes(keywordLower) || fullDescription.includes(keywordLower)) {
      descriptionMatches.push(keyword);
      matchedKeywords.push(keyword);
    }
  }

  const typeMatch = category.productTypes.some(
    (type) => productTypeUpper === type
  );

  return {
    categoryId,
    confidence,
    matchedKeywords,
    matchSources: {
      nameMatches,
      descriptionMatches,
      typeMatch
    }
  };
}

/**
 * Check if a product matches a specific category using validated filtering logic
 * (Backward compatibility wrapper around confidence-based matching)
 */
export function matchesCategory(
  product: RezdyProduct,
  categoryId: string
): boolean {
  // Use confidence-based matching with a default threshold
  const confidence = getCategoryMatchConfidence(product, categoryId);
  return confidence > 0;
}

/**
 * Enhanced product with confidence score for sorting
 */
export interface ProductWithConfidence extends RezdyProduct {
  categoryConfidence?: number;
  categoryMatch?: CategoryMatch;
}

/**
 * Filter products by category using confidence-based matching
 * @param products - Array of products to filter
 * @param categoryId - Category ID to filter by
 * @param minConfidence - Minimum confidence threshold (default: 0)
 * @param includeConfidence - Whether to include confidence scores in results
 * @returns Filtered products, optionally with confidence scores
 */
export function filterProductsByCategoryWithConfidence(
  products: RezdyProduct[],
  categoryId: string,
  minConfidence: number = 0,
  includeConfidence: boolean = false
): ProductWithConfidence[] {
  if (categoryId === "all") {
    return includeConfidence 
      ? products.map(product => ({ ...product, categoryConfidence: 0 }))
      : products;
  }

  const category = CATEGORY_DEFINITIONS[categoryId];
  if (!category) return [];

  // Use category's minimum confidence if specified
  const threshold = Math.max(minConfidence, category.minimumConfidence || 0);

  return products
    .map((product) => {
      const confidence = getCategoryMatchConfidence(product, categoryId);
      const match = confidence > 0 ? getCategoryMatch(product, categoryId) : null;
      
      if (confidence >= threshold) {
        const enhancedProduct: ProductWithConfidence = { ...product };
        if (includeConfidence) {
          enhancedProduct.categoryConfidence = confidence;
          enhancedProduct.categoryMatch = match || undefined;
        }
        return enhancedProduct;
      }
      return null;
    })
    .filter((product): product is ProductWithConfidence => product !== null)
    .sort((a, b) => {
      // Sort by confidence score descending, then by name
      if (includeConfidence && a.categoryConfidence && b.categoryConfidence) {
        const confidenceDiff = b.categoryConfidence - a.categoryConfidence;
        if (confidenceDiff !== 0) return confidenceDiff;
      }
      return a.name.localeCompare(b.name);
    });
}

/**
 * Filter products by category using validated filtering logic
 * (Backward compatibility wrapper)
 */
export function filterProductsByCategory(
  products: RezdyProduct[],
  categoryId: string
): RezdyProduct[] {
  return filterProductsByCategoryWithConfidence(products, categoryId, 0, false);
}

/**
 * Get all category matches for a product with confidence scores
 * @param product - Product to analyze
 * @param minConfidence - Minimum confidence to include (default: 20)
 * @returns Array of category matches sorted by confidence
 */
export function getAllCategoryMatches(
  product: RezdyProduct,
  minConfidence: number = 20
): CategoryMatch[] {
  const matches: CategoryMatch[] = [];
  
  for (const categoryId of Object.keys(CATEGORY_DEFINITIONS)) {
    const match = getCategoryMatch(product, categoryId);
    if (match && match.confidence >= minConfidence) {
      matches.push(match);
    }
  }
  
  // Sort by confidence descending
  return matches.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get the best category match for a product
 * @param product - Product to analyze
 * @param minConfidence - Minimum confidence required (default: 30)
 * @returns Best category match or null if none meet threshold
 */
export function getBestCategoryMatch(
  product: RezdyProduct,
  minConfidence: number = 30
): CategoryMatch | null {
  const matches = getAllCategoryMatches(product, minConfidence);
  return matches.length > 0 ? matches[0] : null;
}

/**
 * Analyze category matching performance for debugging
 * @param products - Products to analyze
 * @param minConfidence - Minimum confidence to consider a match
 * @returns Analysis report
 */
export function analyzeCategoryMatching(
  products: RezdyProduct[],
  minConfidence: number = 20
): {
  totalProducts: number;
  categorizedProducts: number;
  uncategorizedProducts: number;
  categoryDistribution: Record<string, number>;
  averageConfidence: Record<string, number>;
  lowConfidenceMatches: Array<{
    product: string;
    category: string;
    confidence: number;
  }>;
  multipleMatches: Array<{
    product: string;
    matches: CategoryMatch[];
  }>;
} {
  const totalProducts = products.length;
  let categorizedCount = 0;
  const categoryDistribution: Record<string, number> = {};
  const confidenceSum: Record<string, number> = {};
  const confidenceCount: Record<string, number> = {};
  const lowConfidenceMatches: Array<{
    product: string;
    category: string;
    confidence: number;
  }> = [];
  const multipleMatches: Array<{
    product: string;
    matches: CategoryMatch[];
  }> = [];

  // Initialize counters
  for (const categoryId of Object.keys(CATEGORY_DEFINITIONS)) {
    categoryDistribution[categoryId] = 0;
    confidenceSum[categoryId] = 0;
    confidenceCount[categoryId] = 0;
  }

  products.forEach((product) => {
    const matches = getAllCategoryMatches(product, minConfidence);
    
    if (matches.length > 0) {
      categorizedCount++;
      
      // Track multiple matches
      if (matches.length > 1) {
        multipleMatches.push({
          product: product.name,
          matches
        });
      }

      matches.forEach((match) => {
        categoryDistribution[match.categoryId]++;
        confidenceSum[match.categoryId] += match.confidence;
        confidenceCount[match.categoryId]++;

        // Track low confidence matches
        if (match.confidence < 50) {
          lowConfidenceMatches.push({
            product: product.name,
            category: match.categoryId,
            confidence: match.confidence
          });
        }
      });
    }
  });

  // Calculate average confidence
  const averageConfidence: Record<string, number> = {};
  for (const categoryId of Object.keys(CATEGORY_DEFINITIONS)) {
    averageConfidence[categoryId] = 
      confidenceCount[categoryId] > 0 
        ? confidenceSum[categoryId] / confidenceCount[categoryId]
        : 0;
  }

  return {
    totalProducts,
    categorizedProducts: categorizedCount,
    uncategorizedProducts: totalProducts - categorizedCount,
    categoryDistribution,
    averageConfidence,
    lowConfidenceMatches: lowConfidenceMatches.sort((a, b) => a.confidence - b.confidence),
    multipleMatches
  };
}

/**
 * Debug function to log detailed category matching for a specific product
 * @param product - Product to debug
 * @param categoryId - Optional specific category to test
 */
export function debugCategoryMatching(
  product: RezdyProduct,
  categoryId?: string
): void {
  console.group(`🔍 Category Matching Debug: ${product.name}`);
  
  if (categoryId) {
    // Debug specific category
    const match = getCategoryMatch(product, categoryId);
    const confidence = getCategoryMatchConfidence(product, categoryId);
    
    console.log(`Category: ${categoryId}`);
    console.log(`Confidence: ${confidence}`);
    console.log(`Match:`, match);
  } else {
    // Debug all categories
    const allMatches = getAllCategoryMatches(product, 0);
    
    console.log(`Product Type: ${product.productType}`);
    console.log(`Name: ${product.name}`);
    console.log(`Short Description: ${product.shortDescription || 'N/A'}`);
    console.log(`\nAll Category Matches (${allMatches.length}):`);
    
    allMatches.forEach((match) => {
      console.log(`  ${match.categoryId}: ${match.confidence}% confidence`);
      console.log(`    Name matches: [${match.matchSources.nameMatches.join(', ')}]`);
      console.log(`    Description matches: [${match.matchSources.descriptionMatches.join(', ')}]`);
      console.log(`    Type match: ${match.matchSources.typeMatch}`);
    });
    
    if (allMatches.length === 0) {
      console.log('  No category matches found');
    }
  }
  
  console.groupEnd();
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
    "hens-party",
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
