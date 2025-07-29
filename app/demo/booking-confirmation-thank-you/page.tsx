"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Sparkles, ShoppingBag, Star, MapPin, ArrowRight, Clock, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RezdyExtra } from "@/lib/types/rezdy";
import { formatCurrency } from "@/lib/utils/pricing-utils";
import { useGuestDetails, encodeGuestDetailsForUrl } from "@/hooks/use-guest-details";
import Image from "next/image";

interface BookingDetails {
  orderNumber: string;
  transactionId: string;
  productName: string;
  date: string;
  time: string;
  guests: number;
  pickupLocation?: string;
  totalAmount: number;
  customerEmail: string;
  status: string;
}

// Mock booking details for demo
const mockBookingDetails: BookingDetails = {
  orderNumber: "RZD-2024-001234",
  transactionId: "TXN-STRIPE-789456",
  productName: "Gold Coast Glowworm Caves & Skywalk Adventure",
  date: "2024-02-15",
  time: "09:00 AM - 05:00 PM",
  guests: 4,
  pickupLocation: "Surfers Paradise Hotel",
  totalAmount: 596,
  customerEmail: "demo@example.com",
  status: "CONFIRMED",
};

// Mock warning for demo
const mockWarning = "Please arrive 15 minutes early for check-in. Weather conditions may affect some activities.";
const mockBookingId = "BOOKING-REF-789123";

interface MarketplaceAddonsResponse {
  addons: RezdyExtra[];
  totalCount: number;
  cached: boolean;
  region: string;
  lastUpdated: string;
  fetchStats?: {
    totalProducts: number;
    filteredAddons: number;
    fetchTime: string;
  };
}

export default function BookingConfirmationThankYouDemo() {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showMarketplaceAddons, setShowMarketplaceAddons] = useState(true);
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [extras, setExtras] = useState<RezdyExtra[]>([]);
  const [extrasLoading, setExtrasLoading] = useState(true);
  const [extrasError, setExtrasError] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<{[key: string]: number}>({});
  const [searchTerm, setSearchTerm] = useState<string>('skywalk');
  
  // Initialize guest details hook for prefill functionality
  const { storedDetails, hasStoredDetails } = useGuestDetails();
  
  // Demo search terms for testing
  const demoSearchTerms = ['skywalk', 'caves', 'glowworm', 'scenic', 'wildlife', 'adventure'];

  // Extract region from booked tour for targeted add-ons (same logic as MarketplaceAddonsSection)
  const extractRegionFromTour = (tourName: string): string => {
    const tourLower = tourName.toLowerCase();
    if (tourLower.includes('gold coast')) return 'gold coast';
    if (tourLower.includes('brisbane')) return 'brisbane';
    if (tourLower.includes('cairns')) return 'cairns';
    if (tourLower.includes('sydney')) return 'sydney';
    if (tourLower.includes('melbourne')) return 'melbourne';
    if (tourLower.includes('byron')) return 'byron bay';
    if (tourLower.includes('sunshine coast')) return 'sunshine coast';
    return 'all'; // Default to all regions
  };

  // Extract search term from booked tour for targeted add-ons
  const extractSearchTermFromTour = (tourName: string): string => {
    const tourLower = tourName.toLowerCase();
    if (tourLower.includes('skywalk')) return 'skywalk';
    if (tourLower.includes('glowworm') || tourLower.includes('glow worm')) return 'glowworm';
    if (tourLower.includes('cave')) return 'caves';
    if (tourLower.includes('scenic') || tourLower.includes('lookout')) return 'scenic';
    if (tourLower.includes('wildlife') || tourLower.includes('animal')) return 'wildlife';
    if (tourLower.includes('adventure') || tourLower.includes('extreme')) return 'adventure';
    return 'skywalk'; // Default to skywalk
  };

  // Simulate the original's data fetching behavior
  useEffect(() => {
    const simulateDataFetch = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, simulateLoading ? 2000 : 500));
      
      setBookingDetails(mockBookingDetails);
      // Set search term based on the mock booking
      setSearchTerm(extractSearchTermFromTour(mockBookingDetails.productName));
      setLoading(false);
    };

    simulateDataFetch();
  }, [simulateLoading]);

  // Fetch real marketplace extras
  useEffect(() => {
    const fetchMarketplaceExtras = async () => {
      if (!bookingDetails) return;

      try {
        setExtrasLoading(true);
        setExtrasError(null);
        
        // Add demo delay for loading states
        if (simulateLoading) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        const region = extractRegionFromTour(bookingDetails.productName);
        const response = await fetch(`/api/rezdy/marketplace/addons?search=${encodeURIComponent(searchTerm)}&region=${encodeURIComponent(region)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch marketplace add-ons');
        }
        
        const data: MarketplaceAddonsResponse = await response.json();
        setExtras(data.addons || []);
        console.log(`✅ Loaded ${data.addons?.length || 0} marketplace add-ons for search: "${searchTerm}" in region: ${region}`);
      } catch (err) {
        console.error('Error fetching marketplace add-ons:', err);
        setExtrasError(err instanceof Error ? err.message : 'Unknown error');
        // Fallback to empty array on error
        setExtras([]);
      } finally {
        setExtrasLoading(false);
      }
    };

    fetchMarketplaceExtras();
  }, [bookingDetails, simulateLoading, searchTerm]);

  const handleDownloadConfirmation = () => {
    window.print();
  };

  const handleShareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: "Booking Confirmation",
        text: `My tour booking is confirmed! Order: ${mockBookingDetails.orderNumber}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedField("link");
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPriceDisplayText = (extra: RezdyExtra): string => {
    switch (extra.priceType) {
      case "PER_PERSON":
        return `${formatCurrency(extra.price)} per person`;
      case "PER_BOOKING":
        return `${formatCurrency(extra.price)} per booking`;
      case "PER_DAY":
        return `${formatCurrency(extra.price)} per day`;
      default:
        return formatCurrency(extra.price);
    }
  };

  const calculateExtraPrice = (extra: RezdyExtra): number => {
    const guestCount = bookingDetails?.guests || 2;
    switch (extra.priceType) {
      case "PER_PERSON":
        return extra.price * guestCount;
      case "PER_BOOKING":
      case "PER_DAY":
      default:
        return extra.price;
    }
  };

  const handleToggleExtra = (extraId: string) => {
    setSelectedExtras(prev => ({
      ...prev,
      [extraId]: prev[extraId] ? 0 : 1
    }));
  };

  const getTotalSelectedPrice = (): number => {
    return Object.entries(selectedExtras).reduce((total, [extraId, quantity]) => {
      if (quantity === 0) return total;
      const extra = extras.find(e => e.id === extraId);
      return extra ? total + calculateExtraPrice(extra) : total;
    }, 0);
  };

  const getSelectedExtrasCount = (): number => {
    return Object.values(selectedExtras).filter(qty => qty > 0).length;
  };

  // Handle booking with prefilled guest details
  const handleCompleteBookingWithPrefill = (extra: RezdyExtra) => {
    // Check if we have stored guest details for prefill
    if (hasStoredDetails && storedDetails) {
      try {
        // Encode guest details for URL
        const encodedDetails = encodeGuestDetailsForUrl(storedDetails);
        
        // Navigate to booking page with prefill parameters
        const bookingUrl = `/booking/${extra.productCode}?prefill=true&guestDetails=${encodedDetails}`;
        
        console.log('🚀 Navigating to add-on booking with prefill:', {
          productCode: extra.productCode,
          hasGuestDetails: true,
          encodedLength: encodedDetails.length,
        });
        
        window.location.href = bookingUrl;
      } catch (error) {
        console.error('Failed to encode guest details:', error);
        // Fallback to regular booking without prefill
        window.location.href = `/booking/${extra.productCode}`;
      }
    } else {
      // No stored details, proceed with regular booking
      window.location.href = `/booking/${extra.productCode}`;
    }
  };

  // Handle complete booking for all selected extras
  const handleCompleteAllSelectedBookings = () => {
    const selectedExtraIds = Object.entries(selectedExtras)
      .filter(([_, quantity]) => quantity > 0)
      .map(([extraId]) => extraId);
    
    if (selectedExtraIds.length === 0) {
      console.warn('No extras selected for booking');
      return;
    }
    
    // For demo purposes, book the first selected extra with prefill
    const firstSelectedExtra = extras.find(e => selectedExtraIds.includes(e.id));
    if (firstSelectedExtra) {
      handleCompleteBookingWithPrefill(firstSelectedExtra);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-coral-50 flex items-center justify-center p-4">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="animate-spin rounded-full h-16 w-16 border-4 border-brand-accent border-t-transparent mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600 text-lg">Loading your booking confirmation...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your adventure details 🌟</p>
        </motion.div>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-coral-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="max-w-md w-full bg-white/80 backdrop-blur-sm shadow-xl">
            <CardContent className="pt-6 text-center">
              <motion.div 
                className="text-red-500 mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <AlertCircle className="h-12 w-12 mx-auto" />
              </motion.div>
              <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
              <p className="text-gray-600 mb-4">
                {error ||
                  "We could not find your booking confirmation. Please check your email or contact support."}
              </p>
              <Button 
                onClick={() => (window.location.href = "/")}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white"
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-coral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Demo Controls Header */}
        <motion.div 
          className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-1">
                Demo: Enhanced Booking Confirmation with Real Marketplace Search Data
              </h2>
              <p className="text-sm text-blue-700">
                This demo displays real marketplace add-ons from the Rezdy API using search parameters with enhanced card design
              </p>
              {bookingDetails && (
                <div className="text-xs text-blue-600 mt-1 space-y-1">
                  <p>
                    Search term: <span className="font-medium">"{searchTerm}"</span> | 
                    Region: <span className="font-medium">{extractRegionFromTour(bookingDetails.productName)}</span>
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentIndex = demoSearchTerms.indexOf(searchTerm);
                  const nextIndex = (currentIndex + 1) % demoSearchTerms.length;
                  setSearchTerm(demoSearchTerms[nextIndex]);
                }}
                className="flex items-center gap-2"
              >
                🔍 Search: {searchTerm}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSimulateLoading(!simulateLoading)}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {simulateLoading ? "Fast" : "Slow"} Loading
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMarketplaceAddons(!showMarketplaceAddons)}
                className="flex items-center gap-2"
              >
                {showMarketplaceAddons ? "Hide" : "Show"} Add-ons
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Success Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            🎉 Congratulations! Your adventure awaits. We've sent your booking confirmation to your email.
          </p>
        </motion.div>

        {/* Warning Message (Demo Version) */}
        <motion.div 
          className="mt-6 mb-8 mx-auto max-w-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium mb-1">Important Note:</p>
                  <p className="text-yellow-700">{mockWarning}</p>
                  <p className="text-yellow-700 mt-2">
                    <span className="font-medium">Reference Number:</span> {mockBookingId}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Extras Section */}
        {showMarketplaceAddons && bookingDetails && (extrasLoading || extras.length > 0 || extrasError) && (
          <motion.div 
            className="mt-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-blue-200 shadow-lg">
              <CardHeader className="pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                >
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-3 bg-gradient-to-br from-brand-accent to-purple-500 rounded-xl">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                        Enhance Your Adventure
                      </span>
                      <Badge variant="secondary" className="ml-3 text-xs">
                        {getSelectedExtrasCount()} Selected
                      </Badge>
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Searching for \"{searchTerm}\" experiences {bookingDetails ? `in ${extractRegionFromTour(bookingDetails.productName) === 'all' ? 'your area' : extractRegionFromTour(bookingDetails.productName)}` : 'for your destination'}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-3">
                    🌟 Perfect extras to complete your adventure! These \"{searchTerm}\" experiences 
                    are specially curated using Rezdy's marketplace search API.
                  </p>
                </motion.div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {extrasLoading ? (
                  <motion.div 
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="animate-pulse">
                          <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                          <div className="bg-gray-200 rounded h-4 mb-2"></div>
                          <div className="bg-gray-200 rounded h-3 w-3/4 mb-3"></div>
                          <div className="bg-gray-200 rounded h-8"></div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : extrasError ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-red-800 mb-2">
                        Unable to Load Add-ons
                      </h3>
                      <p className="text-red-700 text-sm mb-4">
                        We're having trouble loading available extras right now. Please try again later.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.reload()}
                        className="text-red-700 border-red-300 hover:bg-red-50"
                      >
                        Try Again
                      </Button>
                    </div>
                  </motion.div>
                ) : extras.length === 0 ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                      <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        No Add-ons Available
                      </h3>
                      <p className="text-blue-700 text-sm">
                        We don't have any additional experiences available for your destination right now. 
                        Check back later for new offerings!
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                  >
                    {extras.map((extra, index) => {
                      const isSelected = selectedExtras[extra.id] > 0;
                      const totalPrice = calculateExtraPrice(extra);
                      
                      return (
                        <motion.div
                          key={extra.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.5, 
                            delay: 1.8 + (index * 0.1),
                            ease: "easeOut"
                          }}
                          whileHover={{ 
                            y: -8,
                            transition: { duration: 0.2 }
                          }}
                          className="group"
                        >
                          <Card 
                            className={`h-full cursor-pointer transition-all duration-300 overflow-hidden ${
                              isSelected 
                                ? "ring-2 ring-brand-accent bg-brand-accent/5 border-brand-accent/30 shadow-lg" 
                                : "hover:shadow-xl hover:border-brand-accent/20 border-gray-200"
                            }`}
                            onClick={() => handleToggleExtra(extra.id)}
                          >
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden bg-gray-100">
                              {extra.image ? (
                                <Image
                                  src={extra.image.mediumSizeUrl || extra.image.itemUrl || "/placeholder.svg"}
                                  alt={extra.image.caption || extra.name}
                                  fill
                                  className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
                                    isSelected ? "scale-105" : ""
                                  }`}
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                  <div className="text-center">
                                    <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                                    <span className="text-sm text-gray-500 font-medium">{extra.category || 'Add-on'}</span>
                                  </div>
                                </div>
                              )}
                              
                              {/* Category Badge */}
                              <div className="absolute top-3 left-3">
                                <Badge 
                                  variant="secondary" 
                                  className="bg-white/90 text-gray-700 backdrop-blur-sm flex items-center gap-1"
                                >
                                  <Tag className="h-3 w-3" />
                                  {extra.category}
                                </Badge>
                              </div>
                              
                              {/* Selection Badge */}
                              {isSelected && (
                                <motion.div 
                                  className="absolute top-3 right-3"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 200 }}
                                >
                                  <Badge className="bg-brand-accent text-white">
                                    ✓ Added
                                  </Badge>
                                </motion.div>
                              )}
                              
                              {/* Gradient Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            
                            <CardContent className="p-5 space-y-4">
                              {/* Title and Description */}
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                                  {extra.name}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                  {extra.description}
                                </p>
                              </div>
                              
                              {/* Pricing */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">Base Price</span>
                                  <span className="text-sm font-medium text-gray-700">
                                    {getPriceDisplayText(extra)}
                                  </span>
                                </div>
                                
                                {extra.priceType === "PER_PERSON" && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                      For {bookingDetails?.guests || 2} guests
                                    </span>
                                    <span className="text-lg font-bold text-brand-accent">
                                      {formatCurrency(totalPrice)}
                                    </span>
                                  </div>
                                )}
                                
                                {extra.priceType !== "PER_PERSON" && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Total Price</span>
                                    <span className="text-lg font-bold text-brand-accent">
                                      {formatCurrency(totalPrice)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action Button */}
                              <div className="flex gap-2">
                                <Button 
                                  className={`flex-1 transition-all duration-200 ${
                                    isSelected
                                      ? "bg-brand-accent/90 hover:bg-brand-accent text-white"
                                      : "bg-white border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleExtra(extra.id);
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    <span>
                                      {isSelected ? "Remove" : "Select"}
                                    </span>
                                  </div>
                                </Button>
                                
                                <Button
                                  className="bg-gradient-to-r from-brand-accent to-purple-500 hover:from-brand-accent/90 hover:to-purple-500/90 text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCompleteBookingWithPrefill(extra);
                                  }}
                                  title={hasStoredDetails ? "Book now with your saved details" : "Book now"}
                                >
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
                
                {/* Selected Extras Summary */}
                {getSelectedExtrasCount() > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-lg p-6 border border-brand-accent/20 shadow-sm mt-8"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-brand-accent" />
                        <span className="font-semibold text-lg">Selected Extras</span>
                        <Badge variant="outline" className="bg-brand-accent text-white">
                          {getSelectedExtrasCount()}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total Additional Cost</div>
                        <div className="text-2xl font-bold text-brand-accent">
                          {formatCurrency(getTotalSelectedPrice())}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      {Object.entries(selectedExtras)
                        .filter(([_, quantity]) => quantity > 0)
                        .map(([extraId]) => {
                          const extra = extras.find(e => e.id === extraId);
                          if (!extra) return null;
                          
                          return (
                            <div key={extraId} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">{extra.name}</span>
                              <span className="font-medium">
                                {formatCurrency(calculateExtraPrice(extra))}
                              </span>
                            </div>
                          );
                        })}
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-brand-accent to-purple-500 hover:from-brand-accent/90 hover:to-purple-500/90 text-white font-semibold py-3 text-lg"
                      onClick={handleCompleteAllSelectedBookings}
                      title={hasStoredDetails ? "Book selected extras with your saved details" : "Book selected extras"}
                    >
                      <div className="flex items-center gap-2">
                        <span>Complete Booking • {formatCurrency(getTotalSelectedPrice())}</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </Button>

                    <p className="text-xs text-gray-500 mt-3 text-center flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" />
                      Confirmation will be sent to {bookingDetails.customerEmail}
                    </p>
                  </motion.div>
                )}
                
                {/* Information Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 2.0 }}
                  className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-6"
                >
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Why book extras now?</p>
                      <ul className="text-blue-700 space-y-1 text-xs">
                        <li>• Exclusive experiences not available elsewhere</li>
                        <li>• Special rates for existing customers</li>
                        <li>• Seamless integration with your original booking</li>
                        <li>• Cancel up to 24 hours before for full refund</li>
                        {hasStoredDetails && (
                          <li className="font-medium text-brand-accent">
                            • ✨ Quick booking with your saved details available
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </div>
  );
}