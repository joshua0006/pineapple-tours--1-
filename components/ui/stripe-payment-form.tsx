"use client";

import React, { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Shield, CreditCard, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { logStripeError } from "@/lib/stripe-error-monitor";
import { trackAddPaymentInfo, getProductCategory, formatCurrencyForGTM } from "@/lib/gtm";

interface StripePaymentFormProps {
  clientSecret: string;
  orderNumber: string;
  amount: number;
  currency: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  loading?: boolean;
  className?: string;
  bookingData?: any;
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
  bookingData,
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

  // Enhanced logging and debugging
  useEffect(() => {
    console.log("StripePaymentForm initialized:", {
      hasStripe: !!stripe,
      hasElements: !!elements,
      hasClientSecret: !!clientSecret,
      clientSecretLength: clientSecret?.length,
      orderNumber,
      amount,
      currency,
      timestamp: new Date().toISOString()
    });

    if (stripe) {
      console.log("✅ Stripe loaded successfully");
    } else {
      console.warn("⚠️ Stripe not yet loaded");
    }

    if (elements) {
      console.log("✅ Elements loaded successfully");
    } else {
      console.warn("⚠️ Elements not yet loaded");
    }
  }, [stripe, elements, clientSecret, orderNumber, amount, currency]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    console.log("💳 Payment submission started:", {
      hasStripe: !!stripe,
      hasElements: !!elements,
      hasClientSecret: !!clientSecret,
      orderNumber,
      amount,
      currency,
      isComplete,
      timestamp: new Date().toISOString()
    });

    if (!stripe || !elements) {
      const error = "Stripe has not loaded yet. Please try again.";
      console.error("❌ Stripe/Elements not loaded:", { stripe: !!stripe, elements: !!elements });
      logStripeError.elementLoading(error, { 
        hasStripe: !!stripe, 
        hasElements: !!elements,
        orderNumber,
        amount 
      });
      setErrorMessage(error);
      return;
    }

    if (!clientSecret) {
      const error = "Payment information is missing. Please refresh and try again.";
      console.error("❌ Missing client secret");
      logStripeError.paymentConfirmation(error, 'missing_client_secret', orderNumber, {
        clientSecretLength: clientSecret?.length || 0
      });
      setErrorMessage(error);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    // Track add payment info event in GTM
    try {
      if (bookingData) {
        trackAddPaymentInfo({
          value: formatCurrencyForGTM(amount),
          currency: currency.toUpperCase(),
          paymentType: 'credit_card',
          items: [{
            productCode: bookingData.product?.code || 'unknown',
            productName: bookingData.product?.name || 'Tour Booking',
            category: getProductCategory(bookingData.product?.code || '', bookingData.product?.name || ''),
            quantity: 1,
            price: formatCurrencyForGTM(amount),
          }],
        });
      }
    } catch (gtmError) {
      console.warn('GTM tracking error:', gtmError);
    }

    try {
      // Get the full name from booking data
      const fullName = bookingData?.contact 
        ? `${bookingData.contact.firstName} ${bookingData.contact.lastName}`.trim()
        : "";

      const billingAddress = bookingData?.contact?.address || {};

      console.log("🔄 Confirming payment with Stripe:", {
        fullName,
        email: bookingData?.contact?.email,
        billingAddress,
        returnUrl: `${window.location.origin}/booking/guest-details?orderNumber=${orderNumber}`
      });

      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/guest-details?orderNumber=${orderNumber}`,
          payment_method_data: {
            billing_details: {
              name: fullName,
              email: bookingData?.contact?.email || undefined,
              phone: bookingData?.contact?.phone || undefined,
              address: {
                country: billingAddress.country || "AU",
                state: billingAddress.state || undefined,
                city: billingAddress.city || undefined,
                postal_code: billingAddress.postalCode || undefined,
                line1: billingAddress.line1 || undefined,
                line2: billingAddress.line2 || undefined,
              },
            },
          },
        },
        redirect: "if_required", // Only redirect if required by payment method
      });

      console.log("🔍 Payment confirmation result:", {
        hasError: !!error,
        errorType: error?.type,
        errorCode: error?.code,
        errorMessage: error?.message,
        paymentIntentStatus: paymentIntent?.status,
        paymentIntentId: paymentIntent?.id
      });

      if (error) {
        console.error("❌ Payment confirmation error:", {
          type: error.type,
          code: error.code,
          message: error.message,
          declineCode: error.decline_code,
          paymentMethod: typeof error.payment_method === "string" ? error.payment_method : (error.payment_method as any)?.type
        });
        logStripeError.paymentConfirmation(
          error.message || "Payment confirmation failed",
          error.code,
          orderNumber,
          {
            errorType: error.type,
            declineCode: error.decline_code,
            paymentMethodType: typeof error.payment_method === "string" ? error.payment_method : (error.payment_method as any)?.type,
            amount,
            currency
          }
        );
        setErrorMessage(error.message || "An unexpected error occurred.");
        onPaymentError(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("✅ Payment succeeded:", {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          paymentMethod: typeof paymentIntent.payment_method === "string" ? paymentIntent.payment_method : (paymentIntent.payment_method as any)?.type
        });
        onPaymentSuccess(paymentIntent.id);
      } else {
        console.error("⚠️ Payment not completed:", {
          status: paymentIntent?.status,
          paymentIntentId: paymentIntent?.id,
          requiresAction: paymentIntent?.status === "requires_action"
        });
        setErrorMessage("Payment was not completed. Please try again.");
        onPaymentError("Payment not completed");
      }
    } catch (error: any) {
      console.error("💥 Payment processing exception:", {
        name: error?.name,
        message: error?.message,
        stack: error?.stack?.substring(0, 500),
        stringified: String(error)
      });
      logStripeError.paymentConfirmation(
        `Payment processing exception: ${error?.message}`,
        'processing_exception',
        orderNumber,
        {
          errorName: error?.name,
          stackTrace: error?.stack?.substring(0, 500),
          amount,
          currency
        }
      );
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
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Display */}
        {errorMessage && (
          <Alert variant="destructive" role="alert">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              <strong>Payment Error:</strong> {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Element */}
          <div className="space-y-3">
            <label 
              htmlFor="payment-element" 
              className="text-sm font-semibold text-slate-900"
            >
              Card Information
            </label>
            <div 
              className="border border-slate-200 rounded-lg p-4 bg-white"
              role="group"
              aria-labelledby="payment-element-label"
            >
              <PaymentElement
                options={{
                  layout: "tabs",
                  paymentMethodOrder: ["card", "apple_pay", "google_pay"],
                  // Disable Link functionality by excluding it from payment methods
                  wallets: {
                    applePay: "auto",
                    googlePay: "auto"
                  },
                  fields: {
                    billingDetails: {
                      /*
                       * Let Stripe collect most billing details automatically and
                       * only skip the fields we explicitly gather elsewhere. Using
                       * `if_required` for the address makes the Payment Element
                       * request the minimum set of address fields needed by the
                       * chosen payment method. This avoids the IntegrationError
                       * thrown when `address: \"never\"` is used without also
                       * providing the full address in `confirmPayment`.
                       */
                      name: "auto",
                      email: "never",
                      phone: "auto",
                      address: "auto",
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


          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold py-3 px-6 text-lg"
              size="lg"
              disabled={
                !stripe ||
                !elements ||
                isLoading ||
                externalLoading ||
                !isComplete ||
                !clientSecret
              }
              aria-describedby="payment-button-description"
            >
              {isLoading || externalLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Pay {formatAmount(amount, currency)}
                </>
              )}
            </Button>
          </div>

          {/* Payment Methods Info */}
          <div className="text-center pt-2">
            <div 
              id="payment-button-description"
              className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-2"
            >
              <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
              <span>Secure payment with 256-bit SSL encryption</span>
            </div>
            <div 
              className="flex items-center justify-center gap-4 text-xs text-slate-500"
              aria-label="Accepted payment methods"
            >
              <span>Visa</span>
              <span aria-hidden="true">•</span>
              <span>Mastercard</span>
              <span aria-hidden="true">•</span>
              <span>American Express</span>
              <span aria-hidden="true">•</span>
              <span>Apple Pay</span>
              <span aria-hidden="true">•</span>
              <span>Google Pay</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
