import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  location: string;
  duration: number; // in hours
  maxGuests?: number;
  rating?: number;
  reviewCount?: number;
  category?: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  slug: string;
  onBookNow?: () => void;
  selectedDate?: string; // Date in YYYY-MM-DD format
  participants?: string; // Number of participants
  selectedLocation?: string; // Selected pickup location from search form
}

export function ProductCard({
  id,
  title,
  description,
  image,
  price,
  originalPrice,
  location,
  duration,
  maxGuests,
  rating = 4.5,
  reviewCount = 0,
  category,
  isPopular = false,
  isFeatured = false,
  slug,
  onBookNow,
  selectedDate,
  participants,
  selectedLocation,
}: ProductCardProps) {
  const handleBookNow = () => {
    if (onBookNow) {
      onBookNow();
    } else {
      // Default booking behavior - redirect to booking page with optional parameters
      const params = new URLSearchParams();
      if (selectedDate) {
        params.append("date", selectedDate);
      }
      if (participants) {
        params.append("adults", participants);
      }
      if (selectedLocation && selectedLocation !== "all") {
        params.append("location", selectedLocation);
      }
      const queryString = params.toString();
      const url = queryString
        ? `/booking/${slug}?${queryString}`
        : `/booking/${slug}`;
      window.location.href = url;
    }
  };

  // Build tour details URL with search parameters preserved
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
      params.append("location", selectedLocation);
    }

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  };

  return (
    <div className="group relative h-[400px] overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Title at the top */}
        <div>
          <h3 className="font-semibold text-xl text-white line-clamp-2 drop-shadow-lg">
            {title}
          </h3>
        </div>

        {/* Buttons at the bottom */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50" 
            asChild
          >
            <Link href={buildTourDetailsUrl()}>View Details</Link>
          </Button>
          <Button
            className="flex-1 bg-brand-accent text-brand-secondary hover:bg-coral-600 border-none"
            onClick={handleBookNow}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}

// Type export for external use
export type { ProductCardProps };
