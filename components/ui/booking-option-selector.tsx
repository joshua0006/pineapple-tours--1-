"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronDown,
  MapPin,
  Clock,
  Users,
  Star,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RezdyBookingOption, RezdyPickupLocation } from "@/lib/types/rezdy";
import { cn } from "@/lib/utils";

interface BookingOptionSelectorProps {
  bookingOptions: RezdyBookingOption[];
  selectedBookingOption?: RezdyBookingOption | null;
  selectedPickupLocation?: RezdyPickupLocation | null;
  onBookingOptionSelect: (
    option: RezdyBookingOption,
    location: RezdyPickupLocation
  ) => void;
  onContinue?: () => void;
  className?: string;
  required?: boolean;
  showPricing?: boolean;
  participantCount?: number;
}

interface DropdownState {
  region: string | null;
  option: RezdyBookingOption | null;
  location: RezdyPickupLocation | null;
}

interface RegionGroup {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  options: RezdyBookingOption[];
}

interface DropdownPosition {
  region: "below" | "above";
  location: "below" | "above";
}

export function BookingOptionSelector({
  bookingOptions,
  selectedBookingOption,
  selectedPickupLocation,
  onBookingOptionSelect,
  onContinue,
  className,
  required = false,
  showPricing = true,
  participantCount = 1,
}: BookingOptionSelectorProps) {
  const [dropdownState, setDropdownState] = useState<DropdownState>({
    region: null,
    option: null,
    location: null,
  });

  const [openDropdowns, setOpenDropdowns] = useState({
    region: false,
    location: false,
  });

  const [dropdownPositions, setDropdownPositions] = useState<DropdownPosition>({
    region: "below",
    location: "below",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const regionButtonRef = useRef<HTMLButtonElement>(null);
  const locationButtonRef = useRef<HTMLButtonElement>(null);
  const regionDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Group booking options by region
  const regionGroups: RegionGroup[] = useMemo(() => {
    const groups = new Map<string, RezdyBookingOption[]>();

    bookingOptions.forEach((option) => {
      const regionKey = option.pickupType;
      if (!groups.has(regionKey)) {
        groups.set(regionKey, []);
      }
      groups.get(regionKey)!.push(option);
    });

    return Array.from(groups.entries()).map(([regionKey, options]) => {
      const regionConfig = getRegionConfig(regionKey);
      return {
        id: regionKey,
        ...regionConfig,
        options: options.sort(
          (a, b) => (b.isPreferred ? 1 : 0) - (a.isPreferred ? 1 : 0)
        ),
      };
    });
  }, [bookingOptions]);

  // Initialize from selected values
  useEffect(() => {
    if (selectedBookingOption && selectedPickupLocation) {
      const region = regionGroups.find((g) =>
        g.options.some((o) => o.id === selectedBookingOption.id)
      );

      setDropdownState({
        region: region?.id || null,
        option: selectedBookingOption,
        location: selectedPickupLocation,
      });
    }
  }, [selectedBookingOption, selectedPickupLocation, regionGroups]);

  // Clear errors when state changes
  useEffect(() => {
    if (errors.length > 0) {
      setErrors([]);
    }
  }, [dropdownState]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenDropdowns({ region: false, location: false });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calculate dropdown position based on available space
  const calculateDropdownPosition = (
    buttonRef: React.RefObject<HTMLButtonElement | null>,
    dropdownType: "region" | "location"
  ): "below" | "above" => {
    if (!buttonRef.current) return "below";

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Estimate dropdown height based on content
    const estimatedDropdownHeight =
      dropdownType === "region"
        ? Math.min(regionGroups.length * 80 + 16, 384) // max-h-96 = 384px
        : Math.min(
            (dropdownState.option?.pickupLocations.length || 0) * 64 + 16,
            320
          ); // max-h-80 = 320px

    const spaceBelow = viewportHeight - buttonRect.bottom - 8; // 8px margin
    const spaceAbove = buttonRect.top - 8; // 8px margin

    // Prefer below, but use above if there's insufficient space below and more space above
    if (spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow) {
      return "above";
    }

    return "below";
  };

  // Update dropdown positions when opening
  const updateDropdownPosition = (dropdownType: "region" | "location") => {
    const buttonRef =
      dropdownType === "region" ? regionButtonRef : locationButtonRef;
    const position = calculateDropdownPosition(buttonRef, dropdownType);

    setDropdownPositions((prev) => ({
      ...prev,
      [dropdownType]: position,
    }));
  };

  // Handle window resize to recalculate positions
  useEffect(() => {
    const handleResize = () => {
      if (openDropdowns.region) {
        updateDropdownPosition("region");
      }
      if (openDropdowns.location) {
        updateDropdownPosition("location");
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [
    openDropdowns.region,
    openDropdowns.location,
    regionGroups,
    dropdownState.option,
  ]);

  const handleRegionSelect = (regionId: string) => {
    const selectedRegion = regionGroups.find((g) => g.id === regionId);
    if (!selectedRegion || selectedRegion.options.length === 0) return;

    // Automatically select the first (and typically only) booking option for this region
    const autoSelectedOption = selectedRegion.options[0];

    setIsAnimating(true);
    setDropdownState((prev) => ({
      region: regionId,
      option: autoSelectedOption,
      location: null,
    }));
    setOpenDropdowns((prev) => ({ ...prev, region: false, location: true }));

    setTimeout(() => setIsAnimating(false), 150);
  };

  const handleLocationSelect = (location: RezdyPickupLocation) => {
    const newState = {
      ...dropdownState,
      location,
    };
    setDropdownState(newState);
    setOpenDropdowns((prev) => ({ ...prev, location: false }));

    if (newState.option) {
      onBookingOptionSelect(newState.option, location);
    }
  };

  const handleContinue = () => {
    const validationErrors = validateSelection();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (onContinue) {
      onContinue();
    }
  };

  const validateSelection = (): string[] => {
    const errors: string[] = [];

    if (required) {
      if (!dropdownState.region) {
        errors.push("Please select a pickup region");
      }
      if (!dropdownState.option) {
        errors.push("Please select a booking option");
      }
      if (!dropdownState.location) {
        errors.push("Please select a specific pickup location");
      }
    }

    if (
      dropdownState.option &&
      participantCount > dropdownState.option.availability
    ) {
      errors.push(
        `Only ${dropdownState.option.availability} seats available for this option`
      );
    }

    return errors;
  };

  const toggleDropdown = (dropdown: keyof typeof openDropdowns) => {
    const isOpening = !openDropdowns[dropdown];

    if (isOpening) {
      updateDropdownPosition(dropdown);
    }

    setOpenDropdowns((prev) => ({
      region: false,
      location: false,
      [dropdown]: !prev[dropdown],
    }));
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTotalPrice = (): string => {
    if (!dropdownState.option) return "";
    const total = dropdownState.option.price * participantCount;
    return formatPrice(total);
  };

  const isSelectionComplete =
    dropdownState.region && dropdownState.option && dropdownState.location;
  const canContinue = isSelectionComplete && errors.length === 0;

  return (
    <div ref={containerRef} className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-lg font-semibold text-gray-900">
            Select Booking Option
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Badge variant="secondary" className="text-xs">
            {bookingOptions.length} option{bookingOptions.length > 1 ? "s" : ""}{" "}
            available
          </Badge>
        </div>
        <p className="text-sm text-gray-600">
          Choose your preferred pickup region and specific location
        </p>
      </div>

      {/* Selection Flow */}
      <div className="space-y-4">
        {/* Step 1: Region Selection */}
        <div
          className={cn(
            "relative transition-all duration-300",
            isAnimating && "transform scale-[0.98]"
          )}
        >
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            1. Choose Pickup Region
          </Label>

          <div className="relative">
            <button
              ref={regionButtonRef}
              onClick={() => toggleDropdown("region")}
              className={cn(
                "w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg",
                "hover:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent",
                "transition-all duration-200 group",
                openDropdowns.region &&
                  "border-coral-500 ring-2 ring-coral-500 ring-opacity-20",
                dropdownState.region && "border-green-400 bg-green-50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {dropdownState.region ? (
                    <>
                      {
                        regionGroups.find((g) => g.id === dropdownState.region)
                          ?.icon
                      }
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          {
                            regionGroups.find(
                              (g) => g.id === dropdownState.region
                            )?.name
                          }
                        </span>
                        {dropdownState.option && showPricing && (
                          <div className="text-sm text-coral-600 font-medium">
                            {formatPrice(dropdownState.option.price)} per person
                          </div>
                        )}
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-500">
                        Select your pickup region
                      </span>
                    </>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-gray-400 transition-transform duration-200",
                    openDropdowns.region && "rotate-180"
                  )}
                />
              </div>
            </button>

            {/* Region Dropdown */}
            {openDropdowns.region && (
              <div
                ref={regionDropdownRef}
                className={cn(
                  "absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto",
                  "transition-all duration-200",
                  dropdownPositions.region === "above"
                    ? "bottom-full mb-1 animate-in slide-in-from-bottom-1"
                    : "top-full mt-1 animate-in slide-in-from-top-1"
                )}
              >
                <div className="p-2">
                  {regionGroups.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => handleRegionSelect(region.id)}
                      className="w-full px-3 py-3 text-left hover:bg-gray-50 rounded-md transition-colors duration-150 group"
                    >
                      <div className="flex items-start gap-3">
                        {region.icon}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 group-hover:text-coral-600 truncate">
                            {region.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {region.description}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {region.options[0]?.pickupLocations?.length || 0}{" "}
                            pickup location
                            {(region.options[0]?.pickupLocations?.length ||
                              0) !== 1
                              ? "s"
                              : ""}{" "}
                            available
                          </div>
                          {showPricing && region.options[0] && (
                            <div className="text-sm text-coral-600 font-medium mt-1">
                              {formatPrice(region.options[0].price)} per person
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Location Selection */}
        <div
          className={cn(
            "transition-all duration-300",
            !dropdownState.option && "opacity-50 pointer-events-none",
            isAnimating && "transform scale-[0.98]"
          )}
        >
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            2. Choose Pickup Location
          </Label>

          <div className="relative">
            <button
              ref={locationButtonRef}
              onClick={() => toggleDropdown("location")}
              disabled={!dropdownState.option}
              className={cn(
                "w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg",
                "hover:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent",
                "transition-all duration-200 group disabled:cursor-not-allowed",
                openDropdowns.location &&
                  "border-coral-500 ring-2 ring-coral-500 ring-opacity-20",
                dropdownState.location && "border-green-400 bg-green-50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {dropdownState.location ? (
                    <>
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {dropdownState.location.name}
                        </div>
                        {dropdownState.location.pickupTime && (
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pickup: {dropdownState.location.pickupTime}
                          </div>
                        )}
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-500">
                        {dropdownState.option
                          ? "Select your pickup location"
                          : "Choose a region first"}
                      </span>
                    </>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-gray-400 transition-transform duration-200",
                    openDropdowns.location && "rotate-180"
                  )}
                />
              </div>
            </button>

            {/* Location Dropdown */}
            {openDropdowns.location && dropdownState.option && (
              <div
                ref={locationDropdownRef}
                className={cn(
                  "absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10",
                  "transition-all duration-200",
                  dropdownPositions.location === "above"
                    ? "bottom-full mb-1 animate-in slide-in-from-bottom-1"
                    : "top-full mt-1 animate-in slide-in-from-top-1"
                )}
              >
                <div className="p-2 max-h-80 overflow-y-auto">
                  {dropdownState.option.pickupLocations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => handleLocationSelect(location)}
                      className="w-full px-3 py-3 text-left hover:bg-gray-50 rounded-md transition-colors duration-150 group"
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 group-hover:text-coral-600">
                            {location.name}
                          </div>
                          {typeof location.address === "string" && (
                            <div className="text-sm text-gray-600 mt-1">
                              {location.address}
                            </div>
                          )}
                          {location.pickupTime && (
                            <div className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Pickup: {location.pickupTime}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-1">
              {errors.map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Continue Button */}
      {onContinue && (
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            className={cn(
              "px-8 py-2 transition-all duration-200",
              canContinue
                ? "bg-coral-500 hover:bg-coral-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            Continue to Next Step
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper function to get region configuration
function getRegionConfig(regionKey: string) {
  const configs = {
    brisbane: {
      name: "Brisbane Region",
      description: "Hotel pickups from Brisbane CBD and surrounding areas",
      icon: <MapPin className="w-5 h-5 text-blue-600" />,
    },
    "gold-coast": {
      name: "Gold Coast Region",
      description: "Convenient pickups from Gold Coast hotels and attractions",
      icon: <MapPin className="w-5 h-5 text-orange-600" />,
    },
    "brisbane-city-loop": {
      name: "Brisbane City Loop",
      description: "Multiple CBD pickup points with scheduled stops",
      icon: <MapPin className="w-5 h-5 text-purple-600" />,
    },
    "tamborine-direct": {
      name: "Meet at Destination",
      description: "Join the tour directly at Tamborine Mountain",
      icon: <MapPin className="w-5 h-5 text-green-600" />,
    },
  };

  return (
    configs[regionKey as keyof typeof configs] || {
      name: regionKey.charAt(0).toUpperCase() + regionKey.slice(1),
      description: "Pickup service available",
      icon: <MapPin className="w-5 h-5 text-gray-600" />,
    }
  );
}
