"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Info,
} from "lucide-react";

export default function PickupLocationTestPage() {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RezdyProduct | null>(
    null
  );

  // Demo products - different types to test pickup location behavior
  const testProducts: RezdyProduct[] = [
    {
      productCode: "WINE-TOUR-SCENIC-RIM",
      name: "Scenic Rim Wine Tour",
      shortDescription: "Full day wine tasting experience in the Scenic Rim",
      description:
        "Discover boutique wineries in the beautiful Scenic Rim region with multiple pickup options.",
      advertisedPrice: 155,
      quantityRequiredMin: 1,
      quantityRequiredMax: 8,
      status: "ACTIVE",
      categories: ["Wine Tours"],
    },
    {
      productCode: "BRISBANE-DAY-ADVENTURE",
      name: "Brisbane Adventure Tour",
      shortDescription: "City highlights and nature experience",
      description:
        "Explore Brisbane's best attractions with convenient pickup from multiple locations.",
      advertisedPrice: 120,
      quantityRequiredMin: 1,
      quantityRequiredMax: 12,
      status: "ACTIVE",
      categories: ["City Tours"],
    },
    {
      productCode: "MOUNTAIN-HIKING-EXPERIENCE",
      name: "Tamborine Mountain Hiking",
      shortDescription: "Guided hiking with stunning views",
      description:
        "Experience Tamborine Mountain's natural beauty with pickup service from Brisbane and Gold Coast.",
      advertisedPrice: 89,
      quantityRequiredMin: 2,
      quantityRequiredMax: 10,
      status: "ACTIVE",
      categories: ["Adventure Tours"],
    },
    {
      productCode: "REGULAR-TOUR-NO-PICKUP",
      name: "Self-Drive Garden Tour",
      shortDescription: "Meet at location garden tour",
      description: "Self-drive tour where you meet at the garden entrance.",
      advertisedPrice: 45,
      quantityRequiredMin: 1,
      quantityRequiredMax: 20,
      status: "ACTIVE",
      categories: ["Garden Tours"],
    },
  ];

  // Demo session
  const createDemoSession = (productCode: string): RezdySession => ({
    id: `session-${productCode}-001`,
    startTimeLocal: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    endTimeLocal: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000
    ).toISOString(),
    seatsAvailable: 8,
    totalPrice: 0, // Will use product price
    bookingOptions: FitTourDataService.getBookingOptions(productCode),
  });

  const handleBookProduct = (product: RezdyProduct) => {
    setSelectedProduct(product);
    setShowBooking(true);
  };

  const getBookingOptionsCount = (productCode: string) => {
    return FitTourDataService.getBookingOptions(productCode).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Pickup Location Test Page
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Test different product types to see where pickup location
              selection appears
            </p>

            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Where to find pickup selection:</strong> After clicking
                "Book Now", select a date and time session first. The pickup
                location selection will appear below the time selection in{" "}
                <strong>Step 1: Date & Guest Details</strong>.
              </AlertDescription>
            </Alert>
          </div>

          {/* Test Products */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {testProducts.map((product) => {
              const bookingOptionsCount = getBookingOptionsCount(
                product.productCode
              );
              const hasPickupOptions = bookingOptionsCount > 0;

              return (
                <Card
                  key={product.productCode}
                  className="border-2 hover:border-coral-200 transition-colors"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      {hasPickupOptions ? (
                        <Badge className="bg-green-500 text-white text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {bookingOptionsCount} Pickup Options
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          No Pickup Options
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {product.shortDescription}
                    </p>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Product Code:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {product.productCode}
                        </code>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold text-coral-600">
                          ${product.advertisedPrice}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Max Guests:</span>
                        <span>{product.quantityRequiredMax}</span>
                      </div>
                    </div>

                    {hasPickupOptions && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg">
                        <h5 className="text-sm font-medium text-green-800 mb-2">
                          Available Pickup Options:
                        </h5>
                        <div className="space-y-1">
                          {FitTourDataService.getBookingOptions(
                            product.productCode
                          ).map((option) => (
                            <div
                              key={option.id}
                              className="text-xs text-green-700 flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              <span>
                                {option.name} (${option.price})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full bg-coral-500 hover:bg-coral-600 text-white"
                      onClick={() => handleBookProduct(product)}
                    >
                      Book This Tour
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">
                📍 How to Find the Pickup Location Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Click <strong>"Book This Tour"</strong> on any product with
                  pickup options (green badge)
                </li>
                <li>
                  In the booking modal, you'll be on{" "}
                  <strong>Step 1: Date & Guest Details</strong>
                </li>
                <li>
                  <strong>First select a date</strong> from the calendar
                </li>
                <li>
                  <strong>Then select a time session</strong> from the available
                  options
                </li>
                <li>
                  After selecting a session, the{" "}
                  <strong>pickup location selection will appear below</strong>
                </li>
                <li>
                  You'll see either:
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>
                      <strong>FIT Tour Booking Options</strong> - Multiple
                      pickup packages with pricing
                    </li>
                    <li>
                      <strong>Standard Pickup Locations</strong> - Simple
                      location list
                    </li>
                  </ul>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && selectedProduct && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="h-screen w-screen">
            <div className="bg-white h-full w-full">
              <EnhancedBookingExperience
                product={selectedProduct}
                onClose={() => {
                  setShowBooking(false);
                  setSelectedProduct(null);
                }}
                onBookingComplete={(bookingData) => {
                  console.log("Booking completed:", bookingData);
                  setShowBooking(false);
                  setSelectedProduct(null);
                }}
                preSelectedSession={createDemoSession(
                  selectedProduct.productCode
                )}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
