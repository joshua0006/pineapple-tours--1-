"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

interface GiftVoucherImageProps {
  className?: string
}

// Local gift voucher image downloaded from high-quality source
const defaultImage = {
  src: "/gift-vouchers/gift-vouchers-main.jpg",
  alt: "Gift Vouchers for Tours and Experiences"
}

export function GiftVoucherImage({ className = "" }: GiftVoucherImageProps) {
  const [imageSrc, setImageSrc] = useState(defaultImage.src)
  const [imageAlt, setImageAlt] = useState(defaultImage.alt)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to load image from Rezdy gift voucher products
    const loadRezdyImage = async () => {
      try {
        const response = await fetch('/api/rezdy/products?limit=1000')
        if (response.ok) {
          const data = await response.json()
          const products = data.products || data.data || []
          
          // Filter gift voucher products
          const giftVoucherProducts = products.filter((product: any) => 
            product.productType === 'GIFT_CARD' ||
            product.name.toLowerCase().includes('gift voucher') ||
            product.name.toLowerCase().includes('voucher') ||
            product.shortDescription?.toLowerCase().includes('gift voucher')
          )

          // Find a gift voucher product with images
          const productWithImage = giftVoucherProducts.find((product: any) => 
            product.images && product.images.length > 0
          )

          if (productWithImage && productWithImage.images[0]) {
            const image = productWithImage.images[0]
            setImageSrc(image.largeSizeUrl || image.itemUrl)
            setImageAlt(image.caption || `${productWithImage.name} - Gift Voucher`)
          }
        }
      } catch (error) {
        console.log('Using default image for gift voucher section')
      } finally {
        setLoading(false)
      }
    }

    loadRezdyImage()
  }, [])

  if (loading) {
    return (
      <div className={`aspect-[4/3] rounded-2xl overflow-hidden bg-gray-200 animate-pulse ${className}`} />
    )
  }

  return (
    <div className={`aspect-[4/3] rounded-2xl overflow-hidden ${className}`}>
      <Image 
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover transition-transform duration-300 hover:scale-105"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  )
} 