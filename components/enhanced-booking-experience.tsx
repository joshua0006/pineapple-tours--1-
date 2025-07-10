"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  ShoppingCart,
} from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  preSelectedDate?: string; // ISO date string (YYYY-MM-DD)
  preSelectedSessionId?: string; // Session ID to auto-select when availability loads
  preSelectedLocation?: string; // Pickup location from search form
}

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
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
];


// Helper function to map search form locations to booking regions
const mapLocationToRegion = (location: string): string | undefined => {
  const locationLower = location.toLowerCase();

  if (locationLower.includes("brisbane")) {
    return "brisbane";
  } else if (locationLower.includes("gold coast")) {
    return "gold-coast";
  } else if (locationLower.includes("tamborine")) {
    return "tamborine-direct";
  }

  return undefined;
};

export function EnhancedBookingExperience({
  product,
  onClose,
  preSelectedSession,
  preSelectedParticipants,
  preSelectedExtras,
  preSelectedDate,
  preSelectedSessionId,
  preSelectedLocation,
}: EnhancedBookingExperienceProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingErrors, setBookingErrors] = useState<string[]>([]);

  // Map the preSelectedLocation to a region for FIT tours
  const preSelectedRegion = preSelectedLocation
    ? mapLocationToRegion(preSelectedLocation)
    : undefined;

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
  const [wasSessionAutoSelected, setWasSessionAutoSelected] = useState(false);
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
    if (len < 7) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
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
    // Clear session-specific selections so nothing remains highlighted
    setSelectedDate(undefined);
    setSelectedSession(null);
    setSelectedPickupLocation(null);
    setSelectedBookingOption(null);

    // Clear extras
    setSelectedExtras([]);

    // Set initial guest count based on product requirements
    const minGuests = product.quantityRequiredMin || 1;
    const initialGuests: GuestInfo[] = [];

    for (let i = 0; i < minGuests; i++) {
      initialGuests.push({
        id: (i + 1).toString(),
        firstName: "",
        lastName: "",
        age: 25,
        type: "ADULT",
      });
    }

    setGuests(initialGuests);

    // Clear any errors displayed from the previous booking flow
    setBookingErrors([]);
  }, [product.productCode, product.quantityRequiredMin]);

  // Initialize form data from cart item if provided
  useEffect(() => {
    // Handle pre-selected date from URL parameter
    if (preSelectedDate) {
      const dateFromUrl = new Date(preSelectedDate);
      if (!isNaN(dateFromUrl.getTime())) {
        setSelectedDate(dateFromUrl);
      }
    }

    if (preSelectedSession) {
      // Set the selected date from the session (this takes precedence over URL date)
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
      // Create guest list based on participant counts, respecting product requirements
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

      // Ensure we meet minimum guest requirements
      const minGuests = product.quantityRequiredMin || 1;
      while (newGuests.length < minGuests) {
        newGuests.push({
          id: guestId.toString(),
          firstName: "",
          lastName: "",
          age: 25,
          type: "ADULT",
        });
        guestId++;
      }

      if (newGuests.length > 0) {
        setGuests(newGuests);
      }
    }
  }, [preSelectedSession, preSelectedParticipants, preSelectedDate]);

  // Auto-populate contact info from first guest
  useEffect(() => {
    if (guests.length > 0) {
      setContactInfo((prev) => ({
        ...prev,
        firstName: guests[0].firstName || "",
        lastName: guests[0].lastName || "",
      }));
    }
  }, [guests]);

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


  // Use only real availability data from Rezdy API
  const effectiveAvailabilityData = useMemo(() => {
    // If we have real data with sessions, use it
    if (
      availabilityData &&
      availabilityData[0]?.sessions &&
      availabilityData[0].sessions.length > 0
    ) {
      return availabilityData;
    }

    // If API is still loading, return null
    if (availabilityLoading) {
      return null;
    }

    // If API failed or returned no sessions, return null (no mock data)
    return null;
  }, [
    availabilityData,
    availabilityLoading,
    availabilityError,
  ]);

  // Helper: flatten all sessions across availability entries
  const allSessions: RezdySession[] = useMemo(() => {
    if (!effectiveAvailabilityData) return [] as RezdySession[];

    return effectiveAvailabilityData.flatMap(
      (entry) => entry.sessions || []
    ) as RezdySession[];
  }, [effectiveAvailabilityData]);


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


      if (hasSeats && session.startTimeLocal) {
        const sessionDate = getConsistentDateString(session.startTimeLocal);
        dates.add(sessionDate);
      }
    });


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
    const hasValidGuests = guests.every(
      (g) => g.firstName.trim() && g.lastName.trim()
    );
    const hasValidSession = selectedSession && validationErrors.length === 0;

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
      !needsBookingOption || (selectedBookingOption && selectedPickupLocation);

    // Check if contact info is valid
    const hasValidContactInfo = 
      contactInfo.email.trim() && 
      emailRegex.test(contactInfo.email) &&
      contactInfo.phone.trim() &&
      contactInfo.phone.replace(/\D/g, "").length >= 6;

    // Check if terms are agreed to
    const hasAgreedToTerms = agreeToTerms;

    return (
      hasValidGuests &&
      hasValidSession &&
      hasValidPickupLocation &&
      hasValidBookingOption &&
      hasValidContactInfo &&
      hasAgreedToTerms
    );
  };

  // Event handlers
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSession(null);
    setSelectedPickupLocation(null);
    setWasSessionAutoSelected(false); // Reset auto-selection flag when date changes
  };

  const handleSessionSelect = useCallback(
    (session: RezdySession, isAutoSelection = false) => {
      // ensure id exists before storing
      normalizeSessionId(session);

      setSelectedSession({ ...session });
      // Reset booking option selection when session changes
      setSelectedBookingOption(null);
      setSelectedPickupLocation(null);

      // Clear auto-selection flag if this is a manual selection
      if (!isAutoSelection) {
        setWasSessionAutoSelected(false);
      }

      // Auto-select first pickup location if available (for non-FIT tours)
      if (
        !hasFitTourOptions &&
        session.pickupLocations &&
        session.pickupLocations.length > 0
      ) {
        setSelectedPickupLocation(session.pickupLocations[0]);
      }
    },
    [hasFitTourOptions]
  );

  // Auto-select session when availability data loads and we have a sessionId from URL
  useEffect(() => {
    if (
      preSelectedSessionId &&
      allSessions.length > 0 &&
      selectedDate &&
      !selectedSession
    ) {
      // Find the session that matches the preSelectedSessionId
      const matchingSession = allSessions.find(
        (session) =>
          session.id === preSelectedSessionId ||
          String(session.id) === preSelectedSessionId
      );

      if (matchingSession) {
        // Inline the session selection logic to avoid dependency on handleSessionSelect
        normalizeSessionId(matchingSession);
        setSelectedSession({ ...matchingSession });
        setSelectedBookingOption(null);
        setSelectedPickupLocation(null);

        // Auto-select first pickup location if available (for non-FIT tours)
        if (
          !hasFitTourOptions &&
          matchingSession.pickupLocations &&
          matchingSession.pickupLocations.length > 0
        ) {
          setSelectedPickupLocation(matchingSession.pickupLocations[0]);
        }
      }
    }
  }, [
    preSelectedSessionId,
    allSessions,
    selectedDate,
    selectedSession,
    hasFitTourOptions,
  ]);

  // Auto-select session when there's only one available session for the selected date
  useEffect(() => {
    if (selectedDate && availableSessions.length === 1 && !selectedSession) {
      // Inline the session selection logic to avoid dependency on handleSessionSelect
      const session = availableSessions[0];
      normalizeSessionId(session);
      setSelectedSession({ ...session });
      setSelectedBookingOption(null);
      setSelectedPickupLocation(null);
      setWasSessionAutoSelected(true);

      // Auto-select first pickup location if available (for non-FIT tours)
      if (
        !hasFitTourOptions &&
        session.pickupLocations &&
        session.pickupLocations.length > 0
      ) {
        setSelectedPickupLocation(session.pickupLocations[0]);
      }
    }
  }, [selectedDate, availableSessions, selectedSession, hasFitTourOptions]);

  // Auto-select pickup location for regular tours based on preSelectedLocation
  useEffect(() => {
    if (
      selectedSession &&
      !hasFitTourOptions &&
      preSelectedLocation &&
      selectedSession.pickupLocations &&
      selectedSession.pickupLocations.length > 0 &&
      !selectedPickupLocation
    ) {
      // Find a pickup location that matches the search form location
      const matchingLocation = selectedSession.pickupLocations.find(
        (location) => {
          const locationName = location.name.toLowerCase();
          const searchLocation = preSelectedLocation.toLowerCase();

          return (
            locationName.includes(searchLocation) ||
            searchLocation.includes(locationName.split(" ")[0])
          );
        }
      );

      if (matchingLocation) {
        setSelectedPickupLocation(matchingLocation);
      }
    }
  }, [
    selectedSession,
    hasFitTourOptions,
    preSelectedLocation,
    selectedPickupLocation,
  ]);

  const handleBookingOptionSelect = (
    option: RezdyBookingOption,
    location: RezdyPickupLocation
  ) => {
    setSelectedBookingOption(option);
    setSelectedPickupLocation(location);
  };

  // Stripe payment handlers
  const _handlePaymentSuccess = async (stripePaymentIntentId: string) => {
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
        setBookingErrors([
          confirmResult.error ||
            "Booking confirmation failed. Please contact support.",
        ]);
      }
    } catch (error) {
      setBookingErrors(["Failed to confirm payment. Please contact support."]);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const _handlePaymentError = (error: string) => {
    setBookingErrors([error]);
    setIsProcessingPayment(false);
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
        contact: {
          ...contactInfo,
          country: "Australia"
        },
        pricing: {
          basePrice: pricingBreakdown.basePrice,
          sessionPrice: pricingBreakdown.adultPrice, // Use adult price as session price
          subtotal: pricingBreakdown.subtotal,
          taxAndFees: pricingBreakdown.taxes + pricingBreakdown.serviceFees,
          total: pricingBreakdown.total,
        },
        extras: selectedExtras.map((selectedExtra) => {
          // Get the calculated price from the pricing breakdown which already handles PER_PERSON, PER_BOOKING, etc.
          const extrasFromBreakdown = pricingBreakdown.selectedExtras || [];

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
      return available;
    } catch (err) {
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


      return disabled;
    } catch (err) {
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


      return soldOut;
    } catch (err) {
      return false;
    }
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

        {/* No Availability Alert */}
        {!availabilityLoading &&
          (availabilityError ||
            !availabilityData ||
            !availabilityData[0]?.sessions?.length) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No availability found for this tour. Please try different dates or contact support.
              </AlertDescription>
            </Alert>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
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
                  <Label className="text-base font-medium">Select Date</Label>
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
                    <Label className="text-base font-medium">Select Time</Label>

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
                            const startTime = new Date(session.startTimeLocal!);
                            const endTime = new Date(session.endTimeLocal!);
                            const isSelected =
                              selectedSession !== null &&
                              normalizeSessionId(session) ===
                                normalizeSessionId(
                                  selectedSession as RezdySession
                                );


                            return (
                              <Card
                                key={`${session.id}-${session.startTimeLocal}`}
                                className={cn(
                                  "cursor-pointer transition-all duration-200 border group",
                                  isSelected
                                    ? "border-2 border-brand-accent bg-brand-accent/15 shadow-lg ring-2 ring-brand-accent/80"
                                    : "border border-gray-200 bg-card hover:border-brand-accent/40 hover:shadow-md",
                                  session.seatsAvailable === 0 &&
                                    "opacity-50 cursor-not-allowed"
                                )}
                                onClick={() =>
                                  session.seatsAvailable > 0 &&
                                  handleSessionSelect(session)
                                }
                              >
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                      <div className="flex flex-col items-center justify-center w-16 h-16 bg-brand-accent/10 rounded-lg">
                                        <div className="text-xl font-bold text-brand-accent">
                                          {format(startTime, "HH:mm")}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {format(startTime, "a")}
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <div className="font-semibold text-lg">
                                          {format(startTime, "h:mm a")} -{" "}
                                          {format(endTime, "h:mm a")}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Clock className="h-4 w-4" />
                                          <span>
                                            Duration:{" "}
                                            {Math.round(
                                              (endTime.getTime() -
                                                startTime.getTime()) /
                                                (1000 * 60 * 60)
                                            )}{" "}
                                            hours
                                          </span>
                                        </div>
                                      </div>
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
                    preSelectedRegion={preSelectedRegion}
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
                {!selectedSession && selectedDate && !availabilityLoading && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Please select a date and time session before adding guest
                      details.
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* No Availability Warning */}
                {!availabilityLoading && 
                 effectiveAvailabilityData === null && 
                 selectedDate && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No availability found for the selected date range. This tour may not be available for booking at this time.
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
                  autoManageGuests={false}
                />
              </CardContent>
            </Card>


            {/* Guest Details Validation */}
            {guests.length > 0 &&
              !guests.every((g) => g.firstName.trim() && g.lastName.trim()) && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Please complete all guest names to proceed to the next step.
                  </AlertDescription>
                </Alert>
              )}

            {/* Contact Information */}
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
                    <Label htmlFor="terms" className="text-sm leading-tight">
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
                      </a>{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                  </div>
                  {!agreeToTerms && (
                    <p className="text-xs text-destructive ml-6">
                      You must agree to the terms and conditions to proceed.
                    </p>
                  )}
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    You will proceed to our secure payment page powered by
                    Stripe. Your booking will be confirmed automatically after
                    successful payment.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Booking Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Booking Summary
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Review your booking details and total price
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tour Details */}
                  <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                    <h4 className="font-medium text-lg">{product.name}</h4>
                    <div className="space-y-2 text-sm">
                      {selectedDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(selectedDate, "MMM dd, yyyy")}</span>
                        </div>
                      )}
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
                      {guests.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {guestCounts.adults +
                              guestCounts.children +
                              guestCounts.infants}{" "}
                            guests
                          </span>
                        </div>
                      )}
                      {selectedPickupLocation && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
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
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Summary */}
              {selectedSession && (
                <PricingDisplay
                  breakdown={pricingBreakdown}
                  product={product}
                  showDetails={true}
                />
              )}

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

            
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <div className="flex justify-center pt-6 border-t">
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
                Complete Booking • {formatCurrency(pricingBreakdown.total)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
