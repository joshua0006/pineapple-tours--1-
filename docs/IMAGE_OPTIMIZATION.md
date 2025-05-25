# Image Optimization Guide

This document outlines the comprehensive image optimization system implemented for Pineapple Tours, designed to enhance performance, visual quality, and user experience across all devices.

## Overview

The image optimization system provides:
- **Dynamic sizing** based on device capabilities and viewport
- **Responsive breakpoints** for optimal loading across screen sizes
- **Multiple image sizes** from Rezdy API (thumbnail, medium, large, original)
- **Format optimization** (WebP, AVIF) with fallbacks
- **Service-specific optimizations** for Cloudinary, Imgix, and AWS S3
- **Lazy loading** and progressive enhancement
- **Image modal galleries** with navigation and sharing

## Rezdy Image Structure

The system works with Rezdy's image API structure:

```typescript
interface RezdyImage {
  id: number;
  itemUrl: string;        // Original full-size image
  thumbnailUrl: string;   // Small thumbnail (typically 150px)
  mediumSizeUrl: string;  // Medium size (typically 400-600px)
  largeSizeUrl: string;   // Large size (typically 800-1200px)
  caption?: string;
  isPrimary?: boolean;
}
```

The system automatically selects the appropriate image size based on:
- **Viewport size** - smaller images for mobile devices
- **Component context** - thumbnails for navigation, large for main display
- **Aspect ratio requirements** - optimized dimensions for layout

## Components

### ResponsiveImage Component

The core component for displaying optimized images with responsive behavior.

```tsx
import { ResponsiveImage } from "@/components/ui/responsive-image"

<ResponsiveImage
  images={productImages}
  alt="Tour description"
  aspectRatio="landscape"
  className="w-full h-64"
  priority={true}
  onClick={(index) => openModal(index)}
/>
```

**Props:**
- `images`: Array of RezdyImage objects
- `alt`: Accessibility description
- `aspectRatio`: 'square' | 'landscape' | 'portrait' | 'video' | 'auto'
- `className`: CSS classes
- `priority`: Load image with high priority (for above-fold content)
- `sizes`: Custom responsive sizes string
- `onClick`: Callback when image is clicked
- `showNavigation`: Show navigation dots for multiple images

### ImageGallery Component

Grid-based gallery with modal support for tour image collections.

```tsx
import { ImageGallery } from "@/components/ui/responsive-image"

<ImageGallery
  images={tourImages}
  alt="Tour gallery"
  layout="grid"
  maxImages={4}
  enableModal={true}
  tourName="Sydney Harbour Tour"
/>
```

**Props:**
- `layout`: 'grid' | 'masonry' | 'carousel'
- `maxImages`: Maximum images to display in grid
- `enableModal`: Enable full-screen modal viewing
- `tourName`: Tour name for modal context

### ImageModal Component

Full-screen modal for viewing high-resolution images with navigation.

```tsx
import { ImageModal } from "@/components/ui/image-modal"

<ImageModal
  images={images}
  initialIndex={0}
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  tourName="Tour Name"
/>
```

**Features:**
- Keyboard navigation (arrow keys, escape)
- Image download functionality
- Social sharing integration
- Thumbnail navigation
- Touch/swipe support (mobile)

## Optimization Features

### Responsive Breakpoints

Pre-configured breakpoints for different use cases:

```typescript
RESPONSIVE_BREAKPOINTS = {
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
  ]
}
```

### Aspect Ratio Configurations

Optimized dimensions for different content types:

```typescript
ASPECT_RATIOS = {
  square: { ratio: 1, defaultWidth: 400, defaultHeight: 400 },
  landscape: { ratio: 4/3, defaultWidth: 800, defaultHeight: 600 },
  portrait: { ratio: 3/4, defaultWidth: 600, defaultHeight: 800 },
  video: { ratio: 16/9, defaultWidth: 1280, defaultHeight: 720 },
  ultrawide: { ratio: 21/9, defaultWidth: 1920, defaultHeight: 823 }
}
```

### Service-Specific Optimizations

#### Cloudinary
```typescript
// Automatic optimization with transformations
optimizeImageUrl(imageUrl, {
  width: 800,
  height: 600,
  quality: 85,
  format: 'auto'
})
// Result: .../upload/w_800,h_600,q_85,f_auto,c_cover/image.jpg
```

#### Imgix
```typescript
// URL parameter optimization
optimizeImageUrl(imageUrl, {
  width: 800,
  height: 600,
  quality: 85,
  format: 'webp'
})
// Result: ...?w=800&h=600&q=85&fm=webp&fit=crop&auto=compress,format
```

#### AWS S3
```typescript
// Basic optimization (can be extended with CloudFront)
optimizeImageUrl(imageUrl, options)
```

## Performance Features

### Next.js Image Optimization

Configured for optimal performance:

```javascript
// next.config.mjs
images: {
  unoptimized: false,
  remotePatterns: [
    { protocol: 'https', hostname: '**' },
    { protocol: 'http', hostname: '**' }
  ],
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
}
```

### Lazy Loading

Images are lazy-loaded by default with intersection observer:

```typescript
const observer = createImageObserver((entry) => {
  if (entry.isIntersecting) {
    loadImage(entry.target)
  }
}, {
  rootMargin: '50px 0px',
  threshold: 0.1
})
```

### Preloading Critical Images

For above-the-fold content:

```typescript
// Preload hero images
await preloadImage(heroImageUrl, {
  width: 1920,
  height: 1080,
  quality: 90
})
```

## Utility Functions

### Working with Rezdy Images

```typescript
import { getValidImages, getImageUrl, getPrimaryImageUrl } from "@/lib/utils/product-utils"
import { getRezdyImageUrl } from "@/lib/utils/image-optimization"

// Get all valid images from a product
const validImages = getValidImages(product)

// Get primary image URL with specific size
const heroImage = getPrimaryImageUrl(product, 'large')
const thumbnailImage = getPrimaryImageUrl(product, 'thumbnail')

// Get specific size from an image object
const imageUrl = getRezdyImageUrl(image, 'medium')
```

## Usage Examples

### Tour Card Images

```tsx
<ResponsiveImage
  images={getValidImages(product)}
  alt={`${product.name} tour`}
  aspectRatio="landscape"
  className="transition-transform duration-300 group-hover:scale-105"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### Hero Section

```tsx
<ResponsiveImage
  images={heroImages}
  alt="Tropical paradise"
  aspectRatio="ultrawide"
  priority={true}
  className="w-full h-96 md:h-[500px]"
  sizes="100vw"
/>
```

### Gallery Grid

```tsx
<ImageGallery
  images={tourImages}
  alt="Tour highlights"
  layout="grid"
  maxImages={6}
  enableModal={true}
  tourName={tour.name}
  className="gap-4"
/>
```

## Best Practices

### Image Selection
1. **Use primary images** when available from Rezdy data
2. **Filter invalid URLs** before processing
3. **Provide fallback images** for missing content
4. **Consider aspect ratios** for layout consistency

### Performance
1. **Set priority={true}** for above-the-fold images
2. **Use appropriate aspect ratios** to prevent layout shift
3. **Implement lazy loading** for below-the-fold content
4. **Optimize quality settings** based on content importance

### Accessibility
1. **Provide descriptive alt text** for all images
2. **Use semantic HTML** structure
3. **Support keyboard navigation** in modals
4. **Include ARIA labels** for interactive elements

### Responsive Design
1. **Use appropriate breakpoints** for your layout
2. **Test on multiple devices** and screen sizes
3. **Consider bandwidth limitations** on mobile
4. **Implement progressive enhancement**

## Troubleshooting

### Common Issues

**Images not loading:**
- Check image URLs are valid and accessible
- Verify Next.js remote patterns configuration
- Ensure image service supports requested optimizations

**Poor performance:**
- Review image sizes and quality settings
- Check if lazy loading is properly implemented
- Verify responsive breakpoints are appropriate

**Layout shifts:**
- Use consistent aspect ratios
- Implement proper image dimensions
- Add loading placeholders

### Debug Tools

```typescript
// Enable debug logging
const debugImageUrl = optimizeImageUrl(url, {
  width: 800,
  height: 600,
  quality: 85
})
console.log('Optimized URL:', debugImageUrl)
```

## Future Enhancements

1. **AI-powered image analysis** for automatic cropping
2. **Advanced caching strategies** with service workers
3. **WebP/AVIF format detection** and automatic serving
4. **Image compression analytics** and optimization recommendations
5. **CDN integration** for global image delivery 