import Link from "next/link";
import { Calendar, Users, Star, MapPin } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface Tour {
  id: string;
  title: string;
  image: string;
  location: string;
  duration: string;
  groupSize: string;
  rating: number;
  reviewCount: number;
  price: number;
  isPopular?: boolean;
}

interface TourCardProps {
  tour?: Tour;
  title?: string;
  location?: string;
  image?: string;
  price?: number;
  duration?: number;
  rating?: number;
  slug?: string;
}

export function TourCard({
  tour,
  title,
  location,
  image,
  price,
  duration,
  rating,
  slug,
}: TourCardProps) {
  // Use direct props if provided, otherwise fall back to tour object
  const cardData = {
    title: title || tour?.title || "",
    location: location || tour?.location || "",
    image: image || tour?.image || "",
    price: price || tour?.price || 0,
    duration: duration || tour?.duration || "",
    rating: rating || tour?.rating || 0,
    reviewCount: tour?.reviewCount || 0,
    groupSize: tour?.groupSize || "",
    isPopular: tour?.isPopular || false,
    id: tour?.id || slug || "",
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <CardHeader className="p-0 relative">
        <Image
          src={cardData.image}
          alt={cardData.title}
          width={400}
          height={240}
          className="w-full h-60 object-cover"
        />
        {cardData.isPopular && (
          <Badge className="absolute right-2 top-2 bg-accent text-accent-foreground hover:bg-accent/90">
            Best Seller
          </Badge>
        )}
        <div className="absolute bottom-2 left-2 flex items-center text-white text-sm bg-black/50 rounded px-2 py-1">
          <Star className="mr-1 h-4 w-4 fill-accent text-accent" />
          <span>{cardData.rating}</span>
          {cardData.reviewCount > 0 && (
            <span className="ml-1 text-white/70">({cardData.reviewCount})</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
          {cardData.title}
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="mr-1 h-4 w-4" />
            <span>{cardData.location}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4 text-accent" />
            <span>
              {typeof cardData.duration === "number"
                ? `${cardData.duration} days`
                : cardData.duration}
            </span>
          </div>
          {cardData.groupSize && (
            <div className="flex items-center">
              <Users className="mr-1 h-4 w-4 text-accent" />
              <span>{cardData.groupSize}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold">${cardData.price}</span>
          <span className="text-sm text-muted-foreground ml-1">per person</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/tours/${cardData.id}`}>
            <Button
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10"
            >
              View Details
            </Button>
          </Link>
          <Link href={`/booking/${cardData.id}`}>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Book Now
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
