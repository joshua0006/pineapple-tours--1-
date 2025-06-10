"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Gift, Calendar, Star, CreditCard, Eye, ShoppingCart, ArrowRight, Sparkles, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { GiftVoucherDetailModal } from "@/components/ui/gift-voucher-detail-modal"
import { useGiftVoucherTerms } from "@/hooks/use-rezdy"
import { RezdyProduct, GiftVoucherPurchaseData } from "@/lib/types/rezdy"

interface GiftCardProductsProps {
  className?: string
}

export function GiftCardProducts({ className = "" }: GiftCardProductsProps) {
  const [products, setProducts] = useState<RezdyProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<RezdyProduct | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const terms = useGiftVoucherTerms()

  useEffect(() => {
    const loadGiftCardProducts = async () => {
      try {
        const response = await fetch('/api/rezdy/products?limit=1000')
        if (response.ok) {
          const data = await response.json()
          const allProducts = data.products || data.data || []
          
          // Filter for gift card products with enhanced filtering
          const giftCardProducts = allProducts.filter((product: any) => 
            (product.productType === 'GIFT_CARD' ||
             product.name.toLowerCase().includes('gift voucher') ||
             product.name.toLowerCase().includes('voucher')) &&
            product.images && product.images.length > 0
          ).slice(0, 4) // Limit to 4 products
          
          setProducts(giftCardProducts)
        }
      } catch (error) {
        console.error('Error loading gift card products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadGiftCardProducts()
  }, [])

  const handleProductClick = (product: RezdyProduct) => {
    setSelectedProduct(product)
    setShowDetailModal(true)
  }

  const handlePurchase = (purchaseData: GiftVoucherPurchaseData) => {
    console.log('Gift voucher purchase:', purchaseData)
    // Handle purchase logic here
    setShowDetailModal(false)
  }

  const formatPrice = (price?: number) => {
    if (!price) return "Custom Amount"
    return `$${price.toFixed(0)}`
  }

  const getProductFeatures = (product: RezdyProduct) => {
    const features = []
    
    if (product.advertisedPrice) {
      features.push({ icon: <CreditCard className="h-3 w-3" />, text: formatPrice(product.advertisedPrice) })
    }
    
    features.push({ icon: <Calendar className="h-3 w-3" />, text: "12 months validity" })
    features.push({ icon: <Gift className="h-3 w-3" />, text: "Digital delivery" })
    
    if (product.quantityRequiredMin && product.quantityRequiredMax) {
      features.push({ 
        icon: <Users className="h-3 w-3" />, 
        text: `${product.quantityRequiredMin}-${product.quantityRequiredMax} people` 
      })
    }
    
    return features.slice(0, 3) // Limit to 3 features for clean display
  }

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

  if (products.length === 0) {
    return (
      <div className={`grid gap-4 sm:grid-cols-2 ${className}`}>
        <div className="space-y-4">
          <Card className="relative h-48 overflow-hidden rounded-lg bg-gradient-to-br from-brand-accent/20 to-brand-accent/10 border-none">
            <CardContent className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <Gift className="h-12 w-12 text-brand-accent mx-auto mb-2" />
                <p className="text-brand-text font-medium">Gift Vouchers Available</p>
                <p className="text-xs text-muted-foreground mt-1">Perfect for any occasion</p>
              </div>
            </CardContent>
          </Card>
          <Card className="relative h-32 overflow-hidden rounded-lg bg-gradient-to-br from-brand-accent/10 to-brand-accent/5 border-none">
            <CardContent className="h-full flex items-center justify-center p-4">
              <div className="text-center">
                <CreditCard className="h-8 w-8 text-brand-accent mx-auto mb-1" />
                <p className="text-sm text-muted-foreground">Flexible Amounts</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4 sm:mt-8">
          <Card className="relative h-32 overflow-hidden rounded-lg bg-gradient-to-br from-brand-accent/5 to-brand-accent/10 border-none">
            <CardContent className="h-full flex items-center justify-center p-4">
              <div className="text-center">
                <Calendar className="h-8 w-8 text-brand-accent mx-auto mb-1" />
                <p className="text-sm text-muted-foreground">Valid for 12 Months</p>
              </div>
            </CardContent>
          </Card>
          <Card className="relative h-48 overflow-hidden rounded-lg bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 border-none">
            <CardContent className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <Star className="h-12 w-12 text-brand-accent mx-auto mb-2" />
                <p className="text-brand-text font-medium">Redeemable for Any Tour</p>
                <Link href="/gift-vouchers">
                  <Button size="sm" className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90 mt-3">
                    View All Vouchers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Single product display
  if (products.length === 1) {
    const product = products[0]
    return (
      <>
                  <div className={`relative group cursor-pointer ${className}`} onClick={() => handleProductClick(product)}>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden">
              <Image 
                src={product.images?.[0]?.largeSizeUrl || product.images?.[0]?.itemUrl || "/api/placeholder/600/400"}
                alt={product.images?.[0]?.caption || product.name}
                fill
                className="object-cover transition-all duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 opacity-90 group-hover:opacity-95 transition-opacity duration-300" />
          </div>
          
          {/* Simplified Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-6">
            {/* Top badge */}
            <div className="flex justify-start">
              <Badge className="bg-brand-accent/90 text-brand-secondary backdrop-blur-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                Popular Choice
              </Badge>
            </div>

            {/* Bottom content - only name */}
            <div>
              <h3 className="text-white text-xl font-bold drop-shadow-lg line-clamp-2">
                {product.name}
              </h3>
            </div>
          </div>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-brand-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
        </div>

        {/* Detail Modal */}
        {selectedProduct && (
          <GiftVoucherDetailModal
            product={selectedProduct}
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            terms={terms}
            onPurchase={handlePurchase}
            isPopular={true}
          />
        )}
      </>
    )
  }

  // Multiple products grid layout
  return (
    <>
      <div className={`grid gap-4 sm:grid-cols-2 ${className}`}>
        <div className="space-y-4">
          {products[0] && (
            <div 
              className="relative h-48 overflow-hidden rounded-lg group cursor-pointer"
              onClick={() => handleProductClick(products[0])}
            >
                             <Image
                 src={products[0].images?.[0]?.largeSizeUrl || products[0].images?.[0]?.itemUrl || "/api/placeholder/600/400"}
                 alt={products[0].images?.[0]?.caption || products[0].name}
                fill
                className="object-cover transition-all duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 opacity-90 group-hover:opacity-95 transition-opacity duration-300" />
              
              {/* Simplified overlay content */}
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <div className="flex justify-start">
                  <Badge className="bg-brand-accent/90 text-brand-secondary text-xs">
                    Most Popular
                  </Badge>
                </div>

                <div>
                  <h4 className="text-white font-semibold text-sm drop-shadow line-clamp-2">
                    {products[0].name}
                  </h4>
                </div>
              </div>
            </div>
          )}
          
          {products[1] && (
            <div 
              className="relative h-32 overflow-hidden rounded-lg group cursor-pointer"
              onClick={() => handleProductClick(products[1])}
            >
                             <Image
                 src={products[1].images?.[0]?.largeSizeUrl || products[1].images?.[0]?.itemUrl || "/api/placeholder/600/400"}
                 alt={products[1].images?.[0]?.caption || products[1].name}
                fill
                className="object-cover transition-all duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 opacity-90 group-hover:opacity-95 transition-opacity duration-300" />
              
              <div className="absolute inset-0 flex items-end p-3">
                <div className="w-full">
                  <h4 className="text-white font-medium text-sm drop-shadow line-clamp-1">
                    {products[1].name}
                  </h4>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-4 sm:mt-8">
          {products[2] && (
            <div 
              className="relative h-32 overflow-hidden rounded-lg group cursor-pointer"
              onClick={() => handleProductClick(products[2])}
            >
                             <Image
                 src={products[2].images?.[0]?.largeSizeUrl || products[2].images?.[0]?.itemUrl || "/api/placeholder/600/400"}
                 alt={products[2].images?.[0]?.caption || products[2].name}
                fill
                className="object-cover transition-all duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 opacity-90 group-hover:opacity-95 transition-opacity duration-300" />
              
              <div className="absolute inset-0 flex items-end p-3">
                <div className="w-full">
                  <h4 className="text-white font-medium text-sm drop-shadow line-clamp-1">
                    {products[2].name}
                  </h4>
                </div>
              </div>
            </div>
          )}
          
                     {/* Fourth voucher card or call-to-action */}
           {products[3] ? (
             <div 
               className="relative h-48 overflow-hidden rounded-lg group cursor-pointer"
               onClick={() => handleProductClick(products[3])}
             >
               <Image
                 src={products[3].images?.[0]?.largeSizeUrl || products[3].images?.[0]?.itemUrl || "/api/placeholder/600/400"}
                 alt={products[3].images?.[0]?.caption || products[3].name}
                 fill
                 className="object-cover transition-all duration-500 group-hover:scale-110"
                 sizes="(max-width: 640px) 100vw, 50vw"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 opacity-90 group-hover:opacity-95 transition-opacity duration-300" />
               
               <div className="absolute inset-0 flex flex-col justify-between p-4">
                 <div className="flex justify-start">
                   <Badge className="bg-brand-accent/90 text-brand-secondary text-xs">
                     <Sparkles className="h-3 w-3 mr-1" />
                     Featured
                   </Badge>
                 </div>

                 <div>
                   <h4 className="text-white font-semibold text-sm drop-shadow line-clamp-2">
                     {products[3].name}
                   </h4>
                 </div>
               </div>
             </div>
           ) : (
             /* Fallback call-to-action card when no 4th product */
             <div className="relative h-48 overflow-hidden rounded-lg bg-gradient-to-br from-brand-accent/20 to-brand-accent/10 group cursor-pointer hover:from-brand-accent/25 hover:to-brand-accent/15 transition-all duration-300">
               <Card className="h-full border-none bg-transparent">
                 <CardContent className="h-full flex items-center justify-center p-6">
                   <div className="text-center">
                     <div className="relative">
                       <Gift className="h-12 w-12 text-brand-accent mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                       <Sparkles className="h-4 w-4 text-brand-accent/60 absolute -top-1 -right-1 group-hover:text-brand-accent transition-colors duration-300" />
                     </div>
                     <h4 className="font-semibold text-brand-text mb-2 group-hover:text-brand-accent transition-colors duration-300">Perfect Gift</h4>
                     <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                       Give the gift of unforgettable experiences with our flexible vouchers
                     </p>
                     <div className="space-y-2">
                       <Link href="/gift-vouchers">
                         <Button size="sm" className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90 w-full group-hover:scale-105 transition-transform duration-300">
                           <Gift className="mr-2 h-4 w-4" />
                           View All Vouchers
                         </Button>
                       </Link>
                       <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                         <div className="flex items-center gap-1">
                           <Clock className="h-3 w-3" />
                           <span>12 months</span>
                         </div>
                         <div className="flex items-center gap-1">
                           <Star className="h-3 w-3" />
                           <span>Any tour</span>
                         </div>
                       </div>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </div>
           )}
        </div>
      </div>

      {/* Detail Modal for all products */}
      {selectedProduct && (
        <GiftVoucherDetailModal
          product={selectedProduct}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          terms={terms}
          onPurchase={handlePurchase}
          isPopular={products.indexOf(selectedProduct) === 0}
        />
      )}
    </>
  )
} 