"use client";

import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CreditCard,
  RefreshCw,
  ArrowLeft,
  Phone,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const error = searchParams.get("error");

  const handleRetryPayment = () => {
    // In a real implementation, this would redirect back to the payment form
    // with the booking data pre-populated
    window.history.back();
  };

  const handleStartOver = () => {
    window.location.href = "/";
  };

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "card_declined":
        return "Your card was declined by the bank. Please try a different payment method.";
      case "insufficient_funds":
        return "Insufficient funds available on your card. Please try a different payment method.";
      case "expired_card":
        return "Your card has expired. Please use a different card.";
      case "invalid_card":
        return "The card details entered are invalid. Please check and try again.";
      case "processing_error":
        return "There was an error processing your payment. Please try again.";
      default:
        return "Your payment could not be processed. Please try again or contact support.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Error Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-lg text-gray-600">
            We were unable to process your payment for this booking.
          </p>
        </div>

        {/* Error Details */}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
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
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <p className="text-red-600 font-semibold">Payment Failed</p>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Your booking has not been confirmed. No charges have been made
                  to your account.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* What to do next */}
        <Card>
          <CardHeader>
            <CardTitle>What can you do?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-coral-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-coral-600 text-sm font-semibold">
                    1
                  </span>
                </div>
                <div>
                  <p className="font-medium">Try a different payment method</p>
                  <p className="text-sm text-gray-600">
                    Use a different credit card or payment option
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-coral-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-coral-600 text-sm font-semibold">
                    2
                  </span>
                </div>
                <div>
                  <p className="font-medium">Check your card details</p>
                  <p className="text-sm text-gray-600">
                    Ensure your card number, expiry date, and CVV are correct
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-coral-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-coral-600 text-sm font-semibold">
                    3
                  </span>
                </div>
                <div>
                  <p className="font-medium">Contact your bank</p>
                  <p className="text-sm text-gray-600">
                    Your bank may have blocked the transaction for security
                    reasons
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-coral-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-coral-600 text-sm font-semibold">
                    4
                  </span>
                </div>
                <div>
                  <p className="font-medium">Contact our support team</p>
                  <p className="text-sm text-gray-600">
                    We're here to help if you continue to experience issues
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleRetryPayment}
            className="flex items-center gap-2 flex-1"
          >
            <RefreshCw className="h-4 w-4" />
            Try Payment Again
          </Button>
          <Button
            onClick={handleStartOver}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Start Over
          </Button>
        </div>

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
              Our support team is available 24/7 to help resolve payment issues.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
