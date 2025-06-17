"use client";

import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Phone,
  Mail,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BookingErrorPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const error = searchParams.get("error");
  const transactionId = searchParams.get("transactionId");

  const handleRetryBooking = () => {
    // Redirect back to the booking form
    window.history.back();
  };

  const handleStartOver = () => {
    window.location.href = "/";
  };

  const handleContactSupport = () => {
    // In a real implementation, this could open a support chat or form
    window.location.href = "mailto:support@pineappletours.com";
  };

  const getErrorDetails = (error: string | null) => {
    switch (error) {
      case "booking-data-not-found":
        return {
          title: "Booking Data Missing",
          message:
            "We couldn't find your booking information. This may be due to a temporary system issue.",
          severity: "warning" as const,
          canRetry: true,
        };
      case "booking-registration-failed":
        return {
          title: "Booking Registration Failed",
          message:
            "Your payment was processed successfully, but we encountered an issue registering your booking. Our support team has been notified and will contact you shortly.",
          severity: "error" as const,
          canRetry: false,
          showPaymentInfo: true,
        };
      case "callback-processing-failed":
        return {
          title: "Processing Error",
          message:
            "We encountered an error while processing your booking. Please contact support for assistance.",
          severity: "error" as const,
          canRetry: true,
        };
      default:
        return {
          title: "Booking Error",
          message:
            "An unexpected error occurred while processing your booking. Please try again or contact support.",
          severity: "error" as const,
          canRetry: true,
        };
    }
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Error Header */}
        <div className="text-center">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              errorDetails.severity === "error" ? "bg-red-100" : "bg-yellow-100"
            }`}
          >
            <AlertTriangle
              className={`h-8 w-8 ${
                errorDetails.severity === "error"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {errorDetails.title}
          </h1>
          <p className="text-lg text-gray-600">{errorDetails.message}</p>
        </div>

        {/* Error Alert */}
        <Alert
          variant={
            errorDetails.severity === "error" ? "destructive" : "default"
          }
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {errorDetails.severity === "error"
              ? "System Error"
              : "Processing Issue"}
          </AlertTitle>
          <AlertDescription>
            {errorDetails.severity === "error"
              ? "This error has been logged and our technical team has been notified."
              : "This is usually a temporary issue that resolves quickly."}
          </AlertDescription>
        </Alert>

        {/* Order Information */}
        {orderNumber && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Order Number
                  </label>
                  <p className="font-mono font-semibold">{orderNumber}</p>
                </div>
                {transactionId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Transaction ID
                    </label>
                    <p className="font-mono text-sm">{transactionId}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <p
                    className={`font-semibold ${
                      errorDetails.showPaymentInfo
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {errorDetails.showPaymentInfo
                      ? "Payment Processed - Booking Pending"
                      : "Booking Failed"}
                  </p>
                </div>
                {errorDetails.showPaymentInfo && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> Your payment has been
                      processed successfully. We are working to complete your
                      booking registration and will contact you within 24 hours
                      with confirmation details.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* What to do next */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {errorDetails.canRetry && (
                <Button
                  onClick={handleRetryBooking}
                  className="w-full flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}

              <Button
                onClick={handleContactSupport}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Contact Support
              </Button>

              <Button
                onClick={handleStartOver}
                variant="ghost"
                className="w-full flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Start New Booking
              </Button>
            </div>

            {errorDetails.showPaymentInfo && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Payment Information</h4>
                <p className="text-sm text-gray-600">
                  Your payment has been successfully processed. If you don't
                  hear from us within 24 hours, please contact our support team
                  with your transaction ID.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Need Immediate Help?</CardTitle>
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
              Our support team is available 24/7 to help resolve booking issues.
              Please have your order number ready when contacting us.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
