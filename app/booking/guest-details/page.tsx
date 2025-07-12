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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GuestManager, type GuestInfo } from "@/components/ui/guest-manager";
import { bookingDataStore } from "@/lib/services/booking-data-store";
import { BookingFormData } from "@/lib/utils/booking-transform";
import { cn } from "@/lib/utils";

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dietaryRequirements: string;
  accessibilityNeeds: string;
  specialRequests: string;
}

export default function GuestDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const sessionId = searchParams.get("session_id");

  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);

  // Guest and contact state
  const [guests, setGuests] = useState<GuestInfo[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dietaryRequirements: "",
    accessibilityNeeds: "",
    specialRequests: "",
  });

  // Contact field validation
  const [contactFieldErrors, setContactFieldErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});

  // Basic helpers
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    const len = cleaned.length;
    if (len < 4) return cleaned;
    if (len < 7) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  };

  const validateContactFields = () => {
    const errors: { email?: string; phone?: string } = {};
    if (!emailRegex.test(contactInfo.email)) {
      errors.email = "Please enter a valid email address.";
    }

    const phoneDigits = contactInfo.phone.replace(/\D/g, "");
    if (phoneDigits.length < 6) {
      errors.phone = "Please enter a valid phone number.";
    }

    setContactFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Load booking data on mount
  useEffect(() => {
    if (!orderNumber) {
      setError("Missing order number");
      setLoading(false);
      return;
    }

    const loadBookingData = async () => {
      try {
        // First try to get booking data from session storage (client-side)
        let data: BookingFormData | null = null;
        
        if (typeof window !== 'undefined') {
          const sessionData = sessionStorage.getItem(`booking_${orderNumber}`);
          if (sessionData) {
            try {
              data = JSON.parse(sessionData);
              console.log("✅ Retrieved booking data from session storage");
            } catch (parseError) {
              console.warn("Failed to parse session storage data:", parseError);
            }
          }
        }
        
        // If session storage failed, try the server-side booking data store
        if (!data) {
          data = await bookingDataStore.retrieve(orderNumber);
          console.log("✅ Retrieved booking data from server store");
        }
        
        if (!data) {
          setError("Booking data not found. Please contact support.");
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
            initialGuests.push({
              id: guestId.toString(),
              firstName: "",
              lastName: "",
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

  // Auto-populate contact info from first guest
  useEffect(() => {
    if (guests.length > 0 && guests[0].firstName && guests[0].lastName) {
      setContactInfo((prev) => ({
        ...prev,
        firstName: guests[0].firstName,
        lastName: guests[0].lastName,
      }));
    }
  }, [guests]);

  // Validation
  const canSubmit = () => {
    const hasValidGuests = guests.every(
      (g) => g.firstName.trim() && g.lastName.trim()
    );
    const hasValidContactInfo =
      contactInfo.firstName.trim() &&
      contactInfo.lastName.trim() &&
      contactInfo.email.trim() &&
      emailRegex.test(contactInfo.email) &&
      contactInfo.phone.trim() &&
      contactInfo.phone.replace(/\D/g, "").length >= 6;

    return hasValidGuests && hasValidContactInfo;
  };

  const handleSubmit = async () => {
    if (!canSubmit() || !bookingData) return;

    setSubmitting(true);
    setSubmitErrors([]);

    try {
      // Validate contact fields
      if (!validateContactFields()) {
        setSubmitting(false);
        return;
      }

      // Update booking data with guest and contact information
      const updatedBookingData: BookingFormData = {
        ...bookingData,
        guests: guests.filter((g) => g.firstName.trim() && g.lastName.trim()),
        contact: {
          ...bookingData.contact,
          ...contactInfo,
          country: "Australia",
        },
      };

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
        // Clear the stored booking data from both server and session storage
        if (orderNumber) {
          await bookingDataStore.remove(orderNumber);
          
          // Also clear session storage
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(`booking_${orderNumber}`);
          }
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
                        {bookingData.guestCounts.adults} × {bookingData.selectedPriceOptions.adult.label} (${bookingData.selectedPriceOptions.adult.price})
                      </div>
                    )}
                    {bookingData.guestCounts.children > 0 && bookingData.selectedPriceOptions.child && (
                      <div className="text-sm text-muted-foreground">
                        {bookingData.guestCounts.children} × {bookingData.selectedPriceOptions.child.label} (${bookingData.selectedPriceOptions.child.price})
                      </div>
                    )}
                    {bookingData.guestCounts.infants > 0 && bookingData.selectedPriceOptions.infant && (
                      <div className="text-sm text-muted-foreground">
                        {bookingData.guestCounts.infants} × {bookingData.selectedPriceOptions.infant.label} (${bookingData.selectedPriceOptions.infant.price})
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

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <p className="text-muted-foreground">
              Primary contact details for this booking
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact-first-name">First Name *</Label>
                <Input
                  id="contact-first-name"
                  value={contactInfo.firstName}
                  onChange={(e) =>
                    setContactInfo((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-last-name">Last Name *</Label>
                <Input
                  id="contact-last-name"
                  value={contactInfo.lastName}
                  onChange={(e) =>
                    setContactInfo((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact-email">Email Address *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) =>
                    setContactInfo((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  onBlur={validateContactFields}
                  placeholder="Enter email address"
                  required
                />
                {contactFieldErrors.email && (
                  <p className="mt-1 text-xs text-destructive">
                    {contactFieldErrors.email}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="contact-phone">Phone Number *</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setContactInfo((prev) => ({
                      ...prev,
                      phone: formatted,
                    }));
                  }}
                  onBlur={validateContactFields}
                  placeholder="0412 345 678"
                  required
                />
                {contactFieldErrors.phone && (
                  <p className="mt-1 text-xs text-destructive">
                    {contactFieldErrors.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="dietary-requirements">
                Dietary Requirements (Optional)
              </Label>
              <Textarea
                id="dietary-requirements"
                value={contactInfo.dietaryRequirements}
                onChange={(e) =>
                  setContactInfo((prev) => ({
                    ...prev,
                    dietaryRequirements: e.target.value,
                  }))
                }
                placeholder="Please specify any dietary requirements or allergies"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="accessibility-needs">
                Accessibility Needs (Optional)
              </Label>
              <Textarea
                id="accessibility-needs"
                value={contactInfo.accessibilityNeeds}
                onChange={(e) =>
                  setContactInfo((prev) => ({
                    ...prev,
                    accessibilityNeeds: e.target.value,
                  }))
                }
                placeholder="Please specify any accessibility requirements"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="special-requests">
                Special Requests (Optional)
              </Label>
              <Textarea
                id="special-requests"
                value={contactInfo.specialRequests}
                onChange={(e) =>
                  setContactInfo((prev) => ({
                    ...prev,
                    specialRequests: e.target.value,
                  }))
                }
                placeholder="Any special requests or additional information"
                rows={2}
              />
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