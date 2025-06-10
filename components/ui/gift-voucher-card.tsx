"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Gift, Calendar, Star, CreditCard, Users, MapPin, Eye } from "lucide-react"
import { RezdyProduct, GiftVoucherTerms, GiftVoucherPurchaseData } from "@/lib/types/rezdy"
import { GiftVoucherDetailModal } from "@/components/ui/gift-voucher-detail-modal"

interface GiftVoucherCardProps {
  product: RezdyProduct
  isPopular?: boolean
  terms: GiftVoucherTerms
  onPurchase?: (productCode: string) => void
  onPurchaseComplete?: (purchaseData: GiftVoucherPurchaseData) => void
  className?: string
}

export function GiftVoucherCard({ 
  product, 
  isPopular = false, 
  terms, 
  onPurchase,
  onPurchaseComplete,
  className = "" 
}: GiftVoucherCardProps) {
  const [showDetailModal, setShowDetailModal] = useState(false)

  const handlePurchase = () => {
    if (onPurchase) {
      onPurchase(product.productCode)
    }
  }

  const formatPrice = (price?: number) => {
    if (!price) return "Custom Amount"
    return `$${price.toFixed(0)}`
  }

  const getVoucherFeatures = () => {
    const features = [
      { icon: <Calendar className="h-3 w-3" />, text: "Valid for 12 months" },
      { icon: <Gift className="h-3 w-3" />, text: "Digital delivery" },
      { icon: <Star className="h-3 w-3" />, text: "Transferable" },
    ]

    if (product.productType === 'GIFT_CARD') {
      features.push({ icon: <CreditCard className="h-3 w-3" />, text: "Flexible redemption" })
    }

    if (product.quantityRequiredMin && product.quantityRequiredMax) {
      features.push({ 
        icon: <Users className="h-3 w-3" />, 
        text: `${product.quantityRequiredMin}-${product.quantityRequiredMax} people` 
      })
    }

    return features
  }

  return (
    <Card className={`overflow-hidden hover:shadow-xl transition-all duration-300 relative group flex flex-col ${className}`}>
      {isPopular && (
        <Badge className="absolute top-4 right-4 bg-brand-accent text-brand-secondary z-10 animate-pulse">
          Most Popular
        </Badge>
      )}
      
      <div className="relative h-48 overflow-hidden">
        <img 
          src={product.images?.[0]?.itemUrl || "/api/placeholder/300/200"} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <div className="text-2xl font-bold font-barlow">
            {formatPrice(product.advertisedPrice)}
          </div>
          {product.productType === 'GIFT_CARD' && (
            <div className="text-sm opacity-90">Gift Voucher</div>
          )}
        </div>
        {product.locationAddress && (
          <div className="absolute top-4 left-4 text-white/90 text-xs flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-32">
              {typeof product.locationAddress === 'string' 
                ? product.locationAddress 
                : product.locationAddress.city || 'Multiple Locations'
              }
            </span>
          </div>
        )}
      </div>

      <CardHeader className="pb-3 flex-grow">
        <CardTitle className="font-barlow text-brand-text line-clamp-2 min-h-[3rem] flex items-start">
          {product.name}
        </CardTitle>
        <CardDescription className="font-work-sans line-clamp-3">
          {product.shortDescription || 'Perfect for creating unforgettable memories and experiences'}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 mt-auto">
        <div className="space-y-4">
          {/* Features */}
          <div className="space-y-2">
            {getVoucherFeatures().map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="text-brand-accent">{feature.icon}</div>
                {feature.text}
              </div>
            ))}
          </div>

          <Separator />

          {/* Quick Preview Button */}
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setShowDetailModal(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Quick Preview
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Gift Voucher Detail Modal */}
      <GiftVoucherDetailModal
        product={product}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        terms={terms}
        isPopular={isPopular}
        onPurchase={onPurchaseComplete}
      />
    </Card>
  )
} 