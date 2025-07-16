"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Users,
  MapPin,
  Clock,
  Shield,
  AlertCircle,
  Info,
  Phone,
  Mail,
  Heart,
  Share2,
  Calendar,
  ArrowLeft,
  Home,
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react";
import { format, addDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PricingDisplay } from "@/components/ui/pricing-display";
import { ExtrasSelector } from "@/components/ui/extras-selector";
import { PickupLocationSelector } from "@/components/ui/pickup-location-selector";
import { useRezdyAvailability } from "@/hooks/use-rezdy";
import { fetchAndCacheProduct } from "@/lib/utils/rezdy-product-cache";
import {
  RezdyProduct,
  RezdySession,
  RezdyPickupLocation,
  convertLegacyToApiFormat,
} from "@/lib/types/rezdy";
import {
  getLocationString,
  hasPickupServices,
} from "@/lib/utils/product-utils";
import {
  calculatePricing,
  formatCurrency,
  validatePricingOptions,
  type PricingBreakdown,
  type SelectedExtra,
} from "@/lib/utils/pricing-utils";
import {
  type BookingFormData,
} from "@/lib/utils/booking-transform";
import { cn } from "@/lib/utils";
import { 
  validateBookingPickupData, 
  getPickupValidationMessage, 
  getPickupWarningMessage 
} from "@/lib/utils/pickup-validation";
import { usePickupAnalytics } from "@/lib/utils/pickup-analytics";

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
  preloadedPickupLocations?: RezdyPickupLocation[]; // Pre-fetched pickup locations for faster loading
}


export function EnhancedBookingExperience({
  product,
  preSelectedSession,
  preSelectedParticipants,
  preSelectedExtras,
  preSelectedDate,
  preSelectedSessionId,
  preSelectedLocation,
  preloadedPickupLocations,
}: EnhancedBookingExperienceProps) {
  const [bookingErrors, setBookingErrors] = useState<string[]>([]);
  
  // Initialize analytics
  const { trackApiRequest, trackPickupSelection, trackValidationError } = usePickupAnalytics();
  
  // Cache product data on mount
  useEffect(() => {
    if (product && product.productCode) {
      fetchAndCacheProduct(product.productCode).then(cachedProduct => {
        if (cachedProduct) {
          console.log('✅ Product cached for booking:', product.productCode);
        }
      });
    }
  }, [product?.productCode]);

  // Fetch pickup locations from Rezdy API (only if not preloaded)
  useEffect(() => {
    // Skip if we already have preloaded pickup locations
    if (preloadedPickupLocations && preloadedPickupLocations.length > 0) {
      console.log('✅ Using preloaded pickup locations:', preloadedPickupLocations.length);
      // Track cache hit for analytics
      trackApiRequest(product.productCode, 0, true, true);
      // Ensure loading state is false when using preloaded data
      setPickupLocationsLoading(false);
      return;
    }

    const fetchPickupLocations = async () => {
      if (!product?.productCode) {
        console.warn('⚠️ No product code available for pickup location fetch');
        return;
      }
      
      console.log(`🔍 Fetching pickup locations for product: ${product.productCode}`);
      
      setPickupLocationsLoading(true);
      setPickupLocationsError(null);
      
      const startTime = Date.now();
      
      try {
        const apiUrl = `/api/rezdy/products/${product.productCode}/pickups`;
        console.log(`📡 Making API request to: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        const responseTime = Date.now() - startTime;
        
        if (!response.ok) {
          trackApiRequest(product.productCode, responseTime, false, false);
          const errorText = await response.text();
          console.error(`❌ API request failed: ${response.status} - ${errorText}`);
          throw new Error(`Failed to fetch pickup locations: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const pickupLocations = data.pickups || [];
        
        console.log(`✅ Pickup locations response:`, {
          productCode: data.productCode,
          totalCount: data.totalCount,
          pickupsReceived: pickupLocations.length,
          cached: data.cached,
          source: data.source,
          hasPickups: data.hasPickups
        });
        
        setApiPickupLocations(pickupLocations);
        
        // Track successful API request
        trackApiRequest(product.productCode, responseTime, data.cached || false, true);
        
        console.log('✅ Pickup locations loaded from API:', pickupLocations.length);
        
                 // Log first few pickup locations for debugging
         if (pickupLocations.length > 0) {
           console.log('📍 Sample pickup locations:', pickupLocations.slice(0, 3).map((p: RezdyPickupLocation) => ({
             name: p.locationName,
             address: p.address,
             minutesPrior: p.minutesPrior
           })));
         } else {
           console.log('ℹ️ No pickup locations available for this product');
         }
        
      } catch (error) {
        console.error('❌ Error fetching pickup locations:', error);
        setPickupLocationsError(error instanceof Error ? error.message : 'Failed to fetch pickup locations');
        setApiPickupLocations([]);
        
        // Track failed API request
        const responseTime = Date.now() - startTime;
        trackApiRequest(product.productCode, responseTime, false, false);
      } finally {
        setPickupLocationsLoading(false);
      }
    };

    fetchPickupLocations();
  }, [product?.productCode, trackApiRequest]);


  // Check if product has pickup services
  const productHasPickupServices = hasPickupServices(product);



  // Booking state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSession, setSelectedSession] = useState<RezdySession | null>(
    preSelectedSession || null
  );
  const [selectedPickupLocation, setSelectedPickupLocation] =
    useState<RezdyPickupLocation | null>(null);
  const [, setWasSessionAutoSelected] = useState(false);
  
  // API pickup locations state - initialize with preloaded data if available
  const [apiPickupLocations, setApiPickupLocations] = useState<RezdyPickupLocation[]>(
    preloadedPickupLocations || []
  );
  const [pickupLocationsLoading, setPickupLocationsLoading] = useState(
    // Only show loading if we don't have preloaded data
    !(preloadedPickupLocations && preloadedPickupLocations.length > 0)
  );
  const [pickupLocationsError, setPickupLocationsError] = useState<string | null>(null);
  
  // Pickup validation state
  const [pickupValidationError, setPickupValidationError] = useState<string | null>(null);
  const [pickupValidationWarning, setPickupValidationWarning] = useState<string | null>(null);
  
  // Simplified guest count - default to minimum required
  const [guestCounts, setGuestCounts] = useState({
    adults: preSelectedParticipants?.adults || Math.max(1, product.quantityRequiredMin || 1),
    children: preSelectedParticipants?.children || 0,
    infants: preSelectedParticipants?.infants || 0,
  });
  
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>(
    preSelectedExtras || []
  );
  
  // Terms agreement
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Payment processing state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Contact information state
  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Contact field validation errors
  const [contactFieldErrors, setContactFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }>({});

  // Validation helpers
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    const len = cleaned.length;
    if (len < 4) return cleaned;
    if (len < 7) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  };

  // Unused function - can be removed if not needed for future validation
  // const validateContactFields = () => {
  //   const errors: { firstName?: string; lastName?: string; email?: string; phone?: string } = {};
  //   
  //   if (!contactInfo.firstName.trim()) {
  //     errors.firstName = "First name is required";
  //   }
  //   
  //   if (!contactInfo.lastName.trim()) {
  //     errors.lastName = "Last name is required";
  //   }
  //   
  //   if (!contactInfo.email) {
  //     errors.email = "Email is required";
  //   } else if (!emailRegex.test(contactInfo.email)) {
  //     errors.email = "Please enter a valid email address";
  //   }

  //   const phoneDigits = contactInfo.phone.replace(/\D/g, "");
  //   if (!contactInfo.phone) {
  //     errors.phone = "Phone number is required";
  //   } else if (phoneDigits.length < 6) {
  //     errors.phone = "Please enter a valid phone number";
  //   }

  //   setContactFieldErrors(errors);
  //   return Object.keys(errors).length === 0;
  // };

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

    // Clear extras
    setSelectedExtras([]);

    // Clear any errors displayed from the previous booking flow
    setBookingErrors([]);
  }, [product.productCode]);

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
        setSelectedPickupLocation(convertLegacyToApiFormat(preSelectedSession.pickupLocations[0]));
      }
    }

    if (preSelectedParticipants) {
      setGuestCounts({
        adults: preSelectedParticipants.adults,
        children: preSelectedParticipants.children || 0,
        infants: preSelectedParticipants.infants || 0,
      });
    }
  }, [preSelectedSession, preSelectedParticipants, preSelectedDate]);

  // Date range for availability
  const today = new Date();
  const endDate = addDays(today, 90); // 3 months ahead
  const startDateRange = today.toISOString().split("T")[0];
  const endDateRange = endDate.toISOString().split("T")[0];

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

  // Determine which pickup locations to use (API first, then session fallback)
  const effectivePickupLocations = useMemo(() => {
    // Use API pickup locations if available
    if (apiPickupLocations.length > 0) {
      return apiPickupLocations;
    }
    
    // Fallback to session pickup locations (convert legacy format to API format)
    const sessionPickupLocations = selectedSession?.pickupLocations || [];
    return sessionPickupLocations.map(convertLegacyToApiFormat);
  }, [apiPickupLocations, selectedSession?.pickupLocations]);

  // Calculate pricing (simplified without booking options)
  const pricingBreakdown = useMemo((): PricingBreakdown => {
    return calculatePricing(product, selectedSession, {
      adults: guestCounts.adults,
      children: guestCounts.children,
      infants: guestCounts.infants,
      extras: selectedExtras,
    });
  }, [
    product,
    selectedSession,
    guestCounts,
    selectedExtras,
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
  const canProceedToPayment = () => {
    const hasValidSession = selectedSession && validationErrors.length === 0;

    // Check if pickup location is required and selected
    const needsPickupLocation =
      productHasPickupServices &&
      effectivePickupLocations.length > 0;
    const hasValidPickupLocation =
      !needsPickupLocation || selectedPickupLocation;

    // No longer need FIT tour booking option validation

    // Check if terms are agreed to
    const hasAgreedToTerms = agreeToTerms;

    // Check if contact info is valid
    const hasValidContactInfo = 
      contactInfo.firstName.trim() &&
      contactInfo.lastName.trim() &&
      contactInfo.email && 
      contactInfo.phone && 
      emailRegex.test(contactInfo.email) && 
      contactInfo.phone.replace(/\D/g, "").length >= 6;

    // Check pickup validation
    const hasValidPickup = !pickupValidationError;

    return (
      hasValidSession &&
      hasValidPickupLocation &&
      hasAgreedToTerms &&
      hasValidContactInfo &&
      hasValidPickup
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
      // Reset pickup location selection when session changes
      setSelectedPickupLocation(null);

      // Clear auto-selection flag if this is a manual selection
      if (!isAutoSelection) {
        setWasSessionAutoSelected(false);
      }

      // Auto-selection of pickup location is handled by the effectivePickupLocations useEffect
    },
    []
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
        setSelectedPickupLocation(null);

        // Auto-selection of pickup location is handled by the effectivePickupLocations useEffect
      }
    }
  }, [
    preSelectedSessionId,
    allSessions,
    selectedDate,
    selectedSession,
  ]);

  // Auto-select session when there's only one available session for the selected date
  useEffect(() => {
    if (selectedDate && availableSessions.length === 1 && !selectedSession) {
      // Inline the session selection logic to avoid dependency on handleSessionSelect
      const session = availableSessions[0];
      normalizeSessionId(session);
      setSelectedSession({ ...session });
      setSelectedPickupLocation(null);
      setWasSessionAutoSelected(true);

      // Auto-selection of pickup location is handled by the effectivePickupLocations useEffect
    }
  }, [selectedDate, availableSessions, selectedSession]);

  // Auto-select pickup location when effective pickup locations are available
  useEffect(() => {
    if (
      selectedSession &&
      effectivePickupLocations.length > 0 &&
      !selectedPickupLocation
    ) {
      // Auto-select first pickup location if available
      setSelectedPickupLocation(effectivePickupLocations[0]);
      console.log('✅ Auto-selected pickup location:', effectivePickupLocations[0].locationName);
    }
  }, [selectedSession, effectivePickupLocations, selectedPickupLocation]);

  // Validate pickup location selection
  useEffect(() => {
    if (!selectedSession) {
      setPickupValidationError(null);
      setPickupValidationWarning(null);
      return;
    }

    const validationResult = validateBookingPickupData(
      selectedPickupLocation,
      effectivePickupLocations,
      productHasPickupServices,
      false
    );

    const errorMessage = validationResult.isValid ? null : getPickupValidationMessage(validationResult);
    setPickupValidationError(errorMessage);
    setPickupValidationWarning(getPickupWarningMessage(validationResult) || null);
    
    // Track validation errors
    if (errorMessage) {
      trackValidationError(product.productCode, errorMessage);
    }
  }, [selectedPickupLocation, effectivePickupLocations, productHasPickupServices, selectedSession, product.productCode, trackValidationError]);

  // Auto-select pickup location for regular tours based on preSelectedLocation
  useEffect(() => {
    if (
      selectedSession &&
      preSelectedLocation &&
      effectivePickupLocations.length > 0 &&
      !selectedPickupLocation
    ) {
      // Find a pickup location that matches the search form location
      const matchingLocation = effectivePickupLocations.find(
        (location) => {
          const locationName = location.locationName.toLowerCase();
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
    preSelectedLocation,
    effectivePickupLocations,
    selectedPickupLocation,
  ]);


  const handlePickupLocationSelect = (location: RezdyPickupLocation) => {
    setSelectedPickupLocation(location);
    
    // Track pickup location selection
    trackPickupSelection(product.productCode, location);
  };

  // Guest count management functions
  const updateGuestCount = (type: 'adults' | 'children' | 'infants', delta: number) => {
    setGuestCounts(prev => {
      const newCounts = { ...prev };
      const newValue = prev[type] + delta;
      
      // Apply constraints
      if (type === 'adults') {
        // Adults minimum is 1, maximum from product or 50
        newCounts.adults = Math.max(1, Math.min(newValue, product.quantityRequiredMax || 50));
      } else {
        // Children and infants minimum is 0
        newCounts[type] = Math.max(0, Math.min(newValue, (product.quantityRequiredMax || 50) - newCounts.adults));
      }
      
      // Ensure total doesn't exceed maximum
      const total = newCounts.adults + newCounts.children + newCounts.infants;
      if (product.quantityRequiredMax && total > product.quantityRequiredMax) {
        return prev; // Don't update if it would exceed maximum
      }
      
      return newCounts;
    });
  };

  const incrementGuests = (type: 'adults' | 'children' | 'infants') => {
    updateGuestCount(type, 1);
  };

  const decrementGuests = (type: 'adults' | 'children' | 'infants') => {
    updateGuestCount(type, -1);
  };

  // Check if we can add more guests of a specific type
  const canIncrement = (_type: 'adults' | 'children' | 'infants'): boolean => {
    const total = guestCounts.adults + guestCounts.children + guestCounts.infants;
    const maxAllowed = product.quantityRequiredMax || 50;
    return total < maxAllowed;
  };

  // Check if we can remove guests of a specific type
  const canDecrement = (type: 'adults' | 'children' | 'infants'): boolean => {
    if (type === 'adults') {
      return guestCounts.adults > 1; // Must have at least 1 adult
    }
    return guestCounts[type] > 0;
  };

  const handleProceedToPayment = async () => {
    setIsProcessingPayment(true);
    setBookingErrors([]);

    try {
      // Prepare minimal booking data for payment processing
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
        },
        // We'll collect guest details after payment
        guests: [],
        contact: {
          firstName: contactInfo.firstName,
          lastName: contactInfo.lastName,
          email: contactInfo.email,
          phone: contactInfo.phone,
          country: "Australia",
          dietaryRequirements: "",
          accessibilityNeeds: "",
          specialRequests: "",
        },
        pricing: {
          basePrice: pricingBreakdown.basePrice,
          sessionPrice: pricingBreakdown.adultPrice,
          subtotal: pricingBreakdown.subtotal,
          taxAndFees: pricingBreakdown.taxes + pricingBreakdown.serviceFees,
          total: pricingBreakdown.total,
        },
        extras: selectedExtras.map((selectedExtra) => {
          let totalPrice = selectedExtra.extra.price * selectedExtra.quantity;
          if (selectedExtra.extra.priceType === "PER_PERSON") {
            totalPrice =
              selectedExtra.extra.price *
              selectedExtra.quantity *
              (guestCounts.adults + guestCounts.children + guestCounts.infants);
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
          type: "CREDITCARD", // Explicitly set the type for Rezdy compatibility
        },
        // Store guest counts for later use
        guestCounts,
        // Store selected priceOptions from Rezdy
        selectedPriceOptions: pricingBreakdown.selectedPriceOptions ? {
          adult: pricingBreakdown.selectedPriceOptions.adult ? {
            id: pricingBreakdown.selectedPriceOptions.adult.id,
            label: pricingBreakdown.selectedPriceOptions.adult.label,
            price: pricingBreakdown.selectedPriceOptions.adult.price,
          } : undefined,
          child: pricingBreakdown.selectedPriceOptions.child ? {
            id: pricingBreakdown.selectedPriceOptions.child.id,
            label: pricingBreakdown.selectedPriceOptions.child.label,
            price: pricingBreakdown.selectedPriceOptions.child.price,
          } : undefined,
          infant: pricingBreakdown.selectedPriceOptions.infant ? {
            id: pricingBreakdown.selectedPriceOptions.infant.id,
            label: pricingBreakdown.selectedPriceOptions.infant.label,
            price: pricingBreakdown.selectedPriceOptions.infant.price,
          } : undefined,
        } : undefined,
      };

      // Generate unique order number
      const generatedOrderNumber = `ORD-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      // Store booking data in session storage for payment page
      sessionStorage.setItem(`booking_${generatedOrderNumber}`, JSON.stringify(formData));

      // Also store in server-side store as backup (will be done by payment intent API)
      // The payment intent creation API will handle server-side storage

      // Redirect to custom payment page
      const paymentUrl = `/booking/payment?orderNumber=${generatedOrderNumber}&amount=${pricingBreakdown.total}&productName=${encodeURIComponent(product.name)}`;
      window.location.href = paymentUrl;
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
                  Choose your preferred tour date and session
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

                {/* Enhanced Pickup Location Selection */}
                {selectedSession && (
                  <>
                    {pickupLocationsLoading && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 py-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-accent"></div>
                          <span className="text-sm text-muted-foreground font-medium">
                            Loading pickup locations...
                          </span>
                        </div>
                        {/* Skeleton loader for pickup locations */}
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg animate-pulse">
                              <div className="w-4 h-4 bg-muted rounded-full"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-muted rounded w-2/3"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {pickupLocationsError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p className="font-medium">Unable to load pickup locations</p>
                            <p className="text-sm">{pickupLocationsError}</p>
                            <button 
                              onClick={() => window.location.reload()} 
                              className="text-sm underline hover:no-underline"
                            >
                              Try refreshing the page
                            </button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {!pickupLocationsLoading && effectivePickupLocations.length > 0 && (
                      <div className="space-y-3">
                      
                        
                        <PickupLocationSelector
                          pickupLocations={effectivePickupLocations}
                          selectedPickupLocation={selectedPickupLocation}
                          onPickupLocationSelect={handlePickupLocationSelect}
                          showDirections={true}
                          required={true}
                        />
                        
                        {pickupValidationError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {pickupValidationError}
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {pickupValidationWarning && (
                          <Alert className="border-yellow-200 bg-yellow-50">
                            <Info className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                              {pickupValidationWarning}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                    
                    {!pickupLocationsLoading && !pickupLocationsError && effectivePickupLocations.length === 0 && (
                      <Alert className="border-blue-200 bg-blue-50">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <div className="space-y-1">
                            <p className="font-medium">No pickup service available</p>
                            <p className="text-sm">Please arrive at the meeting point specified in your booking confirmation.</p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}

                {/* Date Selection Validation */}
                {!selectedSession && selectedDate && !availabilityLoading && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Please select a date and time session to proceed.
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

            {/* Guest Count Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Guests
                </CardTitle>
                <p className="text-muted-foreground">
                  Choose the number of guests for your booking
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Adults */}
                <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                  <div className="text-center mb-3">
                    <div className="font-medium">Adults</div>
                    <div className="text-sm text-muted-foreground">Ages 18+</div>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => decrementGuests('adults')}
                      disabled={!canDecrement('adults')}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{guestCounts.adults}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => incrementGuests('adults')}
                      disabled={!canIncrement('adults')}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                  <div className="text-center mb-3">
                    <div className="font-medium">Children</div>
                    <div className="text-sm text-muted-foreground">Ages 3-17</div>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => decrementGuests('children')}
                      disabled={!canDecrement('children')}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{guestCounts.children}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => incrementGuests('children')}
                      disabled={!canIncrement('children')}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                  <div className="text-center mb-3">
                    <div className="font-medium">Infants</div>
                    <div className="text-sm text-muted-foreground">Ages 0-2</div>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => decrementGuests('infants')}
                      disabled={!canDecrement('infants')}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{guestCounts.infants}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => incrementGuests('infants')}
                      disabled={!canIncrement('infants')}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Summary and constraints */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <Users className="h-5 w-5 text-brand-accent" />
                    <span>
                      Total: {guestCounts.adults + guestCounts.children + guestCounts.infants} guests
                    </span>
                  </div>
                  
                
                  <div className="text-sm text-muted-foreground w-full">
                    <Info className="h-4 w-4 inline mr-1" />
                    Guest details will be collected after payment confirmation
                  </div>
                </div>
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
                  We'll need your contact details to send booking confirmation
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={contactInfo.firstName}
                      onChange={(e) => {
                        setContactInfo(prev => ({ ...prev, firstName: e.target.value }));
                        // Clear error when user starts typing
                        if (contactFieldErrors.firstName) {
                          setContactFieldErrors(prev => ({ ...prev, firstName: undefined }));
                        }
                      }}
                      onBlur={() => {
                        if (!contactInfo.firstName.trim()) {
                          setContactFieldErrors(prev => ({ 
                            ...prev, 
                            firstName: "First name is required" 
                          }));
                        }
                      }}
                      className={cn(
                        "h-12",
                        contactFieldErrors.firstName && "border-destructive"
                      )}
                    />
                    {contactFieldErrors.firstName && (
                      <p className="text-sm text-destructive">{contactFieldErrors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      value={contactInfo.lastName}
                      onChange={(e) => {
                        setContactInfo(prev => ({ ...prev, lastName: e.target.value }));
                        // Clear error when user starts typing
                        if (contactFieldErrors.lastName) {
                          setContactFieldErrors(prev => ({ ...prev, lastName: undefined }));
                        }
                      }}
                      onBlur={() => {
                        if (!contactInfo.lastName.trim()) {
                          setContactFieldErrors(prev => ({ 
                            ...prev, 
                            lastName: "Last name is required" 
                          }));
                        }
                      }}
                      className={cn(
                        "h-12",
                        contactFieldErrors.lastName && "border-destructive"
                      )}
                    />
                    {contactFieldErrors.lastName && (
                      <p className="text-sm text-destructive">{contactFieldErrors.lastName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={contactInfo.email}
                      onChange={(e) => {
                        setContactInfo(prev => ({ ...prev, email: e.target.value }));
                        // Clear error when user starts typing
                        if (contactFieldErrors.email) {
                          setContactFieldErrors(prev => ({ ...prev, email: undefined }));
                        }
                      }}
                      onBlur={() => {
                        if (contactInfo.email && !emailRegex.test(contactInfo.email)) {
                          setContactFieldErrors(prev => ({ 
                            ...prev, 
                            email: "Please enter a valid email address" 
                          }));
                        }
                      }}
                      className={cn(
                        "h-12",
                        contactFieldErrors.email && "border-destructive"
                      )}
                    />
                    {contactFieldErrors.email && (
                      <p className="text-sm text-destructive">{contactFieldErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="04XX XXX XXX"
                        value={contactInfo.phone}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          setContactInfo(prev => ({ ...prev, phone: formatted }));
                          // Clear error when user starts typing
                          if (contactFieldErrors.phone) {
                            setContactFieldErrors(prev => ({ ...prev, phone: undefined }));
                          }
                        }}
                        onBlur={() => {
                          const phoneDigits = contactInfo.phone.replace(/\D/g, "");
                          if (contactInfo.phone && phoneDigits.length < 6) {
                            setContactFieldErrors(prev => ({ 
                              ...prev, 
                              phone: "Please enter a valid phone number" 
                            }));
                          }
                        }}
                        className={cn(
                          "h-12 pl-10",
                          contactFieldErrors.phone && "border-destructive"
                        )}
                      />
                    </div>
                    {contactFieldErrors.phone && (
                      <p className="text-sm text-destructive">{contactFieldErrors.phone}</p>
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
                    You will proceed to our secure payment page. After payment, you'll provide guest details to complete your booking.
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
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {guestCounts.adults +
                            guestCounts.children +
                            guestCounts.infants}{" "}
                          guests
                        </span>
                      </div>
                      {selectedPickupLocation && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {selectedPickupLocation.locationName}
                            </div>
                            {selectedPickupLocation.minutesPrior && (
                              <div className="text-muted-foreground">
                                Arrive: {Math.abs(selectedPickupLocation.minutesPrior)} minutes early
                              </div>
                            )}
                            {selectedPickupLocation.address && (
                              <div className="text-sm text-muted-foreground">
                                {selectedPickupLocation.address}
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
            disabled={!canProceedToPayment() || isProcessingPayment}
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
