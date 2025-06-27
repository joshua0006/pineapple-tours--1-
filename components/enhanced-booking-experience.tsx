"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Users,
  CreditCard,
  MapPin,
  Clock,
  Star,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  Phone,
  Mail,
  Globe,
  Heart,
  Share2,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Home,
} from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingDisplay } from "@/components/ui/pricing-display";
import { GuestManager, type GuestInfo } from "@/components/ui/guest-manager";
import { ExtrasSelector } from "@/components/ui/extras-selector";
import { PickupLocationSelector } from "@/components/ui/pickup-location-selector";
import { BookingOptionSelector } from "@/components/ui/booking-option-selector";
import { useRezdyAvailability } from "@/hooks/use-rezdy";
import {
  RezdyProduct,
  RezdySession,
  RezdyPickupLocation,
  RezdyBookingOption,
  RezdyAvailability,
} from "@/lib/types/rezdy";
import { FitTourDataService } from "@/lib/services/fit-tour-data";
import {
  formatPrice,
  getLocationString,
  hasPickupServices,
  getPickupServiceType,
  extractPickupLocations,
} from "@/lib/utils/product-utils";
import {
  calculatePricing,
  formatCurrency,
  getPricingSummaryText,
  validatePricingOptions,
  type PricingBreakdown,
  type SelectedExtra,
} from "@/lib/utils/pricing-utils";
import {
  transformBookingDataToRezdy,
  validateBookingDataForRezdy,
  calculateExtrasPricing,
  getTotalParticipantCount,
  getParticipantBreakdown,
  type BookingFormData,
} from "@/lib/utils/booking-transform";
import { cn } from "@/lib/utils";
import {
  registerBookingWithPayment,
  PaymentConfirmation,
  BookingService,
} from "@/lib/services/booking-service";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripePaymentForm } from "@/components/ui/stripe-payment-form";

interface EnhancedBookingExperienceProps {
  product: RezdyProduct;
  onClose?: () => void;
  onBookingComplete?: (bookingData: any) => void;
  // Optional cart item data for pre-populating the form
  preSelectedSession?: RezdySession;
  preSelectedParticipants?: {
    adults: number;
    children?: number;
    infants?: number;
  };
  preSelectedExtras?: SelectedExtra[];
}

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  emergencyContact: string;
  emergencyPhone: string;
  dietaryRequirements: string;
  accessibilityNeeds: string;
  specialRequests: string;
}

// Payment info is no longer collected in the form - handled by Westpac hosted page

const BOOKING_STEPS = [
  {
    id: 1,
    title: "Date & Guest Details",
    description: "Choose your tour date and add guest information",
  },
  {
    id: 2,
    title: "Contact Info",
    description: "Provide contact and special requirements",
  },
  {
    id: 3,
    title: "Review Booking",
    description: "Review your booking details",
  },
  {
    id: 4,
    title: "Secure Payment",
    description: "Complete your payment securely with Stripe",
  },
];

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Japan",
  "South Korea",
  "China",
  "India",
  "Brazil",
  "Mexico",
  "Argentina",
  "Other",
];

export function EnhancedBookingExperience({
  product,
  onClose,
  preSelectedSession,
  preSelectedParticipants,
  preSelectedExtras,
}: EnhancedBookingExperienceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingErrors, setBookingErrors] = useState<string[]>([]);

  // Check if product has pickup services
  const productHasPickupServices = hasPickupServices(product);
  const pickupServiceType = getPickupServiceType(product);
  const mentionedPickupLocations = extractPickupLocations(product);

  // Get FIT tour booking options
  const fitTourBookingOptions = useMemo(() => {
    return FitTourDataService.getBookingOptions(product.productCode);
  }, [product.productCode]);

  const hasFitTourOptions = fitTourBookingOptions.length > 0;

  // Booking state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSession, setSelectedSession] = useState<RezdySession | null>(
    preSelectedSession || null
  );
  const [selectedPickupLocation, setSelectedPickupLocation] =
    useState<RezdyPickupLocation | null>(null);
  const [selectedBookingOption, setSelectedBookingOption] =
    useState<RezdyBookingOption | null>(null);
  const [guests, setGuests] = useState<GuestInfo[]>([
    { id: "1", firstName: "", lastName: "", age: 25, type: "ADULT" },
  ]);
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>(
    preSelectedExtras || []
  );
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    emergencyContact: "",
    emergencyPhone: "",
    dietaryRequirements: "",
    accessibilityNeeds: "",
    specialRequests: "",
  });
  // Inline field errors for contact inputs
  const [contactFieldErrors, setContactFieldErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});

  // Basic helpers
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 10); // keep max 10 digits
    const len = cleaned.length;
    if (len < 4) return cleaned;
    if (len < 7) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
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

  // Payment info is handled by Westpac hosted page - no longer stored in component state
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Payment processing state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Stripe state
  const [stripePromise] = useState(() =>
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  );
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [orderNumber, setOrderNumber] = useState<string>("");

  // Debug flag – set to true to see detailed console logs for calendar highlight logic
  const DEBUG_CALENDAR = true;

  // Helper function to ensure consistent date formatting across storage and retrieval
  const getConsistentDateString = (input: Date | string): string => {
    // For Date objects – easy path
    if (input instanceof Date) {
      return input.toISOString().split("T")[0];
    }

    // For string inputs coming from Rezdy (may be "YYYY-MM-DDTHH:mm:ss" or "YYYY-MM-DD HH:mm:ss")
    if (typeof input === "string") {
      // Fast path: if the string already contains a delimiter, slice before it
      const tIndex = input.indexOf("T");
      const spaceIndex = input.indexOf(" ");
      const delimiterIndex = tIndex !== -1 ? tIndex : spaceIndex;
      if (delimiterIndex !== -1) {
        return input.slice(0, delimiterIndex).trim();
      }

      // Regex fallback: match YYYY-MM-DD at start
      const match = input.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }

    // As a last resort, return the input cast to string (this shouldn't normally happen)
    return String(input);
  };

  // Reset all selection-related state when the displayed product changes
  useEffect(() => {
    // Start back at step 1
    setCurrentStep(1);

    // Clear session-specific selections so nothing remains highlighted
    setSelectedDate(undefined);
    setSelectedSession(null);
    setSelectedPickupLocation(null);
    setSelectedBookingOption(null);

    // Clear extras and guests back to their defaults
    setSelectedExtras([]);
    setGuests([
      { id: "1", firstName: "", lastName: "", age: 25, type: "ADULT" },
    ]);

    // Clear any errors displayed from the previous booking flow
    setBookingErrors([]);
  }, [product.productCode]);

  // Initialize form data from cart item if provided
  useEffect(() => {
    if (preSelectedSession) {
      // Set the selected date from the session
      const sessionDate = new Date(preSelectedSession.startTimeLocal);
      setSelectedDate(sessionDate);

      // Auto-select first pickup location if available
      if (
        preSelectedSession.pickupLocations &&
        preSelectedSession.pickupLocations.length > 0
      ) {
        setSelectedPickupLocation(preSelectedSession.pickupLocations[0]);
      }
    }

    if (preSelectedParticipants) {
      // Create guest list based on participant counts
      const newGuests: GuestInfo[] = [];
      let guestId = 1;

      // Add adults
      for (let i = 0; i < preSelectedParticipants.adults; i++) {
        newGuests.push({
          id: guestId.toString(),
          firstName: "",
          lastName: "",
          age: 25,
          type: "ADULT",
        });
        guestId++;
      }

      // Add children
      if (preSelectedParticipants.children) {
        for (let i = 0; i < preSelectedParticipants.children; i++) {
          newGuests.push({
            id: guestId.toString(),
            firstName: "",
            lastName: "",
            age: 12,
            type: "CHILD",
          });
          guestId++;
        }
      }

      // Add infants
      if (preSelectedParticipants.infants) {
        for (let i = 0; i < preSelectedParticipants.infants; i++) {
          newGuests.push({
            id: guestId.toString(),
            firstName: "",
            lastName: "",
            age: 1,
            type: "INFANT",
          });
          guestId++;
        }
      }

      if (newGuests.length > 0) {
        setGuests(newGuests);
      }
    }
  }, [preSelectedSession, preSelectedParticipants]);

  // Date range for availability
  const today = new Date();
  const endDate = addDays(today, 90); // 3 months ahead
  const startDateRange = today.toISOString().split("T")[0];
  const endDateRange = endDate.toISOString().split("T")[0];

  // Calculate guest counts
  const guestCounts = useMemo(() => {
    const counts = { adults: 0, children: 0, infants: 0 };
    guests.forEach((guest) => {
      if (guest.type === "ADULT") counts.adults++;
      else if (guest.type === "CHILD") counts.children++;
      else if (guest.type === "INFANT") counts.infants++;
    });
    return counts;
  }, [guests]);

  // Fetch availability
  const {
    data: availabilityData,
    loading: availabilityLoading,
    error: availabilityError,
  } = useRezdyAvailability(
    product.productCode,
    startDateRange,
    endDateRange,
    `ADULT:${guestCounts.adults},CHILD:${guestCounts.children},INFANT:${guestCounts.infants}`
  );

  // Fallback mock data for when API is not working
  const mockAvailabilityData: RezdyAvailability[] = useMemo(() => {
    const sessions = [];
    const today = new Date();

    // Generate mock sessions for the next 30 days
    for (let i = 1; i <= 30; i++) {
      const sessionDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const dateString = sessionDate.toISOString().split("T")[0];

      // Skip weekends for some variety
      if (sessionDate.getDay() === 0 || sessionDate.getDay() === 6) continue;

      // Morning session
      sessions.push({
        id: `mock-session-${i}-morning`,
        startTimeLocal: `${dateString}T09:00:00`,
        endTimeLocal: `${dateString}T17:00:00`,
        seatsAvailable: Math.floor(Math.random() * 15) + 5, // 5-20 seats
        totalPrice: product.advertisedPrice || 89,
        pickupLocations: [],
      });

      // Afternoon session (some days)
      if (Math.random() > 0.3) {
        sessions.push({
          id: `mock-session-${i}-afternoon`,
          startTimeLocal: `${dateString}T14:00:00`,
          endTimeLocal: `${dateString}T22:00:00`,
          seatsAvailable: Math.floor(Math.random() * 12) + 3, // 3-15 seats
          totalPrice: product.advertisedPrice || 89,
          pickupLocations: [],
        });
      }
    }

    return [{ productCode: product.productCode, sessions }] as any;
  }, [product.productCode, product.advertisedPrice]);

  // Use mock data if API fails or returns no data
  const effectiveAvailabilityData = useMemo(() => {
    // If we have real data with sessions, use it
    if (
      availabilityData &&
      availabilityData[0]?.sessions &&
      availabilityData[0].sessions.length > 0
    ) {
      return availabilityData;
    }

    // If API is still loading, don't use mock data yet
    if (availabilityLoading) {
      return null;
    }

    // If API failed or returned no sessions, use mock data
    if (
      availabilityError ||
      !availabilityData ||
      !availabilityData[0]?.sessions ||
      availabilityData[0].sessions.length === 0
    ) {
      return mockAvailabilityData;
    }

    return availabilityData;
  }, [
    availabilityData,
    availabilityLoading,
    availabilityError,
    mockAvailabilityData,
  ]);

  // Helper: flatten all sessions across availability entries
  const allSessions: RezdySession[] = useMemo(() => {
    if (!effectiveAvailabilityData) return [] as RezdySession[];

    return effectiveAvailabilityData.flatMap(
      (entry) => entry.sessions || []
    ) as RezdySession[];
  }, [effectiveAvailabilityData]);

  // Debug: log the flattened sessions whenever they change (placed after allSessions is defined)
  useEffect(() => {
    if (!DEBUG_CALENDAR) return;
    console.groupCollapsed("[CalendarDebug] allSessions updated");
    console.table(
      allSessions.map((s: RezdySession) => ({
        date: s.startTimeLocal?.split("T")[0],
        start: s.startTimeLocal,
        seatsAvailable: (s as any).seatsAvailable,
        seatsRemaining: (s as any).seatsRemaining,
      }))
    );
    console.groupEnd();
  }, [allSessions]);

  // Extract available dates with seat availability
  const availableDates = useMemo(() => {
    if (allSessions.length === 0) return new Set<string>();

    const dates = new Set<string>();
    allSessions.forEach((session: RezdySession) => {
      // Handle seats in various formats (number, string, undefined)
      const rawSeats =
        (session as any).seatsRemaining ?? (session as any).seatsAvailable;
      let hasSeats = true;

      if (rawSeats !== undefined && rawSeats !== null) {
        const numeric = Number(rawSeats);
        hasSeats = isNaN(numeric) ? true : numeric > 0;
      }

      if (DEBUG_CALENDAR) {
        console.log(`[CalendarDebug] Processing session:`, {
          date: session.startTimeLocal?.split("T")[0],
          rawSeats,
          hasSeats,
          startTime: session.startTimeLocal,
        });
      }

      if (hasSeats && session.startTimeLocal) {
        const sessionDate = getConsistentDateString(session.startTimeLocal);
        dates.add(sessionDate);
        if (DEBUG_CALENDAR) {
          console.log(
            `[CalendarDebug] Added date to availableDates:`,
            sessionDate
          );
        }
      }
    });

    if (DEBUG_CALENDAR) {
      console.log(
        `[CalendarDebug] Final availableDates Set:`,
        Array.from(dates)
      );
    }

    return dates;
  }, [allSessions]);

  // Get seat availability for a specific date
  const getDateSeatAvailability = useMemo(() => {
    if (allSessions.length === 0) return new Map<string, number>();

    const seatMap = new Map<string, number>();
    allSessions.forEach((session: RezdySession) => {
      if (session.startTimeLocal) {
        const sessionDate = getConsistentDateString(session.startTimeLocal);
        const currentSeats = seatMap.get(sessionDate) || 0;
        const rawSeats =
          (session as any).seatsRemaining ?? (session as any).seatsAvailable;
        const numericSeats = Number(rawSeats);
        const seats = isNaN(numericSeats)
          ? Number.MAX_SAFE_INTEGER
          : numericSeats;
        seatMap.set(sessionDate, Math.max(currentSeats, seats));
      }
    });
    return seatMap;
  }, [allSessions]);

  // Get all dates that have sessions (regardless of availability)
  const datesWithSessions = useMemo(() => {
    if (allSessions.length === 0) return new Set<string>();

    const dates = new Set<string>();
    allSessions.forEach((session) => {
      if (session.startTimeLocal) {
        const sessionDate = getConsistentDateString(session.startTimeLocal);
        dates.add(sessionDate);
      }
    });
    return dates;
  }, [allSessions]);

  // Helper to guarantee session.id exists
  const normalizeSessionId = (session: RezdySession): string => {
    if (session.id !== undefined && session.id !== null && session.id !== "") {
      return String(session.id);
    }
    // Generate deterministic id based on start & end times
    const generatedId = `${session.startTimeLocal ?? "unknown"}___${
      session.endTimeLocal ?? ""
    }`;
    // Mutate the object so future comparisons use same id
    (session as any).id = generatedId;
    return generatedId;
  };

  // Get sessions for selected date
  const availableSessions = useMemo(() => {
    if (
      !effectiveAvailabilityData ||
      !effectiveAvailabilityData[0]?.sessions ||
      !selectedDate
    )
      return [];

    const selectedDateString = getConsistentDateString(selectedDate);
    return effectiveAvailabilityData[0].sessions
      .map((s: RezdySession) => {
        // ensure id exists
        normalizeSessionId(s);
        return s;
      })
      .filter(
        (session) =>
          session.startTimeLocal &&
          getConsistentDateString(session.startTimeLocal) === selectedDateString
      )
      .sort((a: RezdySession, b: RezdySession) => {
        if (!a.startTimeLocal || !b.startTimeLocal) return 0;
        return (
          new Date(a.startTimeLocal).getTime() -
          new Date(b.startTimeLocal).getTime()
        );
      });
  }, [effectiveAvailabilityData, selectedDate]);

  // Calculate pricing with booking option
  const pricingBreakdown = useMemo((): PricingBreakdown => {
    const basePricing = calculatePricing(product, selectedSession, {
      adults: guestCounts.adults,
      children: guestCounts.children,
      infants: guestCounts.infants,
      extras: selectedExtras,
    });

    // If FIT tour option is selected, add the option pricing
    if (selectedBookingOption && hasFitTourOptions) {
      const participantCount = guestCounts.adults + guestCounts.children;
      const optionTotal = selectedBookingOption.price * participantCount;

      return {
        ...basePricing,
        adultPrice: basePricing.adultPrice + selectedBookingOption.price,
        subtotal: basePricing.subtotal + optionTotal,
        total: basePricing.total + optionTotal,
        bookingOptionPrice: selectedBookingOption.price,
        bookingOptionTotal: optionTotal,
        bookingOptionName: selectedBookingOption.name,
      };
    }

    return basePricing;
  }, [
    product,
    selectedSession,
    guestCounts,
    selectedExtras,
    selectedBookingOption,
    hasFitTourOptions,
  ]);

  // Validation
  const validationErrors = useMemo(() => {
    return validatePricingOptions(
      {
        adults: guestCounts.adults,
        children: guestCounts.children,
        infants: guestCounts.infants,
        extras: selectedExtras,
      },
      product
    );
  }, [guestCounts, selectedExtras, product]);

  // Step validation
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        const hasValidGuests = guests.every(
          (g) => g.firstName.trim() && g.lastName.trim()
        );
        const hasValidSession =
          selectedSession && validationErrors.length === 0;

        // Check if pickup location is required and selected
        const needsPickupLocation =
          productHasPickupServices &&
          selectedSession?.pickupLocations &&
          selectedSession.pickupLocations.length > 0;
        const hasValidPickupLocation =
          !needsPickupLocation || selectedPickupLocation;

        // Check if FIT tour booking option is required and selected
        const needsBookingOption = hasFitTourOptions;
        const hasValidBookingOption =
          !needsBookingOption ||
          (selectedBookingOption && selectedPickupLocation);

        return (
          hasValidGuests &&
          hasValidSession &&
          hasValidPickupLocation &&
          hasValidBookingOption
        );
      case 2:
        return (
          contactInfo.firstName &&
          contactInfo.lastName &&
          contactInfo.email &&
          contactInfo.phone
        );
      case 3:
        return agreeToTerms; // Terms agreement required to proceed to payment
      case 4:
        return false; // Payment step doesn't proceed to next step
      default:
        return false;
    }
  };

  // Event handlers
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSession(null);
    setSelectedPickupLocation(null);
  };

  const handleSessionSelect = (session: RezdySession) => {
    // ensure id exists before storing
    const sid = normalizeSessionId(session);

    setSelectedSession({ ...session });
    // Reset booking option selection when session changes
    setSelectedBookingOption(null);
    setSelectedPickupLocation(null);
    // Auto-select first pickup location if available (for non-FIT tours)
    if (
      !hasFitTourOptions &&
      session.pickupLocations &&
      session.pickupLocations.length > 0
    ) {
      setSelectedPickupLocation(session.pickupLocations[0]);
    }
  };

  const handleBookingOptionSelect = (
    option: RezdyBookingOption,
    location: RezdyPickupLocation
  ) => {
    setSelectedBookingOption(option);
    setSelectedPickupLocation(location);
  };

  // Stripe payment handlers
  const handlePaymentSuccess = async (stripePaymentIntentId: string) => {
    setIsProcessingPayment(true);
    setBookingErrors([]);

    try {
      // Confirm payment with our backend
      const confirmResponse = await fetch(
        "/api/payments/stripe/confirm-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentIntentId: stripePaymentIntentId,
            orderNumber,
          }),
        }
      );

      const confirmResult = await confirmResponse.json();

      if (confirmResult.success) {
        // Redirect to confirmation page
        window.location.href = `/booking/confirmation?orderNumber=${confirmResult.orderNumber}&transactionId=${confirmResult.transactionId}`;
      } else {
        console.error("Booking confirmation failed:", confirmResult.error);
        setBookingErrors([
          confirmResult.error ||
            "Booking confirmation failed. Please contact support.",
        ]);
      }
    } catch (error) {
      console.error("Payment confirmation error:", error);
      setBookingErrors(["Failed to confirm payment. Please contact support."]);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    setBookingErrors([error]);
    setIsProcessingPayment(false);
  };

  const handleNextStep = () => {
    // Additional validation for contact step
    if (currentStep === 2 && !validateContactFields()) {
      return; // stop if errors
    }

    if (canProceedToNextStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setBookingErrors([]);
      // Scroll to top of the page
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setBookingErrors([]);
      // Scroll to top of the page
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleProceedToPayment = async () => {
    setIsProcessingPayment(true);
    setBookingErrors([]);

    try {
      // Prepare booking data in the format our transformation utilities expect
      const formData: BookingFormData = {
        product: {
          code: product.productCode,
          name: product.name,
          description: product.shortDescription,
        },
        session: {
          id: selectedSession?.id || "",
          startTime: selectedSession?.startTimeLocal || "",
          endTime: selectedSession?.endTimeLocal || "",
          pickupLocation: selectedPickupLocation,
          bookingOption: selectedBookingOption,
        },
        guests: guests.filter((g) => g.firstName.trim() && g.lastName.trim()),
        contact: contactInfo,
        pricing: {
          basePrice: pricingBreakdown.basePrice,
          sessionPrice: pricingBreakdown.adultPrice, // Use adult price as session price
          subtotal: pricingBreakdown.subtotal,
          taxAndFees: pricingBreakdown.taxes + pricingBreakdown.serviceFees,
          total: pricingBreakdown.total,
        },
        extras: selectedExtras.map((selectedExtra, index) => {
          // Get the calculated price from the pricing breakdown which already handles PER_PERSON, PER_BOOKING, etc.
          const extrasFromBreakdown = pricingBreakdown.selectedExtras || [];
          const matchingExtra = extrasFromBreakdown.find(
            (e) => e.extra.id === selectedExtra.extra.id
          );

          // Calculate total price based on price type
          let totalPrice = selectedExtra.extra.price * selectedExtra.quantity;
          if (selectedExtra.extra.priceType === "PER_PERSON") {
            totalPrice =
              selectedExtra.extra.price *
              selectedExtra.quantity *
              getTotalParticipantCount(guests);
          }

          return {
            id: selectedExtra.extra.id,
            name: selectedExtra.extra.name,
            price: selectedExtra.extra.price,
            quantity: selectedExtra.quantity,
            totalPrice,
          };
        }),
        payment: {
          method: "credit_card",
        },
      };

      // Validate booking data for Rezdy submission
      const validation = validateBookingDataForRezdy(formData);
      if (!validation.isValid) {
        setBookingErrors(validation.errors);
        setIsProcessingPayment(false);
        return;
      }

      // Generate unique order number
      const generatedOrderNumber = `ORD-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;
      setOrderNumber(generatedOrderNumber);

      // Create Stripe Checkout session
      const checkoutResponse = await fetch(
        "/api/payments/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingData: formData,
            orderNumber: generatedOrderNumber,
          }),
        }
      );

      const checkoutResult = await checkoutResponse.json();

      if (!checkoutResult.success || !checkoutResult.url) {
        setBookingErrors([
          checkoutResult.error || "Failed to create checkout session",
        ]);
        setIsProcessingPayment(false);
        return;
      }

      // Redirect user to Stripe-hosted Checkout page
      window.location.href = checkoutResult.url as string;
      // Note: no further code will execute after redirect, but keep for safety
      return;
    } catch (error) {
      console.error("Checkout session creation error:", error);
      setBookingErrors([
        "Failed to create checkout session. Please try again.",
      ]);
      setIsProcessingPayment(false);
    }
  };

  const isDateAvailable = (date: Date): boolean => {
    try {
      const dateString = getConsistentDateString(date);
      const available = availableDates.has(dateString);
      if (DEBUG_CALENDAR) {
        console.log(`[CalendarDebug] isDateAvailable(${dateString}) ->`, {
          available,
          availableDatesSize: availableDates.size,
          availableDatesArray: Array.from(availableDates),
          allSessionsCount: allSessions.length,
          // Show both formats for debugging timezone issues
          localFormat: format(date, "yyyy-MM-dd"),
          utcFormat: dateString,
          formatMismatch: format(date, "yyyy-MM-dd") !== dateString,
        });
      }
      return available;
    } catch (err) {
      if (DEBUG_CALENDAR) {
        console.warn("[CalendarDebug] isDateAvailable error", err);
      }
      return false;
    }
  };

  const isDateDisabled = (date: Date): boolean => {
    try {
      const dateString = getConsistentDateString(date);
      const hasAvailabilityData = Boolean(allSessions.length > 0);

      if (date < today || date > endDate) {
        return true;
      }

      if (!hasAvailabilityData) return false;

      const hasSessionsOnDate = datesWithSessions.has(dateString);
      const hasSeatsOnDate = (getDateSeatAvailability.get(dateString) || 0) > 0;
      const disabled = hasSessionsOnDate && !hasSeatsOnDate;

      if (DEBUG_CALENDAR) {
        console.log(
          `[CalendarDebug] isDateDisabled(${dateString}) ->`,
          disabled
        );
      }

      return disabled;
    } catch (err) {
      if (DEBUG_CALENDAR)
        console.warn("[CalendarDebug] isDateDisabled error", err);
      return true;
    }
  };

  const isDateSoldOut = (date: Date): boolean => {
    try {
      const dateString = getConsistentDateString(date);
      const hasAvailabilityData = Boolean(allSessions.length > 0);

      if (!hasAvailabilityData) return false;

      const hasSessionsOnDate = datesWithSessions.has(dateString);
      const hasSeatsOnDate = (getDateSeatAvailability.get(dateString) || 0) > 0;

      const soldOut = hasSessionsOnDate && !hasSeatsOnDate;

      if (DEBUG_CALENDAR) {
        console.log(`[CalendarDebug] isDateSoldOut(${dateString}) ->`, soldOut);
      }

      return soldOut;
    } catch (err) {
      if (DEBUG_CALENDAR)
        console.warn("[CalendarDebug] isDateSoldOut error", err);
      return false;
    }
  };

  const getStepProgress = () => {
    return ((currentStep - 1) / (BOOKING_STEPS.length - 1)) * 100;
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header with Navigation */}
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
            <Link href="/tours" className="hover:text-foreground">
              Tours
            </Link>
            <span>/</span>
            <Link
              href={`/tours/${product.productCode}`}
              className="hover:text-foreground"
            >
              {product.name}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Book Now</span>
          </nav>

          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground">
                {getLocationString(product.locationAddress)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Link href={`/tours/${product.productCode}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tour
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              Step {currentStep} of {BOOKING_STEPS.length}
            </span>
            <span>{Math.round(getStepProgress())}% Complete</span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {BOOKING_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <div
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors",
                  currentStep >= step.id
                    ? "bg-brand-accent text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.id ? (
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  step.id
                )}
              </div>
              {index < BOOKING_STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-12 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-colors flex-shrink-0",
                    currentStep > step.id ? "bg-brand-accent" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Display */}
        {(bookingErrors.length > 0 || validationErrors.length > 0) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {[...bookingErrors, ...validationErrors].map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Demo Data Alert */}
        {!availabilityLoading &&
          (availabilityError ||
            !availabilityData ||
            !availabilityData[0]?.sessions?.length) && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Demo availability data is being displayed. In a live
                environment, this would show real-time tour availability from
                the booking system.
              </AlertDescription>
            </Alert>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Step 1: Date & Guest Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Date & Time Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Select Date & Time
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Choose your preferred tour date and session first
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Date Selection */}
                    <div>
                      <Label className="text-base font-medium">
                        Select Date
                      </Label>
                      <div className="mt-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-12",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate
                                ? format(selectedDate, "EEEE, MMMM do, yyyy")
                                : "Choose your tour date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={selectedDate}
                              onSelect={handleDateSelect}
                              disabled={isDateDisabled}
                              modifiers={{
                                available: isDateAvailable,
                                soldOut: isDateSoldOut,
                              }}
                              modifiersStyles={{
                                available: {
                                  backgroundColor: "rgb(255 88 93 / 0.1)",
                                  color: "#FF585D",
                                  fontWeight: "bold",
                                },
                                soldOut: {
                                  backgroundColor: "rgb(64 64 64 / 0.1)",
                                  color: "#404040",
                                  textDecoration: "line-through",
                                },
                              }}
                              initialFocus
                            />
                            <div className="p-3 border-t space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="w-3 h-3 bg-brand-accent/20 rounded"></div>
                                <span>Available dates</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="w-3 h-3 bg-muted rounded"></div>
                                <span>Sold out</span>
                              </div>
                              {availabilityLoading && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <div className="w-3 h-3 bg-muted rounded animate-pulse"></div>
                                  <span>Loading availability...</span>
                                </div>
                              )}
                              {availabilityError && (
                                <div className="flex items-center gap-2 text-sm text-destructive">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>Error loading availability</span>
                                </div>
                              )}
                              {!availabilityLoading &&
                                !availabilityError &&
                                effectiveAvailabilityData && (
                                  <div className="text-xs text-muted-foreground">
                                    {effectiveAvailabilityData[0]?.sessions
                                      ?.length || 0}{" "}
                                    sessions found
                                    {availabilityError ||
                                    !availabilityData ||
                                    !availabilityData[0]?.sessions?.length
                                      ? " (using demo data)"
                                      : ""}
                                  </div>
                                )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                      <div>
                        <Label className="text-base font-medium">
                          Select Time
                        </Label>
                        {availabilityLoading ? (
                          <div className="mt-2 space-y-2">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="h-16 bg-muted/50 rounded-lg animate-pulse"
                              />
                            ))}
                          </div>
                        ) : availableSessions.length > 0 ? (
                          <div className="mt-2 space-y-3">
                            {availableSessions
                              .filter(
                                (session) =>
                                  session.startTimeLocal && session.endTimeLocal
                              )
                              .map((session) => {
                                const startTime = new Date(
                                  session.startTimeLocal!
                                );
                                const endTime = new Date(session.endTimeLocal!);
                                const isSelected =
                                  selectedSession !== null &&
                                  normalizeSessionId(session) ===
                                    normalizeSessionId(
                                      selectedSession as RezdySession
                                    );

                                // Debug logs – remove once issue resolved
                                console.debug("[Booking] Render session card", {
                                  sessionId: session.id,
                                  selectedSessionId: selectedSession?.id,
                                  isSelected,
                                });

                                return (
                                  <Card
                                    key={`${session.id}-${session.startTimeLocal}`}
                                    className={cn(
                                      "cursor-pointer transition-all duration-200 border flex flex-col sm:flex-row items-stretch group",
                                      isSelected
                                        ? "border-2 border-brand-accent bg-brand-accent/15 shadow-lg ring-2 ring-brand-accent/80 scale-[1.01] z-10"
                                        : "border border-gray-200 bg-card hover:border-brand-accent/40 hover:bg-muted/50",
                                      session.seatsAvailable === 0 &&
                                        "opacity-50 cursor-not-allowed",
                                      // Responsive: make highlight more obvious on mobile
                                      isSelected &&
                                        "sm:scale-100 sm:shadow-lg sm:bg-brand-accent/10"
                                    )}
                                    onClick={() =>
                                      session.seatsAvailable > 0 &&
                                      handleSessionSelect(session)
                                    }
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                          <div className="text-center">
                                            <div className="text-lg font-bold">
                                              {format(startTime, "HH:mm")}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              {format(endTime, "HH:mm")}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="font-medium">
                                              {format(startTime, "h:mm a")} -{" "}
                                              {format(endTime, "h:mm a")}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                              <Users className="h-4 w-4" />
                                              <span>
                                                {session.seatsAvailable > 0
                                                  ? `${session.seatsAvailable} seats available`
                                                  : "Sold out"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-lg font-bold">
                                            {formatCurrency(
                                              session.totalPrice ||
                                                product.advertisedPrice ||
                                                0
                                            )}
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            per adult
                                          </div>
                                          {typeof session.id === "string" &&
                                          session.id.startsWith("mock-") ? (
                                            <div className="text-xs text-brand-accent mt-1">
                                              Demo
                                            </div>
                                          ) : null}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="mt-2 p-4 text-center text-muted-foreground bg-muted/30 rounded-lg">
                            No sessions available for this date. Please select
                            another date.
                          </div>
                        )}
                      </div>
                    )}

                    {/* FIT Tour Booking Options or Standard Pickup Location Selection */}
                    {selectedSession && hasFitTourOptions ? (
                      <BookingOptionSelector
                        bookingOptions={fitTourBookingOptions}
                        selectedBookingOption={selectedBookingOption}
                        selectedPickupLocation={selectedPickupLocation}
                        onBookingOptionSelect={handleBookingOptionSelect}
                        participantCount={
                          guestCounts.adults +
                          guestCounts.children +
                          guestCounts.infants
                        }
                        showPricing={true}
                        required={true}
                        className="w-full"
                      />
                    ) : (
                      selectedSession &&
                      selectedSession.pickupLocations &&
                      selectedSession.pickupLocations.length > 0 && (
                        <PickupLocationSelector
                          pickupLocations={selectedSession.pickupLocations}
                          selectedPickupLocation={selectedPickupLocation}
                          onPickupLocationSelect={setSelectedPickupLocation}
                          showDirections={true}
                          required={true}
                        />
                      )
                    )}

                    {/* Date Selection Validation */}
                    {!selectedSession && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Please select a date and time session before adding
                          guest details.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Guest Details Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {BOOKING_STEPS[0].title}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Add guest information for your selected session
                    </p>
                    {guests.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-brand-accent" />
                        <span className="text-brand-accent">
                          {guestCounts.adults +
                            guestCounts.children +
                            guestCounts.infants}{" "}
                          guests added
                        </span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <GuestManager
                      guests={guests}
                      onGuestsChange={setGuests}
                      maxGuests={product.quantityRequiredMax || 10}
                      minGuests={product.quantityRequiredMin || 1}
                      requireAdult={true}
                    />
                  </CardContent>
                </Card>

                {/* Optional Extras */}
                {product.extras && product.extras.length > 0 && (
                  <ExtrasSelector
                    extras={product.extras}
                    selectedExtras={selectedExtras}
                    onExtrasChange={setSelectedExtras}
                    guestCount={
                      guestCounts.adults +
                      guestCounts.children +
                      guestCounts.infants
                    }
                  />
                )}

                {/* Guest Details Validation */}
                {guests.length > 0 &&
                  !guests.every(
                    (g) => g.firstName.trim() && g.lastName.trim()
                  ) && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Please complete all guest names to proceed to the next
                        step.
                      </AlertDescription>
                    </Alert>
                  )}
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {BOOKING_STEPS[1].title}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {BOOKING_STEPS[1].description}
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
                        placeholder="(123) 456-7890"
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
                    <Label htmlFor="contact-country">Country</Label>
                    <Select
                      value={contactInfo.country}
                      onValueChange={(value) =>
                        setContactInfo((prev) => ({ ...prev, country: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergency-contact">
                        Emergency Contact
                      </Label>
                      <Input
                        id="emergency-contact"
                        value={contactInfo.emergencyContact}
                        onChange={(e) =>
                          setContactInfo((prev) => ({
                            ...prev,
                            emergencyContact: e.target.value,
                          }))
                        }
                        placeholder="Emergency contact name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergency-phone">Emergency Phone</Label>
                      <Input
                        id="emergency-phone"
                        type="tel"
                        value={contactInfo.emergencyPhone}
                        onChange={(e) =>
                          setContactInfo((prev) => ({
                            ...prev,
                            emergencyPhone: e.target.value,
                          }))
                        }
                        placeholder="Emergency contact phone"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="dietary-requirements">
                      Dietary Requirements
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
                      placeholder="Please specify any dietary restrictions or allergies"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="accessibility-needs">
                      Accessibility Needs
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
                    <Label htmlFor="special-requests">Special Requests</Label>
                    <Textarea
                      id="special-requests"
                      value={contactInfo.specialRequests}
                      onChange={(e) =>
                        setContactInfo((prev) => ({
                          ...prev,
                          specialRequests: e.target.value,
                        }))
                      }
                      placeholder="Any other special requests or information"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review Booking */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Booking Review */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Review Your Booking
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Please review your booking details before proceeding to
                      payment
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Tour Details */}
                    <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                      <h4 className="font-medium text-lg">{product.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {selectedDate &&
                              format(selectedDate, "EEEE, MMMM do, yyyy")}
                          </span>
                        </div>
                        {selectedSession &&
                          selectedSession.startTimeLocal &&
                          selectedSession.endTimeLocal && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(
                                  new Date(selectedSession.startTimeLocal),
                                  "h:mm a"
                                )}{" "}
                                -
                                {format(
                                  new Date(selectedSession.endTimeLocal),
                                  "h:mm a"
                                )}
                              </span>
                            </div>
                          )}
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {guestCounts.adults +
                              guestCounts.children +
                              guestCounts.infants}{" "}
                            guests ({guestCounts.adults} adults,{" "}
                            {guestCounts.children} children,{" "}
                            {guestCounts.infants} infants)
                          </span>
                        </div>
                        {selectedBookingOption && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedBookingOption.name}</span>
                          </div>
                        )}
                        {selectedPickupLocation && (
                          <div className="flex items-start gap-2 ml-6">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {selectedPickupLocation.name}
                              {selectedPickupLocation.pickupTime &&
                                ` at ${selectedPickupLocation.pickupTime}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Guest Details */}
                    <div>
                      <h4 className="font-medium mb-2">Guest Details</h4>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {guests.map((guest, index) => (
                            <div
                              key={guest.id}
                              className="flex justify-between"
                            >
                              <span>
                                {guest.firstName} {guest.lastName}
                              </span>
                              <span className="text-muted-foreground">
                                {guest.age}yo {guest.type.toLowerCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h4 className="font-medium mb-2">Contact Information</h4>
                      <div className="bg-muted/30 p-4 rounded-lg text-sm space-y-1">
                        <div>
                          {contactInfo.firstName} {contactInfo.lastName}
                        </div>
                        <div>{contactInfo.email}</div>
                        <div>{contactInfo.phone}</div>
                        {contactInfo.emergencyContact && (
                          <div className="text-muted-foreground">
                            Emergency: {contactInfo.emergencyContact} (
                            {contactInfo.emergencyPhone})
                          </div>
                        )}
                        {contactInfo.dietaryRequirements && (
                          <div className="text-muted-foreground">
                            Dietary: {contactInfo.dietaryRequirements}
                          </div>
                        )}
                        {contactInfo.specialRequests && (
                          <div className="text-muted-foreground">
                            Special requests: {contactInfo.specialRequests}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selected Extras */}
                    {selectedExtras.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Selected Extras</h4>
                        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                          {selectedExtras.map((extra, index) => (
                            <div
                              key={`${extra.extra.id}-${index}`}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {extra.extra.name} x{extra.quantity}
                              </span>
                              <span>
                                {formatCurrency(
                                  extra.extra.price * extra.quantity
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Terms and Payment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Terms & Payment
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Agree to terms and proceed to secure payment
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={agreeToTerms}
                          onCheckedChange={(checked) =>
                            setAgreeToTerms(checked as boolean)
                          }
                          required
                        />
                        <Label
                          htmlFor="terms"
                          className="text-sm leading-tight"
                        >
                          I agree to the{" "}
                          <a
                            href="/terms-and-conditions"
                            className="text-primary underline"
                            target="_blank"
                          >
                            terms and conditions
                          </a>{" "}
                          and{" "}
                          <a
                            href="/privacy-policy"
                            className="text-primary underline"
                            target="_blank"
                          >
                            privacy policy
                          </a>
                        </Label>
                      </div>
                    </div>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        You will proceed to our secure payment page powered by
                        Stripe. Your booking will be confirmed automatically
                        after successful payment.
                      </AlertDescription>
                    </Alert>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>What happens next?</AlertTitle>
                      <AlertDescription className="space-y-1 mt-2">
                        <div>
                          1. You'll proceed to our secure payment page powered
                          by Stripe
                        </div>
                        <div>
                          2. Complete your payment using credit card, Apple Pay,
                          or Google Pay
                        </div>
                        <div>
                          3. Your booking will be confirmed automatically
                        </div>
                        <div>
                          4. Confirmation email will be sent to{" "}
                          {contactInfo.email}
                        </div>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Secure Payment */}
            {currentStep === 4 && clientSecret && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Secure Payment
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Complete your booking payment securely with Stripe
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "stripe",
                          variables: {
                            colorPrimary: "#FF585D",
                            colorBackground: "#ffffff",
                            colorText: "#424770",
                            colorDanger: "#df1b41",
                            fontFamily: "Inter, system-ui, sans-serif",
                            spacingUnit: "4px",
                            borderRadius: "8px",
                          },
                        },
                      }}
                    >
                      <StripePaymentForm
                        clientSecret={clientSecret}
                        orderNumber={orderNumber}
                        amount={pricingBreakdown.total}
                        currency="AUD"
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                        loading={isProcessingPayment}
                      />
                    </Elements>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Product Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {getLocationString(product.locationAddress)}
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{format(selectedDate, "MMM dd, yyyy")}</span>
                    </div>
                  )}

                  {selectedSession &&
                    selectedSession.startTimeLocal &&
                    selectedSession.endTimeLocal && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(
                            new Date(selectedSession.startTimeLocal),
                            "h:mm a"
                          )}{" "}
                          -
                          {format(
                            new Date(selectedSession.endTimeLocal),
                            "h:mm a"
                          )}
                        </span>
                      </div>
                    )}

                  {guests.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      <span>
                        {guestCounts.adults +
                          guestCounts.children +
                          guestCounts.infants}{" "}
                        guests
                      </span>
                    </div>
                  )}

                  {selectedPickupLocation && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <div>
                        <div className="font-medium">
                          {selectedPickupLocation.name}
                        </div>
                        {selectedPickupLocation.pickupTime && (
                          <div className="text-muted-foreground">
                            Pickup: {selectedPickupLocation.pickupTime}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pricing Summary */}
              {selectedSession && (
                <PricingDisplay
                  breakdown={pricingBreakdown}
                  showDetails={true}
                />
              )}

              {/* Trust Indicators */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-brand-accent" />
                    <span>Secure SSL Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-brand-accent" />
                    <span>Free Cancellation 24h</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-brand-accent" />
                    <span>4.9/5 Customer Rating</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep < 3 ? (
            <Button
              onClick={handleNextStep}
              disabled={!canProceedToNextStep()}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : currentStep === 3 ? (
            <Button
              onClick={handleProceedToPayment}
              disabled={!canProceedToNextStep() || isProcessingPayment}
              className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/90 text-white"
              size="lg"
            >
              {isProcessingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Payment...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Proceed to Payment • {formatCurrency(pricingBreakdown.total)}
                </>
              )}
            </Button>
          ) : (
            // Step 4 (Payment) - no next button needed, payment form handles submission
            <div className="text-sm text-muted-foreground">
              Complete the payment form above to finish your booking
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
