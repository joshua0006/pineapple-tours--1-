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
        <Card className="relative h-80 w-full overflow-hidden shadow-lg">
          {/* Animated background skeleton */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
          
          {/* Gradient overlay to match the actual design */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Content skeleton at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
            {/* Tour name skeleton - 2 lines to match line-clamp-2 */}
            <div className="space-y-2">
              <div className="h-7 bg-white/20 rounded animate-pulse" />
              <div className="h-7 bg-white/20 rounded w-3/4 animate-pulse" />
            </div>
            
            {/* Button skeletons */}
            <div className="flex gap-3">
              <div className="h-12 bg-white/10 rounded flex-1 animate-pulse border-2 border-white/20" />
              <div className="h-12 bg-white/20 rounded flex-1 animate-pulse" />
            </div>
          </div>
        </Card>
      );
    }

    const validImages = getValidImages(product);
    
    // Use 3rd and 4th images for brewery tour products
    const breweryTourProducts = ['PRVHY0', 'PTS7WT'];
    const isBreweryTour = breweryTourProducts.includes(product.productCode);
    const imagesToUse = isBreweryTour && validImages.length >= 4 
      ? validImages.slice(2, 4) // Use 3rd and 4th images (indices 2-3)
      : validImages; // Use all valid images for other products
    
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
      <Card className="relative h-80 w-full overflow-hidden group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg cursor-pointer">
        {/* Background Image - Full Height */}
        <div className="absolute inset-0">
          <ResponsiveImage
            images={imagesToUse}
            alt={`${product.name} tour`}
            aspectRatio="landscape"
            className="transition-transform duration-700 group-hover:scale-110 object-cover w-full h-full"
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

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-300" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="space-y-4">
            {/* Tour Name */}
            <h3 className="text-2xl font-bold leading-tight line-clamp-2 drop-shadow-lg group-hover:text-white/95 transition-colors duration-200">
              {product.name}
            </h3>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <Link href={buildTourDetailsUrl()} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-2 border-white/80 text-white bg-white/10 hover:bg-white hover:text-gray-900 backdrop-blur-sm transition-all duration-300 py-3 font-semibold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  aria-label={`View details for ${product.name} tour`}
                >
                  View Details
                </Button>
              </Link>
              <Link href={buildDirectBookingUrl()} className="flex-1">
                <Button
                  className="w-full bg-brand-accent text-brand-secondary hover:bg-brand-accent/90 backdrop-blur-sm transition-all duration-300 py-3 font-semibold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-brand-accent"
                  aria-label={`Book ${product.name} tour now`}
                >
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }
