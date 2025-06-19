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
    title: "Review & Pay",
    description: "Review your booking and proceed to secure payment",
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
  // Payment info is handled by Westpac hosted page - no longer stored in component state
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);

  // Payment processing state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
  const mockAvailabilityData = useMemo(() => {
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

    return [{ productCode: product.productCode, sessions }];
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
      console.log("Using mock availability data due to API issue:", {
        availabilityError,
        availabilityData,
      });
      return mockAvailabilityData;
    }

    return availabilityData;
  }, [
    availabilityData,
    availabilityLoading,
    availabilityError,
    mockAvailabilityData,
  ]);

  // Debug logging for availability data
  useEffect(() => {
    console.log("Enhanced Booking Experience - Availability Debug:", {
      productCode: product.productCode,
      startDateRange,
      endDateRange,
      guestCounts,
      availabilityLoading,
      availabilityError,
      availabilityData,
      effectiveAvailabilityData,
      sessionsCount: effectiveAvailabilityData?.[0]?.sessions?.length || 0,
      firstSessionExample: effectiveAvailabilityData?.[0]?.sessions?.[0],
    });
  }, [
    product.productCode,
    startDateRange,
    endDateRange,
    guestCounts,
    availabilityLoading,
    availabilityError,
    availabilityData,
    effectiveAvailabilityData,
  ]);

  // Extract available dates with seat availability
  const availableDates = useMemo(() => {
    if (!effectiveAvailabilityData || !effectiveAvailabilityData[0]?.sessions)
      return new Set<string>();

    const dates = new Set<string>();
    effectiveAvailabilityData[0].sessions.forEach((session) => {
      if (session.seatsAvailable > 0 && session.startTimeLocal) {
        const sessionDate = session.startTimeLocal.split("T")[0];
        dates.add(sessionDate);
      }
    });
    return dates;
  }, [effectiveAvailabilityData]);

  // Get seat availability for a specific date
  const getDateSeatAvailability = useMemo(() => {
    if (!effectiveAvailabilityData || !effectiveAvailabilityData[0]?.sessions)
      return new Map<string, number>();

    const seatMap = new Map<string, number>();
    effectiveAvailabilityData[0].sessions.forEach((session) => {
      if (session.startTimeLocal) {
        const sessionDate = session.startTimeLocal.split("T")[0];
        const currentSeats = seatMap.get(sessionDate) || 0;
        seatMap.set(
          sessionDate,
          Math.max(currentSeats, session.seatsAvailable)
        );
      }
    });
    return seatMap;
  }, [effectiveAvailabilityData]);

  // Get all dates that have sessions (regardless of availability)
  const datesWithSessions = useMemo(() => {
    if (!effectiveAvailabilityData || !effectiveAvailabilityData[0]?.sessions)
      return new Set<string>();

    const dates = new Set<string>();
    effectiveAvailabilityData[0].sessions.forEach((session) => {
      if (session.startTimeLocal) {
        const sessionDate = session.startTimeLocal.split("T")[0];
        dates.add(sessionDate);
      }
    });
    return dates;
  }, [effectiveAvailabilityData]);

  // Get sessions for selected date
  const availableSessions = useMemo(() => {
    if (
      !effectiveAvailabilityData ||
      !effectiveAvailabilityData[0]?.sessions ||
      !selectedDate
    )
      return [];

    const selectedDateString = format(selectedDate, "yyyy-MM-dd");
    return effectiveAvailabilityData[0].sessions
      .filter(
        (session) =>
          session.startTimeLocal &&
          session.startTimeLocal.startsWith(selectedDateString)
      )
      .sort((a, b) => {
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
        return agreeToTerms; // Only need terms agreement for final step
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
    setSelectedSession(session);
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

  const handleNextStep = () => {
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
      const orderNumber = `ORD-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      // Initiate payment with Westpac and redirect to hosted payment page
      console.log("Initiating payment with Westpac...");
      const paymentResponse = await fetch("/api/payments/westpac/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingData: formData,
          orderNumber,
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResult.success) {
        setBookingErrors([paymentResult.error || "Failed to initiate payment"]);
        setIsProcessingPayment(false);
        return;
      }

      // Redirect to Westpac hosted payment page
      console.log("Redirecting to Westpac payment page...");
      window.location.href = paymentResult.redirectUrl;

      // Note: The rest of the booking process (payment confirmation and Rezdy registration)
      // will be handled by the payment callback endpoint after successful payment
    } catch (error) {
      console.error("Booking submission error:", error);
      setBookingErrors(["Failed to process booking. Please try again."]);
      setIsProcessingPayment(false);
    }
  };

  const isDateAvailable = (date: Date): boolean => {
    try {
      const dateString = format(date, "yyyy-MM-dd");
      return availableDates.has(dateString);
    } catch {
      return false;
    }
  };

  const isDateDisabled = (date: Date): boolean => {
    try {
      const dateString = format(date, "yyyy-MM-dd");
      const hasAvailabilityData = Boolean(
        effectiveAvailabilityData &&
          effectiveAvailabilityData[0]?.sessions &&
          effectiveAvailabilityData[0].sessions.length > 0
      );

      // Disable if date is in the past or beyond our range
      if (date < today || date > endDate) {
        return true;
      }

      // If we don't have availability data yet, don't disable dates (let them load)
      if (!hasAvailabilityData) {
        return false;
      }

      // If we have availability data, only disable dates that have sessions but no seats
      const hasSessionsOnDate = datesWithSessions.has(dateString);
      const hasSeatsOnDate = (getDateSeatAvailability.get(dateString) || 0) > 0;

      // Disable if there are sessions on this date but no seats available
      return hasSessionsOnDate && !hasSeatsOnDate;
    } catch {
      return true;
    }
  };

  const isDateSoldOut = (date: Date): boolean => {
    try {
      const dateString = format(date, "yyyy-MM-dd");
      const hasAvailabilityData = Boolean(
        effectiveAvailabilityData &&
          effectiveAvailabilityData[0]?.sessions &&
          effectiveAvailabilityData[0].sessions.length > 0
      );

      // Only mark as sold out if we have availability data, there are sessions on this date, but no seats available
      if (!hasAvailabilityData) {
        return false;
      }

      const hasSessionsOnDate = datesWithSessions.has(dateString);
      const hasSeatsOnDate = (getDateSeatAvailability.get(dateString) || 0) > 0;

      return hasSessionsOnDate && !hasSeatsOnDate;
    } catch {
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
                    {selectedSession && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-brand-accent" />
                        <span className="text-brand-accent">
                          Session selected for{" "}
                          {selectedDate && format(selectedDate, "MMM dd, yyyy")}
                        </span>
                      </div>
                    )}
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
                                  selectedSession?.id === session.id;

                                return (
                                  <Card
                                    key={session.id}
                                    className={cn(
                                      "cursor-pointer transition-all duration-200 border",
                                      isSelected
                                        ? "ring-2 ring-brand-accent bg-brand-accent/5 border-brand-accent"
                                        : "border-gray-200",
                                      session.seatsAvailable === 0 &&
                                        "opacity-50 cursor-not-allowed"
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
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone">Phone Number *</Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) =>
                          setContactInfo((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="Enter phone number"
                        required
                      />
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

            {/* Step 3: Review & Pay */}
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
                          <div className="flex items-center gap-2 ml-6">
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
                              key={extra.extra.id}
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

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="newsletter"
                          checked={subscribeNewsletter}
                          onCheckedChange={(checked) =>
                            setSubscribeNewsletter(checked as boolean)
                          }
                        />
                        <Label
                          htmlFor="newsletter"
                          className="text-sm leading-tight"
                        >
                          Subscribe to our newsletter for exclusive offers and
                          travel tips
                        </Label>
                      </div>
                    </div>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        You will be redirected to Westpac's secure payment
                        gateway to complete your payment. Your booking will be
                        confirmed automatically after successful payment.
                      </AlertDescription>
                    </Alert>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>What happens next?</AlertTitle>
                      <AlertDescription className="space-y-1 mt-2">
                        <div>
                          1. You'll be redirected to Westpac's secure payment
                          page
                        </div>
                        <div>
                          2. Complete your payment using credit card, PayPal, or
                          bank transfer
                        </div>
                        <div>
                          3. You'll be redirected back with booking confirmation
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
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">
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
          ) : (
            <Button
              onClick={handleProceedToPayment}
              disabled={!canProceedToNextStep() || isProcessingPayment}
              className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/90 text-white"
              size="lg"
            >
              {isProcessingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Redirecting to Payment...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Proceed to Payment • {formatCurrency(pricingBreakdown.total)}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
