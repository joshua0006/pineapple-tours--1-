import Image from "next/image";
import { Star, MapPin, Wifi, Car, Coffee, Waves } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AccommodationCardProps {
  name: string;
  location: string;
  type: string;
  image: string;
  rating: number;
  price: number;
  amenities: string[];
  description: string;
}

export function AccommodationCard({
  name,
  location,
  type,
  image,
  rating,
  price,
  amenities,
  description,
}: AccommodationCardProps) {
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />;
      case "parking":
      case "car":
        return <Car className="h-4 w-4" />;
      case "restaurant":
      case "coffee":
        return <Coffee className="h-4 w-4" />;
      case "beach access":
      case "spa":
        return <Waves className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardHeader className="p-0 relative">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="absolute top-3 left-3">
          <Badge className="bg-brand-accent text-brand-secondary">{type}</Badge>
        </div>
        <div className="absolute top-3 right-3 bg-black/70 rounded-full px-2 py-1 flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-white text-sm font-medium">{rating}</span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-semibold mb-1 group-hover:text-brand-accent transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{location}</span>
          </div>
        </div>

        <p className="text-muted-foreground mb-4 line-clamp-2">{description}</p>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {amenities.slice(0, 4).map((amenity, index) => (
              <div
                key={index}
                className="flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2 py-1"
              >
                {getAmenityIcon(amenity)}
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold">${price}</span>
            <span className="text-sm text-muted-foreground ml-1">
              per night
            </span>
          </div>
          <Button className="bg-brand-accent text-brand-secondary hover:bg-coral-600">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
