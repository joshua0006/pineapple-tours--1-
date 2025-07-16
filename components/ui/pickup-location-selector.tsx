"use client";

import React, { useMemo, useCallback } from "react";
import { MapPin, Clock, Navigation, Users, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  RezdyPickupLocation,
  RezdyBookingOption,
  RezdyAddress,
} from "@/lib/types/rezdy";
import { cn } from "@/lib/utils";

interface PickupLocationSelectorProps {
  pickupLocations?: RezdyPickupLocation[];
  bookingOptions?: RezdyBookingOption[];
  selectedPickupLocation: RezdyPickupLocation | null;
  selectedBookingOption?: RezdyBookingOption | null;
  onPickupLocationSelect: (location: RezdyPickupLocation) => void;
  onBookingOptionSelect?: (
    option: RezdyBookingOption,
    location: RezdyPickupLocation
  ) => void;
  className?: string;
  showDirections?: boolean;
  required?: boolean;
  showPricing?: boolean;
}

// Extended pickup location type with city for grouping
interface PickupLocationWithCity extends RezdyPickupLocation {
  city?: string;
}

const PickupLocationSelectorComponent = ({
  pickupLocations,
  bookingOptions,
  selectedPickupLocation,
  selectedBookingOption,
  onPickupLocationSelect,
  onBookingOptionSelect,
  className,
  showDirections = false,
  required = false,
  showPricing = false,
}: PickupLocationSelectorProps) => {
  // If we have booking options, use those; otherwise fall back to simple pickup locations
  const hasBookingOptions = bookingOptions && bookingOptions.length > 0;
  const hasSimplePickupLocations =
    pickupLocations && pickupLocations.length > 0;

  if (!hasBookingOptions && !hasSimplePickupLocations) {
    return null;
  }

  // Memoize address formatting function
  const formatAddress = useCallback((
    address: string | RezdyAddress | undefined
  ): string => {
    if (!address) return "";

    if (typeof address === "string") {
      return address;
    }

    const parts = [];
    if (address.addressLine) parts.push(address.addressLine);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.postCode) parts.push(address.postCode);
    return parts.join(", ");
  }, []);

  // Memoize location ID generation
  const getLocationId = useCallback((location: RezdyPickupLocation): string => {
    // Use locationName as the primary identifier, with fallback to coordinates
    return location.locationName || `${location.latitude},${location.longitude}` || 'unknown';
  }, []);

  // Memoize selected location ID
  const selectedLocationId = useMemo(() => {
    if (!selectedPickupLocation) return '';
    return getLocationId(selectedPickupLocation);
  }, [selectedPickupLocation, getLocationId]);

  // Memoize pickup time formatting
  const formatPickupTime = useCallback((minutesPrior?: number): string | null => {
    if (!minutesPrior) return null;
    
    const absMinutes = Math.abs(minutesPrior);
    if (minutesPrior < 0) {
      return `${absMinutes} minutes early`;
    } else if (minutesPrior > 0) {
      return `${absMinutes} minutes after`;
    }
    return null;
  }, []);

  // Memoize location city determination
  const getLocationCity = useCallback((location: RezdyPickupLocation): string => {
    // First try to extract from address if it's an object
    if (location.address && typeof location.address === 'object') {
      const address = location.address as RezdyAddress;
      if (address.city) {
        return address.city;
      }
    }
    
    // Try to extract from location name
    const locationName = location.locationName.toLowerCase();
    
    if (locationName.includes('brisbane')) {
      return 'Brisbane';
    }
    if (locationName.includes('gold coast')) {
      return 'Gold Coast';
    }
    if (locationName.includes('byron')) {
      return 'Byron Bay';
    }
    if (locationName.includes('tamborine')) {
      return 'Tamborine Mountain';
    }
    if (locationName.includes('springbrook')) {
      return 'Springbrook';
    }
    
    // If no match found, try to extract from address string
    if (typeof location.address === 'string') {
      const addressLower = location.address.toLowerCase();
      if (addressLower.includes('brisbane')) return 'Brisbane';
      if (addressLower.includes('gold coast')) return 'Gold Coast';
      if (addressLower.includes('byron')) return 'Byron Bay';
      if (addressLower.includes('tamborine')) return 'Tamborine Mountain';
      if (addressLower.includes('springbrook')) return 'Springbrook';
    }
    
    return 'Unknown';
  }, []);

  // Simplified pickup time formatting - uses minutesPrior or generic city-based times
  const getPickupTimeForLocation = useCallback((location: RezdyPickupLocation): string | null => {
    // First try to use the minutesPrior field if available
    const priorTime = formatPickupTime(location.minutesPrior);
    if (priorTime) {
      return priorTime;
    }
    
    // Fallback to generic city-based pickup times
    const city = getLocationCity(location);
    switch (city) {
      case 'Brisbane':
        return '8:45am - 9:15am';
      case 'Gold Coast':
        return '8:45am - 9:15am';
      case 'Byron Bay':
        return '9:00am - 9:30am';
      case 'Tamborine Mountain':
        return '9:00am - 9:30am';
      default:
        return 'Check details';
    }
  }, [formatPickupTime, getLocationCity]);

  // Memoize directions URL generation
  const getDirectionsUrl = useCallback((location: RezdyPickupLocation): string => {
    if (location.latitude && location.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    }

    const address = formatAddress(location.address);
    if (address) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        address
      )}`;
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      location.locationName
    )}`;
  }, [formatAddress]);

  // Memoize price formatting
  const formatPrice = useCallback((price: number): string => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(price);
  }, []);

  // Memoize city display name mapping
  const getCityDisplayName = useCallback((city: string): string => {
    if (!city) return "Other Locations";
    
    // Clean up city names for display
    return city
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, []);



  // Memoize grouped locations for booking options by city
  const groupedLocationsByOption = useMemo(() => {
    if (!bookingOptions) return {};
    
    return bookingOptions.reduce((acc, option) => {
      acc[option.id] = option.pickupLocations.reduce(
        (locationAcc, location) => {
          const city = getLocationCity(location);
          if (!locationAcc[city]) locationAcc[city] = [];
          locationAcc[city].push(location);
          return locationAcc;
        },
        {} as Record<string, RezdyPickupLocation[]>
      );
      return acc;
    }, {} as Record<string, Record<string, RezdyPickupLocation[]>>);
  }, [bookingOptions, getLocationCity]);

  // Memoize simple pickup locations grouped by city for the simple interface
  const groupedSimpleLocations = useMemo(() => {
    if (!pickupLocations) return {};
    
    return pickupLocations.reduce(
      (acc, location) => {
        const city = getLocationCity(location);
        if (!acc[city]) acc[city] = [];
        acc[city].push(location);
        return acc;
      },
      {} as Record<string, RezdyPickupLocation[]>
    );
  }, [pickupLocations, getLocationCity]);

  // Render booking options interface
  if (hasBookingOptions) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-4">
          <Label className="text-base font-medium">
            Select Booking Option
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Badge variant="secondary" className="text-xs">
            {bookingOptions!.length} option
            {bookingOptions!.length > 1 ? "s" : ""} available
          </Badge>
        </div>

        <div className="space-y-4">
          {bookingOptions!.map((option) => {
            const isSelected = selectedBookingOption?.id === option.id;
            const groupedLocations = groupedLocationsByOption[option.id] || {};

            return (
              <Card
                key={option.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  isSelected
                    ? "ring-2 ring-coral-500 bg-coral-50 border-coral-200"
                    : "hover:bg-gray-50 border-gray-200"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                            isSelected
                              ? "border-coral-500 bg-coral-500"
                              : "border-gray-300 bg-white"
                          )}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        {option.name}
                      </CardTitle>
                      {option.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      )}
                    </div>
                    {showPricing && (
                      <div className="text-right">
                        <div className="text-xl font-bold text-coral-600">
                          {formatPrice(option.price)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          per person
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{option.availability} seats available</span>
                    </div>
                    {option.isPreferred && (
                      <Badge variant="default" className="text-xs bg-amber-500">
                        <Star className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Pickup locations grouped by city */}
                  <div className="space-y-3">
                    {Object.entries(groupedLocations).map(
                      ([city, locations]) => (
                        <div key={city}>
                          <h5 className="font-medium text-sm text-gray-700 mb-2">
                            {getCityDisplayName(city)}
                          </h5>
                          <div className="space-y-2">
                            {locations.map((location) => {
                              const locationId = getLocationId(location);
                              const isLocationSelected =
                                isSelected &&
                                selectedLocationId === locationId;

                              return (
                                <div
                                  key={locationId}
                                  className={cn(
                                    "p-3 rounded-lg border cursor-pointer transition-colors",
                                    isLocationSelected
                                      ? "bg-coral-100 border-coral-300"
                                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                  )}
                                  onClick={() => {
                                    if (onBookingOptionSelect) {
                                      onBookingOptionSelect(option, location);
                                    } else {
                                      onPickupLocationSelect(location);
                                    }
                                  }}
                                >
                                  <div className="flex items-start gap-2">
                                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm">
                                        {location.locationName}
                                      </div>
                                      {formatAddress(location.address) && (
                                        <div className="text-xs text-muted-foreground break-words">
                                          {formatAddress(location.address)}
                                        </div>
                                      )}
                                      {getPickupTimeForLocation(location) && (
                                        <div className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>
                                            Pickup: {getPickupTimeForLocation(location) || formatPickupTime(location.minutesPrior)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    {showDirections && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-1 text-blue-600 hover:text-blue-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(
                                            getDirectionsUrl(location),
                                            "_blank"
                                          );
                                        }}
                                      >
                                        <Navigation className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* Included services */}
                  {option.includedServices &&
                    option.includedServices.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <h6 className="text-sm font-medium text-gray-700 mb-2">
                          Included Services
                        </h6>
                        <div className="flex flex-wrap gap-1">
                          {option.includedServices.map((service, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {required && !selectedBookingOption && (
          <p className="text-sm text-red-600 mt-2">
            Please select a booking option to continue
          </p>
        )}
      </div>
    );
  }

  // Render simple pickup locations interface (fallback)
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Label className="text-base font-medium">
          Pickup Location
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Badge variant="secondary" className="text-xs">
          {pickupLocations!.length} location
          {pickupLocations!.length > 1 ? "s" : ""} available
        </Badge>
      </div>

      <div className="space-y-2">
        {pickupLocations!.map((location) => {
          const locationId = getLocationId(location);
          const isSelected = selectedLocationId === locationId;
          
          return (
            <Card
              key={locationId}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected
                  ? "ring-2 ring-coral-500 bg-coral-50 border-coral-200"
                  : "hover:bg-gray-50 border-gray-200"
              )}
              onClick={() => onPickupLocationSelect(location)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                      isSelected
                        ? "border-coral-500 bg-coral-500"
                        : "border-gray-300 bg-white"
                    )}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">
                      {location.locationName}
                    </div>

                    {formatAddress(location.address) && (
                      <div className="text-sm text-gray-600 mt-1 flex items-start gap-1">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="break-words">
                          {formatAddress(location.address)}
                        </span>
                      </div>
                    )}

                    {getPickupTimeForLocation(location) && (
                      <div className="text-sm text-yellow-700 font-medium mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Pickup: {getPickupTimeForLocation(location) || formatPickupTime(location.minutesPrior)}</span>
                      </div>
                    )}
                    
                    {/* {location.additionalInstructions && (
                      <div className="text-sm text-blue-700 mt-2 p-2 bg-blue-50 rounded">
                        {location.additionalInstructions}
                      </div>
                    )} */}

                    {showDirections && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 mt-2 text-blue-600 hover:text-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(getDirectionsUrl(location), "_blank");
                        }}
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Get Directions
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {required && !selectedPickupLocation && (
        <p className="text-sm text-red-600 mt-2">
          Please select a pickup location to continue
        </p>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const PickupLocationSelector = React.memo(PickupLocationSelectorComponent);
