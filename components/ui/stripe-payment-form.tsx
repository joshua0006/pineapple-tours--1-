"use client";

import React, { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Shield, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StripePaymentFormProps {
  clientSecret: string;
  orderNumber: string;
  amount: number;
  currency: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  loading?: boolean;
  className?: string;
}

export function StripePaymentForm({
  clientSecret,
  orderNumber,
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError,
  loading: externalLoading = false,
  className,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);

  // Reset error when client secret changes
  useEffect(() => {
    setErrorMessage("");
  }, [clientSecret]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("Stripe has not loaded yet. Please try again.");
      return;
    }

    if (!clientSecret) {
      setErrorMessage(
        "Payment information is missing. Please refresh and try again."
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation?orderNumber=${orderNumber}`,
        },
        redirect: "if_required", // Only redirect if required by payment method
      });

      if (error) {
        console.error("Payment confirmation error:", error);
        setErrorMessage(error.message || "An unexpected error occurred.");
        onPaymentError(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("Payment succeeded:", paymentIntent.id);
        onPaymentSuccess(paymentIntent.id);
      } else {
        console.error("Payment not completed:", paymentIntent?.status);
        setErrorMessage("Payment was not completed. Please try again.");
        onPaymentError("Payment not completed");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      onPaymentError("Payment processing failed");
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <Card className={cn("w-full max-w-lg mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Complete your booking payment securely with Stripe
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Amount Display */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Amount:</span>
            <span className="text-lg font-bold">
              {formatAmount(amount, currency)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Order: {orderNumber}
          </div>
        </div>

        {/* Error Display */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Element */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Details</label>
            <div className="border rounded-md p-3">
              <PaymentElement
                options={{
                  layout: "tabs",
                  paymentMethodOrder: ["card", "apple_pay", "google_pay"],
                  fields: {
                    billingDetails: {
                      name: "auto",
                      email: "auto",
                      phone: "auto",
                      address: "never", // We'll use AddressElement separately
                    },
                  },
                }}
                onReady={() => {
                  console.log("PaymentElement ready");
                }}
                onChange={(event: any) => {
                  setIsComplete(event.complete);
                  if (event.error) {
                    setErrorMessage(event.error.message);
                  } else {
                    setErrorMessage("");
                  }
                }}
              />
            </div>
          </div>

          <Separator />

          {/* Billing Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Billing Address</label>
            <div className="border rounded-md p-3">
              <AddressElement
                options={{
                  mode: "billing",
                  allowedCountries: ["AU", "US", "CA", "GB", "NZ"],
                  fields: {
                    phone: "always",
                  },
                  validation: {
                    phone: {
                      required: "never",
                    },
                  },
                }}
              />
            </div>
          </div>

          <Separator />

          {/* Security Notice */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <Shield className="h-4 w-4 mt-0.5 text-brand-accent" />
            <div>
              <div className="font-medium text-foreground">Secure Payment</div>
              <div>
                Your payment information is encrypted and secure. We use
                Stripe's industry-leading security to protect your data.
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white"
            size="lg"
            disabled={
              !stripe ||
              !elements ||
              isLoading ||
              externalLoading ||
              !isComplete ||
              !clientSecret
            }
          >
            {isLoading || externalLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Pay {formatAmount(amount, currency)}
              </>
            )}
          </Button>

          {/* Payment Methods Accepted */}
          <div className="text-center text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-3 w-3" />
              <span>Visa, Mastercard, American Express accepted</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-3 w-3" />
              <span>Apple Pay and Google Pay supported</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
