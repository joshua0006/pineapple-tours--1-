"use client";

import { useState, useMemo } from "react";
import { MapPin, Users, Clock, Star, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import { useRezdyProducts } from "@/hooks/use-rezdy";
import { RezdyProduct } from "@/lib/types/rezdy";

interface DestinationConfig {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  locationFilters: string[];
}

const DESTINATIONS: DestinationConfig[] = [
  {
    id: "gold-coast",
    name: "Gold Coast",
    description:
      "Discover the stunning beaches, theme parks, and hinterland of the Gold Coast with our private tours.",
    keywords: [
      "gold coast",
      "surfers paradise",
      "broadbeach",
      "burleigh",
      "currumbin",
    ],
    locationFilters: [
      "Gold Coast",
      "Surfers Paradise",
      "Broadbeach",
      "Burleigh Heads",
      "Currumbin",
    ],
  },
  {
    id: "brisbane",
    name: "Brisbane",
    description:
      "Explore Queensland's vibrant capital city with personalized private tours showcasing culture, food, and attractions.",
    keywords: [
      "brisbane",
      "south bank",
      "fortitude valley",
      "west end",
      "kangaroo point",
    ],
    locationFilters: [
      "Brisbane",
      "South Bank",
      "Fortitude Valley",
      "West End",
      "Kangaroo Point",
    ],
  },
  {
    id: "tamborine-mountain",
    name: "Tamborine Mountain",
    description:
      "Experience the natural beauty and world-class wineries of Mount Tamborine on exclusive private tours.",
    keywords: [
      "tamborine",
      "mount tamborine",
      "tamborine mountain",
      "gallery walk",
      "cedar creek",
    ],
    locationFilters: [
      "Mount Tamborine",
      "Tamborine Mountain",
      "Gallery Walk",
      "Cedar Creek",
    ],
  },
  {
    id: "northern-nsw",
    name: "Northern New South Wales",
    description:
      "Journey into the unknown beauty of Northern NSW with private tours to Byron Bay, Nimbin, and hidden gems.",
    keywords: [
      "byron bay",
      "nimbin",
      "lismore",
      "ballina",
      "northern nsw",
      "northern new south wales",
    ],
    locationFilters: [
      "Byron Bay",
      "Nimbin",
      "Lismore",
      "Ballina",
      "Northern NSW",
    ],
  },
  {
    id: "scenic-rim",
    name: "Scenic Rim",
    description:
      "Discover the dramatic landscapes and charming towns of the Scenic Rim region on bespoke private tours.",
    keywords: [
      "scenic rim",
      "boonah",
      "beaudesert",
      "canungra",
      "mount barney",
    ],
    locationFilters: [
      "Scenic Rim",
      "Boonah",
      "Beaudesert",
      "Canungra",
      "Mount Barney",
    ],
  },
];

interface PrivateToursDestinationProps {
  className?: string;
}

export function PrivateToursDestination({
  className,
}: PrivateToursDestinationProps) {
  const [activeDestination, setActiveDestination] = useState("gold-coast");

  // Fetch all products with a higher limit to get comprehensive data
  const { data: products, loading, error } = useRezdyProducts(1000, 0);

  // Filter products for private tours
  const privateTourProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      // Filter for private tour types
      const isPrivateTour =
        product.productType === "PRIVATE_TOUR" ||
        product.productType === "CUSTOM" ||
        product.name?.toLowerCase().includes("private") ||
        product.description?.toLowerCase().includes("private") ||
        product.shortDescription?.toLowerCase().includes("private");

      // Ensure product is active
      const isActive = product.status === "ACTIVE";

      return isPrivateTour && isActive;
    });
  }, [products]);

  // Group products by destination
  const productsByDestination = useMemo(() => {
    const grouped: Record<string, RezdyProduct[]> = {};

    DESTINATIONS.forEach((destination) => {
      grouped[destination.id] = privateTourProducts.filter((product) => {
        const searchText =
          `${product.name} ${product.description} ${product.shortDescription} ${product.locationAddress}`.toLowerCase();

        return (
          destination.keywords.some((keyword) =>
            searchText.includes(keyword.toLowerCase())
          ) ||
          destination.locationFilters.some((location) =>
            searchText.includes(location.toLowerCase())
          )
        );
      });
    });

    return grouped;
  }, [privateTourProducts]);

  const currentDestination = DESTINATIONS.find(
    (d) => d.id === activeDestination
  );
  const currentProducts = productsByDestination[activeDestination] || [];

  if (loading) {
    return (
      <section
        className={`py-16 bg-gradient-to-br from-blue-50 to-indigo-100 ${className}`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-20 w-full max-w-4xl mx-auto" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className={`py-16 bg-gradient-to-br from-blue-50 to-indigo-100 ${className}`}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Private Tours by Destination
          </h2>
          <p className="text-red-600">
            Unable to load tour data. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`py-16 bg-gradient-to-br from-blue-50 to-indigo-100 ${className}`}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Private Tours by Destination
          </h2>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Travel from the Gold Coast and Brisbane to Tamborine Mountain or
            Journey further into the unknown of Northern New South Wales and the
            Scenic Rim, our private tours are curated to suit you so If you
            can't see exactly what you are looking for just let our helpful team
            know and we will put together the perfect tour for you.
          </p>
        </div>

        {/* Destination Tabs */}
        <Tabs
          value={activeDestination}
          onValueChange={setActiveDestination}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-2 mb-8">
            {DESTINATIONS.map((destination) => (
              <TabsTrigger
                key={destination.id}
                value={destination.id}
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-blue-50"
              >
                {destination.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          {DESTINATIONS.map((destination) => (
            <TabsContent
              key={destination.id}
              value={destination.id}
              className="space-y-8"
            >
              {/* Destination Description */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-gray-900 flex items-center justify-center gap-2">
                    <MapPin className="h-6 w-6 text-blue-600" />
                    {destination.name}
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-700 max-w-2xl mx-auto">
                    {destination.description}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Products Grid */}
              {currentProducts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {currentProducts.slice(0, 6).map((product) => (
                    <Card
                      key={product.productCode}
                      className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 mb-2"
                          >
                            Private Tour
                          </Badge>
                          {product.advertisedPrice && (
                            <span className="text-lg font-bold text-green-600">
                              ${product.advertisedPrice}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {product.shortDescription && (
                          <p className="text-gray-600 text-sm line-clamp-3">
                            {product.shortDescription}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {product.quantityRequiredMin &&
                            product.quantityRequiredMax && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>
                                  {product.quantityRequiredMin}-
                                  {product.quantityRequiredMax} guests
                                </span>
                              </div>
                            )}
                          {product.durationHours && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{product.durationHours}h</span>
                            </div>
                          )}
                        </div>

                        {product.locationAddress && (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">
                              {typeof product.locationAddress === "string"
                                ? product.locationAddress
                                : `${product.locationAddress.city || ""} ${
                                    product.locationAddress.state || ""
                                  }`.trim()}
                            </span>
                          </div>
                        )}

                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:bg-blue-700 transition-colors">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Private Tours Available
                    </h3>
                    <p className="text-gray-600 mb-6">
                      We don't currently have private tours listed for{" "}
                      {destination.name}, but we can create a custom experience
                      for you.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Contact Us for Custom Tour
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Show More Button */}
              {currentProducts.length > 6 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white"
                  >
                    View All {currentProducts.length} {destination.name} Private
                    Tours
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Custom Tour CTA */}
              <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-xl">
                <CardContent className="text-center py-8">
                  <Star className="h-8 w-8 mx-auto mb-4 text-yellow-300" />
                  <h3 className="text-2xl font-bold mb-2">
                    Can't Find What You're Looking For?
                  </h3>
                  <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                    Our experienced team specializes in creating bespoke private
                    tours tailored to your interests, schedule, and group size.
                    Let us design the perfect {destination.name} experience just
                    for you.
                  </p>
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3">
                    Create Custom Tour
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
