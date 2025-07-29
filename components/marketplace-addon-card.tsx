"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RezdyExtra } from "@/lib/types/rezdy";
import { 
  Plus, 
  Minus, 
  ShoppingCart,
  MapPin,
  Clock,
  Users,
  Star
} from "lucide-react";

interface SelectedAddon {
  addon: RezdyExtra;
  quantity: number;
}

interface MarketplaceAddonCardProps {
  addons: RezdyExtra[];
  selectedAddons?: SelectedAddon[];
  onAddonSelect?: (addon: RezdyExtra, quantity: number) => void;
  onAddonRemove?: (addonId: string) => void;
  guestCount?: number;
  className?: string;
  showAddToCart?: boolean;
  maxQuantity?: number;
}

export function MarketplaceAddonCard({
  addons,
  selectedAddons = [],
  onAddonSelect,
  onAddonRemove,
  guestCount = 2,
  className = "",
  showAddToCart = true,
  maxQuantity = 10
}: MarketplaceAddonCardProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getQuantity = (addonId: string): number => {
    return quantities[addonId] || 0;
  };

  const setQuantity = (addonId: string, quantity: number) => {
    const newQuantity = Math.max(0, Math.min(quantity, maxQuantity));
    setQuantities(prev => ({
      ...prev,
      [addonId]: newQuantity
    }));
  };

  const calculatePrice = (addon: RezdyExtra, quantity: number): number => {
    let basePrice = addon.price * quantity;
    
    // Apply per-person pricing if applicable
    if (addon.priceType === 'PER_PERSON') {
      basePrice *= guestCount;
    }
    
    return basePrice;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(price);
  };

  const getPriceTypeLabel = (priceType: string): string => {
    switch (priceType) {
      case 'PER_PERSON':
        return `per person (${guestCount} guests)`;
      case 'PER_BOOKING':
        return 'per booking';
      case 'PER_DAY':
        return 'per day';
      default:
        return 'per item';
    }
  };

  const handleAddToCart = (addon: RezdyExtra) => {
    const quantity = getQuantity(addon.id);
    if (quantity > 0 && onAddonSelect) {
      onAddonSelect(addon, quantity);
    }
  };

  const isSelected = (addonId: string): boolean => {
    return selectedAddons.some(selected => selected.addon.id === addonId);
  };

  if (!addons || addons.length === 0) {
    return null;
  }

  return (
    <div className={`grid gap-6 ${className}`}>
      {addons.map((addon, index) => {
        const quantity = getQuantity(addon.id);
        const totalPrice = calculatePrice(addon, quantity);
        const selected = isSelected(addon.id);

        return (
          <motion.div
            key={addon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${
              selected ? 'ring-2 ring-brand-accent border-brand-accent' : 'border-gray-200'
            }`}>
              <div className="grid md:grid-cols-3 gap-0">
                {/* Image Section */}
                <div className="relative aspect-video md:aspect-square bg-gradient-to-br from-blue-50 to-purple-50">
                  {addon.image?.itemUrl ? (
                    <Image
                      src={addon.image.itemUrl}
                      alt={addon.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-brand-accent/20 rounded-full flex items-center justify-center">
                        <Star className="w-8 h-8 text-brand-accent" />
                      </div>
                    </div>
                  )}
                  
                  {/* Price Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-gradient-to-r from-brand-primary to-brand-accent text-white font-semibold">
                      {formatPrice(addon.price)}
                    </Badge>
                  </div>

                  {/* Category Badge */}
                  {addon.category && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 text-gray-700">
                        {addon.category}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="md:col-span-2 p-6">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                      {addon.name}
                    </CardTitle>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className="capitalize">{getPriceTypeLabel(addon.priceType)}</span>
                      </div>
                      
                      {addon.priceType === 'PER_PERSON' && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{guestCount} guests</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    {/* Description */}
                    {addon.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {addon.description}
                      </p>
                    )}

                    {/* Quantity Selector and Add to Cart */}
                    {showAddToCart && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setQuantity(addon.id, quantity - 1)}
                              disabled={quantity === 0}
                              className="h-10 w-10 p-0 hover:bg-gray-100"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            
                            <div className="w-12 text-center font-medium">
                              {quantity}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setQuantity(addon.id, quantity + 1)}
                              disabled={quantity >= maxQuantity}
                              className="h-10 w-10 p-0 hover:bg-gray-100"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          {quantity > 0 && (
                            <div className="text-sm text-gray-600">
                              Total: <span className="font-semibold text-brand-primary">
                                {formatPrice(totalPrice)}
                              </span>
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => handleAddToCart(addon)}
                          disabled={quantity === 0}
                          className={`flex items-center gap-2 transition-colors ${
                            selected 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-brand-accent hover:bg-brand-accent/90'
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {selected ? 'Added' : 'Add to Cart'}
                        </Button>
                      </div>
                    )}

                    {/* Availability Info */}
                    {addon.isAvailable === false && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">Currently unavailable</p>
                      </div>
                    )}

                    {addon.maxQuantity && addon.maxQuantity <= 5 && (
                      <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-700">
                          Limited availability - Max {addon.maxQuantity} per booking
                        </p>
                      </div>
                    )}
                  </CardContent>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}