"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RezdyExtra } from "@/lib/types/rezdy";
import { 
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SelectedAddon {
  addon: RezdyExtra;
  quantity: number;
}

interface HorizontalScrollableAddonCardProps {
  addons: RezdyExtra[];
  selectedAddons?: SelectedAddon[];
  onAddonSelect?: (addon: RezdyExtra, quantity: number) => void;
  onAddonRemove?: (addonId: string) => void;
  guestCount?: number;
  showAddToCart?: boolean;
  maxQuantity?: number;
}

export function HorizontalScrollableAddonCard({
  addons,
  selectedAddons = [],
  onAddonSelect,
  onAddonRemove,
  guestCount = 2,
  showAddToCart = true,
  maxQuantity = 10
}: HorizontalScrollableAddonCardProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = (addon: RezdyExtra) => {
    if (onAddonSelect) {
      onAddonSelect(addon, 1);
    }
  };

  const isSelected = (addonId: string): boolean => {
    return selectedAddons.some(selected => selected.addon.id === addonId);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of one card plus gap
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (!addons || addons.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      <div className="hidden md:block">
        <Button
          variant="outline"
          size="sm"
          onClick={() => scroll('left')}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-lg border-gray-200 hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => scroll('right')}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-lg border-gray-200 hover:bg-gray-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}
      >
        {addons.map((addon, index) => {
          const selected = isSelected(addon.id);

          return (
            <motion.div
              key={addon.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex-shrink-0 w-80 h-96"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className={`group relative h-full overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                selected ? 'ring-2 ring-brand-accent shadow-lg' : ''
              }`}>
                {/* Background Image */}
                <div className="absolute inset-0">
                  {addon.image?.itemUrl ? (
                    <Image
                      src={addon.image.itemUrl}
                      alt={addon.name}
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
                      <div className="w-20 h-20 bg-brand-accent/20 rounded-full flex items-center justify-center">
                        <Star className="w-10 h-10 text-brand-accent" />
                      </div>
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="relative h-full flex flex-col justify-between p-6">
                  {/* Title at top */}
                  <h3 className="font-bold text-2xl text-white text-center drop-shadow-lg">
                    {addon.name}
                  </h3>

                  {/* Add to Cart Button at bottom */}
                  {showAddToCart && (
                    <Button
                      onClick={() => handleAddToCart(addon)}
                      className={`flex items-center gap-2 transition-all duration-300 px-6 py-3 ${
                        selected 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-brand-accent hover:bg-brand-accent/90 text-white'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {selected ? 'Added to Cart' : 'Add to Cart'}
                    </Button>
                  )}

                  {/* Availability Warning */}
                  {addon.isAvailable === false && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Currently Unavailable
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Scroll Indicator Dots */}
      <div className="flex justify-center mt-4 gap-2 md:hidden">
        {addons.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-gray-300"
          />
        ))}
      </div>
    </div>
  );
}