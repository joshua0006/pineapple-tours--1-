import { RezdyProduct, RezdyImage } from "@/lib/types/rezdy"

/**
 * Generate a URL-friendly slug from a Rezdy product
 */
export function generateProductSlug(product: RezdyProduct): string {
  const nameSlug = product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  return `${product.productCode.toLowerCase()}-${nameSlug}`
}

/**
 * Extract product code from a slug
 */
export function extractProductCodeFromSlug(slug: string): string | null {
  const parts = slug.split('-')
  if (parts.length === 0) return null
  
  // The product code is typically the first part of the slug
  return parts[0].toUpperCase()
}

/**
 * Find a product by slug from a list of products
 */
export function findProductBySlug(products: RezdyProduct[], slug: string): RezdyProduct | null {
  const productCode = extractProductCodeFromSlug(slug)
  if (!productCode) return null
  
  return products.find(product => product.productCode === productCode) || null
}

/**
 * Format price for display
 */
export function formatPrice(price: number | undefined): string {
  if (!price) return 'Price on request'
  return `$${price.toFixed(0)}`
}

/**
 * Get the primary image URL from a product
 */
export function getPrimaryImageUrl(product: RezdyProduct, size: 'thumbnail' | 'medium' | 'large' | 'original' = 'large'): string {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0]
  
  if (!primaryImage) {
    return "/placeholder.svg?height=400&width=600"
  }
  
  switch (size) {
    case 'thumbnail':
      return primaryImage.thumbnailUrl
    case 'medium':
      return primaryImage.mediumSizeUrl
    case 'large':
      return primaryImage.largeSizeUrl
    case 'original':
      return primaryImage.itemUrl
    default:
      return primaryImage.largeSizeUrl
  }
}

/**
 * Get all valid images from a product, filtering out broken or empty URLs
 */
export function getValidImages(product: RezdyProduct): RezdyImage[] {
  if (!product.images) return []
  
  return product.images.filter(image => 
    image.itemUrl && 
    image.itemUrl.trim() !== '' && 
    !image.itemUrl.includes('placeholder') &&
    image.thumbnailUrl &&
    image.mediumSizeUrl &&
    image.largeSizeUrl
  )
}

/**
 * Get the appropriate image URL from a RezdyImage based on desired size
 */
export function getImageUrl(image: RezdyImage, size: 'thumbnail' | 'medium' | 'large' | 'original' = 'large'): string {
  switch (size) {
    case 'thumbnail':
      return image.thumbnailUrl
    case 'medium':
      return image.mediumSizeUrl
    case 'large':
      return image.largeSizeUrl
    case 'original':
      return image.itemUrl
    default:
      return image.largeSizeUrl
  }
}

/**
 * Get optimized image URL with size parameters
 */
export function getOptimizedImageUrl(
  imageUrl: string, 
  width?: number, 
  height?: number, 
  quality: number = 85
): string {
  if (!imageUrl || imageUrl.includes('placeholder')) {
    return "/placeholder.svg?height=400&width=600"
  }

  // For external image services, you might want to add optimization parameters
  // This is a basic implementation - you can extend it based on your image service
  try {
    const url = new URL(imageUrl)
    
    // Add optimization parameters if supported by the image service
    if (width) url.searchParams.set('w', width.toString())
    if (height) url.searchParams.set('h', height.toString())
    if (quality !== 85) url.searchParams.set('q', quality.toString())
    
    return url.toString()
  } catch {
    // If URL parsing fails, return original URL
    return imageUrl
  }
}

/**
 * Generate responsive image sizes string for different breakpoints
 */
export function generateImageSizes(
  breakpoints: { size: string; width: string }[] = [
    { size: '(max-width: 640px)', width: '100vw' },
    { size: '(max-width: 1024px)', width: '50vw' },
    { size: '(max-width: 1280px)', width: '33vw' },
  ],
  defaultWidth: string = '25vw'
): string {
  const sizeStrings = breakpoints.map(bp => `${bp.size} ${bp.width}`)
  return [...sizeStrings, defaultWidth].join(', ')
}

/**
 * Get image dimensions from URL or return defaults
 */
export function getImageDimensions(imageUrl: string): { width: number; height: number } {
  // Try to extract dimensions from URL parameters
  try {
    const url = new URL(imageUrl)
    const width = url.searchParams.get('width') || url.searchParams.get('w')
    const height = url.searchParams.get('height') || url.searchParams.get('h')
    
    if (width && height) {
      return {
        width: parseInt(width, 10),
        height: parseInt(height, 10)
      }
    }
  } catch {
    // URL parsing failed
  }
  
  // Return default dimensions
  return { width: 800, height: 600 }
}

/**
 * Extract location string from locationAddress
 */
export function getLocationString(locationAddress: string | any): string {
  if (typeof locationAddress === 'string') {
    return locationAddress
  }
  
  if (locationAddress && typeof locationAddress === 'object') {
    return locationAddress.city || locationAddress.addressLine || 'Location TBD'
  }
  
  return 'Location TBD'
}

/**
 * Extract city name from locationAddress
 */
export function getCityFromLocation(locationAddress: string | any): string | null {
  if (!locationAddress) return null;
  
  if (typeof locationAddress === 'string') {
    // Try to extract city from string format
    // Common patterns: "City, State", "Address, City, State", etc.
    const parts = locationAddress.split(',').map(part => part.trim());
    if (parts.length >= 2) {
      // Assume the second-to-last part is the city for most formats
      return parts[parts.length - 2] || null;
    }
    // If only one part, it might be the city
    return parts[0] || null;
  }
  
  if (locationAddress && typeof locationAddress === 'object') {
    return locationAddress.city || null;
  }
  
  return null;
}

/**
 * Extract unique cities from an array of products
 */
export function getUniqueCitiesFromProducts(products: RezdyProduct[]): string[] {
  if (!products || products.length === 0) return [];
  
  const cities = new Set<string>();
  
  products.forEach(product => {
    const city = getCityFromLocation(product.locationAddress);
    if (city && city.trim() !== '' && city !== 'Location TBD') {
      cities.add(city.trim());
    }
  });
  
  return Array.from(cities).sort();
}

/**
 * Filter products by city
 */
export function filterProductsByCity(products: RezdyProduct[], selectedCity: string): RezdyProduct[] {
  console.log('filterProductsByCity called with:', {
    productsLength: products.length,
    selectedCity,
    isAll: selectedCity === 'all'
  });
  
  if (!selectedCity || selectedCity === 'all') {
    console.log('Returning all products:', products.length);
    return products;
  }
  
  const filtered = products.filter(product => {
    const city = getCityFromLocation(product.locationAddress);
    const matches = city && city.toLowerCase() === selectedCity.toLowerCase();
    return matches;
  });
  
  console.log('Filtered products:', {
    selectedCity,
    originalCount: products.length,
    filteredCount: filtered.length
  });
  
  return filtered;
}

/**
 * Check if a product offers pickup services based on its data
 */
export function hasPickupServices(product: RezdyProduct): boolean {
  if (!product) return false;
  
  // Check product name for pickup-related keywords
  const nameIndicators = [
    'pickup',
    'door to door',
    'door-to-door',
    'transfer',
    'shuttle',
    'hop on hop off',
    'hop-on hop-off',
    'from brisbane',
    'from gold coast',
    'from tamborine',
    'including pickup'
  ];
  
  const productName = product.name?.toLowerCase() || '';
  const hasNameIndicator = nameIndicators.some(indicator => 
    productName.includes(indicator)
  );
  
  // Check product description for pickup-related keywords
  const descriptionIndicators = [
    'pickup',
    'door to door',
    'door-to-door',
    'transfer',
    'shuttle service',
    'departing from',
    'pickup from',
    'collection from'
  ];
  
  const productDescription = product.shortDescription?.toLowerCase() || '';
  const hasDescriptionIndicator = descriptionIndicators.some(indicator => 
    productDescription.includes(indicator)
  );
  
  // Check product type
  const pickupProductTypes = [
    'TRANSFER',
    'SHUTTLE',
    'CUSTOM' // Many hop-on hop-off services are CUSTOM type
  ];
  
  const hasPickupProductType = pickupProductTypes.includes(product.productType || '');
  
  // Return true if any indicator is found
  return hasNameIndicator || hasDescriptionIndicator || hasPickupProductType;
}

/**
 * Get pickup service type based on product data
 */
export function getPickupServiceType(product: RezdyProduct): 'door-to-door' | 'designated-points' | 'shuttle' | 'none' {
  if (!hasPickupServices(product)) return 'none';
  
  const productName = product.name?.toLowerCase() || '';
  const productDescription = product.shortDescription?.toLowerCase() || '';
  const combinedText = `${productName} ${productDescription}`;
  
  // Door-to-door service
  if (combinedText.includes('door to door') || combinedText.includes('door-to-door')) {
    return 'door-to-door';
  }
  
  // Shuttle service
  if (combinedText.includes('shuttle') || combinedText.includes('transfer')) {
    return 'shuttle';
  }
  
  // Default to designated pickup points for other pickup services
  return 'designated-points';
}

/**
 * Extract pickup locations mentioned in product name or description
 */
export function extractPickupLocations(product: RezdyProduct): string[] {
  const locations: string[] = [];
  const combinedText = `${product.name || ''} ${product.shortDescription || ''}`.toLowerCase();
  
  // Common pickup locations mentioned in the data
  const locationKeywords = [
    'brisbane',
    'gold coast',
    'tamborine mountain',
    'surfers paradise',
    'broadbeach',
    'currumbin',
    'movie world'
  ];
  
  locationKeywords.forEach(location => {
    if (combinedText.includes(location)) {
      locations.push(location.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '));
    }
  });
  
  return [...new Set(locations)]; // Remove duplicates
} 