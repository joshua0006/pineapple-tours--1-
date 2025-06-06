// Comprehensive tour categories based on actual Rezdy data analysis
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

// Categories based on actual Rezdy product data analysis - validated to work with real data
export const TOUR_CATEGORIES: Omit<TourCategory, 'tourCount' | 'icon' | 'image'>[] = [
  // Winery Tours - 46 products (46%) - VALIDATED
  {
    id: 'winery-tours',
    title: 'Winery Tours',
    description: 'Wine tasting experiences at local wineries and vineyards',
    productTypes: ['DAYTOUR', 'PRIVATE_TOUR', 'GIFT_CARD', 'CUSTOM'],
    keywords: ['winery', 'wine', 'vineyard', 'cellar', 'vintage', 'wine tasting', 'wine tour'],
    slug: 'winery-tours',
    categoryGroup: 'tours'
  },

  // Brewery Tours - 32 products (32%) - VALIDATED
  {
    id: 'brewery-tours',
    title: 'Brewery Tours',
    description: 'Craft beer experiences and brewery visits',
    productTypes: ['DAYTOUR', 'PRIVATE_TOUR', 'CUSTOM'],
    keywords: ['brewery', 'beer', 'craft beer', 'brewing', 'ale', 'lager', 'beer tasting', 'brewery tour'],
    slug: 'brewery-tours',
    categoryGroup: 'tours'
  },

  // Hop-On Hop-Off - 34 products (34%) - VALIDATED
  {
    id: 'hop-on-hop-off',
    title: 'Hop-On Hop-Off',
    description: 'Flexible sightseeing with hop-on hop-off bus services',
    productTypes: ['CUSTOM', 'TRANSFER', 'ACTIVITY'],
    keywords: ['hop-on', 'hop off', 'hop on hop off', 'sightseeing bus', 'city tour bus', 'tourist bus'],
    slug: 'hop-on-hop-off',
    categoryGroup: 'transportation'
  },

  // Bus Charter - 22 products (22%) - VALIDATED
  {
    id: 'bus-charter',
    title: 'Bus Charter',
    description: 'Private bus and coach charter services for groups',
    productTypes: ['CHARTER', 'CUSTOM'],
    keywords: ['bus charter', 'charter bus', 'private bus', 'group transport', 'coach charter'],
    slug: 'bus-charter',
    categoryGroup: 'transportation'
  },

  // Day Tours - 18 products (18%) - VALIDATED
  {
    id: 'day-tours',
    title: 'Day Tours',
    description: 'Full-day guided tours and excursions',
    productTypes: ['DAYTOUR', 'GIFT_CARD'],
    keywords: ['day tour', 'full day', 'day trip', 'day excursion', 'all day', 'daily tour'],
    slug: 'day-tours',
    categoryGroup: 'tours'
  },

  // Corporate Tours - 20 products (20%) - VALIDATED
  {
    id: 'corporate-tours',
    title: 'Corporate Tours',
    description: 'Business events, team building, and corporate experiences',
    productTypes: ['DAYTOUR', 'CHARTER', 'CUSTOM'],
    keywords: ['corporate', 'business', 'team building', 'company', 'corporate event', 'business tour'],
    slug: 'corporate-tours',
    categoryGroup: 'experiences'
  },

  // Barefoot Luxury - 34 products (34%) - VALIDATED
  {
    id: 'barefoot-luxury',
    title: 'Barefoot Luxury',
    description: 'Premium and luxury experiences with exclusive service',
    productTypes: ['DAYTOUR', 'PRIVATE_TOUR', 'GIFT_CARD'],
    keywords: ['barefoot luxury', 'luxury', 'premium', 'exclusive', 'vip', 'high-end', 'upscale'],
    slug: 'barefoot-luxury',
    categoryGroup: 'tours'
  },

  // Hens Party - Special celebrations for brides-to-be
  {
    id: 'hens-party',
    title: 'Hens Party',
    description: 'Special celebrations for brides-to-be and their friends',
    productTypes: ['DAYTOUR', 'PRIVATE_TOUR', 'CUSTOM'],
    keywords: ['hens party', 'hen party', 'bachelorette', 'bridal party', 'girls night', 'ladies night', 'celebration'],
    slug: 'hens-party',
    categoryGroup: 'experiences'
  },

  // Additional categories based on actual Rezdy product types found
  
  // Activities - Based on ACTIVITY product type
  {
    id: 'activities',
    title: 'Activities',
    description: 'Various activities and experiences',
    productTypes: ['ACTIVITY'],
    keywords: ['activity', 'experience', 'adventure', 'fun', 'entertainment'],
    slug: 'activities',
    categoryGroup: 'experiences'
  },

  // Private Tours - Based on PRIVATE_TOUR product type
  {
    id: 'private-tours',
    title: 'Private Tours',
    description: 'Exclusive private guided tours and experiences',
    productTypes: ['PRIVATE_TOUR'],
    keywords: ['private', 'exclusive', 'personal', 'intimate', 'customized'],
    slug: 'private-tours',
    categoryGroup: 'tours'
  },

  // Multi-day Tours - Based on MULTIDAYTOUR product type
  {
    id: 'multiday-tours',
    title: 'Multi-day Tours',
    description: 'Extended adventures spanning multiple days',
    productTypes: ['MULTIDAYTOUR'],
    keywords: ['multiday', 'multi-day', 'package', 'extended', 'overnight', 'itinerary', 'multiple days'],
    slug: 'multiday-tours',
    categoryGroup: 'tours'
  },

  // Transfers - Based on TRANSFER product type
  {
    id: 'transfers',
    title: 'Transfers',
    description: 'Airport transfers and transportation services',
    productTypes: ['TRANSFER'],
    keywords: ['transfer', 'transport', 'shuttle', 'airport', 'pickup', 'dropoff'],
    slug: 'transfers',
    categoryGroup: 'transportation'
  },

  // Lessons - Based on LESSON product type
  {
    id: 'lessons',
    title: 'Lessons',
    description: 'Educational lessons and skill-building experiences',
    productTypes: ['LESSON'],
    keywords: ['lesson', 'learn', 'instruction', 'teaching', 'skill', 'education'],
    slug: 'lessons',
    categoryGroup: 'experiences'
  },

  // Tickets - Based on TICKET product type
  {
    id: 'tickets',
    title: 'Tickets',
    description: 'Event tickets and attraction entries',
    productTypes: ['TICKET'],
    keywords: ['ticket', 'entry', 'admission', 'event', 'show', 'attraction'],
    slug: 'tickets',
    categoryGroup: 'experiences'
  },

  // Rentals - Based on RENTAL product type
  {
    id: 'rentals',
    title: 'Rentals',
    description: 'Equipment and vehicle rentals',
    productTypes: ['RENTAL'],
    keywords: ['rental', 'hire', 'rent', 'equipment', 'vehicle'],
    slug: 'rentals',
    categoryGroup: 'experiences'
  },

  // Gift Cards - Based on GIFT_CARD product type
  {
    id: 'gift-cards',
    title: 'Gift Cards',
    description: 'Gift vouchers for tours and experiences',
    productTypes: ['GIFT_CARD'],
    keywords: ['gift', 'voucher', 'card', 'present', 'certificate'],
    slug: 'gift-cards',
    categoryGroup: 'experiences'
  },

  // Merchandise - Based on MERCHANDISE product type
  {
    id: 'merchandise',
    title: 'Merchandise',
    description: 'Souvenirs and branded merchandise',
    productTypes: ['MERCHANDISE'],
    keywords: ['merchandise', 'souvenir', 'shop', 'buy', 'product', 'branded'],
    slug: 'merchandise',
    categoryGroup: 'experiences'
  }
]

// Legacy support
export const LEGACY_CATEGORY_MAPPING: Record<string, string> = {
  "adventure": "activities",
  "cultural": "day-tours",
  "food-wine": "winery-tours",
  "nature": "day-tours",
  "urban": "day-tours",
  "family": "day-tours",
  "romantic": "private-tours",
  "luxury": "barefoot-luxury",
  "photography": "private-tours",
  "water-activities": "activities",
  "workshops": "lessons",
  "classes": "lessons",
  "tastings": "winery-tours",
  "honeymoon": "private-tours"
};

// Helper function to filter products by category using validated keywords and product types
export function filterProductsByCategory(products: any[], category: Omit<TourCategory, 'tourCount' | 'icon' | 'image'>) {
  return products.filter(product => {
    const searchText = `${product.name || ''} ${product.shortDescription || ''} ${product.description || ''}`.toLowerCase()
    const productTypeUpper = product.productType?.toUpperCase() || ''
    
    // Check if any keywords match in the text
    const keywordMatch = category.keywords.some(keyword => 
      searchText.includes(keyword.toLowerCase())
    )
    
    // Check if product type matches exactly
    const productTypeMatch = category.productTypes.some(type => 
      productTypeUpper === type
    )
    
    return keywordMatch || productTypeMatch
  })
}

// Get category by slug
export function getCategoryBySlug(slug: string) {
  return TOUR_CATEGORIES.find(category => category.slug === slug)
}

// Legacy function - map old category IDs to new ones
function mapLegacyCategory(categoryId: string): string {
  return LEGACY_CATEGORY_MAPPING[categoryId] || categoryId
}

// Get category by ID (with legacy support)
export function getCategoryById(id: string): Omit<TourCategory, 'tourCount' | 'icon' | 'image'> | undefined {
  const mappedId = mapLegacyCategory(id)
  return TOUR_CATEGORIES.find(category => category.id === mappedId)
}

// Get all category IDs
export function getAllCategoryIds(): string[] {
  return TOUR_CATEGORIES.map(category => category.id)
}

// Get category display name
export function getCategoryDisplayName(id: string): string {
  const mappedId = mapLegacyCategory(id)
  const category = getCategoryById(mappedId)
  return category?.title || id
}

// Check if product matches category using validated filtering logic
export function doesProductMatchCategory(
  product: any,
  categoryId: string
): boolean {
  const mappedId = mapLegacyCategory(categoryId)
  const category = getCategoryById(mappedId)
  
  if (!category) return false
  
  const searchText = `${product.name || ''} ${product.shortDescription || ''} ${product.description || ''}`.toLowerCase()
  const productTypeUpper = product.productType?.toUpperCase() || ''
  
  // Check keyword matches
  const keywordMatch = category.keywords.some(keyword => 
    searchText.includes(keyword.toLowerCase())
  )
  
  // Check product type matches
  const productTypeMatch = category.productTypes.some(type => 
    productTypeUpper === type
  )
  
  return keywordMatch || productTypeMatch
}

// Get main tour categories (excluding support categories like gift cards, merchandise)
export function getMainTourCategories(): Omit<TourCategory, 'tourCount' | 'icon' | 'image'>[] {
  return TOUR_CATEGORIES.filter(category => 
    ['tours', 'transportation'].includes(category.categoryGroup) &&
    !['gift-cards', 'merchandise', 'tickets'].includes(category.id)
  )
}

// Get all categories for search dropdown
export function getSearchCategories(): Omit<TourCategory, 'tourCount' | 'icon' | 'image'>[] {
  return TOUR_CATEGORIES.filter(category => 
    !['merchandise', 'gift-cards'].includes(category.id)
  )
} 