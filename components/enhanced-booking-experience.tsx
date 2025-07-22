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
  ChevronDown,
} from "lucide-react";
import { format, addDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  RezdyPriceOption,
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
  
  // Calendar popover state
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // API pickup locations state - initialize with preloaded data if available
  const [apiPickupLocations, setApiPickupLocations] = useState<RezdyPickupLocation[]>(
    preloadedPickupLocations || []
  );
  const [pickupLocationsLoading, setPickupLocationsLoading] = useState(true);
  const [pickupLocationsError, setPickupLocationsError] = useState<string | null>(null);
  
  // Pickup validation state
  const [pickupValidationError, setPickupValidationError] = useState<string | null>(null);
  const [pickupValidationWarning, setPickupValidationWarning] = useState<string | null>(null);

  // Handle loading state based on preloaded data
  useEffect(() => {
    if (preloadedPickupLocations && preloadedPickupLocations.length > 0) {
      setPickupLocationsLoading(false);
    }
  }, [preloadedPickupLocations]);
  
  // Dynamic guest count based on available price options
  const [guestCounts, setGuestCounts] = useState<Record<string, number>>(() => {
    const initialCounts: Record<string, number> = {};
    
    // Initialize counts based on available price options
    if (product.priceOptions && product.priceOptions.length > 0) {
      product.priceOptions.forEach((option) => {
        initialCounts[option.label] = 0;
      });
      
      // Set the first option to minimum required or 1
      const firstOption = product.priceOptions[0];
      initialCounts[firstOption.label] = Math.max(1, product.quantityRequiredMin || 1);
      
      // Apply pre-selected participants if available
      if (preSelectedParticipants) {
        // Map legacy participant types to actual price option labels
        product.priceOptions.forEach((option) => {
          const labelLower = option.label.toLowerCase();
          if (labelLower.includes('adult') && preSelectedParticipants.adults) {
            initialCounts[option.label] = preSelectedParticipants.adults;
          } else if (labelLower.includes('child') && preSelectedParticipants.children) {
            initialCounts[option.label] = preSelectedParticipants.children;
          } else if (labelLower.includes('infant') && preSelectedParticipants.infants) {
            initialCounts[option.label] = preSelectedParticipants.infants;
          }
        });
      }
    } else {
      // Fallback to default structure if no price options
      initialCounts['Adult'] = preSelectedParticipants?.adults || Math.max(1, product.quantityRequiredMin || 1);
      initialCounts['Child'] = preSelectedParticipants?.children || 0;
      initialCounts['Infant'] = preSelectedParticipants?.infants || 0;
    }
    
    return initialCounts;
  });


  // State for guest count input (new flow)
  const [desiredGuestCount, setDesiredGuestCount] = useState<number>(
    preSelectedParticipants?.adults || product.quantityRequiredMin || 1
  );
  
  // State for guest count validation feedback
  const [guestCountValidation, setGuestCountValidation] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  
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

  // Helper to get guest selector content based on pricing pattern
  function getGuestSelectorContent(product: RezdyProduct) {
    if (!product.priceOptions || product.priceOptions.length === 0) {
      return {
        title: "Select Guests",
        description: "Choose the number of guests for your booking"
      };
    }

    const labels = product.priceOptions.map(opt => opt.label.toLowerCase());
    
    if (labels.some(label => label.includes('private') || label.includes('group'))) {
      return {
        title: "Group Size",
        description: "Specify your private group requirements"
      };
    }
    
    if (labels.length === 1 && labels[0].includes('quantity')) {
      return {
        title: "Number of Participants",
        description: "How many people will be joining this experience?"
      };
    }
    
    if (labels.some(label => 
      label.includes('adult') || label.includes('child') || label.includes('infant')
    )) {
      return {
        title: "Select Guests",
        description: "Choose the number of guests by age group"
      };
    }
    
    return {
      title: "Select Options",
      description: "Choose your preferred pricing options"
    };
  }

  // Helper to check if we should use the new guest count input flow
  function shouldUseGuestCountInputFlow(product: RezdyProduct): boolean {
    if (!product.priceOptions || product.priceOptions.length === 0) {
      return false;
    }

    const labels = product.priceOptions.map(opt => opt.label.toLowerCase());
    
    // Use new flow for group size bookings
    if (labels.some(label => label.includes('private') || label.includes('group'))) {
      return true;
    }
    
    // Use new flow if the product has quantity constraints (min/max)
    if (product.quantityRequiredMin !== undefined || product.quantityRequiredMax !== undefined) {
      return true;
    }
    
    return false;
  }

  // Helper to check if guest count is valid for a specific price option
  function isValidGuestCount(product: RezdyProduct, guestCount: number, priceOption?: RezdyPriceOption): boolean {
    if (priceOption) {
      // Use price option specific constraints if available
      const minQuantity = priceOption.minQuantity || 1;
      const maxQuantity = priceOption.maxQuantity || Number.MAX_SAFE_INTEGER;
      return guestCount >= minQuantity && guestCount <= maxQuantity;
    }
    
    // Fallback to product-level constraints
    const minQuantity = product.quantityRequiredMin || 1;
    const maxQuantity = product.quantityRequiredMax || Number.MAX_SAFE_INTEGER;
    
    return guestCount >= minQuantity && guestCount <= maxQuantity;
  }

  // Helper to get available price options for the desired guest count
  function getAvailablePriceOptions(product: RezdyProduct, guestCount: number) {
    if (!product.priceOptions || product.priceOptions.length === 0) {
      return [];
    }

    // Filter price options based on their individual quantity constraints
    return product.priceOptions.filter(option => 
      isValidGuestCount(product, guestCount, option)
    );
  }

  // Helper to validate and clamp guest count within Rezdy constraints
  function validateAndClampGuestCount(product: RezdyProduct, desiredCount: number): {
    validCount: number;
    isValid: boolean;
    exceedsMax: boolean;
    belowMin: boolean;
    minQuantity: number;
    maxQuantity: number;
  } {
    const minQuantity = product.quantityRequiredMin || 1;
    const maxQuantity = product.quantityRequiredMax || Number.MAX_SAFE_INTEGER;
    
    let validCount = desiredCount;
    let isValid = true;
    let exceedsMax = false;
    let belowMin = false;

    if (desiredCount < minQuantity) {
      validCount = minQuantity;
      isValid = false;
      belowMin = true;
    } else if (desiredCount > maxQuantity) {
      validCount = maxQuantity;
      isValid = false;
      exceedsMax = true;
    }

    return {
      validCount,
      isValid,
      exceedsMax,
      belowMin,
      minQuantity,
      maxQuantity
    };
  }

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

    if (preSelectedParticipants && product.priceOptions) {
      setGuestCounts(prev => {
        const newCounts = { ...prev };
        
        // Map legacy participant types to actual price option labels
        product.priceOptions?.forEach((option) => {
          const labelLower = option.label.toLowerCase();
          if (labelLower.includes('adult') && preSelectedParticipants.adults) {
            newCounts[option.label] = preSelectedParticipants.adults;
          } else if (labelLower.includes('child') && preSelectedParticipants.children) {
            newCounts[option.label] = preSelectedParticipants.children;
          } else if (labelLower.includes('infant') && preSelectedParticipants.infants) {
            newCounts[option.label] = preSelectedParticipants.infants;
          }
        });
        
        return newCounts;
      });
    }
  }, [preSelectedSession, preSelectedParticipants, preSelectedDate]);


  // Date range for availability
  const today = new Date();
  const endDate = addDays(today, 90); // 3 months ahead
  const startDateRange = today.toISOString().split("T")[0];
  const endDateRange = endDate.toISOString().split("T")[0];

  // Auto-populate guestCounts for new guest count input flow
  useEffect(() => {
    if (shouldUseGuestCountInputFlow(product) && desiredGuestCount > 0) {
      const availableOptions = getAvailablePriceOptions(product, desiredGuestCount);
      
      if (availableOptions.length > 0) {
        // For the simplified flow, automatically select the first available option
        // and set the count to the desired guest count
        setGuestCounts(prev => {
          const newCounts: Record<string, number> = {};
          
          // Clear all counts first
          Object.keys(prev).forEach(key => {
            newCounts[key] = 0;
          });
          
          // Set the first available option to the desired guest count
          const selectedOption = availableOptions[0];
          newCounts[selectedOption.label] = desiredGuestCount;
          
          return newCounts;
        });
      }
    }
  }, [shouldUseGuestCountInputFlow(product), desiredGuestCount, product.priceOptions]);

  // Memoize participants parameter for availability to prevent unnecessary API calls when guest counts change
  const participantsForAvailability = useMemo(() => {
    // Use a stable default parameter for availability fetching
    // Most tours have fixed time slots regardless of participant numbers
    return 'ADULT:1';
  }, [product.productCode]); // Only depend on product code, not guest counts

  // Fetch availability
  const {
    data: availabilityData,
    loading: availabilityLoading,
    error: availabilityError,
  } = useRezdyAvailability(
    product.productCode,
    startDateRange,
    endDateRange,
    participantsForAvailability
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
    // Validate guest counts data
    if (!guestCounts || Object.keys(guestCounts).length === 0) {
      console.warn('No guest counts available for pricing calculation');
      return calculatePricing(product, selectedSession, {
        adults: 1,
        children: 0,
        infants: 0,
        extras: selectedExtras,
        dynamicGuestCounts: {},
      });
    }

    // Validate that product price options match guest count keys
    if (product.priceOptions && product.priceOptions.length > 0) {
      const priceOptionLabels = product.priceOptions.map(opt => opt.label);
      const guestCountLabels = Object.keys(guestCounts);
      
      // Check for mismatched labels and log warnings
      guestCountLabels.forEach(label => {
        const hasExactMatch = priceOptionLabels.includes(label);
        const hasCaseInsensitiveMatch = priceOptionLabels.some(optLabel => 
          optLabel.toLowerCase() === label.toLowerCase()
        );
        const hasPartialMatch = priceOptionLabels.some(optLabel => 
          optLabel.toLowerCase().includes(label.toLowerCase()) ||
          label.toLowerCase().includes(optLabel.toLowerCase())
        );
        
        if (!hasExactMatch && !hasCaseInsensitiveMatch && !hasPartialMatch) {
          console.warn(`Guest count label "${label}" does not match any price option:`, priceOptionLabels);
        }
      });
    }
    
    // Convert dynamic guest counts to standard format for pricing calculation
    const standardCounts = {
      adults: 0,
      children: 0,
      infants: 0,
    };
    
    // Map price option counts to standard guest types
    if (product.priceOptions) {
      Object.entries(guestCounts).forEach(([label, count]) => {
        const labelLower = label.toLowerCase();
        if (labelLower.includes('adult') || labelLower.includes('senior') || 
            labelLower.includes('concession') || labelLower.includes('student')) {
          standardCounts.adults += count;
        } else if (labelLower.includes('child')) {
          standardCounts.children += count;
        } else if (labelLower.includes('infant')) {
          standardCounts.infants += count;
        } else if (labelLower.includes('family')) {
          // Family packages typically count as multiple adults
          standardCounts.adults += count * 2; // Assume family of 4 = 2 adults + 2 children
          standardCounts.children += count * 2;
        } else if (labelLower.includes('quantity') || labelLower.includes('person')) {
          // Generic quantity types default to adults
          standardCounts.adults += count;
        } else {
          // Default unknown types to adults but log warning
          console.warn(`Unknown guest type "${label}" defaulting to adult`);
          standardCounts.adults += count;
        }
      });
    } else {
      // Use guest counts directly if no price options
      standardCounts.adults = guestCounts['Adult'] || guestCounts['adult'] || 0;
      standardCounts.children = guestCounts['Child'] || guestCounts['child'] || 0;
      standardCounts.infants = guestCounts['Infant'] || guestCounts['infant'] || 0;
    }
    
    // Ensure at least one guest for valid booking
    const totalGuests = standardCounts.adults + standardCounts.children + standardCounts.infants;
    if (totalGuests === 0) {
      console.warn('No guests found in pricing calculation, defaulting to 1 adult');
      standardCounts.adults = 1;
    }
    
    try {
      return calculatePricing(product, selectedSession, {
        adults: standardCounts.adults,
        children: standardCounts.children,
        infants: standardCounts.infants,
        extras: selectedExtras,
        dynamicGuestCounts: guestCounts,
      });
    } catch (error) {
      console.error('Error calculating pricing:', error);
      // Return fallback pricing
      return {
        adults: standardCounts.adults,
        children: standardCounts.children,
        infants: standardCounts.infants,
        basePrice: product.advertisedPrice || 0,
        adultPrice: selectedSession?.totalPrice || product.advertisedPrice || 0,
        childPrice: 0,
        infantPrice: 0,
        subtotal: (selectedSession?.totalPrice || product.advertisedPrice || 0) * totalGuests,
        extrasSubtotal: 0,
        taxes: 0,
        serviceFees: 0,
        total: (selectedSession?.totalPrice || product.advertisedPrice || 0) * totalGuests,
        selectedExtras: selectedExtras,
        dynamicGuestCounts: guestCounts,
      };
    }
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
    
    // Close the calendar popover after date selection
    if (date) {
      setCalendarOpen(false);
    }
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
            const totalGuests = shouldUseGuestCountInputFlow(product) 
              ? desiredGuestCount
              : Object.values(guestCounts).reduce((sum, count) => sum + count, 0);
            totalPrice =
              selectedExtra.extra.price *
              selectedExtra.quantity *
              totalGuests;
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
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
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
                  {getGuestSelectorContent(product).title}
                </CardTitle>
                <p className="text-muted-foreground">
                  {getGuestSelectorContent(product).description}
                </p>
              </CardHeader>
              <CardContent>
                {/* New guest count input flow */}
                {shouldUseGuestCountInputFlow(product) && (
                  <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                    <Label htmlFor="guestCount" className="text-base font-medium mb-3 block">
                      How many guests will be joining?
                    </Label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const validation = validateAndClampGuestCount(product, desiredGuestCount - 1);
                          setDesiredGuestCount(validation.validCount);
                        }}
                        disabled={(() => {
                          const validation = validateAndClampGuestCount(product, desiredGuestCount - 1);
                          return validation.belowMin || desiredGuestCount <= validation.minQuantity;
                        })()}
                        className="h-10 w-10 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 max-w-[120px]">
                        <Input
                          id="guestCount"
                          type="text"
                          inputMode="numeric"
                          value={desiredGuestCount}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            const validation = validateAndClampGuestCount(product, value);
                            setDesiredGuestCount(validation.validCount);
                            
                            // Set validation feedback
                            if (!validation.isValid) {
                              if (validation.belowMin) {
                                setGuestCountValidation({
                                  isValid: false,
                                  message: `Minimum ${validation.minQuantity} guests required`
                                });
                              } else if (validation.exceedsMax) {
                                setGuestCountValidation({
                                  isValid: false,
                                  message: `Maximum ${validation.maxQuantity} guests allowed`
                                });
                              }
                            } else {
                              setGuestCountValidation(null);
                            }
                          }}
                          onBlur={(e) => {
                            // Ensure value is within constraints when user leaves the field
                            const value = parseInt(e.target.value) || 1;
                            const validation = validateAndClampGuestCount(product, value);
                            if (!validation.isValid) {
                              setDesiredGuestCount(validation.validCount);
                              setGuestCountValidation(null); // Clear message after auto-correction
                            }
                          }}
                          className={cn(
                            "text-center text-lg font-medium h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                            guestCountValidation && !guestCountValidation.isValid && "border-destructive focus:ring-destructive"
                          )}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const validation = validateAndClampGuestCount(product, desiredGuestCount + 1);
                          setDesiredGuestCount(validation.validCount);
                        }}
                        disabled={(() => {
                          const validation = validateAndClampGuestCount(product, desiredGuestCount + 1);
                          return validation.exceedsMax || desiredGuestCount >= validation.maxQuantity;
                        })()}
                        className="h-10 w-10 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Validation Error Message */}
                    {guestCountValidation && !guestCountValidation.isValid && (
                      <div className="mt-2 text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {guestCountValidation.message}
                      </div>
                    )}
                    
                   
                  </div>
                )}
                
                {/* Summary and constraints */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <Users className="h-5 w-5 text-brand-accent" />
                    <span>
                      Total: {shouldUseGuestCountInputFlow(product) 
                        ? `${desiredGuestCount} guests`
                        : `${Object.values(guestCounts).reduce((sum, count) => sum + count, 0)} guests`
                      }
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
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
                          {shouldUseGuestCountInputFlow(product) 
                            ? `${desiredGuestCount} guests`
                            : `${Object.values(guestCounts).reduce((sum, count) => sum + count, 0)} guests`
                          }
                        </span>
                      </div>
                      {selectedPickupLocation && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {selectedPickupLocation.locationName}
                            </div>
                           
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
                    shouldUseGuestCountInputFlow(product) 
                      ? desiredGuestCount
                      : Object.values(guestCounts).reduce((sum, count) => sum + count, 0)
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
