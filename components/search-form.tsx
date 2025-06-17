"use client";

/**
 * Enhanced Search Form with Rezdy Data Management Integration
 *
 * This component provides a simplified search interface with three main inputs:
 * - Participants: Number of people for the tour
 * - Tour Date: When the tour should take place
 * - Pick up Location: Where participants will be picked up
 *
 * Rezdy Integration Features:
 * - Real-time data fetching from Rezdy API with caching
 * - Data validation and cleaning pipeline
 * - Product segmentation and filtering
 * - Quality metrics and error handling
 * - Smart cache invalidation and refresh capabilities
 * - Dynamic location extraction from product data
 *
 * The form integrates with the comprehensive data management system
 * documented in DATA_MANAGEMENT_IMPLEMENTATION.md and follows the
 * strategies outlined in REZDY_DATA_MANAGEMENT_STRATEGIES.md
 */

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDays, format } from "date-fns";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useBookingPrompt } from "@/hooks/use-booking-prompt";
import { useCityProducts } from "@/hooks/use-city-products";
import { useRezdyDataManager } from "@/hooks/use-rezdy-data-manager";

// Static pickup locations (fallback)
const STATIC_PICKUP_LOCATIONS = [
  "Brisbane",
  "Broadbeach",
  "Currumbin wildlife sanctuary",
  "Gold Coast",
  "Miami",
  "Mount Nathan",
  "Mount Tamborine",
  "Surfers Paradise",
];

interface SearchFormProps {
  onSearch?: (searchData: any) => void;
  showRedirect?: boolean;
  onLocationChange?: (location: string, products: any[]) => void;
  onCityChange?: (city: string, cityProducts: any[]) => void;
}

export function SearchForm({
  onSearch,
  showRedirect = true,
  onLocationChange,
}: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { promptData } = useBookingPrompt();
  const { cities, loading: citiesLoading } = useCityProducts();

  // Rezdy data management integration
  const {
    data: rezdyData,
    isLoading: rezdyLoading,
    error: rezdyError,
    refreshData,
  } = useRezdyDataManager({
    enableCaching: true,
    enableValidation: true,
    enableSegmentation: false, // We're doing our own filtering
    autoRefresh: false,
  });

  // Extract unique pickup locations from Rezdy products with tour counts
  const pickupLocations = useMemo(() => {
    const locationCounts = new Map<string, number>();

    // Add static locations
    STATIC_PICKUP_LOCATIONS.forEach((location) => {
      if (!locationCounts.has(location)) {
        locationCounts.set(location, 0);
      }
    });

    // Add locations from Rezdy products and count tours
    rezdyData.products.forEach((product) => {
      let locationName = "";

      if (product.locationAddress) {
        if (typeof product.locationAddress === "string") {
          locationName = product.locationAddress;
        } else if (product.locationAddress.city) {
          locationName = product.locationAddress.city;
        }
      }

      if (locationName) {
        // Normalize Tamborine variations to "Mount Tamborine"
        if (locationName.toLowerCase().includes("tamborine")) {
          locationName = "Mount Tamborine";
        }

        locationCounts.set(
          locationName,
          (locationCounts.get(locationName) || 0) + 1
        );
      }
    });

    return Array.from(locationCounts.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => a.location.localeCompare(b.location));
  }, [rezdyData.products]);

  // Form state for simplified search
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [tourDate, setTourDate] = useState<Date | undefined>();
  const [participants, setParticipants] = useState("2");

  // Initialize form with URL parameters or booking prompt data
  useEffect(() => {
    // Check URL parameters first (these take priority)
    const urlParticipants = searchParams.get("participants");
    const urlTourDate = searchParams.get("tourDate");
    const urlLocation = searchParams.get("location");

    // Handle participants parameter
    if (urlParticipants) {
      setParticipants(urlParticipants);
    } else if (promptData?.groupSize) {
      setParticipants(promptData.groupSize.toString());
    }

    // Handle tour date parameter
    if (urlTourDate) {
      setTourDate(new Date(urlTourDate));
    } else if (promptData?.bookingDate) {
      setTourDate(promptData.bookingDate);
    }

    // Handle location parameter
    if (urlLocation) {
      setSelectedLocation(urlLocation);
    }
  }, [searchParams, promptData]);

  // Handle location selection change
  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
  };

  // Filter products based on selected location
  const currentLocationProducts = useMemo(() => {
    if (selectedLocation === "all") {
      return rezdyData.products;
    }

    return rezdyData.products.filter((product) => {
      if (product.locationAddress) {
        let productLocation = "";
        if (typeof product.locationAddress === "string") {
          productLocation = product.locationAddress;
        } else if (product.locationAddress.city) {
          productLocation = product.locationAddress.city;
        }

        // Handle Tamborine variations
        if (
          selectedLocation === "Mount Tamborine" &&
          productLocation.toLowerCase().includes("tamborine")
        ) {
          return true;
        }

        return productLocation
          .toLowerCase()
          .includes(selectedLocation.toLowerCase());
      }
      return false;
    });
  }, [selectedLocation, rezdyData.products]);

  // Notify parent component when location changes
  useEffect(() => {
    if (onLocationChange) {
      onLocationChange(selectedLocation, currentLocationProducts);
    }
  }, [selectedLocation, currentLocationProducts, onLocationChange]);

  const handleToursSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const searchData = {
      participants: participants,
      tourDate: tourDate ? format(tourDate, "yyyy-MM-dd") : "",
      location: selectedLocation === "all" ? "" : selectedLocation,
      pickupLocation: selectedLocation === "all" ? "" : selectedLocation,
      searchType: "tours",
      // Additional Rezdy-specific parameters
      productType: "tour",
      availability: "available",
      sortBy: "relevance",
      // Include filtered products from Rezdy data
      products: currentLocationProducts,
      totalProducts: rezdyData.products.length,
      dataQuality: rezdyError ? "error" : "good",
    };

    if (onSearch) {
      onSearch(searchData);
    } else if (showRedirect) {
      // Redirect to search results page
      const params = new URLSearchParams();

      // Include all parameters if they have values
      if (participants) params.append("participants", participants);
      if (selectedLocation && selectedLocation !== "all")
        params.append("location", selectedLocation);
      if (tourDate) params.append("tourDate", format(tourDate, "yyyy-MM-dd"));

      router.push(`/tours?${params.toString()}`);
    }
  };

  // Check if form was pre-populated from booking prompt
  const isPrePopulated =
    promptData && (promptData.groupSize > 0 || promptData.bookingDate);

  // Check if date is selected for enhanced UI feedback
  const hasDateSelected = tourDate;
  const dateText = hasDateSelected ? format(tourDate!, "MMM dd, yyyy") : null;

  return (
    <div className="w-full bg-white/60 rounded-xl shadow-xl border-0">
      <div className="p-4 sm:p-5">
        <div className="mb-4 sm:mb-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-primary text-[24px] leading-[36px] font-semibold text-gray-900">
              {isPrePopulated ? "Complete Your Booking" : "Find a Tour"}
            </h2>
            {rezdyError && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshData()}
                disabled={rezdyLoading}
                className="text-xs"
              >
                <RefreshCw
                  className={`w-3 h-3 mr-1 ${
                    rezdyLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh Data
              </Button>
            )}
          </div>
          <p className="font-text text-xs sm:text-sm text-gray-600 leading-relaxed">
            {isPrePopulated
              ? "We've pre-filled your preferences. Adjust as needed and search for available tours."
              : "Search for tours by selecting participants, date, and pickup location"}
            {hasDateSelected && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
                <CalendarDays className="w-3 h-3 mr-1" />
                <span>{dateText}</span>
              </span>
            )}

            {rezdyError && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                Data sync issue
              </span>
            )}
          </p>
        </div>

        <form onSubmit={handleToursSearch}>
          {/* Search Inputs - Single column layout for better UX */}
          <div className="space-y-4 mb-6">
            {/* Participants */}
            <div className="space-y-2 text-start">
              <Label
                htmlFor="participants"
                className="font-text text-sm font-medium text-gray-700"
              >
                Participants
              </Label>
              <div className="relative">
                <Select value={participants} onValueChange={setParticipants}>
                  <SelectTrigger
                    id="participants"
                    className={`h-12 border-gray-300 text-sm focus:border-coral-500 focus:ring-coral-500 ${
                      isPrePopulated && promptData?.groupSize
                        ? "ring-2 ring-coral-200 bg-coral-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select participants" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "Participant" : "Participants"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tour Date */}
            <div className="space-y-2 text-start">
              <Label
                htmlFor="tour-date"
                className="font-text text-sm font-medium text-gray-700"
              >
                Tour Date
              </Label>
              <div className="relative">
                <DatePicker
                  id="tour-date"
                  date={tourDate}
                  onDateChange={setTourDate}
                  placeholder="Select tour date"
                  minDate={new Date()}
                  maxDate={addDays(new Date(), 365)}
                  className={`h-12 border-gray-300 text-sm focus:border-coral-500 focus:ring-coral-500 ${
                    tourDate ? "border-coral-300 bg-coral-50" : ""
                  } ${
                    isPrePopulated && tourDate ? "ring-2 ring-coral-200" : ""
                  }`}
                />
              </div>
            </div>

            {/* Pick up Location */}
            <div className="space-y-2 text-start">
              <Label
                htmlFor="pickup-location"
                className="font-text text-sm font-medium text-gray-700"
              >
                Pick up Location
              </Label>
              <div className="relative">
                <Select
                  value={selectedLocation}
                  onValueChange={handleLocationChange}
                  disabled={citiesLoading || rezdyLoading}
                >
                  <SelectTrigger
                    id="pickup-location"
                    className="h-12 border-gray-300 text-sm focus:border-coral-500 focus:ring-coral-500"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <SelectValue
                        placeholder={
                          citiesLoading || rezdyLoading
                            ? "Loading..."
                            : "Select pickup location"
                        }
                      />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {pickupLocations.map(({ location, count }) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Search Button - Full width at bottom */}
          <Button
            type="submit"
            className={`w-full h-12 font-medium text-base transition-all duration-200 shadow-md hover:shadow-lg bg-brand-accent text-brand-secondary hover:bg-brand-accent/90 ${
              isPrePopulated ? "ring-2 ring-brand-accent/20" : ""
            }`}
          >
            <Search className="mr-2 h-4 w-4" />
            {isPrePopulated
              ? "Find My Tours"
              : hasDateSelected
              ? "Search Available Tours"
              : "Search Tours"}
          </Button>
        </form>
      </div>
    </div>
  );
}
