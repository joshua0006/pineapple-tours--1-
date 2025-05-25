import { RezdyImage } from "@/lib/types/rezdy"

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

export interface ResponsiveBreakpoint {
  size: string
  width: string
  descriptor?: string
}

/**
 * Default responsive breakpoints for different use cases
 */
export const RESPONSIVE_BREAKPOINTS = {
  card: [
    { size: '(max-width: 640px)', width: '100vw' },
    { size: '(max-width: 1024px)', width: '50vw' },
    { size: '(max-width: 1280px)', width: '33vw' },
  ],
  hero: [
    { size: '(max-width: 640px)', width: '100vw' },
    { size: '(max-width: 1024px)', width: '100vw' },
    { size: '(max-width: 1920px)', width: '100vw' },
  ],
  gallery: [
    { size: '(max-width: 640px)', width: '100vw' },
    { size: '(max-width: 1024px)', width: '50vw' },
    { size: '(max-width: 1280px)', width: '25vw' },
  ],
  thumbnail: [
    { size: '(max-width: 640px)', width: '150px' },
    { size: '(max-width: 1024px)', width: '200px' },
  ]
}

/**
 * Aspect ratio configurations with optimal sizes
 */
export const ASPECT_RATIOS = {
  square: { ratio: 1, defaultWidth: 400, defaultHeight: 400 },
  landscape: { ratio: 4/3, defaultWidth: 800, defaultHeight: 600 },
  portrait: { ratio: 3/4, defaultWidth: 600, defaultHeight: 800 },
  video: { ratio: 16/9, defaultWidth: 1280, defaultHeight: 720 },
  ultrawide: { ratio: 21/9, defaultWidth: 1920, defaultHeight: 823 },
  auto: { ratio: 0, defaultWidth: 800, defaultHeight: 600 }
}

/**
 * Detect image service from URL and apply appropriate optimizations
 */
export function optimizeImageUrl(
  url: string, 
  options: ImageOptimizationOptions = {}
): string {
  if (!url || url.includes('placeholder')) {
    return "/placeholder.svg?height=400&width=600"
  }

  const { width, height, quality = 85, format, fit = 'cover' } = options

  try {
    const urlObj = new URL(url)
    
    // Handle different image services
    if (urlObj.hostname.includes('cloudinary.com')) {
      return optimizeCloudinaryUrl(url, options)
    } else if (urlObj.hostname.includes('imgix.net')) {
      return optimizeImgixUrl(url, options)
    } else if (urlObj.hostname.includes('amazonaws.com') || urlObj.hostname.includes('s3.')) {
      return optimizeS3Url(url, options)
    } else {
      // Generic optimization - add query parameters
      if (width) urlObj.searchParams.set('w', width.toString())
      if (height) urlObj.searchParams.set('h', height.toString())
      if (quality !== 85) urlObj.searchParams.set('q', quality.toString())
      if (format) urlObj.searchParams.set('f', format)
      
      return urlObj.toString()
    }
  } catch (error) {
    console.warn('Failed to optimize image URL:', error)
    return url
  }
}

/**
 * Optimize Cloudinary URLs
 */
function optimizeCloudinaryUrl(url: string, options: ImageOptimizationOptions): string {
  const { width, height, quality = 85, format = 'auto', fit = 'cover' } = options
  
  try {
    // Parse Cloudinary URL structure
    const parts = url.split('/upload/')
    if (parts.length !== 2) return url
    
    const [baseUrl, imagePath] = parts
    const transformations = []
    
    if (width) transformations.push(`w_${width}`)
    if (height) transformations.push(`h_${height}`)
    if (quality !== 85) transformations.push(`q_${quality}`)
    if (format) transformations.push(`f_${format}`)
    transformations.push(`c_${fit}`)
    
    const transformString = transformations.join(',')
    return `${baseUrl}/upload/${transformString}/${imagePath}`
  } catch {
    return url
  }
}

/**
 * Optimize Imgix URLs
 */
function optimizeImgixUrl(url: string, options: ImageOptimizationOptions): string {
  const { width, height, quality = 85, format = 'auto', fit = 'crop' } = options
  
  try {
    const urlObj = new URL(url)
    
    if (width) urlObj.searchParams.set('w', width.toString())
    if (height) urlObj.searchParams.set('h', height.toString())
    if (quality !== 85) urlObj.searchParams.set('q', quality.toString())
    if (format) urlObj.searchParams.set('fm', format)
    urlObj.searchParams.set('fit', fit)
    urlObj.searchParams.set('auto', 'compress,format')
    
    return urlObj.toString()
  } catch {
    return url
  }
}

/**
 * Optimize S3/AWS URLs (basic implementation)
 */
function optimizeS3Url(url: string, options: ImageOptimizationOptions): string {
  // For S3, we might need to use a service like AWS Lambda@Edge or CloudFront
  // For now, return the original URL
  return url
}

/**
 * Generate responsive sizes string
 */
export function generateResponsiveSizes(
  breakpoints: ResponsiveBreakpoint[] = RESPONSIVE_BREAKPOINTS.card,
  defaultWidth: string = '25vw'
): string {
  const sizeStrings = breakpoints.map(bp => `${bp.size} ${bp.width}`)
  return [...sizeStrings, defaultWidth].join(', ')
}

/**
 * Get optimal image dimensions for a given aspect ratio and container size
 */
export function getOptimalDimensions(
  aspectRatio: keyof typeof ASPECT_RATIOS,
  containerWidth: number,
  containerHeight?: number
): { width: number; height: number } {
  const config = ASPECT_RATIOS[aspectRatio]
  
  if (aspectRatio === 'auto' && containerHeight) {
    return { width: containerWidth, height: containerHeight }
  }
  
  const width = containerWidth
  const height = Math.round(width / config.ratio)
  
  return { width, height }
}

/**
 * Create srcSet for responsive images
 */
export function createSrcSet(
  baseUrl: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920],
  options: Omit<ImageOptimizationOptions, 'width'> = {}
): string {
  return widths
    .map(width => {
      const optimizedUrl = optimizeImageUrl(baseUrl, { ...options, width })
      return `${optimizedUrl} ${width}w`
    })
    .join(', ')
}

/**
 * Get the appropriate image URL from a RezdyImage based on desired size
 */
export function getRezdyImageUrl(
  image: RezdyImage, 
  size: 'thumbnail' | 'medium' | 'large' | 'original' = 'large'
): string {
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
 * Get the best image from a collection based on criteria
 */
export function getBestImage(
  images: RezdyImage[],
  preferredAspectRatio?: keyof typeof ASPECT_RATIOS,
  preferPrimary: boolean = true
): RezdyImage | null {
  if (!images || images.length === 0) return null
  
  // Filter out invalid images
  const validImages = images.filter(img => 
    img.itemUrl && 
    img.itemUrl.trim() !== '' && 
    !img.itemUrl.includes('placeholder') &&
    img.thumbnailUrl &&
    img.mediumSizeUrl &&
    img.largeSizeUrl
  )
  
  if (validImages.length === 0) return null
  
  // Prefer primary image if requested
  if (preferPrimary) {
    const primaryImage = validImages.find(img => img.isPrimary)
    if (primaryImage) return primaryImage
  }
  
  // If no specific aspect ratio preference, return first valid image
  if (!preferredAspectRatio) {
    return validImages[0]
  }
  
  // For now, return first valid image
  // In the future, you could analyze image dimensions to match aspect ratio
  return validImages[0]
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, options: ImageOptimizationOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = optimizeImageUrl(src, options)
  })
}

/**
 * Lazy load images with intersection observer
 */
export function createImageObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions = {
    rootMargin: '50px 0px',
    threshold: 0.1,
    ...options
  }
  
  return new IntersectionObserver((entries) => {
    entries.forEach(callback)
  }, defaultOptions)
} 