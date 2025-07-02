import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Clock, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

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

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    } else if (hours === 1) {
      return "1 hour";
    } else if (hours < 24) {
      return `${hours} hours`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      if (remainingHours === 0) {
        return days === 1 ? "1 day" : `${days} days`;
      } else {
        return `${days}d ${remainingHours}h`;
      }
    }
  };

  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <div className="aspect-[4/3] relative">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isFeatured && (
              <Badge className="bg-brand-accent text-brand-secondary">
                Featured
              </Badge>
            )}
            {isPopular && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Popular
              </Badge>
            )}
            {category && (
              <Badge variant="outline" className="bg-white/90 text-gray-700">
                {category}
              </Badge>
            )}
          </div>

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-red-500 text-white">
                -{discountPercentage}%
              </Badge>
            </div>
          )}

          {/* Rating Overlay */}
          {rating && reviewCount > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{rating}</span>
              <span className="text-xs text-gray-600">({reviewCount})</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-brand-accent transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>

        {/* Details Row */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(duration)}</span>
          </div>
          {maxGuests && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Up to {maxGuests}</span>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-brand-accent">
              ${price}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${originalPrice}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">per person</span>
        </div>
      </CardContent>

      {/* Action Buttons */}
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={buildTourDetailsUrl()}>View Details</Link>
        </Button>
        <Button
          className="flex-1 bg-brand-accent text-brand-secondary hover:bg-coral-600"
          onClick={handleBookNow}
        >
          <Calendar className="h-4 w-4 mr-1" />
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
}

// Type export for external use
export type { ProductCardProps };
