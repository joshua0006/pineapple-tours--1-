"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

interface GiftVoucherImage {
  src: string
  alt: string
  width: number
  height: number
}

// Default tour images as fallback
const defaultImages: GiftVoucherImage[] = [
  {
    src: "/hop-on-hop-off/hop-on-hop-off-bus-1.jpg",
    alt: "Tour Experience - Image 1",
    width: 400,
    height: 300
  },
  {
    src: "/hop-on-hop-off/hop-on-hop-off-landmarks-2.jpg",
    alt: "Tour Experience - Image 2",
    width: 400,
    height: 200
  },
  {
    src: "/hop-on-hop-off/hop-on-hop-off-attractions-3.jpg",
    alt: "Tour Experience - Image 3",
    width: 400,
    height: 200
  },
  {
    src: "/hop-on-hop-off/hop-on-hop-off-views-4.jpg",
    alt: "Tour Experience - Image 4",
    width: 400,
    height: 300
  }
]

interface GiftVoucherImagesProps {
  className?: string
}

export function GiftVoucherImages({ className = "" }: GiftVoucherImagesProps) {
  const [images, setImages] = useState<GiftVoucherImage[]>(defaultImages)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to load images from Rezdy data (excluding gift voucher products)
    const loadRezdyImages = async () => {
      try {
        const response = await fetch('/api/download-gift-voucher-section-images')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.images && data.images.length > 0) {
            // Convert downloaded images to our format
            const rezdyImages: GiftVoucherImage[] = data.images.slice(0, 4).map((img: any, index: number) => ({
              src: img.localPath,
              alt: img.alt || `Tour Experience - Image ${index + 1}`,
              width: index % 2 === 0 ? 400 : 400,
              height: index < 2 ? (index === 0 ? 300 : 200) : (index === 2 ? 200 : 300)
            }))
            setImages(rezdyImages)
          }
        }
      } catch (error) {
        console.log('Using default images for gift voucher section')
      } finally {
        setLoading(false)
      }
    }

    loadRezdyImages()
  }, [])

  if (loading) {
    return (
      <div className={`grid gap-4 sm:grid-cols-2 ${className}`}>
        <div className="space-y-4">
          <div className="relative h-48 overflow-hidden rounded-lg bg-gray-200 animate-pulse" />
          <div className="relative h-32 overflow-hidden rounded-lg bg-gray-200 animate-pulse" />
        </div>
        <div className="space-y-4 sm:mt-8">
          <div className="relative h-32 overflow-hidden rounded-lg bg-gray-200 animate-pulse" />
          <div className="relative h-48 overflow-hidden rounded-lg bg-gray-200 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${className}`}>
      <div className="space-y-4">
        <div className="relative h-48 overflow-hidden rounded-lg">
          <Image
            src={images[0]?.src || defaultImages[0].src}
            alt={images[0]?.alt || defaultImages[0].alt}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
        <div className="relative h-32 overflow-hidden rounded-lg">
          <Image
            src={images[1]?.src || defaultImages[1].src}
            alt={images[1]?.alt || defaultImages[1].alt}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
      </div>
      <div className="space-y-4 sm:mt-8">
        <div className="relative h-32 overflow-hidden rounded-lg">
          <Image
            src={images[2]?.src || defaultImages[2].src}
            alt={images[2]?.alt || defaultImages[2].alt}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
        <div className="relative h-48 overflow-hidden rounded-lg">
          <Image
            src={images[3]?.src || defaultImages[3].src}
            alt={images[3]?.alt || defaultImages[3].alt}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
      </div>
    </div>
  )
} 