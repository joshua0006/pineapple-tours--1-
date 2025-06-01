"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { RezdyImage } from "@/lib/types/rezdy"

interface ImageModalProps {
  images: RezdyImage[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
  tourName?: string
}

export function ImageModal({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  tourName
}: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isLoading, setIsLoading] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  useEffect(() => {
    setCurrentIndex(initialIndex)
    setIsLoading(true)
  }, [initialIndex])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setIsLoading(true)
  }, [images.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setIsLoading(true)
  }, [images.length])

  // Touch handlers for swipe navigation
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && images.length > 1) {
      goToNext()
    }
    if (isRightSwipe && images.length > 1) {
      goToPrevious()
    }
  }

  const handleDownload = async () => {
    const currentImage = images[currentIndex]
    if (!currentImage?.itemUrl) return

    try {
      const response = await fetch(currentImage.itemUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${tourName || 'tour'}-image-${currentIndex + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download image:', error)
    }
  }

  const handleShare = async () => {
    const currentImage = images[currentIndex]
    if (!currentImage?.itemUrl) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: tourName ? `${tourName} - Image ${currentIndex + 1}` : 'Tour Image',
          url: currentImage.itemUrl
        })
      } catch (error) {
        console.error('Failed to share:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(currentImage.itemUrl)
        // You could show a toast notification here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
      }
    }
  }

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-2 sm:p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {currentIndex + 1} of {images.length}
            </Badge>
            {tourName && (
              <h2 className="text-white text-sm sm:text-lg font-medium truncate max-w-32 sm:max-w-md">
                {tourName}
              </h2>
            )}
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
            >
              <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-10 w-10 sm:h-12 sm:w-12 rounded-full"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-10 w-10 sm:h-12 sm:w-12 rounded-full"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </>
      )}

      {/* Main image */}
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 md:p-16">
        <div className="relative max-w-full max-h-full">
          <Image
            src={currentImage.largeSizeUrl || currentImage.itemUrl || "/placeholder.svg?height=800&width=1200"}
            alt={currentImage.caption || `${tourName} - Image ${currentIndex + 1}`}
            width={1200}
            height={800}
            className={cn(
              "max-w-full max-h-full object-contain transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            priority
            sizes="100vw"
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      </div>

      {/* Caption */}
      {currentImage.caption && (
        <div className="absolute bottom-16 sm:bottom-20 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-black/50 to-transparent">
          <p className="text-white text-center text-xs sm:text-sm max-w-xl sm:max-w-2xl mx-auto">
            {currentImage.caption}
          </p>
        </div>
      )}

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1 sm:space-x-2 max-w-full overflow-x-auto px-2 sm:px-4 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsLoading(true)
              }}
              className={cn(
                "relative w-12 h-9 sm:w-16 sm:h-12 rounded overflow-hidden border-2 transition-all flex-shrink-0",
                index === currentIndex
                  ? "border-white scale-110"
                  : "border-white/30 hover:border-white/60"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.thumbnailUrl || image.mediumSizeUrl || "/placeholder.svg?height=100&width=150"}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label="Close modal"
      />
    </div>
  )
} 