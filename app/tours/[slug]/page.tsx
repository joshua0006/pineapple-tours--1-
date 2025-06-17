"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  Star,
  Check,
  Info,
  Calendar,
  Users,
  Sparkles,
  Camera,
  Heart,
  Shield,
  Globe,
  Clock,
} from "lucide-react";
import { useState, useEffect, use } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { EnhancedBookingExperience } from "@/components/enhanced-booking-experience";
import { ErrorState } from "@/components/error-state";
import { DescriptionDisplay } from "@/components/ui/description-display";
import {
  TourInfoTable,
  createTourInfoItems,
} from "@/components/ui/tour-info-table";
import { GoogleMaps } from "@/components/ui/google-maps";
import { ImageGallery } from "@/components/ui/responsive-image";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { useRezdyProducts, useRezdyAvailability } from "@/hooks/use-rezdy";
import {
  extractProductCodeFromSlug,
  getPrimaryImageUrl,
  getLocationString,
  formatPrice,
  getValidImages,
  hasPickupServices,
  getPickupServiceType,
  extractPickupLocations,
} from "@/lib/utils/product-utils";
import { RezdyProduct } from "@/lib/types/rezdy";

export default function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [selectedProduct, setSelectedProduct] = useState<RezdyProduct | null>(
    null
  );
  const [showBooking, setShowBooking] = useState(false);
  const [dateRange, setDateRange] = useState(30); // days to look ahead
  const [groupSize, setGroupSize] = useState(2); // number of adults

  // Unwrap params Promise using React.use()
  const resolvedParams = use(params);

  // Extract product code from slug
  const productCode = extractProductCodeFromSlug(resolvedParams.slug);

  // Fetch all products to find the one matching our slug
  const {
    data: products,
    loading: productsLoading,
    error: productsError,
  } = useRezdyProducts(100, 0);

  // Set up availability checking based on user preferences
  const startDate = new Date().toISOString().split("T")[0];
  const endDate = new Date(Date.now() + dateRange * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const {
    data: availability,
    loading: availabilityLoading,
    error: availabilityError,
  } = useRezdyAvailability(
    productCode,
    startDate,
    endDate,
    `ADULT:${groupSize}`
  );

  // Find the specific product when products are loaded
  useEffect(() => {
    if (products && productCode) {
      const product = products.find((p) => p.productCode === productCode);
      if (product) {
        // Add sample extras data for demonstration
        // In a real implementation, this would come from the Rezdy API
        const productWithExtras = {
          ...product,
          extras: [
            {
              id: "extra-1",
              name: "Professional Photography Package",
              description:
                "Get professional photos of your tour experience taken by our expert photographer. Includes 20+ high-resolution digital photos delivered within 24 hours.",
              price: 45,
              priceType: "PER_BOOKING" as const,
              maxQuantity: 1,
              isAvailable: true,
              category: "Photography",
              image: {
                id: 1001,
                itemUrl: "/placeholder.svg?height=400&width=600",
                thumbnailUrl: "/placeholder.svg?height=100&width=100",
                mediumSizeUrl: "/placeholder.svg?height=200&width=200",
                largeSizeUrl: "/placeholder.svg?height=400&width=600",
                caption: "Professional Photography",
              },
            },
            {
              id: "extra-2",
              name: "Premium Lunch Upgrade",
              description:
                "Upgrade to our premium lunch featuring locally sourced ingredients and gourmet options.",
              price: 25,
              priceType: "PER_PERSON" as const,
              maxQuantity: 5,
              isAvailable: true,
              category: "Food & Beverage",
            },
            {
              id: "extra-3",
              name: "Equipment Rental",
              description:
                "High-quality equipment rental including waterproof gear and safety equipment.",
              price: 15,
              priceType: "PER_PERSON" as const,
              maxQuantity: 10,
              isAvailable: true,
              category: "Equipment",
            },
            {
              id: "extra-4",
              name: "Transportation Upgrade",
              description:
                "Upgrade to premium transportation with air conditioning and comfortable seating.",
              price: 35,
              priceType: "PER_BOOKING" as const,
              maxQuantity: 1,
              isAvailable: true,
              category: "Transportation",
            },
            {
              id: "extra-5",
              name: "Souvenir Package",
              description:
                "Take home a curated selection of local souvenirs and memorabilia.",
              price: 20,
              priceType: "PER_PERSON" as const,
              maxQuantity: 3,
              isAvailable: true,
              category: "Souvenirs",
            },
          ],
        };
        setSelectedProduct(productWithExtras);
      } else {
        setSelectedProduct(null);
      }
    }
  }, [products, productCode]);

  if (productsLoading) {
    return (
      <div className="flex-1">
        <div className="container py-8 sm:py-12">
          <div className="animate-pulse space-y-6 sm:space-y-8">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-2/3 sm:w-1/3" />
            <div className="h-48 sm:h-64 bg-gray-200 rounded" />
            <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-4 sm:h-6 bg-gray-200 rounded" />
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="space-y-4 order-first lg:order-last">
                <div className="h-24 sm:h-32 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (productsError || !selectedProduct) {
    return (
      <div className="container py-8 sm:py-12">
        <ErrorState
          title="Tour not found"
          message={
            productsError ||
            "The tour you're looking for doesn't exist or has been removed."
          }
          showRetry={!!productsError}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const primaryImageUrl = getPrimaryImageUrl(selectedProduct);
  const location = getLocationString(selectedProduct.locationAddress);
  const price = formatPrice(selectedProduct.advertisedPrice);

  // Utility function to strip HTML tags and clean text
  const stripHtmlTags = (html: string): string => {
    if (!html || typeof html !== "string") return "";

    return html
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
      .replace(/&amp;/g, "&") // Replace HTML entities
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&hellip;/g, "...")
      .replace(/&mdash;/g, "—")
      .replace(/&ndash;/g, "–")
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/^\s*[-•*]\s*/gm, "") // Remove bullet points
      .trim();
  };

  // Generate highlights from description or use default ones
  const rawHighlights = selectedProduct.description
    ? stripHtmlTags(selectedProduct.description)
        .split(/[.!?]+/) // Split by sentence endings
        .filter((sentence) => sentence.trim().length > 20) // Filter out short fragments
        .slice(0, 6) // Take first 6 sentences
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 0) // Remove empty strings
    : [
        "Expert local guide with extensive knowledge of the area",
        "All necessary equipment and safety gear provided",
        "Small group experience for personalized attention",
        "Incredible photo opportunities at scenic viewpoints",
        "Rich cultural insights and authentic local stories",
        "Flexible schedule adapted to weather and group preferences",
      ];

  // Add icons to highlights for better visual appeal
  const getHighlightIcon = (index: number, text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("guide") || lowerText.includes("expert"))
      return Users;
    if (
      lowerText.includes("photo") ||
      lowerText.includes("camera") ||
      lowerText.includes("scenic")
    )
      return Camera;
    if (
      lowerText.includes("equipment") ||
      lowerText.includes("safety") ||
      lowerText.includes("gear")
    )
      return Shield;
    if (
      lowerText.includes("group") ||
      lowerText.includes("personal") ||
      lowerText.includes("small")
    )
      return Heart;
    if (
      lowerText.includes("cultural") ||
      lowerText.includes("local") ||
      lowerText.includes("insight")
    )
      return Globe;
    if (
      lowerText.includes("flexible") ||
      lowerText.includes("time") ||
      lowerText.includes("schedule")
    )
      return Clock;

    // Default icons based on index
    const defaultIcons = [Sparkles, Star, Check, Info, MapPin, Calendar];
    return defaultIcons[index % defaultIcons.length];
  };

  const highlights = rawHighlights.map((text, index) => ({
    text,
    icon: getHighlightIcon(index, text),
  }));

  const availableSessions = availability?.[0]?.sessions || [];
  const tourInfoItems = createTourInfoItems(selectedProduct);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="container py-4" aria-label="Breadcrumb">
        <ol className="flex items-center text-xs sm:text-sm text-muted-foreground overflow-x-auto">
          <li className="flex-shrink-0">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li className="flex-shrink-0">
            <ChevronRight
              className="mx-1 h-3 w-3 sm:h-4 sm:w-4"
              aria-hidden="true"
            />
          </li>
          <li className="flex-shrink-0">
            <Link
              href="/tours"
              className="hover:text-foreground transition-colors"
            >
              Tours
            </Link>
          </li>
          <li className="flex-shrink-0">
            <ChevronRight
              className="mx-1 h-3 w-3 sm:h-4 sm:w-4"
              aria-hidden="true"
            />
          </li>
          <li className="min-w-0">
            <span
              className="text-foreground truncate block"
              aria-current="page"
            >
              {selectedProduct.name}
            </span>
          </li>
        </ol>
      </nav>

      {/* Tour Header */}
      <section className="container py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between text-left">
          <div className="flex-1 max-w-4xl">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              {selectedProduct.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <MapPin
                  className="mr-1 h-4 w-4 text-brand-accent"
                  aria-hidden="true"
                />
                <span className="text-sm sm:text-base">{location}</span>
              </div>
              <div className="flex items-center">
                <Star
                  className="mr-1 h-4 w-4 fill-brand-accent text-brand-accent"
                  aria-hidden="true"
                />
                <span className="text-sm sm:text-base">4.8 (Reviews)</span>
              </div>
              {selectedProduct.status === "ACTIVE" && (
                <Badge className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90 text-xs sm:text-sm">
                  Available
                </Badge>
              )}
            </div>
          </div>
          <div className="text-left md:text-right flex-shrink-0">
            <div className="text-sm text-muted-foreground">Starting from</div>
            <div className="text-2xl sm:text-3xl font-bold">{price}</div>
            <div className="text-sm text-muted-foreground">per person</div>
          </div>
        </div>
      </section>

      {/* Tour Images */}
      <section className="container py-6" aria-label="Tour gallery">
        <div className="max-w-6xl mx-auto">
          <ImageGallery
            images={getValidImages(selectedProduct)}
            alt={selectedProduct.name}
            layout="grid"
            maxImages={4}
            enableModal={true}
            tourName={selectedProduct.name}
          />
        </div>
      </section>

      {/* Tour Content */}
      <section className="container py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6 lg:gap-8 xl:grid-cols-4 xl:items-start">
            {/* Streamlined Mobile Booking Bar */}
            <div className="xl:hidden order-first">
              <div className="max-w-2xl mx-auto">
                <Card className="sticky top-16 z-10 shadow-sm border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-gray-900">
                          {price}
                        </div>
                        <div className="text-sm text-gray-600">per person</div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-brand-accent/20 text-brand-accent hover:bg-brand-accent/10"
                          onClick={() => {
                            const availabilityTab = document.querySelector(
                              '[value="availability"]'
                            );
                            if (availabilityTab) {
                              (availabilityTab as HTMLElement).click();
                              availabilityTab.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                            }
                          }}
                        >
                          Check Dates
                        </Button>
                        <Button
                          size="sm"
                          className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90"
                          onClick={() => setShowBooking(true)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content - Streamlined */}
            <div className="xl:col-span-3 min-w-0">
              <div className="max-w-4xl mx-auto xl:mx-0 space-y-6">
                {/* Essential Tour Information - Simplified */}
                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-brand-accent" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">
                            Group Size
                          </div>
                          <div className="font-semibold text-gray-900">
                            {selectedProduct.quantityRequiredMin || 1}-
                            {selectedProduct.quantityRequiredMax || 20} people
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                          <Clock className="h-5 w-5 text-brand-accent" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Duration</div>
                          <div className="font-semibold text-gray-900">
                            {(() => {
                              // Calculate duration from available session if possible
                              if (availableSessions.length > 0) {
                                const session = availableSessions[0];
                                const start = new Date(session.startTimeLocal);
                                const end = new Date(session.endTimeLocal);
                                const diffMs = end.getTime() - start.getTime();
                                const diffHours = Math.round(
                                  diffMs / (1000 * 60 * 60)
                                );
                                return diffHours > 0
                                  ? `${diffHours} hours`
                                  : "Full day";
                              }
                              // Fallback to generic text
                              return "Full day experience";
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-brand-accent" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Location</div>
                          <div className="font-semibold text-gray-900">
                            {location}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* What's Included - Simplified */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        What's Included
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          "Professional local guide",
                          "All necessary equipment",
                          "Safety briefing and instructions",
                          "Small group experience",
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm text-gray-700">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Redesigned Tabs - 2 Tab Layout */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-white data-[state=active]:text-brand-accent data-[state=active]:border-brand-accent/20 data-[state=active]:shadow-sm rounded-md mx-1 my-1"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="location"
                      className="data-[state=active]:bg-white data-[state=active]:text-brand-accent data-[state=active]:border-brand-accent/20 data-[state=active]:shadow-sm rounded-md mx-1 my-1"
                    >
                      Location & Pickup
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <div className="space-y-6">
                      {/* Clean Description */}
                      <div>
                        <DescriptionDisplay
                          description={selectedProduct.description}
                          shortDescription={selectedProduct.shortDescription}
                          maxLength={undefined}
                          allowExpansion={false}
                          className="text-gray-700 leading-relaxed"
                        />
                      </div>

                      {/* Quick Booking Section in Overview */}
                      <Card className="border border-brand-accent/20 bg-brand-accent/5">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Ready to Book?
                              </h3>
                              <p className="text-gray-600">
                                Check availability and secure your spot
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <AddToCartButton
                                product={selectedProduct}
                                session={
                                  availableSessions.length > 0
                                    ? availableSessions[0]
                                    : undefined
                                }
                                variant="outline"
                                className="border-brand-accent/30 text-brand-accent hover:bg-brand-accent/10"
                              >
                                Add to Cart
                              </AddToCartButton>
                              <Button
                                className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90"
                                onClick={() => setShowBooking(true)}
                              >
                                Book Now - {price}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="location" className="mt-6">
                    <div className="space-y-6">
                      {/* Location Card */}
                      <Card className="border border-gray-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-brand-accent" />
                            Location & Meeting Point
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Map */}
                          <GoogleMaps
                            address={selectedProduct.locationAddress}
                            pickupLocations={
                              availableSessions.length > 0
                                ? availableSessions[0]?.pickupLocations || []
                                : []
                            }
                            tourName={selectedProduct.name}
                          />

                          {/* Location Details */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Meeting Point
                            </h4>
                            <div className="text-gray-700">
                              {typeof selectedProduct.locationAddress ===
                              "string" ? (
                                <p>{selectedProduct.locationAddress}</p>
                              ) : (
                                <div>
                                  {selectedProduct.locationAddress
                                    ?.addressLine && (
                                    <p>
                                      {
                                        selectedProduct.locationAddress
                                          .addressLine
                                      }
                                    </p>
                                  )}
                                  <p>
                                    {[
                                      selectedProduct.locationAddress?.city,
                                      selectedProduct.locationAddress?.state,
                                      selectedProduct.locationAddress?.postCode,
                                    ]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Pickup Information */}
                            {availableSessions.length > 0 &&
                              availableSessions[0]?.pickupLocations &&
                              availableSessions[0].pickupLocations.length >
                                0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <h5 className="font-medium text-gray-900 mb-2">
                                    Pickup Available
                                  </h5>
                                  <p className="text-sm text-gray-600 mb-3">
                                    This tour offers pickup from{" "}
                                    {
                                      availableSessions[0].pickupLocations
                                        .length
                                    }{" "}
                                    convenient locations.
                                  </p>
                                  <div className="space-y-2">
                                    {availableSessions[0].pickupLocations
                                      .slice(0, 5)
                                      .map((pickup, index) => (
                                        <div
                                          key={pickup.id || index}
                                          className="flex items-center gap-2"
                                        >
                                          <div className="w-2 h-2 bg-coral-500 rounded-full"></div>
                                          <span className="text-sm text-gray-700">
                                            {pickup.name}
                                          </span>
                                          {pickup.pickupTime && (
                                            <span className="text-xs text-gray-500 ml-auto">
                                              {pickup.pickupTime}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    {availableSessions[0].pickupLocations
                                      .length > 5 && (
                                      <div className="text-sm text-gray-500 mt-2">
                                        +
                                        {availableSessions[0].pickupLocations
                                          .length - 5}{" "}
                                        more pickup locations available
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Availability Quick View in Location Tab */}
                      <Card className="border border-gray-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-coral-500" />
                            Upcoming Availability
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {availabilityLoading ? (
                            <div className="space-y-3">
                              {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                  key={index}
                                  className="animate-pulse bg-gray-100 h-12 rounded-lg"
                                />
                              ))}
                            </div>
                          ) : availableSessions.length > 0 ? (
                            <div className="space-y-3">
                              {availableSessions.slice(0, 3).map((session) => {
                                const sessionDate = new Date(
                                  session.startTimeLocal
                                );
                                const isLowAvailability =
                                  session.seatsAvailable <= 3;

                                return (
                                  <div
                                    key={session.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {sessionDate.toLocaleDateString(
                                          "en-US",
                                          {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                          }
                                        )}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {sessionDate.toLocaleTimeString(
                                          "en-US",
                                          {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }
                                        )}{" "}
                                        • {session.seatsAvailable} seats
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      className="bg-coral-500 text-white hover:bg-coral-600"
                                      onClick={() => setShowBooking(true)}
                                      disabled={session.seatsAvailable === 0}
                                    >
                                      Book{" "}
                                      {session.totalPrice
                                        ? `$${session.totalPrice}`
                                        : price}
                                    </Button>
                                  </div>
                                );
                              })}

                              <div className="text-center pt-3">
                                <Button
                                  variant="outline"
                                  onClick={() => setShowBooking(true)}
                                  className="border-coral-200 text-coral-700 hover:bg-coral-50"
                                >
                                  View All Available Dates
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <h4 className="text-lg font-medium mb-2">
                                No availability found
                              </h4>
                              <p className="text-gray-600 mb-4">
                                Contact us for custom dates and group bookings.
                              </p>
                              <Button
                                variant="outline"
                                onClick={() => setShowBooking(true)}
                                className="border-coral-200 text-coral-700 hover:bg-coral-50"
                              >
                                Contact Us
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Simplified Desktop Booking Sidebar */}
            <div className="hidden xl:block xl:col-span-1 sticky top-24">
              <div className=" max-w-sm mx-auto space-y-4">
                <Card className="border border-gray-200 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {price}
                      </div>
                      <div className="text-gray-600">per person</div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <AddToCartButton
                        product={selectedProduct}
                        session={
                          availableSessions.length > 0
                            ? availableSessions[0]
                            : undefined
                        }
                        className="w-full"
                        variant="outline"
                      >
                        Add to Cart
                      </AddToCartButton>

                      <Button
                        className="w-full bg-coral-500 text-white hover:bg-coral-600"
                        onClick={() => setShowBooking(true)}
                      >
                        Book Now
                      </Button>
                    </div>

                    <div className="text-center text-sm text-gray-600 mb-6">
                      Free cancellation up to 24 hours before
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-coral-500" />
                        <span className="text-sm text-gray-700">
                          {location}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-coral-500" />
                        <span className="text-sm text-gray-700">
                          {selectedProduct.quantityRequiredMin || 1}-
                          {selectedProduct.quantityRequiredMax || 20} people
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-coral-500" />
                        <span className="text-sm text-gray-700">
                          Safety certified
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 mt-6">
                      <Button
                        variant="outline"
                        className="w-full text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowBooking(true)}
                      >
                        Need Help? Contact Us
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Card */}
                <Card className="border border-gray-200 bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-coral-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-coral-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Location</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-700">
                        {typeof selectedProduct.locationAddress === "string" ? (
                          selectedProduct.locationAddress
                        ) : (
                          <div>
                            {selectedProduct.locationAddress?.addressLine && (
                              <div>
                                {selectedProduct.locationAddress.addressLine}
                              </div>
                            )}
                            <div>
                              {[
                                selectedProduct.locationAddress?.city,
                                selectedProduct.locationAddress?.state,
                                selectedProduct.locationAddress?.postCode,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pickup Information */}
                      {availableSessions.length > 0 &&
                        availableSessions[0]?.pickupLocations &&
                        availableSessions[0].pickupLocations.length > 0 && (
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-700">
                                Pickup Available
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {availableSessions[0].pickupLocations.length}{" "}
                              pickup location
                              {availableSessions[0].pickupLocations.length > 1
                                ? "s"
                                : ""}{" "}
                              available
                            </p>
                          </div>
                        )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          // Switch to location tab
                          const locationTab =
                            document.querySelector('[value="location"]');
                          if (locationTab) {
                            (locationTab as HTMLElement).click();
                            locationTab.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }
                        }}
                      >
                        View on Map
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Simplified Mobile Booking Section */}
            <div className="xl:hidden">
              <Card className="sticky bottom-4 z-10 border border-coral-200 shadow-lg bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 text-left">
                      <div className="text-xl font-bold text-gray-900">
                        {price}
                      </div>
                      <div className="text-sm text-gray-600">per person</div>
                    </div>

                    <div className="flex gap-3">
                      <AddToCartButton
                        product={selectedProduct}
                        session={
                          availableSessions.length > 0
                            ? availableSessions[0]
                            : undefined
                        }
                        size="sm"
                        variant="outline"
                        className="border-coral-200 text-coral-700 hover:bg-coral-50"
                        showIcon={false}
                      >
                        Add to Cart
                      </AddToCartButton>

                      <Button
                        size="sm"
                        className="bg-coral-500 text-white hover:bg-coral-600"
                        onClick={() => setShowBooking(true)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBooking && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
        >
          <div className="h-screen w-screen">
            <div className="bg-white h-full w-full">
              <EnhancedBookingExperience
                product={selectedProduct}
                onClose={() => setShowBooking(false)}
                onBookingComplete={(bookingData) => {
                  console.log("Booking completed:", bookingData);
                  // Here you could redirect to a confirmation page or show a success message
                  setShowBooking(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
