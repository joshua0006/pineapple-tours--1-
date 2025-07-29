"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExtrasCard } from "@/components/ui/extras-card";
import { ExtrasBookingSummary } from "@/components/ui/extras-booking-summary";
import { RezdyExtra } from "@/lib/types/rezdy";
import { SelectedExtra } from "@/lib/utils/pricing-utils";
import { 
  Star, 
  Sparkles
} from "lucide-react";

interface MarketplaceAddonsSectionProps {
  bookingDetails: {
    productName: string;
    orderNumber: string;
    customerEmail: string;
    totalAmount: number;
  };
  className?: string;
}

interface MarketplaceAddonsResponse {
  addons: RezdyExtra[];
  totalCount: number;
  cached: boolean;
  region: string;
  searchTerm: string;
  lastUpdated: string;
}

export function MarketplaceAddonsSection({ 
  bookingDetails, 
  className = "" 
}: MarketplaceAddonsSectionProps) {
  const [addons, setAddons] = useState<RezdyExtra[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<SelectedExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingAddons, setBookingAddons] = useState(false);

  // Extract region from booked tour for targeted add-ons
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
    if (tourLower.includes('brewery') || tourLower.includes('wine')) return 'brewery';
    if (tourLower.includes('food') || tourLower.includes('dining')) return 'food';
    return 'skywalk'; // Default to skywalk
  };

  const region = extractRegionFromTour(bookingDetails.productName);
  const searchTerm = extractSearchTermFromTour(bookingDetails.productName);

  useEffect(() => {
    const fetchMarketplaceAddons = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/rezdy/marketplace/addons?search=${encodeURIComponent(searchTerm)}&region=${encodeURIComponent(region)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch marketplace add-ons');
        }
        
        const data: MarketplaceAddonsResponse = await response.json();
        setAddons(data.addons || []);
        console.log(`✅ Loaded ${data.addons?.length || 0} marketplace add-ons for search: "${searchTerm}" in region: ${region}`);
      } catch (err) {
        console.error('Error fetching marketplace add-ons:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplaceAddons();
  }, [region, searchTerm]);

  const handleAddonsChange = (newSelectedAddons: SelectedExtra[]) => {
    setSelectedAddons(newSelectedAddons);
  };

  const calculateTotalAddonPrice = (): number => {
    return selectedAddons.reduce((total, selectedAddon) => {
      const addon = selectedAddon.extra;
      let price = addon.price * selectedAddon.quantity;
      
      // Apply per-person pricing if applicable (assuming 2 guests average for post-booking)
      if (addon.priceType === 'PER_PERSON') {
        price *= 2; // Default guest count for post-booking scenarios
      }
      
      return total + price;
    }, 0);
  };

  const handleBookAddons = async () => {
    if (selectedAddons.length === 0) return;
    
    setBookingAddons(true);
    try {
      // Here you would integrate with your booking system
      // For now, we'll simulate the booking process
      console.log('Booking add-ons:', selectedAddons);
      console.log('Total price:', calculateTotalAddonPrice());
      console.log('Original booking:', bookingDetails.orderNumber);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success feedback
      alert(`Successfully added ${selectedAddons.length} add-on(s) to your booking! You will receive a separate confirmation email.`);
      setSelectedAddons([]);
    } catch (error) {
      console.error('Error booking add-ons:', error);
      alert('Sorry, there was an error adding the add-ons to your booking. Please contact support.');
    } finally {
      setBookingAddons(false);
    }
  };

  if (loading) {
    return (
      <motion.div 
        className={`${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-8">
            <div className="flex items-center justify-center space-x-2">
              <motion.div 
                className="w-4 h-4 bg-brand-accent rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-gray-600">Loading add-on experiences...</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error || !addons || addons.length === 0) {
    return null; // Don't show section if no add-ons available
  }

  return (
    <motion.div 
      className={`${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
    >
      <Card className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-blue-200 shadow-lg">
        <CardHeader className="pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-brand-accent to-purple-500 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                  Enhance Your Adventure
                </span>
               
              </div>
            </CardTitle>
            
            <p className="text-gray-600 mt-2">
              Perfect add-ons to complete your adventure! These {searchTerm}   {" "}experiences 
              are curated based on your booking using our marketplace search.
            </p>
          </motion.div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Add-ons Selector */}
          <ExtrasCard
            addons={addons}
            selectedAddons={selectedAddons}
            onAddonsChange={handleAddonsChange}
            guestCount={2} // Default guest count for post-booking
            region={region}
            searchTerm={searchTerm}
            loading={false}
            className="border-none shadow-none bg-transparent"
          />

          {/* Booking Summary */}
          <ExtrasBookingSummary
            selectedAddons={selectedAddons}
            bookingAddons={bookingAddons}
            customerEmail={bookingDetails.customerEmail}
            onBookAddons={handleBookAddons}
            calculateTotalAddonPrice={calculateTotalAddonPrice}
          />

          {/* Information Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="bg-blue-50 rounded-lg p-4 border border-blue-200"
          >
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Why book add-ons now?</p>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>• Exclusive experiences not available elsewhere</li>
                  <li>• Discounted rates for existing customers</li>
                  <li>• Seamless booking tied to your original reservation</li>
                  <li>• Cancel up to 24 hours before for full refund</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}