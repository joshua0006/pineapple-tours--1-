"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RezdyProduct } from "@/lib/types/rezdy";
import {
  getPrimaryImageUrl,
  getLocationString,
  generateProductSlug,
  getCityFromLocation,
  areProductsLocationRelated,
} from "@/lib/utils/product-utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRezdyProducts } from "@/hooks/use-rezdy";
import { useState, useMemo } from "react";

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

  // NEW: related tours modal state and data
  const { data: allProducts, loading: productsLoading } =
    useRezdyProducts(1000);
  const currentCity = getCityFromLocation(product.locationAddress);

  const relatedTours = useMemo(() => {
    if (productsLoading || !allProducts) {
      console.log("[RelatedTours] Products still loading or unavailable.");
      return [] as RezdyProduct[];
    }

    const baseCityRaw = getCityFromLocation(product.locationAddress);
    const baseCity =
      baseCityRaw
        ?.toLowerCase()
        .replace(/mount tamborine|tamborine mountain/, "tamborine") || null;

    console.log(
      "[RelatedTours] Base city:",
      baseCityRaw,
      "->",
      baseCity,
      "| Total products:",
      allProducts.length
    );

    const results: RezdyProduct[] = [];

    (allProducts as RezdyProduct[]).forEach((p) => {
      if (p.productCode === product.productCode) return;

      const candidateCityRaw = getCityFromLocation(p.locationAddress);
      const candidateCity =
        candidateCityRaw
          ?.toLowerCase()
          .replace(/mount tamborine|tamborine mountain/, "tamborine") || null;

      // Flags for debugging
      const reasons: string[] = [];

      // City matching logic
      let cityMatches = false;
      if (baseCity && candidateCity) {
        cityMatches = baseCity === candidateCity;
      } else {
        cityMatches = areProductsLocationRelated(product, p);
      }
      if (!cityMatches) reasons.push("city-mismatch");

      // Exclusion checks
      if (
        p.name.toLowerCase().includes("gift card") ||
        p.name.toLowerCase().includes("voucher") ||
        p.name.toLowerCase().includes("credit") ||
        p.productType === "GIFT_VOUCHER"
      ) {
        reasons.push("giftcard/voucher");
      }
      if (p.status !== "ACTIVE") reasons.push("inactive");
      if (p.advertisedPrice == null || p.advertisedPrice <= 0)
        reasons.push("no-price");

      if (reasons.length === 0) {
        results.push(p);
      } else {
        console.debug(
          "[RelatedTours] Exclude",
          p.productCode,
          "| Reasons:",
          reasons.join(",")
        );
      }
    });

    console.log("[RelatedTours] Final count:", results.length);
    return results;
  }, [allProducts, productsLoading, product]);

  // If still loading show a loading message
  const relatedToursDisplay = productsLoading ? [] : relatedTours;

  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);

  const selectedTours = useMemo(
    () =>
      relatedToursDisplay.filter((t) => selectedCodes.includes(t.productCode)),
    [relatedToursDisplay, selectedCodes]
  );

  const totalPrice = useMemo(() => {
    const base = product.advertisedPrice ?? 0;
    const extras = selectedTours.reduce(
      (sum, t) => sum + (t.advertisedPrice ?? 0),
      0
    );
    return base + extras;
  }, [product.advertisedPrice, selectedTours]);

  const buildCombinedBookingUrl = () => {
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
    if (selectedCodes.length > 0) {
      params.append("extras", selectedCodes.join(","));
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
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="w-full bg-brand-accent text-brand-secondary hover:bg-brand-accent/90 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 py-3 font-semibold"
                aria-label={`Book ${product.name} tour now`}
              >
                Book Now
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Select Related Tours</DialogTitle>
                <DialogDescription>
                  Choose extra tours in the same location to avoid schedule
                  conflicts. Prices are per person.
                </DialogDescription>
              </DialogHeader>

              <div className="relative mt-4 flex-1 min-h-0">
                {/* Scroll buttons */}
                {relatedToursDisplay.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white shadow-lg border-gray-300"
                      onClick={() => {
                        if (scrollRef) {
                          scrollRef.scrollBy({
                            left: -300,
                            behavior: "smooth",
                          });
                        }
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white shadow-lg border-gray-300"
                      onClick={() => {
                        if (scrollRef) {
                          scrollRef.scrollBy({ left: 300, behavior: "smooth" });
                        }
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                <ScrollArea className="h-80 w-full">
                  <div className="h-80 w-full overflow-hidden">
                    <div className="px-10 h-full">
                      {relatedToursDisplay.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No other tours available in this location.
                        </p>
                      )}
                      <div
                        ref={setScrollRef}
                        className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide h-full"
                        style={{
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                        }}
                      >
                        {relatedToursDisplay.map((t) => {
                          const checked = selectedCodes.includes(t.productCode);
                          const tourImage = getPrimaryImageUrl(t);
                          return (
                            <div
                              key={t.productCode}
                              className={`min-w-[300px] rounded-lg border p-4 cursor-pointer transition-all ${
                                checked
                                  ? "border-brand-accent bg-brand-accent/5 shadow-md"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => {
                                if (checked) {
                                  setSelectedCodes((prev) =>
                                    prev.filter((c) => c !== t.productCode)
                                  );
                                } else {
                                  setSelectedCodes((prev) => [
                                    ...prev,
                                    t.productCode,
                                  ]);
                                }
                              }}
                            >
                              {/* Image */}
                              <div className="relative h-40 w-full mb-3 rounded-md overflow-hidden">
                                {tourImage ? (
                                  <Image
                                    src={tourImage}
                                    alt={t.name}
                                    fill
                                    className="object-cover"
                                    sizes="300px"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">
                                      No image
                                    </span>
                                  </div>
                                )}
                                {/* Checkbox overlay */}
                                <div className="absolute top-2 right-2">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(value) => {
                                      if (value) {
                                        setSelectedCodes((prev) => [
                                          ...prev,
                                          t.productCode,
                                        ]);
                                      } else {
                                        setSelectedCodes((prev) =>
                                          prev.filter(
                                            (c) => c !== t.productCode
                                          )
                                        );
                                      }
                                    }}
                                    className="bg-white/90 border-white"
                                  />
                                </div>
                              </div>

                              {/* Content */}
                              <div className="space-y-3">
                                <h4 className="font-medium text-sm line-clamp-2 leading-tight min-h-[2.5rem]">
                                  {t.name}
                                </h4>

                                <div className="flex items-center text-xs text-gray-500">
                                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">
                                    {getLocationString(t.locationAddress)}
                                  </span>
                                </div>

                                {t.advertisedPrice && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                      per person
                                    </span>
                                    <span className="font-bold text-brand-accent text-lg">
                                      ${t.advertisedPrice.toFixed(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>

              <div className="mt-4 flex items-center justify-between font-semibold text-base border-t pt-4">
                <span>Total Price:</span>
                <span>${totalPrice.toFixed(0)}</span>
              </div>

              <DialogFooter className="mt-4">
                <Link href={buildCombinedBookingUrl()} className="w-full">
                  <Button className="w-full bg-brand-accent text-brand-secondary">
                    Proceed to Booking
                  </Button>
                </Link>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  );
}
