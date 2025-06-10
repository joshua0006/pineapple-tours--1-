"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Gift, 
  Calendar, 
  Star, 
  CreditCard, 
  Clock, 
  Users, 
  MapPin, 
  Check, 
  Heart,
  Mail,
  Shield,
  Sparkles
} from "lucide-react"
import { RezdyProduct, GiftVoucherTerms } from "@/lib/types/rezdy"
import Image from "next/image"

interface GiftVoucherPreviewProps {
  product: RezdyProduct
  terms: GiftVoucherTerms
  isVisible: boolean
  onPurchase?: () => void
  onViewDetails?: () => void
}

export function GiftVoucherPreview({ 
  product, 
  terms, 
  isVisible, 
  onPurchase, 
  onViewDetails 
}: GiftVoucherPreviewProps) {
  const formatPrice = (price?: number) => {
    if (!price) return "Custom Amount"
    return `$${price.toFixed(0)}`
  }

  const location = typeof product.locationAddress === 'string' 
    ? product.locationAddress 
    : product.locationAddress?.city || 'Multiple Locations'

  const quickFeatures = [
    { icon: <Calendar className="h-4 w-4" />, text: "12 months validity" },
    { icon: <Mail className="h-4 w-4" />, text: "Instant delivery" },
    { icon: <Star className="h-4 w-4" />, text: "Fully transferable" },
    { icon: <Shield className="h-4 w-4" />, text: "Secure purchase" }
  ]

  if (!isVisible) return null

  return (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-brand-text line-clamp-2 font-barlow">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-3 w-3 text-brand-accent" />
              <span className="text-xs text-muted-foreground">{location}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-brand-text">
              {formatPrice(product.advertisedPrice)}
            </div>
            <div className="text-xs text-muted-foreground">gift voucher</div>
          </div>
        </div>

        {/* Quick Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 font-work-sans">
          {product.shortDescription || 
           "Perfect gift for creating unforgettable memories and experiences. Choose from our extensive collection of tours and activities."}
        </p>

        {/* Quick Features */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {quickFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="text-brand-accent">{feature.icon}</div>
              <span className="text-xs text-muted-foreground">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button 
          size="sm" 
          className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-secondary"
          onClick={onPurchase}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Purchase Now
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full"
          onClick={onViewDetails}
        >
          View Full Details
        </Button>
      </div>

      {/* Decorative Element */}
      <div className="absolute top-2 right-2 text-brand-accent/20">
        <Sparkles className="h-6 w-6" />
      </div>
    </div>
  )
} 