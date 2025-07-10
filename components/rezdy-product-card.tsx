import { RezdyProduct } from "@/lib/types/rezdy";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { getValidImages } from "@/lib/utils/product-utils";

interface RezdyProductCardProps {
  product: RezdyProduct;
}

export function RezdyProductCard({ product }: RezdyProductCardProps) {
  const validImages = getValidImages(product);

  return (
    <div className="group relative h-[400px] overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Background Image */}
      <div className="absolute inset-0">
        {validImages.length > 0 ? (
          <ResponsiveImage
            images={validImages}
            alt={product.name}
            aspectRatio="landscape"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-accent to-coral-600" />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Title at the top */}
        <div>
          <h3 className="font-semibold text-xl text-white line-clamp-2 drop-shadow-lg">
            {product.name}
          </h3>
        </div>

        {/* Buttons at the bottom */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50" 
            asChild
          >
            <Link href={`/tours/${product.productCode}`}>View Details</Link>
          </Button>
          <Button
            className="flex-1 bg-brand-accent text-brand-secondary hover:bg-coral-600 border-none"
            asChild
          >
            <Link href={`/booking/${product.productCode}`}>Book Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
