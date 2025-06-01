// Comprehensive tour categories based on the Rezdy Data Management Strategies
export interface TourCategory {
  id: string
  title: string
  description: string
  icon?: any
  productTypes: string[]
  keywords: string[]
  image?: string
  slug: string
  tourCount?: number
  categoryGroup: 'tours' | 'experiences' | 'transportation'
}

// Comprehensive categories based on ProductCategories interface from Rezdy Data Management Strategies
export const TOUR_CATEGORIES: Omit<TourCategory, 'tourCount' | 'icon' | 'image'>[] = [
  // Tours Category Group - Adventure Tours
  {
    id: 'adventure',
    title: 'Adventure Tours',
    description: 'Thrilling outdoor adventures and adrenaline-pumping experiences',
    productTypes: ['ADVENTURE', 'OUTDOOR', 'EXTREME', 'HIKING', 'CLIMBING', 'DIVING', 'EXPEDITION'],
    keywords: ['adventure', 'outdoor', 'hiking', 'climbing', 'extreme', 'thrill', 'adrenaline', 'diving', 'expedition', 'active', 'sport'],
    slug: 'adventure',
    categoryGroup: 'tours'
  },
  
  // Tours Category Group - Cultural Tours
  {
    id: 'cultural',
    title: 'Cultural Tours',
    description: 'Immerse yourself in local culture, history, and traditions',
    productTypes: ['CULTURAL', 'HERITAGE', 'HISTORICAL', 'MUSEUM', 'TRADITIONAL', 'ART'],
    keywords: ['cultural', 'heritage', 'history', 'museum', 'traditional', 'local', 'art', 'architecture', 'historic', 'culture'],
    slug: 'cultural',
    categoryGroup: 'tours'
  },
  
  // Tours Category Group - Food & Wine Tours
  {
    id: 'food-wine',
    title: 'Food & Wine Tours',
    description: 'Culinary adventures and wine tasting experiences',
    productTypes: ['FOOD', 'WINE', 'CULINARY', 'TASTING', 'GASTRONOMY', 'DINING'],
    keywords: ['food', 'wine', 'culinary', 'tasting', 'gastronomy', 'dining', 'restaurant', 'cooking', 'chef', 'cuisine', 'gourmet'],
    slug: 'food-wine',
    categoryGroup: 'tours'
  },
  
  // Tours Category Group - Nature Tours
  {
    id: 'nature',
    title: 'Nature Tours',
    description: 'Explore natural wonders, wildlife, and scenic landscapes',
    productTypes: ['NATURE', 'WILDLIFE', 'ECO', 'SCENIC', 'NATIONAL_PARK', 'FOREST', 'BEACH'],
    keywords: ['nature', 'wildlife', 'eco', 'scenic', 'park', 'forest', 'beach', 'mountain', 'lake', 'bird', 'animal', 'environment'],
    slug: 'nature',
    categoryGroup: 'tours'
  },
  
  // Tours Category Group - Urban Tours
  {
    id: 'urban',
    title: 'Urban Tours',
    description: 'Discover city highlights, neighborhoods, and urban culture',
    productTypes: ['CITY', 'URBAN', 'WALKING', 'SIGHTSEEING', 'NEIGHBORHOOD', 'DOWNTOWN'],
    keywords: ['city', 'urban', 'walking', 'sightseeing', 'downtown', 'neighborhood', 'street', 'architecture', 'skyline', 'metro'],
    slug: 'urban',
    categoryGroup: 'tours'
  },

  // Tours Category Group - Family Tours
  {
    id: 'family',
    title: 'Family Tours',
    description: 'Family-friendly adventures suitable for all ages',
    productTypes: ['FAMILY', 'KIDS', 'CHILDREN', 'ALL_AGES'],
    keywords: ['family', 'kids', 'children', 'child', 'all ages', 'family-friendly', 'suitable for children', 'parents', 'generations'],
    slug: 'family',
    categoryGroup: 'tours'
  },

  // Tours Category Group - Romantic Tours
  {
    id: 'romantic',
    title: 'Romantic Tours',
    description: 'Intimate experiences perfect for couples and honeymoons',
    productTypes: ['ROMANTIC', 'HONEYMOON', 'COUPLES', 'INTIMATE', 'PRIVATE'],
    keywords: ['romantic', 'honeymoon', 'couples', 'romance', 'intimate', 'private', 'sunset', 'luxury', 'special occasion'],
    slug: 'romantic',
    categoryGroup: 'tours'
  },

  // Tours Category Group - Luxury Tours
  {
    id: 'luxury',
    title: 'Luxury Tours',
    description: 'Premium experiences with exclusive access and high-end service',
    productTypes: ['LUXURY', 'PREMIUM', 'EXCLUSIVE', 'VIP', 'HIGH_END'],
    keywords: ['luxury', 'premium', 'exclusive', 'vip', 'high-end', 'deluxe', 'first-class', 'upscale', 'elite'],
    slug: 'luxury',
    categoryGroup: 'tours'
  },

  // Tours Category Group - Photography Tours
  {
    id: 'photography',
    title: 'Photography Tours',
    description: 'Capture stunning moments with guided photography experiences',
    productTypes: ['PHOTOGRAPHY', 'PHOTO', 'CAMERA', 'SCENIC', 'WORKSHOP'],
    keywords: ['photography', 'photo', 'camera', 'scenic', 'capture', 'instagram', 'photogenic', 'landscape', 'portrait'],
    slug: 'photography',
    categoryGroup: 'tours'
  },

  // Tours Category Group - Water Activities
  {
    id: 'water-activities',
    title: 'Water Activities',
    description: 'Ocean, lake, and river adventures and water sports',
    productTypes: ['WATER', 'MARINE', 'BOAT', 'CRUISE', 'SAILING', 'DIVING', 'SNORKELING'],
    keywords: ['water', 'marine', 'boat', 'cruise', 'sailing', 'diving', 'snorkeling', 'ocean', 'sea', 'lake', 'river', 'beach'],
    slug: 'water-activities',
    categoryGroup: 'tours'
  },
  
  // Experiences Category Group - Workshops
  {
    id: 'workshops',
    title: 'Workshops',
    description: 'Hands-on learning experiences and skill-building activities',
    productTypes: ['WORKSHOP', 'HANDS_ON', 'CRAFT', 'SKILL', 'LEARNING', 'DIY'],
    keywords: ['workshop', 'hands-on', 'craft', 'skill', 'learning', 'class', 'tutorial', 'diy', 'make', 'create'],
    slug: 'workshops',
    categoryGroup: 'experiences'
  },
  
  // Experiences Category Group - Classes
  {
    id: 'classes',
    title: 'Classes',
    description: 'Educational classes and instructional experiences',
    productTypes: ['CLASS', 'LESSON', 'COURSE', 'EDUCATIONAL', 'INSTRUCTION', 'TRAINING'],
    keywords: ['class', 'lesson', 'course', 'educational', 'instruction', 'learn', 'teach', 'training', 'school', 'academy'],
    slug: 'classes',
    categoryGroup: 'experiences'
  },
  
  // Experiences Category Group - Tastings
  {
    id: 'tastings',
    title: 'Tastings',
    description: 'Specialized tasting experiences for food, wine, and beverages',
    productTypes: ['TASTING', 'SAMPLING', 'DEGUSTATION', 'PAIRING', 'WINE_TASTING'],
    keywords: ['tasting', 'sampling', 'degustation', 'pairing', 'flavor', 'vintage', 'sommelier', 'cellar', 'vineyard'],
    slug: 'tastings',
    categoryGroup: 'experiences'
  },
  
  // Transportation Category Group - Transfers
  {
    id: 'transfers',
    title: 'Transfers',
    description: 'Airport transfers and point-to-point transportation',
    productTypes: ['TRANSFER', 'TRANSPORT', 'TRANSPORTATION', 'SHUTTLE', 'PICKUP'],
    keywords: ['transfer', 'transport', 'shuttle', 'airport', 'pickup', 'dropoff', 'ride', 'taxi', 'private car'],
    slug: 'transfers',
    categoryGroup: 'transportation'
  },
  
  // Transportation Category Group - Day Trips
  {
    id: 'day-trips',
    title: 'Day Trips',
    description: 'Full-day excursions with transportation included',
    productTypes: ['DAY_TRIP', 'EXCURSION', 'DAY_TOUR', 'FULL_DAY', 'ROUND_TRIP'],
    keywords: ['day trip', 'excursion', 'day tour', 'full day', 'round trip', 'guided', 'all day', 'return'],
    slug: 'day-trips',
    categoryGroup: 'transportation'
  },
  
  // Transportation Category Group - Multi-day Tours
  {
    id: 'multiday-tours',
    title: 'Multi-day Tours',
    description: 'Extended adventures spanning multiple days',
    productTypes: ['MULTIDAY_TOUR', 'MULTI_DAY_TOUR', 'MULTIDAYTOUR', 'PACKAGE', 'EXTENDED'],
    keywords: ['multiday', 'multi-day', 'package', 'extended', 'overnight', 'itinerary', 'multiple days', 'tour package'],
    slug: 'multiday-tours',
    categoryGroup: 'transportation'
  },

  // Transportation Category Group - Airport Services
  {
    id: 'airport-services',
    title: 'Airport Services',
    description: 'Airport-related services and connections',
    productTypes: ['AIRPORT', 'ARRIVAL', 'DEPARTURE', 'CONNECTION', 'LAYOVER'],
    keywords: ['airport', 'arrival', 'departure', 'connection', 'layover', 'terminal', 'flight', 'check-in'],
    slug: 'airport-services',
    categoryGroup: 'transportation'
  }
]

// Helper function to filter products by category
export function filterProductsByCategory(products: any[], category: Omit<TourCategory, 'tourCount' | 'icon' | 'image'>) {
  return products.filter(product => {
    const searchText = `${product.name} ${product.shortDescription || ''} ${product.description || ''} ${product.categories?.join(' ') || ''}`.toLowerCase()
    const productTypeUpper = product.productType?.toUpperCase() || ''
    
    // Check if any keywords match
    const keywordMatch = category.keywords.some(keyword => 
      searchText.includes(keyword.toLowerCase())
    )
    
    // Check if product type matches
    const productTypeMatch = category.productTypes.some(type => 
      productTypeUpper.includes(type)
    )
    
    return keywordMatch || productTypeMatch
  })
}

export function getCategoryBySlug(slug: string) {
  return TOUR_CATEGORIES.find(category => category.slug === slug)
}

// Legacy category mapping for backward compatibility
export const LEGACY_CATEGORY_MAPPING: Record<string, string> = {
  "honeymoon": "romantic",
  "urban": "cultural",
  "workshops": "cultural",
  "classes": "cultural",
  "tastings": "food-wine",
  "transfers": "transportation",
  "day-trips": "transportation",
  "multiday-tours": "transportation",
  "airport-services": "transportation"
};

// Helper function to get category by ID
export function getCategoryById(id: string): Omit<TourCategory, 'tourCount' | 'icon' | 'image'> | undefined {
  return TOUR_CATEGORIES.find(category => category.id === id);
}

// Helper function to get all category IDs
export function getAllCategoryIds(): string[] {
  return TOUR_CATEGORIES.map(category => category.id);
}

// Helper function to get category display name
export function getCategoryDisplayName(id: string): string {
  const category = getCategoryById(id);
  return category?.title || id;
}

// Helper function to check if a product matches a category
export function doesProductMatchCategory(
  product: any,
  categoryId: string
): boolean {
  // Handle legacy category mapping
  const actualCategoryId = LEGACY_CATEGORY_MAPPING[categoryId] || categoryId;
  const category = getCategoryById(actualCategoryId);
  
  if (!category) return false;

  const searchText = `${product.name || ''} ${product.shortDescription || ''} ${product.description || ''} ${product.categories?.join(' ') || ''}`.toLowerCase();
  const productTypeUpper = product.productType?.toUpperCase() || '';

  // Check if any keywords match
  const keywordMatch = category.keywords.some(keyword => 
    searchText.includes(keyword.toLowerCase())
  );

  // Check if product type matches
  const productTypeMatch = category.productTypes.some(type => 
    productTypeUpper.includes(type)
  );

  return keywordMatch || productTypeMatch;
}

// Get main tour categories (excluding experiences and transportation subcategories)
export function getMainTourCategories(): Omit<TourCategory, 'tourCount' | 'icon' | 'image'>[] {
  return TOUR_CATEGORIES.filter(category => category.categoryGroup === 'tours');
}

// Get all categories for search dropdown (including main categories and some key subcategories)
export function getSearchCategories(): Omit<TourCategory, 'tourCount' | 'icon' | 'image'>[] {
  return TOUR_CATEGORIES.filter(category => 
    category.categoryGroup === 'tours' || 
    ['transfers', 'day-trips', 'multiday-tours'].includes(category.id)
  );
} 