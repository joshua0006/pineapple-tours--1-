"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { StripePaymentForm } from "@/components/ui/stripe-payment-form";
import { StripeErrorBoundary } from "@/components/ui/stripe-error-boundary";
import { logStripeError } from "@/lib/stripe-error-monitor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Shield, 
  CreditCard, 
  AlertCircle, 
  Clock, 
  CheckCircle2,
  Lock,
  Calendar,
  Users,
  MapPin,
  Info
} from "lucide-react";
import Link from "next/link";

// Initialize Stripe with error handling and logging
const initializeStripe = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  console.log("Stripe initialization:", {
    hasPublishableKey: !!publishableKey,
    keyLength: publishableKey?.length,
    keyPrefix: publishableKey?.substring(0, 7),
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });

  if (!publishableKey) {
    const error = "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined";
    logStripeError.initialization(error, { 
      nodeEnv: process.env.NODE_ENV,
      hasKey: false 
    });
    throw new Error("Stripe publishable key is missing");
  }

  if (!publishableKey.startsWith('pk_')) {
    const error = "Invalid publishable key format";
    logStripeError.initialization(error, { 
      keyPrefix: publishableKey.substring(0, 7),
      keyLength: publishableKey.length 
    });
    throw new Error("Invalid Stripe publishable key format");
  }

  console.log("✅ Loading Stripe library with key:", publishableKey.substring(0, 20) + "...");
  
  return loadStripe(publishableKey);
};

const stripePromise = initializeStripe();

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get parameters from URL
  const orderNumber = searchParams.get("orderNumber");
  const amount = parseFloat(searchParams.get("amount") || "0");
  const productName = searchParams.get("productName");
  
  // Payment states
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoadingPaymentIntent, setIsLoadingPaymentIntent] = useState(false);
  const [error, setError] = useState<string>("");
  const [bookingData, setBookingData] = useState<any>(null);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);

  // Create payment intent when component mounts (with race condition protection)
  useEffect(() => {
    if (!orderNumber || !amount || amount <= 0) {
      setError("Invalid payment parameters. Please try again.");
      return;
    }

    // Prevent multiple simultaneous calls
    if (isCreatingPaymentIntent || clientSecret) {
      return;
    }

    createPaymentIntent();
  }, [orderNumber, amount, isCreatingPaymentIntent, clientSecret]);

  const createPaymentIntent = async () => {
    // Prevent multiple concurrent calls
    if (isCreatingPaymentIntent) {
      console.log("🔄 Payment intent creation already in progress, skipping...");
      return;
    }

    setIsCreatingPaymentIntent(true);
    setIsLoadingPaymentIntent(true);
    setError("");

    console.log("🔄 Creating payment intent:", {
      orderNumber,
      amount,
      productName,
      timestamp: new Date().toISOString()
    });

    try {
      // Get booking data from session storage or reconstruct from URL params
      const bookingDataStr = sessionStorage.getItem(`booking_${orderNumber}`);
      let bookingDataObj;

      if (bookingDataStr) {
        bookingDataObj = JSON.parse(bookingDataStr);
        setBookingData(bookingDataObj);
        console.log("✅ Booking data retrieved from session storage", {
          hasPickupLocation: !!bookingDataObj?.session?.pickupLocation,
          pickupLocation: bookingDataObj?.session?.pickupLocation ? {
            locationName: bookingDataObj.session.pickupLocation.locationName,
            locationId: bookingDataObj.session.pickupLocation.id,
            address: bookingDataObj.session.pickupLocation.address
          } : null,
          sessionId: bookingDataObj?.session?.id,
          orderNumber: orderNumber
        });
      } else {
        // Fallback: construct minimal booking data from URL params
        console.error("❌ Booking session expired or missing");
        logStripeError.paymentIntent(
          "Booking session expired or missing", 
          orderNumber || "unknown", 
          amount,
          { sessionStorageKey: `booking_${orderNumber || "unknown"}` }
        );
        setError("Booking session expired. Please start your booking again.");
        return;
      }

      console.log("📡 Sending payment intent creation request to API");

      const response = await fetch("/api/payments/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingData: bookingDataObj,
          orderNumber,
        }),
      });

      const result = await response.json();

      console.log("📧 Payment intent API response:", {
        success: result.success,
        hasClientSecret: !!result.clientSecret,
        paymentIntentId: result.paymentIntentId,
        error: result.error
      });

      if (result.success && result.clientSecret) {
        // Always update session storage with payment data to ensure it persists
        if (bookingDataObj) {
          const paymentData = result.paymentData || {
            method: "stripe",
            type: "CREDITCARD" as const
          };
          
          const updatedBookingData = {
            ...bookingDataObj,
            payment: paymentData
          };
          
          sessionStorage.setItem(`booking_${orderNumber}`, JSON.stringify(updatedBookingData));
          setBookingData(updatedBookingData); // Update local state as well
          
          console.log("💾 Updated session storage with payment data:", {
            orderNumber: orderNumber,
            paymentType: paymentData.type,
            paymentMethod: paymentData.method,
            storageKey: `booking_${orderNumber}`
          });
        }
        
        setClientSecret(result.clientSecret);
        console.log("✅ Payment intent created successfully");
      } else {
        const errorMsg = result.error || "Failed to initialize payment. Please try again.";
        console.error("❌ Payment intent creation failed:", errorMsg);
        logStripeError.paymentIntent(errorMsg, orderNumber || "unknown", amount, { apiResponse: result });
        setError(errorMsg);
      }
    } catch (error: any) {
      console.error("💥 Payment intent creation exception:", {
        name: error?.name,
        message: error?.message,
        stack: error?.stack?.substring(0, 500)
      });
      logStripeError.apiError(
        `Payment intent creation failed: ${error?.message}`,
        error?.code,
        { orderNumber: orderNumber || "unknown", amount, errorName: error?.name }
      );
      setError("Failed to initialize payment. Please try again.");
    } finally {
      setIsLoadingPaymentIntent(false);
      setIsCreatingPaymentIntent(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    // Don't clear booking data yet - needed for guest details page
    // sessionStorage.removeItem(`booking_${orderNumber}`);
    
    // Redirect to guest details page to collect guest information
    router.push(`/booking/guest-details?orderNumber=${orderNumber}&session_id=${paymentIntentId}`);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    setError(error);
  };

  const handleBackToBooking = () => {
    // Go back to the booking page - we can determine the product code from the booking data
    const bookingDataStr = sessionStorage.getItem(`booking_${orderNumber}`);
    if (bookingDataStr) {
      const bookingData = JSON.parse(bookingDataStr);
      router.push(`/booking/${bookingData.product.code}`);
    } else {
      router.push("/tours");
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-AU", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Show error state
  if (error && !clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToBooking}
              className="text-brand-primary hover:text-brand-primary/80"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Booking
            </Button>
          </div>

          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Payment Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription>
                  <strong>Payment Error:</strong> {error}
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2 justify-center">
                <Button onClick={handleBackToBooking} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Booking
                </Button>
                <Button onClick={createPaymentIntent}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoadingPaymentIntent || !clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToBooking}
              className="text-brand-primary hover:text-brand-primary/80"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Booking
            </Button>
          </div>

          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 animate-spin" />
                Preparing Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-muted-foreground">
                <div className="animate-pulse" role="status" aria-live="polite">
                  Setting up secure payment for your booking...
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg text-center">
                <div className="font-medium">Order: {orderNumber}</div>
                {productName && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {productName}
                  </div>
                )}
                <div className="text-lg font-bold mt-2">
                  {formatAmount(amount)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show payment form with two-column layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBackToBooking}
              className="text-brand-primary hover:text-brand-primary/80"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Booking
            </Button>
                         <div className="flex items-center gap-2">
               <Lock className="h-4 w-4 text-green-600" aria-hidden="true" />
               <span className="text-sm text-muted-foreground">Secure Payment</span>
             </div>
          </div>
        </div>
      </div>

             {/* Main Content */}
       <div className="container mx-auto px-4 py-8">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto">
           {/* Left Column - Payment Form */}
           <div className="space-y-6 order-2 lg:order-1">
             <div>
               <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                 Complete Your Payment
               </h1>
               <p className="text-slate-600">
                 Secure payment powered by Stripe
               </p>
             </div>

            {/* Payment Form with Error Boundary */}
            <StripeErrorBoundary
              onError={(error, errorInfo) => {
                console.error("🛡️ Stripe Error Boundary triggered:", { error, errorInfo });
                logStripeError.elementLoading(
                  `React Error Boundary: ${error.message}`,
                  { 
                    errorName: error.name,
                    componentStack: errorInfo.componentStack?.substring(0, 300),
                    orderNumber: orderNumber || "unknown",
                    amount
                  }
                );
                setError(`Payment system error: ${error.message}`);
              }}
            >
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  loader: 'auto',
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#FF6B35", // brand-accent color
                      colorBackground: "#ffffff",
                      colorText: "#1e293b",
                      colorDanger: "#dc2626",
                      borderRadius: "8px",
                      fontFamily: "Inter, system-ui, sans-serif",
                      spacingUnit: "4px",
                      gridRowSpacing: "16px",
                      gridColumnSpacing: "16px",
                    },
                    rules: {
                      ".Input": {
                        padding: "12px",
                        fontSize: "16px",
                        border: "1px solid #e2e8f0",
                      },
                      ".Input:focus": {
                        borderColor: "#FF6B35",
                        boxShadow: "0 0 0 1px #FF6B35",
                      },
                      ".Label": {
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: "8px",
                      },
                    },
                  },
                }}
              >
                <StripePaymentForm
                  clientSecret={clientSecret}
                  orderNumber={orderNumber || ""}
                  amount={amount}
                  currency="AUD"
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  className="bg-white rounded-lg shadow-sm border border-slate-200"
                  bookingData={bookingData}
                />
              </Elements>
            </StripeErrorBoundary>

            {/* Security Information */}
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-brand-accent mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900">
                      Your payment is secure
                    </h3>
                    <p className="text-sm text-slate-600">
                      We use industry-standard encryption to protect your payment information. 
                      Your card details are never stored on our servers.
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-slate-600">256-bit SSL</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-slate-600">PCI Compliant</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-slate-600">Stripe Secure</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

                     {/* Right Column - Order Summary */}
           <div className="space-y-6 order-1 lg:order-2">
                          {/* Order Summary Card */}
             <Card className="bg-white shadow-sm border border-slate-200 lg:sticky lg:top-8">
               <CardHeader className="pb-4">
                 <CardTitle id="order-summary-title" className="text-xl font-semibold text-slate-900">
                   Order Summary
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-6" role="region" aria-labelledby="order-summary-title">
                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">
                      {productName || bookingData?.product?.name || 'Tour Booking'}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Order #{orderNumber || 'N/A'}
                    </p>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-3">
                    {bookingData?.session?.startTime ? (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <div>
                          <div className="font-medium text-slate-900">
                            {formatDate(bookingData.session.startTime)}
                          </div>
                          <div className="text-sm text-slate-600">
                            {formatTime(bookingData.session.startTime)}
                            {bookingData.session.endTime && 
                              ` - ${formatTime(bookingData.session.endTime)}`
                            }
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-600">
                            Date & Time
                          </div>
                          <div className="text-sm text-slate-500">
                            To be confirmed
                          </div>
                        </div>
                      </div>
                    )}

                    {bookingData?.guestCounts ? (
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-slate-500" />
                        <div>
                          <div className="font-medium text-slate-900">
                            {(() => {
                              // Calculate total guests from either standard or dynamic format
                              if (typeof bookingData.guestCounts.adults === 'number') {
                                return (bookingData.guestCounts.adults || 0) +
                                       (bookingData.guestCounts.children || 0) +
                                       (bookingData.guestCounts.infants || 0);
                              } else {
                                // Dynamic format - sum all counts
                                return Object.values(bookingData.guestCounts).reduce((sum: number, count: any) => 
                                  sum + (typeof count === 'number' && count > 0 ? count : 0), 0
                                );
                              }
                            })()} Guests
                          </div>
                          <div className="text-sm text-slate-600">
                            {(() => {
                              // Handle both standard and dynamic guest count formats for breakdown
                              if (typeof bookingData.guestCounts.adults === 'number') {
                                // Standard format
                                const parts = [];
                                if (bookingData.guestCounts.adults > 0) parts.push(`${bookingData.guestCounts.adults} Adults`);
                                if (bookingData.guestCounts.children > 0) parts.push(`${bookingData.guestCounts.children} Children`);
                                if (bookingData.guestCounts.infants > 0) parts.push(`${bookingData.guestCounts.infants} Infants`);
                                return parts.join(', ');
                              } else {
                                // Dynamic format - show price option labels
                                return Object.entries(bookingData.guestCounts)
                                  .filter(([_, count]) => typeof count === 'number' && count > 0)
                                  .map(([label, count]) => `${count} ${label}`)
                                  .join(', ');
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-600">
                            Guests
                          </div>
                          <div className="text-sm text-slate-500">
                            Details to be confirmed
                          </div>
                        </div>
                      </div>
                    )}

                    {bookingData?.session?.pickupLocation ? (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-slate-900">
                            {bookingData.session.pickupLocation.name || 'Pickup Location'}
                          </div>
                          {bookingData.session.pickupLocation.pickupTime && (
                            <div className="text-sm text-slate-600">
                              Pickup: {bookingData.session.pickupLocation.pickupTime}
                            </div>
                          )}
                          {bookingData.session.pickupLocation.address && (
                            <div className="text-sm text-slate-500 mt-1">
                              {bookingData.session.pickupLocation.address}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <div className="font-medium text-slate-600">
                            Pickup Location
                          </div>
                          <div className="text-sm text-slate-500">
                            To be arranged
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>


                {/* Pricing Breakdown */}
                <div className="space-y-3">
                  {bookingData?.pricing && (
                    <>
                      
                      {bookingData.pricing.taxes > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Taxes & Fees</span>
                          <span className="text-slate-900">
                            {formatAmount(bookingData.pricing.taxes)}
                          </span>
                        </div>
                      )}

                      {bookingData.pricing.serviceFees > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Service Fee</span>
                          <span className="text-slate-900">
                            {formatAmount(bookingData.pricing.serviceFees)}
                          </span>
                        </div>
                      )}

                      <Separator />
                    </>
                  )}

                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-slate-900">Total</span>
                    <span className="text-brand-accent">
                      {formatAmount(amount)}
                    </span>
                  </div>
                </div>

                                 {/* Payment Methods */}
                 <div className="pt-4 border-t border-slate-200">
                   <div className="flex items-center justify-between mb-3">
                     <span className="text-sm font-medium text-slate-900">
                       Accepted Payment Methods
                     </span>
                     <CreditCard className="h-4 w-4 text-slate-500" aria-hidden="true" />
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                     <Badge variant="outline" className="justify-center py-3 text-xs font-medium">
                       💳 Visa
                     </Badge>
                     <Badge variant="outline" className="justify-center py-3 text-xs font-medium">
                       💳 Mastercard
                     </Badge>
                     <Badge variant="outline" className="justify-center py-3 text-xs font-medium">
                       💳 Amex
                     </Badge>
                     <Badge variant="outline" className="justify-center py-3 text-xs font-medium">
                       📱 Apple Pay
                     </Badge>
                   </div>
                   <div className="mt-3 text-center">
                     <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                       <CheckCircle2 className="h-3 w-3 text-green-600" aria-hidden="true" />
                       <span>Google Pay also supported</span>
                     </div>
                   </div>
                 </div>

                {/* Support Information */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-slate-500 mt-0.5" />
                    <div className="text-sm text-slate-600">
                      <p className="font-medium mb-1">Need help?</p>
                      <p>
                        Contact our support team at{" "}
                        <Link 
                          href="mailto:support@pineappletours.com.au" 
                          className="text-brand-accent hover:underline"
                        >
                          support@pineappletours.com.au
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-accent" />
          <p className="text-muted-foreground">Loading payment page...</p>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}