"use client";

import { useState } from "react";
import {
  CheckCircle,
  Calendar,
  Users,
  MapPin,
  Clock,
  Mail,
  Phone,
  Download,
  Share2,
  Star,
  Heart,
  Gift,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DynamicTourCard } from "@/components/dynamic-tour-card";
import { RezdyProduct } from "@/lib/types/rezdy";

// Mock booking details for demo
const mockBookingDetails = {
  orderNumber: "RZD-2024-001234",
  transactionId: "TXN-STRIPE-789456",
  productName: "Gold Coast Wine Tour Experience",
  date: "2024-02-15",
  time: "09:00 AM - 05:00 PM",
  guests: 4,
  pickupLocation: "Surfers Paradise Hotel",
  totalAmount: 596,
  customerEmail: "demo@example.com",
  status: "CONFIRMED",
};

// Mock related tours data
const mockRelatedTours: RezdyProduct[] = [
  {
    productCode: "BRISBANE-BREWERY-001",
    name: "Brisbane Craft Brewery Tour",
    shortDescription: "Discover Brisbane's best craft breweries with tastings and behind-the-scenes tours",
    description: "Join us for an unforgettable journey through Brisbane's thriving craft beer scene...",
    advertisedPrice: 149,
    status: "ACTIVE",
    productType: "TOUR",
    locationAddress: "Brisbane, QLD",
    categories: ["Food & Drink", "Brisbane"]
  },
  {
    productCode: "SCENIC-RIM-002",
    name: "Scenic Rim Wine & Dine Experience",
    shortDescription: "Full-day wine tasting and gourmet dining in the beautiful Scenic Rim region",
    description: "Escape to the Scenic Rim for a day of wine tasting and fine dining...",
    advertisedPrice: 189,
    status: "ACTIVE",
    productType: "TOUR",
    locationAddress: "Scenic Rim, QLD",
    categories: ["Food & Drink", "Scenic Rim"]
  },
  {
    productCode: "TAMBORINE-FOOD-003",
    name: "Mount Tamborine Food & Wine Trail",
    shortDescription: "Explore Mount Tamborine's artisan food producers and boutique wineries",
    description: "Discover the flavors of Mount Tamborine on this guided food and wine trail...",
    advertisedPrice: 169,
    status: "ACTIVE",
    productType: "TOUR",
    locationAddress: "Mount Tamborine, QLD",
    categories: ["Food & Drink", "Mount Tamborine"]
  },
  {
    productCode: "GOLD-COAST-HINTERLAND-004",
    name: "Gold Coast Hinterland Adventure",
    shortDescription: "Explore the stunning Gold Coast hinterland with waterfalls and rainforest walks",
    description: "Discover the natural beauty of the Gold Coast hinterland on this full-day adventure...",
    advertisedPrice: 129,
    status: "ACTIVE",
    productType: "TOUR",
    locationAddress: "Gold Coast Hinterland, QLD",
    categories: ["Nature & Wildlife", "Gold Coast"]
  },

];

export default function BookingConfirmationThankYouDemo() {
  const [showRelatedTours, setShowRelatedTours] = useState(true);

  const handleDownloadConfirmation = () => {
    alert("Demo: Download confirmation functionality");
  };

  const handleShareBooking = () => {
    alert("Demo: Share booking functionality");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Demo Header */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-1">
                Demo: Booking Confirmation Thank You Page
              </h2>
              <p className="text-sm text-blue-700">
                This demo shows the enhanced thank you page with related tours functionality
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRelatedTours(!showRelatedTours)}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {showRelatedTours ? "Hide" : "Show"} Related Tours
            </Button>
          </div>
        </div>

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Your tour has been successfully booked and payment processed.
          </p>
        </div>

        {/* Related Tours Section */}
        {showRelatedTours && (
          <div className="mt-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="h-5 w-5 text-brand-accent" />
              <h3 className="text-lg font-semibold text-brand-primary">
                You Might Also Love These Tours
              </h3>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {mockRelatedTours.map((tour) => (
                <DynamicTourCard key={tour.productCode} product={tour} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 