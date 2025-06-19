"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookingOptionSelector } from "@/components/ui/booking-option-selector";
import { RezdyBookingOption, RezdyPickupLocation } from "@/lib/types/rezdy";
import { FitTourDataService } from "@/lib/services/fit-tour-data";
import { ArrowLeft, Users, Calendar, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export default function BookingOptionSelectorDemo() {
  const [selectedBookingOption, setSelectedBookingOption] =
    useState<RezdyBookingOption | null>(null);
  const [selectedPickupLocation, setSelectedPickupLocation] =
    useState<RezdyPickupLocation | null>(null);
  const [participantCount, setParticipantCount] = useState(2);
  const [showResultModal, setShowResultModal] = useState(false);

  // Get sample booking options for demonstration
  const bookingOptions = FitTourDataService.getBookingOptions(
    "Tamborine Mountain Day Tour"
  );

  const handleBookingOptionSelect = (
    option: RezdyBookingOption,
    location: RezdyPickupLocation
  ) => {
    setSelectedBookingOption(option);
    setSelectedPickupLocation(location);
  };

  const handleContinue = () => {
    setShowResultModal(true);
  };

  const handleReset = () => {
    setSelectedBookingOption(null);
    setSelectedPickupLocation(null);
    setShowResultModal(false);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTotalPrice = () => {
    if (!selectedBookingOption) return 0;
    return selectedBookingOption.price * participantCount;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-coral-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 text-coral-600 hover:text-coral-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Demos
          </Link>

          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Booking Option Selector
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience our redesigned booking flow with cascading dropdown
              menus that guide users through region selection, package options,
              and specific pickup locations.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <Badge className="bg-blue-100 text-blue-800">
                Intuitive Navigation
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                Real-time Pricing
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                Responsive Design
              </Badge>
              <Badge className="bg-orange-100 text-orange-800">
                Accessibility Compliant
              </Badge>
            </div>
          </div>
        </div>

        {/* Demo Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Demo Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Sample Tour:</span>
                <Badge variant="outline" className="text-xs">
                  Tamborine Mountain Day Tour
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Participants:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setParticipantCount(Math.max(1, participantCount - 1))
                    }
                    disabled={participantCount <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {participantCount}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setParticipantCount(Math.min(8, participantCount + 1))
                    }
                    disabled={participantCount >= 8}
                  >
                    +
                  </Button>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="sm:ml-auto w-full sm:w-auto"
              >
                Reset Selection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Booking Option Selector */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-900">
              Select Your Booking Option
            </CardTitle>
            <p className="text-center text-gray-600">
              Choose from {bookingOptions.length} available pickup options with
              transparent pricing
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <BookingOptionSelector
              bookingOptions={bookingOptions}
              selectedBookingOption={selectedBookingOption}
              selectedPickupLocation={selectedPickupLocation}
              onBookingOptionSelect={handleBookingOptionSelect}
              onContinue={handleContinue}
              participantCount={participantCount}
              showPricing={true}
              required={true}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Region-Based Selection
              </h3>
              <p className="text-sm text-gray-600">
                Grouped pickup options by geographic regions for easy navigation
                and logical flow.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Real-Time Updates
              </h3>
              <p className="text-sm text-gray-600">
                Pricing updates instantly, availability checking, and smooth
                transitions between steps.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                User-Centric Design
              </h3>
              <p className="text-sm text-gray-600">
                Intuitive flow with visual feedback, error handling, and
                accessibility features built-in.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  UI/UX Features
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Cascading dropdown menus with smooth animations</li>
                  <li>• Visual feedback with icons and color coding</li>
                  <li>• Progressive disclosure for reduced cognitive load</li>
                  <li>• Clear validation and error messaging</li>
                  <li>• Responsive design for all screen sizes</li>
                  <li>• Accessibility compliant with ARIA labels</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Technical Implementation
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• TypeScript with strict type checking</li>
                  <li>• Real-time pricing calculations</li>
                  <li>• State management with React hooks</li>
                  <li>• Tailwind CSS for consistent styling</li>
                  <li>• Framer Motion for smooth animations</li>
                  <li>• Comprehensive error handling</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selection Result Modal */}
        {showResultModal && selectedBookingOption && selectedPickupLocation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-center text-green-700">
                  🎉 Selection Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Package:</span>
                    <div className="font-medium">
                      {selectedBookingOption.name}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">
                      Pickup Location:
                    </span>
                    <div className="font-medium">
                      {selectedPickupLocation.name}
                    </div>
                  </div>
                  {selectedPickupLocation.pickupTime && (
                    <div>
                      <span className="text-sm text-gray-600">
                        Pickup Time:
                      </span>
                      <div className="font-medium">
                        {selectedPickupLocation.pickupTime}
                      </div>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Total ({participantCount} guest
                      {participantCount > 1 ? "s" : ""}):
                    </span>
                    <span className="text-lg font-bold text-green-700">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowResultModal(false)}
                    className="flex-1"
                  >
                    Continue Editing
                  </Button>
                  <Button
                    onClick={() => {
                      setShowResultModal(false);
                      // In a real app, this would proceed to the next booking step
                      alert(
                        "In a real booking flow, this would proceed to guest details!"
                      );
                    }}
                    className="flex-1 bg-coral-500 hover:bg-coral-600"
                  >
                    Proceed to Booking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
