"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAllProducts } from "@/hooks/use-all-products";
import { DynamicTourCard } from "@/components/dynamic-tour-card";
import { RezdyProduct } from "@/lib/types/rezdy";

interface BookingDetails {
  orderNumber: string;
  transactionId: string;
  productName: string;
  date: string;
  time: string;
  guests: number;
  pickupLocation?: string;
  totalAmount: number;
  customerEmail: string;
  status: string;
}

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const transactionId = searchParams.get("transactionId");

  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all products for related tours
  const { products: allProducts, loading: productsLoading } = useAllProducts();

  // Get related tours based on the booked tour
  const getRelatedTours = (bookedTourName: string): RezdyProduct[] => {
    if (!allProducts || allProducts.length === 0) return [];

    // Simple algorithm to find related tours
    // In a real implementation, this could be more sophisticated
    const relatedTours = allProducts
      .filter((product) => {
        // Exclude the booked tour itself
        if (product.name === bookedTourName) return false;
        
        // Filter for active tours only
        if (product.status !== "ACTIVE") return false;

        // Simple keyword matching for related tours
        const bookedTourWords = bookedTourName.toLowerCase().split(" ");
        const productWords = product.name.toLowerCase().split(" ");
        
        // Check if they share common words (excluding common words like "tour", "the", "and")
        const commonWords = ["tour", "tours", "the", "and", "of", "in", "at", "to", "from", "with"];
        const relevantBookedWords = bookedTourWords.filter(word => !commonWords.includes(word));
        const relevantProductWords = productWords.filter(word => !commonWords.includes(word));
        
        const hasCommonWords = relevantBookedWords.some(word => 
          relevantProductWords.some(productWord => 
            productWord.includes(word) || word.includes(productWord)
          )
        );

        return hasCommonWords;
      })
      .slice(0, 4); // Limit to 4 related tours

    // If no related tours found, return random popular tours
    if (relatedTours.length === 0) {
      return allProducts
        .filter((product) => product.status === "ACTIVE" && product.name !== bookedTourName)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
    }

    return relatedTours;
  };

  const relatedTours = bookingDetails ? getRelatedTours(bookingDetails.productName) : [];

  useEffect(() => {
    if (orderNumber && transactionId) {
      // In a real implementation, fetch booking details from API
      // For now, we'll simulate the data
      setTimeout(() => {
        setBookingDetails({
          orderNumber,
          transactionId,
          productName: "Sydney Harbour Bridge Climb",
          date: "2024-01-15",
          time: "09:00 AM - 12:00 PM",
          guests: 2,
          pickupLocation: "Circular Quay",
          totalAmount: 330,
          customerEmail: "customer@example.com",
          status: "CONFIRMED",
        });
        setLoading(false);
      }, 1000);
    } else {
      setError("Missing booking information");
      setLoading(false);
    }
  }, [orderNumber, transactionId]);

  const handleDownloadConfirmation = () => {
    // Generate PDF or print confirmation
    window.print();
  };

  const handleShareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: "Booking Confirmation",
        text: `My tour booking is confirmed! Order: ${orderNumber}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Booking link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-4">
              {error ||
                "We could not find your booking confirmation. Please check your email or contact support."}
            </p>
            <Button onClick={() => (window.location.href = "/")}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        {relatedTours.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="h-5 w-5 text-brand-accent" />
              <h3 className="text-lg font-semibold text-brand-primary">
                You Might Also Love These Tours
              </h3>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTours.map((tour) => (
                <DynamicTourCard key={tour.productCode} product={tour} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
