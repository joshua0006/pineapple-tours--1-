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
  Info,
  Clock,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useBookingPrompt } from "@/hooks/use-booking-prompt";
import { useCityProducts } from "@/hooks/use-city-products";
import { useRezdyDataManager } from "@/hooks/use-rezdy-data-manager";
import { usePickupLocations } from "@/hooks/use-pickup-locations";
import { PickupLocationService } from "@/lib/services/pickup-location-service";
import { UnifiedPickupFilter } from "@/lib/services/unified-pickup-filter";
import { getPickupScheduleDisplay } from "@/lib/utils/pickup-location-utils";

// Enhanced pickup locations with detailed schedule information
const ENHANCED_PICKUP_LOCATIONS = [
  {
    value: "Brisbane",
    label: "Brisbane",
    description: "Hotel pickups from city center",
    schedule: "8:45am - 9:10am",
    stops: ["Marriott", "Royal on the Park", "Emporium Southbank"]
  },
  {
    value: "Gold Coast", 
    label: "Gold Coast",
    description: "Hotel pickups from main precincts",
    schedule: "8:45am - 9:15am",
    stops: ["Star Casino", "Voco", "JW Marriott", "Sheraton Grand Mirage"]
  },
  {
    value: "Brisbane Loop",
    label: "Brisbane City Loop",
    description: "Multiple city stops",
    schedule: "8:00am - 8:30am",
    stops: ["Southbank", "Petrie Terrace", "Anzac Square", "Howard Smith Wharves", "Kangaroo Point"]
  }
];

// Static pickup locations (fallback)
const STATIC_PICKUP_LOCATIONS = ["Brisbane", "Gold Coast", "Brisbane Loop"];

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

  // Enhanced pickup locations with API data
  const {
    locations: apiPickupLocations,
    stats: pickupStats,
    isLoading: pickupLoading,
    error: pickupError,
    refreshLocations,
    filterProducts,
    preloadData,
  } = usePickupLocations({
    useApiData: true,
    autoRefresh: false,
    preloadOnMount: true, // Enable automatic preloading
  });

  // Use enhanced pickup locations with fallback to static locations
  const pickupLocations = useMemo(() => {
    if (apiPickupLocations.length > 0) {
      return apiPickupLocations.map((location) => ({
        location: location.location,
        count: location.productCount,
        hasApiData: location.hasApiData,
      }));
    }
    
    // Fallback to static locations
    return STATIC_PICKUP_LOCATIONS.map((location) => ({ 
      location, 
      count: 0, 
      hasApiData: false 
    }));
  }, [apiPickupLocations]);

  // Form state for simplified search
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [tourDate, setTourDate] = useState<Date | undefined>();
  const [participants, setParticipants] = useState("2");
  
  // State for filtered products
  const [filteredProducts, setFilteredProducts] = useState(rezdyData.products);
  const [isFiltering, setIsFiltering] = useState(false);

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

  // Handle location selection change with API-based filtering for browser context
  const handleLocationChange = async (location: string) => {
    setSelectedLocation(location);
    setIsFiltering(true);

    try {
      // Use API endpoint for server-side filtering to avoid Node.js fs operations in browser
      const response = await fetch('/api/pickup-filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: rezdyData.products,
          location,
          options: {
            forceLocalData: true,
            useApiData: false,
            enableFallback: true,
            cacheResults: true,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      setFilteredProducts(result.filteredProducts);
      
      console.log('Search form API filtering:', {
        location,
        ...result.filterStats,
        products: result.filteredProducts.length,
        dataSource: result.filterStats.dataSource
      });

    } catch (error) {
      console.error('Unified filtering failed, using fallback:', error);
      
      // Emergency fallback to text-based filtering
      if (location === "all") {
        setFilteredProducts(rezdyData.products);
      } else {
        const fallbackProducts = PickupLocationService.filterProductsByPickupLocation(
          rezdyData.products,
          location
        );
        setFilteredProducts(fallbackProducts);
      }
    } finally {
      setIsFiltering(false);
    }
  };

  // Current location products (for backward compatibility)
  const currentLocationProducts = filteredProducts;

  // Initialize filtered products when Rezdy data changes
  useEffect(() => {
    if (selectedLocation === "all") {
      setFilteredProducts(rezdyData.products);
    }
  }, [rezdyData.products, selectedLocation]);

  // Preload pickup data when component mounts or Rezdy data is ready
  useEffect(() => {
    if (rezdyData.products.length > 0 && preloadData) {
      const productCodes = rezdyData.products.map(p => p.productCode);
      preloadData(productCodes).catch(console.warn);
    }
  }, [rezdyData.products, preloadData]);

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
      filteredCount: currentLocationProducts.length,
      dataQuality: rezdyError || pickupError ? "error" : (pickupStats?.dataQuality || "good"),
      filteringMethod: apiPickupLocations.length > 0 ? "enhanced" : "text_based",
    };

    if (onSearch) {
      onSearch(searchData);
    } else if (showRedirect) {
      // Redirect to search results page
      const params = new URLSearchParams();

      // Include all parameters if they have values - SYNCHRONIZED with tours page
      if (participants) params.append("participants", participants);
      if (selectedLocation && selectedLocation !== "all") {
        // Use pickupLocation for consistency with tours page
        params.append("pickupLocation", selectedLocation);
        // Also include location for backward compatibility
        params.append("location", selectedLocation);
      }
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
            {(rezdyError || pickupError) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refreshData();
                  refreshLocations();
                }}
                disabled={rezdyLoading || pickupLoading}
                className="text-xs"
              >
                <RefreshCw
                  className={`w-3 h-3 mr-1 ${
                    rezdyLoading || pickupLoading ? "animate-spin" : ""
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

            {(rezdyError || pickupError) && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                Data sync issue
              </span>
            )}

            {pickupStats && pickupStats.dataQuality === 'enhanced' && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                Enhanced filtering active
              </span>
            )}

            {/* Show product count summary */}
            {filteredProducts.length !== rezdyData.products.length && selectedLocation !== "all" && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                {filteredProducts.length} tours available
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
                className="font-text text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                Pick up Location
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-sm">
                      <div className="space-y-2">
                        <p className="font-medium">Pickup Schedules:</p>
                        {ENHANCED_PICKUP_LOCATIONS.map((location) => (
                          <div key={location.value} className="text-xs">
                            <span className="font-medium">{location.label}:</span> {location.schedule}
                            <br />
                            <span className="text-muted-foreground">{location.stops.join(", ")}</span>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="relative">
                <Select
                  value={selectedLocation}
                  onValueChange={handleLocationChange}
                >
                  <SelectTrigger
                    id="pickup-location"
                    className="h-12 border-gray-300 text-sm focus:border-coral-500 focus:ring-coral-500"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <SelectValue
                        placeholder={
                          citiesLoading || rezdyLoading || pickupLoading || isFiltering
                            ? "Loading..."
                            : "Select pickup location"
                        }
                      />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Locations
                    </SelectItem>
                    
                    {/* Enhanced pickup locations with clean labels */}
                    {ENHANCED_PICKUP_LOCATIONS.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                    
                    {/* Fallback locations from API if they don't match enhanced ones */}
                    {pickupLocations
                      .filter(({ location }) => !ENHANCED_PICKUP_LOCATIONS.some(enhanced => enhanced.value === location))
                      .map(({ location, count, hasApiData }) => (
                        <SelectItem key={location} value={location}>
                          <div className="flex items-center justify-between w-full">
                            <span>{location}</span>
                            {count > 0 && (
                              <div className="flex items-center gap-1 ml-2">
                                <span className="text-xs text-muted-foreground">({count})</span>
                                {hasApiData && (
                                  <span className="text-xs text-green-600">✓</span>
                                )}
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Show pickup schedule details when a location is selected */}
              {selectedLocation && selectedLocation !== "all" && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs">
                  {(() => {
                    const scheduleData = getPickupScheduleDisplay(selectedLocation);
                    if (scheduleData) {
                      return (
                        <div>
                          <div className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {scheduleData.title}
                          </div>
                          <div className="space-y-1">
                            {scheduleData.schedule.slice(0, 3).map((stop, index) => (
                              <div key={index} className="flex justify-between items-start">
                                <span className="font-medium text-coral-600">{stop.time}</span>
                                <span className="text-gray-600 text-right flex-1 ml-2">
                                  {stop.location}
                                  {stop.address && (
                                    <div className="text-gray-500 font-normal">
                                      {stop.address.length > 30 ? `${stop.address.substring(0, 30)}...` : stop.address}
                                    </div>
                                  )}
                                </span>
                              </div>
                            ))}
                            {scheduleData.schedule.length > 3 && (
                              <div className="text-gray-500 text-center pt-1">
                                +{scheduleData.schedule.length - 3} more stops
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="text-gray-600">
                        Pickup location selected: {selectedLocation}
                      </div>
                    );
                  })()}
                </div>
              )}
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
