"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  Shield,
  Calendar,
  Clock,
  MapPin,
  Home,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GuestManager, type GuestInfo } from "@/components/ui/guest-manager";
import { BookingFormData } from "@/lib/utils/booking-transform";



export default function GuestDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const sessionId = searchParams.get("session_id");
  
  console.log("🎯 Guest Details Page Loaded:", {
    orderNumber: orderNumber,
    sessionId: sessionId,
    sessionIdType: sessionId?.startsWith('cs_') ? 'checkout_session' : sessionId?.startsWith('pi_') ? 'payment_intent' : 'unknown',
    timestamp: new Date().toISOString()
  });

  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);

  // Guest state
  const [guests, setGuests] = useState<GuestInfo[]>([]);


  // Load booking data on mount
  useEffect(() => {
    if (!orderNumber) {
      setError("Missing order number");
      setLoading(false);
      return;
    }

    const loadBookingData = async () => {
      try {
        let data: BookingFormData | null = null;
        
        // First, try to get booking data from sessionStorage (most reliable)
        console.log("🔍 Attempting to retrieve booking data for order:", orderNumber);
        console.log("📊 Current URL parameters:", { orderNumber, sessionId });
        
        // Check sessionStorage first as it's more reliable
        if (orderNumber && typeof window !== "undefined") {
          try {
            const storageKey = `booking_${orderNumber}`;
            console.log("🔑 Checking sessionStorage with key:", storageKey);
            
            const cached = sessionStorage.getItem(storageKey);
            if (cached) {
              data = JSON.parse(cached);
              console.log("✅ Retrieved booking data from sessionStorage:", {
                hasPayment: !!data?.payment,
                paymentType: data?.payment?.type,
                paymentMethod: data?.payment?.method,
                productName: data?.product?.name,
                orderNumber: orderNumber
              });
              
              // Ensure payment data exists
              if (!data.payment || !data.payment.type) {
                console.warn("⚠️ Payment data missing in sessionStorage, adding default");
                data.payment = {
                  method: sessionId ? "stripe" : "credit_card",
                  type: "CREDITCARD" as const
                };
              }
            }
          } catch (storageErr) {
            console.error("💥 Failed to parse booking data from sessionStorage:", storageErr);
          }
        }
        
        // If not found in sessionStorage, try API as fallback
        if (!data) {
          console.log("📡 SessionStorage empty, trying API endpoint...");
          try {
            const response = await fetch(`/api/bookings/${orderNumber}`);
            const result = await response.json();
            
            if (response.ok && result.success && result.data) {
              data = result.data;
              console.log("✅ Retrieved booking data from API:", {
                hasPayment: !!data?.payment,
                paymentType: data?.payment?.type,
                paymentMethod: data?.payment?.method,
                orderNumber: orderNumber
              });
              
              // Store in sessionStorage for consistency
              if (orderNumber && typeof window !== "undefined") {
                sessionStorage.setItem(`booking_${orderNumber}`, JSON.stringify(data));
                console.log("💾 Cached API data to sessionStorage");
              }
            } else {
              console.error("❌ No booking data found in API:", {
                status: response.status,
                result: result
              });
            }
          } catch (apiError) {
            console.error("💥 Failed to retrieve from API:", apiError);
          }
        }
        

        if (!data) {
          console.error("❌ CRITICAL: No booking data found after all fallback attempts");
          console.error("🔍 Debug info:", {
            orderNumber: orderNumber,
            sessionId: sessionId,
            url: window.location.href,
            sessionStorageKeys: Object.keys(sessionStorage),
            bookingKeys: Object.keys(sessionStorage).filter(k => k.includes('booking'))
          });
          
          setError("Booking data not found. This may occur if the booking session has expired or the order number is invalid. Please contact support with your order number: " + orderNumber);
          setLoading(false);
          return;
        }

        setBookingData(data);

        // Initialize guests based on guest counts
        if (data.guestCounts) {
          const initialGuests: GuestInfo[] = [];
          let guestId = 1;

          // Add adults
          for (let i = 0; i < data.guestCounts.adults; i++) {
            // For the first guest, use contact information from pre-payment
            const isFirstGuest = i === 0;
            initialGuests.push({
              id: guestId.toString(),
              firstName: isFirstGuest ? data.contact.firstName : "",
              lastName: isFirstGuest ? data.contact.lastName : "",
              age: 25,
              type: "ADULT",
            });
            guestId++;
          }

          // Add children
          for (let i = 0; i < data.guestCounts.children; i++) {
            initialGuests.push({
              id: guestId.toString(),
              firstName: "",
              lastName: "",
              age: 12,
              type: "CHILD",
            });
            guestId++;
          }

          // Add infants
          for (let i = 0; i < data.guestCounts.infants; i++) {
            initialGuests.push({
              id: guestId.toString(),
              firstName: "",
              lastName: "",
              age: 1,
              type: "INFANT",
            });
            guestId++;
          }

          setGuests(initialGuests);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading booking data:", error);
        setError("Failed to load booking data. Please contact support.");
        setLoading(false);
      }
    };

    loadBookingData();
  }, [orderNumber]);


  // Validation - only check guest information
  const canSubmit = () => {
    const hasValidGuests = guests.every(
      (g) => g.firstName.trim() && g.lastName.trim()
    );

    return hasValidGuests;
  };

  const handleSubmit = async () => {
    if (!canSubmit() || !bookingData) return;

    setSubmitting(true);
    setSubmitErrors([]);

    try {
      // Validate and ensure payment data exists
      let paymentData = bookingData.payment;
      
      // If payment data is missing, determine it based on context
      if (!paymentData || !paymentData.type) {
        console.warn("⚠️ Payment data missing, determining from context:", {
          hasSessionId: !!sessionId,
          originalPayment: bookingData.payment
        });
        
        // For Stripe payments (when sessionId exists), always use CREDITCARD
        paymentData = {
          method: sessionId ? "stripe" : "credit_card",
          type: "CREDITCARD" as const
        };
      }
      
      // Validate payment type is valid
      if (paymentData.type !== "CASH" && paymentData.type !== "CREDITCARD") {
        console.error("❌ Invalid payment type detected:", paymentData.type);
        paymentData.type = "CREDITCARD" as const;
      }

      // Update booking data with guest information and validated payment details
      const updatedBookingData: BookingFormData = {
        ...bookingData,
        guests: guests.filter((g) => g.firstName.trim() && g.lastName.trim()),
        contact: {
          ...bookingData.contact,
          // Preserve original contact information from pre-payment
          country: bookingData.contact.country || "Australia",
        },
        // Use validated payment data
        payment: paymentData
      };

      // Debug: Log the payload being sent to the booking registration API
      console.log("🚀 Sending booking registration request:", {
        orderNumber,
        sessionId,
        guestCount: updatedBookingData.guests.length,
        guestCounts: updatedBookingData.guestCounts,
        totalAmount: updatedBookingData.pricing.total,
        firstGuest: updatedBookingData.guests[0],
        payment: updatedBookingData.payment,
        originalPayment: bookingData.payment
      });

      // Submit to Rezdy API
      const response = await fetch("/api/bookings/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingData: updatedBookingData,
          orderNumber,
          sessionId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Clear session storage
        if (orderNumber && typeof window !== 'undefined') {
          sessionStorage.removeItem(`booking_${orderNumber}`);
        }
        
        // Redirect to confirmation page
        router.push(
          `/booking/confirmation?orderNumber=${orderNumber}&transactionId=${result.transactionId || sessionId}`
        );
      } else {
        setSubmitErrors([
          result.error || "Failed to complete booking. Please try again.",
        ]);
      }
    } catch (error) {
      console.error("Error submitting guest details:", error);
      setSubmitErrors([
        "Failed to submit guest details. Please try again.",
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-destructive mb-4">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error ||
                "We could not find your booking. Please check your email or contact support."}
            </p>
            <Button onClick={() => router.push("/")}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link
              href="/"
              className="hover:text-foreground flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">
              Complete Booking
            </span>
          </nav>

          {/* Success Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-lg text-muted-foreground">
              Please provide guest details to complete your booking
            </p>
          </div>
        </div>

        {/* Error Display */}
        {submitErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {submitErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

       

        {/* Guest Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guest Details
            </CardTitle>
            <p className="text-muted-foreground">
              Please provide the names and ages of all guests
            </p>
          </CardHeader>
          <CardContent>
            <GuestManager
              guests={guests}
              onGuestsChange={setGuests}
              maxGuests={guests.length}
              minGuests={guests.length}
              requireAdult={true}
              autoManageGuests={false}
            />
          </CardContent>
        </Card>

         {/* Booking Summary */}
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-lg">{bookingData.product.name}</h4>
              <div className="space-y-2 text-sm">
                {bookingData.session.startTime && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(
                        new Date(bookingData.session.startTime),
                        "MMM dd, yyyy"
                      )}
                    </span>
                  </div>
                )}
                {bookingData.session.startTime && bookingData.session.endTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(
                        new Date(bookingData.session.startTime),
                        "h:mm a"
                      )}{" "}
                      - {format(new Date(bookingData.session.endTime), "h:mm a")}
                    </span>
                  </div>
                )}
                {bookingData.guestCounts && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {bookingData.guestCounts.adults +
                        bookingData.guestCounts.children +
                        bookingData.guestCounts.infants}{" "}
                      guests
                    </span>
                  </div>
                )}
                {bookingData.selectedPriceOptions && bookingData.guestCounts && (
                  <div className="space-y-1 pt-2">
                    {bookingData.guestCounts.adults > 0 && bookingData.selectedPriceOptions.adult && (
                      <div className="text-sm text-muted-foreground">
                        {bookingData.guestCounts.adults} × {bookingData.selectedPriceOptions.adult.label}
                      </div>
                    )}
                    {bookingData.guestCounts.children > 0 && bookingData.selectedPriceOptions.child && (
                      <div className="text-sm text-muted-foreground">
                        {bookingData.guestCounts.children} × {bookingData.selectedPriceOptions.child.label}
                      </div>
                    )}
                    {bookingData.guestCounts.infants > 0 && bookingData.selectedPriceOptions.infant && (
                      <div className="text-sm text-muted-foreground">
                        {bookingData.guestCounts.infants} × {bookingData.selectedPriceOptions.infant.label}
                      </div>
                    )}
                  </div>
                )}
                {bookingData.session.pickupLocation && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {bookingData.session.pickupLocation.name}
                      </div>
                      {bookingData.session.pickupLocation.pickupTime && (
                        <div className="text-muted-foreground">
                          Pickup: {bookingData.session.pickupLocation.pickupTime}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Paid:</span>
                  <span className="text-brand-accent">
                    ${bookingData.pricing.total.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Order: {orderNumber}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      
        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit() || submitting}
            className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/90 text-white"
            size="lg"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Completing Booking...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Complete Booking
              </>
            )}
          </Button>
        </div>

        {/* Help Info */}
        <div className="text-center text-sm text-muted-foreground">
          <Info className="h-4 w-4 inline mr-1" />
          Need help? Contact our support team at{" "}
          <a href="mailto:support@example.com" className="text-brand-accent">
            support@example.com
          </a>
        </div>
      </div>
    </div>
  );
} 