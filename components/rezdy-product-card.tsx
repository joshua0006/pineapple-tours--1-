import { RezdyProduct, RezdyAddress } from "@/lib/types/rezdy";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, DollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { getValidImages } from "@/lib/utils/product-utils";

interface RezdyProductCardProps {
  product: RezdyProduct;
}

// Helper function to format address
const formatAddress = (address: string | RezdyAddress | undefined): string => {
  if (!address) return "";

  if (typeof address === "string") {
    return address;
  }

  // Handle address object
  const parts = [];
  if (address.addressLine) parts.push(address.addressLine);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postCode) parts.push(address.postCode);

  return parts.join(", ");
};

export function RezdyProductCard({ product }: RezdyProductCardProps) {
  const validImages = getValidImages(product);
  const formattedAddress = formatAddress(product.locationAddress);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {validImages.length > 0 && (
        <div className="relative h-48 w-full">
          <ResponsiveImage
            images={validImages}
            alt={product.name}
            aspectRatio="landscape"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {product.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {product.shortDescription}
            </CardDescription>
          </div>
          {product.advertisedPrice && (
            <div className="flex items-center text-lg font-bold text-primary ml-2">
              <DollarSign className="h-4 w-4" />
              {product.advertisedPrice}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {product.quantityRequiredMin && product.quantityRequiredMax && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {product.quantityRequiredMin}-{product.quantityRequiredMax}{" "}
                people
              </span>
            </div>
          )}

          {formattedAddress && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{formattedAddress}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {product.productCode}
          </Badge>

          {product.productType && (
            <Badge variant="outline" className="text-xs">
              {product.productType}
            </Badge>
          )}

          {product.status && (
            <Badge
              variant={product.status === "ACTIVE" ? "default" : "destructive"}
              className="text-xs"
            >
              {product.status}
            </Badge>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {product.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-4">
        <Link href={`/tours/${product.productCode}`} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-primary text-primary hover:bg-primary/10"
          >
            View Details
          </Button>
        </Link>
        <Link href={`/booking/${product.productCode}`} className="flex-1">
          <Button
            size="sm"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Book Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
