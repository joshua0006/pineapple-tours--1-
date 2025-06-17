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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Confirmation Alert */}
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">
            Confirmation Email Sent
          </AlertTitle>
          <AlertDescription className="text-green-700">
            A detailed confirmation email has been sent to{" "}
            {bookingDetails.customerEmail}. Please check your inbox and spam
            folder.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Tour
                    </label>
                    <p className="font-semibold">
                      {bookingDetails.productName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <div>
                      <Badge
                        variant="success"
                        className="bg-green-100 text-green-800"
                      >
                        {bookingDetails.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Date
                    </label>
                    <p className="font-semibold">
                      {new Date(bookingDetails.date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Time
                    </label>
                    <p className="font-semibold">{bookingDetails.time}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Guests
                    </label>
                    <p className="font-semibold">
                      {bookingDetails.guests} people
                    </p>
                  </div>
                  {bookingDetails.pickupLocation && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Pickup Location
                      </label>
                      <p className="font-semibold">
                        {bookingDetails.pickupLocation}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card>
              <CardHeader>
                <CardTitle>Important Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-coral-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Arrival Time</p>
                      <p className="text-gray-600">
                        Please arrive 15 minutes before your tour start time
                      </p>
                    </div>
                  </div>
                  {bookingDetails.pickupLocation && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-coral-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Pickup Details</p>
                        <p className="text-gray-600">
                          Pickup time and exact location details are in your
                          confirmation email
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-coral-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">What to Bring</p>
                      <p className="text-gray-600">
                        Valid photo ID, comfortable walking shoes, and
                        weather-appropriate clothing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-coral-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Contact Information</p>
                      <p className="text-gray-600">
                        Check your email for emergency contact numbers and
                        detailed instructions
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleDownloadConfirmation}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Confirmation
              </Button>
              <Button
                onClick={handleShareBooking}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share Booking
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                className="flex-1"
              >
                Book Another Tour
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Confirmation Numbers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Confirmation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Rezdy Order Number
                  </label>
                  <p className="font-mono font-bold text-lg">
                    {bookingDetails.orderNumber}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Transaction ID
                  </label>
                  <p className="font-mono text-sm">
                    {bookingDetails.transactionId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Total Paid
                  </label>
                  <p className="font-bold text-xl">
                    AUD ${bookingDetails.totalAmount.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-coral-500" />
                  <span>+61 2 9999 0000</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-coral-500" />
                  <span>support@pineappletours.com</span>
                </div>
                <p className="text-xs text-gray-600">
                  Our support team is available 24/7 to assist with your
                  booking.
                </p>
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cancellation Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Free cancellation up to 24 hours before your tour. See your
                  confirmation email for full terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
