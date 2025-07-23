  "use client";

  import { ResponsiveImage } from "@/components/ui/responsive-image";
  import Link from "next/link";

  import { Button } from "@/components/ui/button";
  import { Card } from "@/components/ui/card";
  import { RezdyProduct } from "@/lib/types/rezdy";
  import { Badge } from "@/components/ui/badge";
  import { Users } from "lucide-react";
  import {
    getValidImages,
    generateProductSlug,
    selectRandomImageForProduct,
  } from "@/lib/utils/product-utils";

  interface DynamicTourCardProps {
    product: RezdyProduct;
    loading?: boolean;
    selectedDate?: string; // Date in YYYY-MM-DD format
    participants?: string; // Number of participants
    selectedLocation?: string; // Selected pickup location from search form
  }

  export function DynamicTourCard({
    product,
    loading = false,
    selectedDate,
    participants,
    selectedLocation,
  }: DynamicTourCardProps) {
    if (loading) {
      return (
        <Card className="relative h-96 w-full overflow-hidden shadow-xl rounded-2xl">
          {/* Animated background skeleton */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
          
          {/* Premium gradient overlay to match the actual design */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          
          {/* Premium Inner Border */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
          
          {/* Tour name skeleton at top */}
          <div className="absolute top-0 left-0 right-0 p-6">
            <div className="space-y-3">
              <div className="h-8 bg-white/25 rounded-lg animate-pulse backdrop-blur-sm" />
              <div className="h-8 bg-white/25 rounded-lg w-3/4 animate-pulse backdrop-blur-sm" />
            </div>
          </div>
          
          {/* Button skeletons at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex gap-3">
              <div className="h-14 bg-white/15 rounded-xl flex-1 animate-pulse border-2 border-white/20 backdrop-blur-md" />
              <div className="h-14 bg-white/25 rounded-xl flex-1 animate-pulse backdrop-blur-md" />
            </div>
          </div>
        </Card>
      );
    }

    const validImages = getValidImages(product);
    
    // Optional special image selection for specific products (configurable via product metadata)
    const specialImageConfig = product.customFields?.imageSelection;
    let imagesToUse = validImages;
    
    // Apply special image selection if configured
    if (specialImageConfig?.startIndex !== undefined && specialImageConfig?.count !== undefined) {
      const startIndex = specialImageConfig.startIndex;
      const count = specialImageConfig.count;
      if (validImages.length >= startIndex + count) {
        const specialImages = validImages.slice(startIndex, startIndex + count);
        // Use random selection even for special image configurations
        imagesToUse = selectRandomImageForProduct(product, specialImages);
      }
    }
    // Legacy support for brewery tours - remove this block if no longer needed
    else {
      const breweryTourProducts = ['PRVHY0', 'PTS7WT'];
      const isBreweryTour = breweryTourProducts.includes(product.productCode);
      if (isBreweryTour && validImages.length >= 4) {
        const breweryImages = validImages.slice(2, 4); // Get 3rd and 4th images (indices 2-3)
        // Use random selection within the brewery images
        imagesToUse = selectRandomImageForProduct(product, breweryImages);
      } else {
        // Use random selection for all other products
        imagesToUse = selectRandomImageForProduct(product, validImages);
      }
    }
    
    const slug = generateProductSlug(product);

    const buildDirectBookingUrl = () => {
      const baseUrl = `/booking/${product.productCode}`;
      const params = new URLSearchParams();

      if (selectedDate) {
        params.append("date", selectedDate);
      }
      if (participants) {
        params.append("adults", participants);
      }
      if (selectedLocation && selectedLocation !== "all") {
        params.append("pickupLocation", selectedLocation);
      }

      return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    };

    const buildTourDetailsUrl = () => {
      const baseUrl = `/tours/${slug}`;
      const params = new URLSearchParams();

      if (selectedDate) {
        params.append("tourDate", selectedDate);
      }

      if (participants) {
        params.append("participants", participants);
      }

      if (selectedLocation && selectedLocation !== "all") {
        params.append("pickupLocation", selectedLocation);
      }

      return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    };

    return (
      <Card className="relative h-96 w-full overflow-hidden group hover:shadow-2xl transition-all duration-500 border-0 shadow-xl cursor-pointer rounded-2xl">
        {/* Background Image - Full Height */}
        <div className="absolute inset-0">
          <ResponsiveImage
            images={imagesToUse}
            alt={`${product.name} tour`}
            aspectRatio="landscape"
            className="transition-transform duration-700 group-hover:scale-105 object-cover w-full h-full"
            showNavigation={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            onImageError={(error) => {
              console.warn(`Image failed to load for ${product.name} (${product.productCode}):`, error);
              console.warn('Available images:', imagesToUse.length);
              console.warn('First image URL:', imagesToUse[0]?.itemUrl);
            }}
          />
        </div>

        {/* Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:from-black/85 group-hover:via-black/45 transition-all duration-500" />
        
        {/* Premium Inner Border */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-300" />

        {/* Premium Tour Name at Top */}
        <div className="absolute top-0 left-0 right-0 p-6 text-white">
          <h3 className="font-barlow text-3xl font-semibold leading-[1.1] text-white tracking-tight transition-all duration-300" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>
            {product.name}
          </h3>
        </div>

        {/* Premium Action Buttons at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex gap-3 w-full">
            <Link href={buildTourDetailsUrl()} className="flex-1">
              <Button
                variant="outline"
                className="w-full border-2 border-white/90 text-white bg-white/15 hover:bg-white hover:text-gray-900 
                         backdrop-blur-md transition-all duration-300 py-3.5 font-semibold text-base 
                         shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02]
                         rounded-xl ring-1 ring-white/20 hover:ring-white/40"
                aria-label={`View details for ${product.name} tour`}
              >
                View Details
              </Button>
            </Link>
            <Link href={buildDirectBookingUrl()} className="flex-1">
              <Button
                className="w-full bg-brand-accent text-brand-secondary hover:bg-coral-600 
                         backdrop-blur-md transition-all duration-300 py-3.5 font-semibold text-base 
                         shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02]
                         border-2 border-brand-accent hover:border-coral-600 rounded-xl
                         hover:shadow-coral-500/25"
                aria-label={`Book ${product.name} tour now`}
              >
                Book Now
              </Button>
            </Link>
          </div>
        </div>

        {/* Premium Hover Glow Effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 
                        bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none" />
      </Card>
    );
  }
