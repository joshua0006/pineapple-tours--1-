"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { RezdyImage } from "@/lib/types/rezdy"
import { ImageModal } from "./image-modal"
import { 
  optimizeImageUrl, 
  generateResponsiveSizes, 
  RESPONSIVE_BREAKPOINTS,
  ASPECT_RATIOS,
  getRezdyImageUrl,
  type ImageOptimizationOptions 
} from "@/lib/utils/image-optimization"

interface ResponsiveImageProps {
  images: RezdyImage[]
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
  aspectRatio?: "square" | "video" | "portrait" | "landscape" | "auto"
  fallbackSrc?: string
  onImageError?: (error: any) => void
  onClick?: (imageIndex: number) => void
  showNavigation?: boolean
}

interface ImageSizeConfig {
  width: number
  height: number
  sizes: string
}

// Use the centralized aspect ratio configurations
const getResponsiveSizes = (aspectRatio: string): string => {
  switch (aspectRatio) {
    case 'square':
    case 'portrait':
      return generateResponsiveSizes(RESPONSIVE_BREAKPOINTS.card)
    case 'landscape':
    case 'video':
      return generateResponsiveSizes(RESPONSIVE_BREAKPOINTS.gallery)
    default:
      return generateResponsiveSizes(RESPONSIVE_BREAKPOINTS.card)
  }
}

export function ResponsiveImage({
  images,
  alt,
  className,
  priority = false,
  sizes,
  aspectRatio = "auto",
  fallbackSrc = "/placeholder.svg?height=400&width=600",
  onImageError,
  onClick,
  showNavigation = true
}: ResponsiveImageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [hasError, setHasError] = useState(false)

  // Get the primary image or first available image
  const primaryImage = images.find(img => img.isPrimary) || images[0]
  const currentImage = images[currentImageIndex] || primaryImage

  // Get aspect ratio configuration
  const aspectConfig = ASPECT_RATIOS[aspectRatio as keyof typeof ASPECT_RATIOS] || ASPECT_RATIOS.auto
  const imageSizes = sizes || getResponsiveSizes(aspectRatio)

  const handleImageError = (error: any) => {
    setHasError(true)
    onImageError?.(error)
  }

  // Use the appropriate image size based on the aspect ratio and viewport
  const getResponsiveImageUrl = (image: RezdyImage): string => {
    // For small viewports or thumbnails, use medium size
    if (aspectRatio === 'square' || aspectConfig.defaultWidth <= 400) {
      return getRezdyImageUrl(image, 'medium')
    }
    // For larger viewports, use large size
    return getRezdyImageUrl(image, 'large')
  }

  const imageUrl = currentImage 
    ? getResponsiveImageUrl(currentImage)
    : fallbackSrc

  return (
    <div 
      className={cn("relative overflow-hidden", onClick && "cursor-pointer", className)}
      onClick={() => onClick?.(currentImageIndex)}
    >
      {aspectRatio !== "auto" && aspectConfig.ratio > 0 ? (
        <div style={{ aspectRatio: aspectConfig.ratio }}>
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-cover"
            sizes={imageSizes}
            priority={priority}
            onError={handleImageError}
            quality={85}
          />
        </div>
      ) : (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes={imageSizes}
          priority={priority}
          onError={handleImageError}
          quality={85}
        />
      )}
      
      {/* Image navigation for multiple images */}
      {images.length > 1 && showNavigation && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentImageIndex 
                  ? "bg-white" 
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Image caption overlay */}
      {currentImage?.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="text-white text-sm">{currentImage.caption}</p>
        </div>
      )}
    </div>
  )
}

// Gallery component for multiple images with different layouts
interface ImageGalleryProps {
  images: RezdyImage[]
  alt: string
  className?: string
  layout?: "grid" | "masonry" | "carousel"
  maxImages?: number
  enableModal?: boolean
  tourName?: string
}

export function ImageGallery({
  images,
  alt,
  className,
  layout = "grid",
  maxImages = 5,
  enableModal = true,
  tourName
}: ImageGalleryProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  
  const displayImages = images.slice(0, maxImages)
  const remainingCount = Math.max(0, images.length - maxImages)

  const handleImageClick = (imageIndex: number) => {
    if (enableModal) {
      setModalImageIndex(imageIndex)
      setModalOpen(true)
    }
  }

  if (layout === "grid") {
    return (
      <>
        <div className={cn("grid gap-2 sm:gap-4", className)}>
          {/* Mobile Layout: 1 large image on top, 3 small images below */}
          <div className="grid grid-cols-1 gap-2 sm:hidden">
            {/* Main large image - mobile */}
            <div className="relative h-48 overflow-hidden rounded-lg">
              <ResponsiveImage
                images={[displayImages[0]].filter(Boolean)}
                alt={`${alt} - Main image`}
                priority
                aspectRatio="landscape"
                className="h-full w-full"
                onClick={() => handleImageClick(0)}
                showNavigation={false}
              />
            </div>
            
            {/* Three smaller images in a row - mobile */}
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, index) => {
                // Use images starting from index 1, or cycle through available images
                const imageIndex = displayImages.length > 1 ? ((index % Math.max(1, displayImages.length - 1)) + 1) : 0;
                const image = displayImages[imageIndex] || displayImages[0];
                
                if (!image) return null;
                
                // Show overlay on the last small image if there are remaining images
                const isLastSmallImage = index === 2;
                const shouldShowOverlay = isLastSmallImage && remainingCount > 0;
                
                return (
                  <div key={index} className="relative h-24 overflow-hidden rounded-lg">
                    <ResponsiveImage
                      images={[image]}
                      alt={`${alt} - Gallery image ${index + 2}`}
                      aspectRatio="square"
                      className="h-full w-full"
                      onClick={() => handleImageClick(imageIndex)}
                      showNavigation={false}
                    />
                    {/* Show remaining count on last small image */}
                    {shouldShowOverlay && (
                      <div 
                        className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(maxImages);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleImageClick(maxImages);
                          }
                        }}
                        aria-label={`View ${remainingCount} more images`}
                      >
                        <span className="text-white text-xs font-semibold">
                          +{remainingCount}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Desktop/Tablet Layout: Original grid layout */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Main large image - desktop */}
            <div className="relative h-64 overflow-hidden rounded-lg md:col-span-2 md:row-span-2 md:h-full">
              <ResponsiveImage
                images={[displayImages[0]].filter(Boolean)}
                alt={`${alt} - Main image`}
                priority
                aspectRatio="landscape"
                className="h-full w-full"
                onClick={() => handleImageClick(0)}
                showNavigation={false}
              />
            </div>
          
            {/* Smaller gallery images - desktop (always showing exactly 4 small images) */}
            {Array.from({ length: 4 }).map((_, index) => {
              // Cycle through available images starting from index 1, or use first image if only one available
              const imageIndex = displayImages.length > 1 ? ((index % (displayImages.length - 1)) + 1) : 0;
              const image = displayImages[imageIndex];
              
              if (!image) return null;
              
              // For the overlay: show on the 4th small image if there are remaining images
              const isLastSmallImage = index === 3;
              const shouldShowOverlay = isLastSmallImage && remainingCount > 0;
              
              return (
                <div key={index} className="relative h-64 overflow-hidden rounded-lg">
                  <ResponsiveImage
                    images={[image]}
                    alt={`${alt} - Gallery image ${index + 2}`}
                    aspectRatio="square"
                    className="h-full w-full"
                    onClick={() => handleImageClick(imageIndex)}
                    showNavigation={false}
                  />
                  {/* Show remaining count on last small image */}
                  {shouldShowOverlay && (
                    <div 
                      className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageClick(maxImages);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleImageClick(maxImages);
                        }
                      }}
                      aria-label={`View ${remainingCount} more images`}
                    >
                      <span className="text-white text-lg font-semibold">
                        +{remainingCount} more
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Image Modal */}
        {enableModal && (
          <ImageModal
            images={images}
            initialIndex={modalImageIndex}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            tourName={tourName}
          />
        )}
      </>
    )
  }

  // Add other layout types here (masonry, carousel) if needed
  return (
    <>
      <div className={className}>
        <ResponsiveImage
          images={displayImages}
          alt={alt}
          aspectRatio="landscape"
          onClick={handleImageClick}
        />
      </div>
      
      {/* Image Modal */}
      {enableModal && (
        <ImageModal
          images={images}
          initialIndex={modalImageIndex}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          tourName={tourName}
        />
      )}
    </>
  )
} 