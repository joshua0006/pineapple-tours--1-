"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

import { ErrorState } from "@/components/error-state";
import { DescriptionDisplay } from "@/components/ui/description-display";
import {
  TourInfoTable,
  createTourInfoItems,
} from "@/components/ui/tour-info-table";
import { GoogleMaps } from "@/components/ui/google-maps";
import { ImageGallery } from "@/components/ui/responsive-image";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { useRezdyAvailability } from "@/hooks/use-rezdy";
import { useAllProducts } from "@/hooks/use-all-products";
import { usePickupCache } from "@/hooks/use-pickup-cache";
import {
  extractProductCodeFromSlug,
  findProductBySlug,
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
  // Unwrap params Promise using React.use()
  const resolvedParams = use(params);

  // Get search parameters from URL (passed from search form)
  const searchParams = useSearchParams();

  // Extract product code from slug
  const productCode = extractProductCodeFromSlug(resolvedParams.slug);

  // Fetch complete product catalogue once (cached)
  const {
    products: products,
    loading: productsLoading,
    error: productsError,
  } = useAllProducts();

  // Debug logging for slug and product lookup
  console.log(`🔍 Tour page debugging:`, {
    slug: resolvedParams.slug,
    extractedProductCode: productCode,
    totalProducts: products?.length || 0,
    productsLoading,
    productsError
  });

  const [selectedProduct, setSelectedProduct] = useState<RezdyProduct | null>(
    null
  );
  const [dateRange, setDateRange] = useState(30); // days to look ahead
  const [groupSize, setGroupSize] = useState(2); // number of adults

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

  // Pre-fetch pickup locations for this product
  const {
    pickupLocations,
    hasPickupLocations,
    preloadPickupLocations,
    isLoading: pickupLoading,
    error: pickupError,
  } = usePickupCache({
    productCode,
    autoFetch: true,
    cacheKey: 'tour-detail-pickup'
  });

  // Find the specific product when products are loaded
  useEffect(() => {
    if (products && products.length > 0) {
      console.log(`🔍 Looking for product with slug: "${resolvedParams.slug}"`);
      
      // Use the improved findProductBySlug function with multiple matching strategies
      const product = findProductBySlug(products, resolvedParams.slug);
      
      if (product) {
        console.log(`✅ Found matching product:`, {
          productCode: product.productCode,
          name: product.name,
          slug: resolvedParams.slug
        });
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
        console.log(`❌ No product found for slug: "${resolvedParams.slug}"`);
        console.log(`📊 Available products:`, products.slice(0, 5).map(p => ({
          productCode: p.productCode,
          name: p.name
        })));
        
        // Fallback: Try to fetch the product individually by extracting product code
        const potentialProductCode = extractProductCodeFromSlug(resolvedParams.slug);
        if (potentialProductCode) {
          console.log(`🔄 Attempting fallback fetch for product code: ${potentialProductCode}`);
          fetch(`/api/tours/${potentialProductCode}`)
            .then(response => response.json())
            .then(data => {
              if (data.tour) {
                console.log(`✅ Fallback fetch successful for ${potentialProductCode}:`, data.tour.name);
                // Transform the API response to match our expected format
                const fallbackProduct = {
                  ...data.tour,
                  extras: [],
                  pickupLocations: ['Gold Coast'], // Default since this API doesn't return this info
                  departsFrom: ['Gold Coast'],
                  primaryPickupLocation: 'Gold Coast'
                };
                setSelectedProduct(fallbackProduct);
              } else {
                console.log(`❌ Fallback fetch failed for ${potentialProductCode}`);
                setSelectedProduct(null);
              }
            })
            .catch(error => {
              console.error(`❌ Fallback fetch error for ${potentialProductCode}:`, error);
              setSelectedProduct(null);
            });
        } else {
          setSelectedProduct(null);
        }
      }
    }
  }, [products, resolvedParams.slug]);

  // Early returns AFTER all hooks have been called
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
    // Enhanced error handling with better user feedback
    const isNetworkError = productsError && productsError.includes('fetch');
    const isNotFoundError = !selectedProduct && !productsError;
    
    let errorTitle = "Tour not found";
    let errorMessage = "The tour you're looking for doesn't exist or has been removed.";
    
    if (isNetworkError) {
      errorTitle = "Connection Error";
      errorMessage = "Unable to load tour information. Please check your internet connection and try again.";
    } else if (isNotFoundError && products && products.length > 0) {
      errorMessage = `We couldn't find a tour matching "${resolvedParams.slug}". This might be due to:
      • The tour URL has changed
      • The tour is no longer available
      • There's a typo in the URL
      
      Try browsing our available tours or use the search function.`;
    }
    
    return (
      <div className="container py-8 sm:py-12">
        <ErrorState
          title={errorTitle}
          message={errorMessage}
          showRetry={!!productsError}
          onRetry={() => window.location.reload()}
        />
        
        {/* Add helpful suggestions */}
        <div className="mt-8 text-center">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Looking for tours? Here are some options:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/tours">
                <Button variant="outline">Browse All Tours</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Go to Homepage</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">Contact Support</Button>
              </Link>
            </div>
          </div>
        </div>
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

  // Helper function to get booking URL with preserved parameters
  const getBookingUrl = () => {
    const params = new URLSearchParams();

    // Get parameters from search form
    const participants = searchParams.get("participants");
    const tourDate = searchParams.get("tourDate");
    const checkIn = searchParams.get("checkIn");
    const pickupLocation = searchParams.get("pickupLocation");
    const location = searchParams.get("location"); // Fallback for legacy URLs

    // Add parameters if they exist
    if (participants) params.append("adults", participants);
    if (tourDate) params.append("date", tourDate);
    else if (checkIn) params.append("date", checkIn); // Use checkIn if tourDate not available
    if (pickupLocation) params.append("pickupLocation", pickupLocation);
    else if (location) params.append("pickupLocation", location); // Legacy fallback

    const queryString = params.toString();
    return `/booking/${selectedProduct.productCode}${
      queryString ? `?${queryString}` : ""
    }`;
  };

  // Helper function to get first available session for cart button
  const getSelectedSession = () => {
    return availableSessions.length > 0 ? availableSessions[0] : undefined;
  };

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
                          Check Dates
                        </Button>
                        <Link href={getBookingUrl()}>
                          <Button
                            size="sm"
                            className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90"
                          >
                            Book Now
                          </Button>
                        </Link>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                  <TabsList className="sticky top-16 sm:top-18 lg:top-20 z-30 grid w-full grid-cols-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm">
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
                                session={getSelectedSession()}
                                variant="outline"
                                className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                              >
                                Add to Cart
                              </AddToCartButton>
                              <Link href={getBookingUrl()}>
                                <Button className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90">
                                  Book Now - {price}
                                </Button>
                              </Link>
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
                                          key={pickup.id ?? `pickup-${index}`}
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
                              {availableSessions
                                .slice(0, 3)
                                .map((session, index) => {
                                  const sessionDate = new Date(
                                    session.startTimeLocal
                                  );
                                  const isLowAvailability =
                                    session.seatsAvailable <= 3;

                                  return (
                                    <div
                                      key={session.id ?? `session-${index}`}
                                      className="flex items-center justify-between p-3 rounded-lg transition-all bg-gray-50 border-2 border-transparent hover:border-coral-200"
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
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          className="bg-coral-500 text-white hover:bg-coral-600"
                                          disabled={
                                            session.seatsAvailable === 0
                                          }
                                          onClick={() => {
                                            // Navigate to booking page with selected session and date
                                            const sessionId = session.id;
                                            const sessionDate = new Date(
                                              session.startTimeLocal
                                            )
                                              .toISOString()
                                              .split("T")[0];
                                            const bookingUrl = sessionId
                                              ? `/booking/${selectedProduct.productCode}?sessionId=${sessionId}&date=${sessionDate}`
                                              : `/booking/${selectedProduct.productCode}?date=${sessionDate}`;
                                            window.location.href = bookingUrl;
                                          }}
                                        >
                                          Book{" "}
                                          {session.totalPrice
                                            ? `$${session.totalPrice}`
                                            : price}
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}

                              <div className="text-center pt-3">
                                <Link
                                  href={`/booking/${selectedProduct.productCode}`}
                                >
                                  <Button
                                    variant="outline"
                                    className="border-coral-200 text-coral-700 hover:bg-coral-50"
                                  >
                                    View All Available Dates
                                  </Button>
                                </Link>
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
                              <Link href="/contact">
                                <Button
                                  variant="outline"
                                  className="border-coral-200 text-coral-700 hover:bg-coral-50"
                                >
                                  Contact Us
                                </Button>
                              </Link>
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
                        session={getSelectedSession()}
                        className="w-full mb-2 border-brand-accent text-brand-accent  hover:text-brand-accent bg-transparent hover:bg-brand-accent/10 transition-all duration-200"
                        variant="outline"
                      >
                        Add to Cart
                      </AddToCartButton>

                      <Link href={getBookingUrl()}>
                        <Button className="w-full bg-coral-500 text-white hover:bg-coral-600">
                          Book Now
                        </Button>
                      </Link>
                    </div>

                   
                    <div className="pt-6 border-t border-gray-200 mt-6">
                      <Link href="/contact">
                        <Button
                          variant="outline"
                          className="w-full text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Need Help? Contact Us
                        </Button>
                      </Link>
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
                        session={getSelectedSession()}
                        size="sm"
                        variant="outline"
                        className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                        showIcon={false}
                      >
                        Add to Cart
                      </AddToCartButton>

                      <Link href={getBookingUrl()}>
                        <Button
                          size="sm"
                          className="bg-coral-500 text-white hover:bg-coral-600"
                        >
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
