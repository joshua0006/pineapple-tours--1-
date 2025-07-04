"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RezdyProduct } from "@/lib/types/rezdy";
import {
  getPrimaryImageUrl,
  getLocationString,
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
      <Card className="overflow-hidden animate-pulse">
        <div className="relative h-56 w-full bg-gray-200" />
        <CardContent className="p-6">
          <div className="h-6 bg-gray-200 rounded mb-3" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
          <div className="h-8 bg-gray-200 rounded w-20" />
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <div className="h-12 bg-gray-200 rounded w-full" />
        </CardFooter>
      </Card>
    );
  }

  const primaryImageUrl = getPrimaryImageUrl(product);
  const location = getLocationString(product.locationAddress);
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
      params.append("pickupLocation", selectedLocation);
    }

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  };

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white">
      <div className="relative">
        <div className="relative h-56 w-full overflow-hidden">
          {primaryImageUrl ? (
            <Image
              src={primaryImageUrl}
              alt={`${product.name} tour`}
              fill
              className="transition-transform duration-500 group-hover:scale-110 object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
          {product.status === "ACTIVE" && (
            <Badge className="absolute right-3 top-3 bg-brand-accent/90 text-brand-secondary hover:bg-brand-accent shadow-lg backdrop-blur-sm">
              Available
            </Badge>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 min-h-[3.5rem] leading-7 group-hover:text-brand-accent transition-colors duration-200">
              {product.name}
            </h3>
            <div className="mt-2 flex items-center text-gray-600">
              <MapPin
                className="mr-2 h-4 w-4 text-brand-accent"
                aria-hidden="true"
              />
              <span className="text-sm line-clamp-1 font-medium">
                {location}
              </span>
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                Starting from
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {product.advertisedPrice ? (
                  <>
                    {`$${product.advertisedPrice.toFixed(0)}`}
                    <span className="text-sm text-gray-500 font-normal ml-1">
                      per person
                    </span>
                  </>
                ) : (
                  "Price on request"
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <div className="flex gap-3 w-full">
          <Link href={buildTourDetailsUrl()} className="flex-1">
            <Button
              variant="outline"
              className="w-full border-brand-accent text-brand-accent hover:text-brand-accent hover:bg-brand-accent/10 transition-all duration-200 py-3 font-semibold"
              aria-label={`View details for ${product.name} tour`}
            >
              View Details
            </Button>
          </Link>
          <Link href={buildDirectBookingUrl()} className="flex-1">
            <Button
              className="w-full bg-brand-accent text-brand-secondary hover:bg-brand-accent/90 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 py-3 font-semibold"
              aria-label={`Book ${product.name} tour now`}
            >
              Book Now
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
