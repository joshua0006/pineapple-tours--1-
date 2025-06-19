"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedBookingExperience } from "@/components/enhanced-booking-experience";
import { FitTourDataService } from "@/lib/services/fit-tour-data";
import { RezdyProduct, RezdySession } from "@/lib/types/rezdy";
import {
  MapPin,
  Clock,
  Users,
  Calendar,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function FitTourBookingDemo() {
  const [showBooking, setShowBooking] = useState(false);

  // Demo FIT tour product
  const demoProduct: RezdyProduct = {
    productCode: "TAMBORINE-FIT",
    name: "Tamborine Mountain FIT Wine Tour",
    shortDescription:
      "Small group wine tasting tour through Tamborine Mountain's boutique wineries",
    description:
      "Experience the best of Tamborine Mountain's wine country with our flexible FIT (Fully Independent Travel) tour. Choose from multiple pickup options including Brisbane hotels, Gold Coast locations, or Brisbane City Loop. Visit 3-4 premium wineries, enjoy gourmet lunch, and discover stunning mountain scenery.",
    advertisedPrice: 159,
    quantityRequiredMin: 1,
    quantityRequiredMax: 8,
    status: "ACTIVE",
    categories: ["Wine Tours", "FIT Tours", "Scenic Rim"],
    images: [
      {
        id: 1,
        itemUrl: "/scenic-rim-landscape.jpg",
        thumbnailUrl: "/scenic-rim-landscape.jpg",
        mediumSizeUrl: "/scenic-rim-landscape.jpg",
        largeSizeUrl: "/scenic-rim-landscape.jpg",
        caption: "Tamborine Mountain Vineyard",
        isPrimary: true,
      },
    ],
    extras: [
      {
        id: "cheese-platter",
        name: "Premium Cheese Platter",
        description: "Local artisan cheese selection",
        price: 25,
        priceType: "PER_PERSON",
        isAvailable: true,
        isRequired: false,
      },
      {
        id: "wine-bottle",
        name: "Take-Home Wine Bottle",
        description: "Premium bottle from visited winery",
        price: 45,
        priceType: "PER_PERSON",
        isAvailable: true,
        isRequired: false,
      },
    ],
  };

  // Demo session
  const demoSession: RezdySession = {
    id: "session-tamborine-fit-001",
    startTimeLocal: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString(), // 7 days from now
    endTimeLocal: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000
    ).toISOString(), // 8 hours later
    seatsAvailable: 12,
    totalPrice: 159,
    bookingOptions: FitTourDataService.getBookingOptions("TAMBORINE-FIT"),
  };

  const bookingOptions = FitTourDataService.getBookingOptions("TAMBORINE-FIT");

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (timeString: string) => {
    return new Date(timeString).toLocaleDateString("en-AU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              FIT Tour Booking Demo
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Enhanced booking experience with multiple pickup options for
              Tamborine Mountain tours
            </p>
            <Badge variant="secondary" className="mb-4">
              Brisbane • Gold Coast • Tamborine Mountain Pickups Available
            </Badge>
          </div>

          {/* Product Overview */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    {demoProduct.name}
                  </CardTitle>
                  <p className="text-gray-600 mb-4">
                    {demoProduct.shortDescription}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Max {demoProduct.quantityRequiredMax} guests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>8 hours</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>4.8 rating</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-coral-600 mb-1">
                    From $159
                  </div>
                  <div className="text-sm text-gray-500">per person</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Available Session</h3>
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-blue-900">
                          {formatDate(demoSession.startTimeLocal)}
                        </div>
                        <div className="text-sm text-blue-700">
                          {formatTime(demoSession.startTimeLocal)} -{" "}
                          {formatTime(demoSession.endTimeLocal)}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-blue-300 text-blue-700"
                      >
                        {demoSession.seatsAvailable} seats available
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-coral-500 hover:bg-coral-600 text-white px-8 py-3"
                  onClick={() => setShowBooking(true)}
                >
                  Book This Tour
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Booking Options Preview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {bookingOptions.map((option) => (
              <Card
                key={option.id}
                className="border-2 hover:border-coral-200 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{option.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </p>
                    </div>
                    {option.isPreferred && (
                      <Badge className="bg-amber-500 text-white text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-coral-600 mb-3">
                    ${option.price}
                    <span className="text-sm font-normal text-gray-500">
                      /person
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span>{option.availability} seats available</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span>
                        {option.pickupLocations.length} pickup locations
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    <h5 className="text-sm font-medium text-gray-700">
                      Included:
                    </h5>
                    {option.includedServices
                      ?.slice(0, 2)
                      .map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs text-gray-600"
                        >
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{service}</span>
                        </div>
                      ))}
                    {(option.includedServices?.length || 0) > 2 && (
                      <div className="text-xs text-gray-500">
                        +{(option.includedServices?.length || 0) - 2} more
                        services
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-coral-200 text-coral-700 hover:bg-coral-50"
                    onClick={() => setShowBooking(true)}
                  >
                    Select This Option
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-coral-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Multiple Pickup Options</h3>
                <p className="text-sm text-gray-600">
                  Choose from Brisbane hotels, Gold Coast locations, or Brisbane
                  City Loop for maximum convenience.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-coral-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Small Group Experience</h3>
                <p className="text-sm text-gray-600">
                  Maximum 8 guests per group for a personalized and intimate
                  wine tasting experience.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-coral-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Flexible Timing</h3>
                <p className="text-sm text-gray-600">
                  Different departure times from each pickup region to maximize
                  your day at the wineries.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="h-screen w-screen">
            <div className="bg-white h-full w-full">
              <EnhancedBookingExperience
                product={demoProduct}
                onClose={() => setShowBooking(false)}
                onBookingComplete={(bookingData) => {
                  console.log("Booking completed:", bookingData);
                  setShowBooking(false);
                }}
                preSelectedSession={demoSession}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
