import { RezdyProduct } from '@/lib/types/rezdy'

// Comprehensive category definitions based on Rezdy Data Management Strategies
export interface CategoryDefinition {
  id: string
  title: string
  keywords: string[]
  productTypes: string[]
}

// Comprehensive categories mapping
export const CATEGORY_DEFINITIONS: Record<string, CategoryDefinition> = {
  adventure: {
    id: 'adventure',
    title: 'Adventure Tours',
    keywords: ['adventure', 'outdoor', 'hiking', 'climbing', 'extreme', 'thrill', 'adrenaline', 'diving', 'expedition', 'active', 'sport'],
    productTypes: ['ADVENTURE', 'OUTDOOR', 'EXTREME', 'HIKING', 'CLIMBING', 'DIVING', 'EXPEDITION']
  },
  cultural: {
    id: 'cultural',
    title: 'Cultural Tours',
    keywords: ['cultural', 'heritage', 'history', 'museum', 'traditional', 'local', 'art', 'architecture', 'historic', 'culture'],
    productTypes: ['CULTURAL', 'HERITAGE', 'HISTORICAL', 'MUSEUM', 'TRADITIONAL', 'ART']
  },
  'food-wine': {
    id: 'food-wine',
    title: 'Food & Wine Tours',
    keywords: ['food', 'wine', 'culinary', 'tasting', 'gastronomy', 'dining', 'restaurant', 'cooking', 'chef', 'cuisine', 'gourmet'],
    productTypes: ['FOOD', 'WINE', 'CULINARY', 'TASTING', 'GASTRONOMY', 'DINING']
  },
  nature: {
    id: 'nature',
    title: 'Nature Tours',
    keywords: ['nature', 'wildlife', 'eco', 'scenic', 'park', 'forest', 'beach', 'mountain', 'lake', 'bird', 'animal', 'environment'],
    productTypes: ['NATURE', 'WILDLIFE', 'ECO', 'SCENIC', 'NATIONAL_PARK', 'FOREST', 'BEACH']
  },
  urban: {
    id: 'urban',
    title: 'Urban Tours',
    keywords: ['city', 'urban', 'walking', 'sightseeing', 'downtown', 'neighborhood', 'street', 'architecture', 'skyline', 'metro'],
    productTypes: ['CITY', 'URBAN', 'WALKING', 'SIGHTSEEING', 'NEIGHBORHOOD', 'DOWNTOWN']
  },
  family: {
    id: 'family',
    title: 'Family Tours',
    keywords: ['family', 'kids', 'children', 'child', 'all ages', 'family-friendly', 'suitable for children', 'parents', 'generations'],
    productTypes: ['FAMILY', 'KIDS', 'CHILDREN', 'ALL_AGES']
  },
  romantic: {
    id: 'romantic',
    title: 'Romantic Tours',
    keywords: ['romantic', 'honeymoon', 'couples', 'romance', 'intimate', 'private', 'sunset', 'luxury', 'special occasion'],
    productTypes: ['ROMANTIC', 'HONEYMOON', 'COUPLES', 'INTIMATE', 'PRIVATE']
  },
  luxury: {
    id: 'luxury',
    title: 'Luxury Tours',
    keywords: ['luxury', 'premium', 'exclusive', 'vip', 'high-end', 'deluxe', 'first-class', 'upscale', 'elite'],
    productTypes: ['LUXURY', 'PREMIUM', 'EXCLUSIVE', 'VIP', 'HIGH_END']
  },
  photography: {
    id: 'photography',
    title: 'Photography Tours',
    keywords: ['photography', 'photo', 'camera', 'scenic', 'capture', 'instagram', 'photogenic', 'landscape', 'portrait'],
    productTypes: ['PHOTOGRAPHY', 'PHOTO', 'CAMERA', 'SCENIC', 'WORKSHOP']
  },
  'water-activities': {
    id: 'water-activities',
    title: 'Water Activities',
    keywords: ['water', 'marine', 'boat', 'cruise', 'sailing', 'diving', 'snorkeling', 'ocean', 'sea', 'lake', 'river', 'beach'],
    productTypes: ['WATER', 'MARINE', 'BOAT', 'CRUISE', 'SAILING', 'DIVING', 'SNORKELING']
  },
  workshops: {
    id: 'workshops',
    title: 'Workshops',
    keywords: ['workshop', 'hands-on', 'craft', 'skill', 'learning', 'class', 'tutorial', 'diy', 'make', 'create'],
    productTypes: ['WORKSHOP', 'HANDS_ON', 'CRAFT', 'SKILL', 'LEARNING', 'DIY']
  },
  classes: {
    id: 'classes',
    title: 'Classes',
    keywords: ['class', 'lesson', 'course', 'educational', 'instruction', 'learn', 'teach', 'training', 'school', 'academy'],
    productTypes: ['CLASS', 'LESSON', 'COURSE', 'EDUCATIONAL', 'INSTRUCTION', 'TRAINING']
  },
  tastings: {
    id: 'tastings',
    title: 'Tastings',
    keywords: ['tasting', 'sampling', 'degustation', 'pairing', 'flavor', 'vintage', 'sommelier', 'cellar', 'vineyard'],
    productTypes: ['TASTING', 'SAMPLING', 'DEGUSTATION', 'PAIRING', 'WINE_TASTING']
  },
  transfers: {
    id: 'transfers',
    title: 'Transfers',
    keywords: ['transfer', 'transport', 'shuttle', 'airport', 'pickup', 'dropoff', 'ride', 'taxi', 'private car'],
    productTypes: ['TRANSFER', 'TRANSPORT', 'TRANSPORTATION', 'SHUTTLE', 'PICKUP']
  },
  'day-trips': {
    id: 'day-trips',
    title: 'Day Trips',
    keywords: ['day trip', 'excursion', 'day tour', 'full day', 'round trip', 'guided', 'all day', 'return'],
    productTypes: ['DAY_TRIP', 'EXCURSION', 'DAY_TOUR', 'FULL_DAY', 'ROUND_TRIP']
  },
  'multiday-tours': {
    id: 'multiday-tours',
    title: 'Multi-day Tours',
    keywords: ['multiday', 'multi-day', 'package', 'extended', 'overnight', 'itinerary', 'multiple days', 'tour package'],
    productTypes: ['MULTIDAY_TOUR', 'MULTI_DAY_TOUR', 'MULTIDAYTOUR', 'PACKAGE', 'EXTENDED']
  },
  'airport-services': {
    id: 'airport-services',
    title: 'Airport Services',
    keywords: ['airport', 'arrival', 'departure', 'connection', 'layover', 'terminal', 'flight', 'check-in'],
    productTypes: ['AIRPORT', 'ARRIVAL', 'DEPARTURE', 'CONNECTION', 'LAYOVER']
  },
  // Legacy support
  honeymoon: {
    id: 'honeymoon',
    title: 'Honeymoon',
    keywords: ['romantic', 'honeymoon', 'couples', 'romance', 'intimate', 'private', 'sunset', 'luxury'],
    productTypes: ['ROMANTIC', 'HONEYMOON', 'COUPLES', 'INTIMATE', 'PRIVATE']
  }
}

/**
 * Check if a product matches a specific category
 */
export function matchesCategory(product: RezdyProduct, categoryId: string): boolean {
  const category = CATEGORY_DEFINITIONS[categoryId]
  if (!category) return false

  const searchText = `${product.name} ${product.shortDescription || ''} ${product.description || ''} ${product.categories?.join(' ') || ''}`.toLowerCase()
  const productTypeUpper = product.productType?.toUpperCase() || ''

  // Check keyword match
  const keywordMatch = category.keywords.some(keyword => searchText.includes(keyword))
  
  // Check product type match
  const productTypeMatch = category.productTypes.some(type => productTypeUpper.includes(type))

  return keywordMatch || productTypeMatch
}

/**
 * Filter products by category
 */
export function filterProductsByCategory(products: RezdyProduct[], categoryId: string): RezdyProduct[] {
  if (categoryId === 'all') return products
  
  return products.filter(product => matchesCategory(product, categoryId))
}

/**
 * Get all available categories
 */
export function getAllCategories(): CategoryDefinition[] {
  return Object.values(CATEGORY_DEFINITIONS).filter(cat => cat.id !== 'honeymoon') // Exclude legacy
}

/**
 * Get category by ID
 */
export function getCategoryById(categoryId: string): CategoryDefinition | undefined {
  return CATEGORY_DEFINITIONS[categoryId]
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(categoryId: string): string {
  const category = CATEGORY_DEFINITIONS[categoryId]
  return category?.title || categoryId
}

/**
 * Categorize products into groups
 */
export function categorizeProducts(products: RezdyProduct[]): Record<string, RezdyProduct[]> {
  const categorized: Record<string, RezdyProduct[]> = {}
  
  // Initialize all categories
  Object.keys(CATEGORY_DEFINITIONS).forEach(categoryId => {
    categorized[categoryId] = []
  })
  
  // Categorize each product
  products.forEach(product => {
    Object.keys(CATEGORY_DEFINITIONS).forEach(categoryId => {
      if (matchesCategory(product, categoryId)) {
        categorized[categoryId].push(product)
      }
    })
  })
  
  return categorized
}

/**
 * Get product counts by category
 */
export function getProductCountsByCategory(products: RezdyProduct[]): Record<string, number> {
  const counts: Record<string, number> = {}
  
  Object.keys(CATEGORY_DEFINITIONS).forEach(categoryId => {
    counts[categoryId] = filterProductsByCategory(products, categoryId).length
  })
  
  return counts
} 