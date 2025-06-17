"use client";

import { useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft, RefreshCw, Phone, Mail, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BookingCancelledPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const handleRetryBooking = () => {
    // Redirect back to the booking form
    window.history.back();
  };

  const handleStartOver = () => {
    window.location.href = "/";
  };

  const handleBrowseTours = () => {
    window.location.href = "/search";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Cancelled Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <XCircle className="h-8 w-8 text-gray-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Cancelled
          </h1>
          <p className="text-lg text-gray-600">
            Your booking process has been cancelled and no payment was
            processed.
          </p>
        </div>

        {/* Information Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Charges Applied</AlertTitle>
          <AlertDescription>
            Your payment was cancelled before processing. No charges have been
            made to your account.
          </AlertDescription>
        </Alert>

        {/* Order Information */}
        {orderNumber && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cancelled Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Order Number
                  </label>
                  <p className="font-mono font-semibold">{orderNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <p className="text-gray-600 font-semibold">Cancelled</p>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  This order was cancelled during the payment process. You can
                  start a new booking at any time.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* What to do next */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              What would you like to do?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={handleRetryBooking}
                className="w-full flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Complete This Booking
              </Button>

              <Button
                onClick={handleBrowseTours}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Browse Other Tours
              </Button>

              <Button
                onClick={handleStartOver}
                variant="ghost"
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Why bookings get cancelled */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Common Reasons for Cancellation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm text-gray-600">
              <div>• Payment window timeout (usually 15 minutes)</div>
              <div>• Browser back button or page refresh during payment</div>
              <div>• Intentional cancellation by clicking "Cancel Payment"</div>
              <div>• Network connectivity issues</div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> To avoid timeouts, have your payment
                details ready before starting the booking process. Most payment
                sessions expire after 15 minutes of inactivity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support Information */}
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
              If you're experiencing issues with the booking process, our
              support team is here to help.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
