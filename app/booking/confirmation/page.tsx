"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAllProducts } from "@/hooks/use-all-products";
import { DynamicTourCard } from "@/components/dynamic-tour-card";
import { RezdyProduct } from "@/lib/types/rezdy";

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

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  // transactionId is optional – fall back to empty string if not provided
  const transactionId = searchParams.get("transactionId") || "";

  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch all products for related tours
  const { products: allProducts, loading: productsLoading } = useAllProducts();

  // Get related tours based on the booked tour
  const getRelatedTours = (bookedTourName: string): RezdyProduct[] => {
    if (!allProducts || allProducts.length === 0) return [];

    // Simple algorithm to find related tours
    // In a real implementation, this could be more sophisticated
    const relatedTours = allProducts
      .filter((product) => {
        // Exclude the booked tour itself
        if (product.name === bookedTourName) return false;
        
        // Filter for active tours only
        if (product.status !== "ACTIVE") return false;

        // Simple keyword matching for related tours
        const bookedTourWords = bookedTourName.toLowerCase().split(" ");
        const productWords = product.name.toLowerCase().split(" ");
        
        // Check if they share common words (excluding common words like "tour", "the", "and")
        const commonWords = ["tour", "tours", "the", "and", "of", "in", "at", "to", "from", "with"];
        const relevantBookedWords = bookedTourWords.filter(word => !commonWords.includes(word));
        const relevantProductWords = productWords.filter(word => !commonWords.includes(word));
        
        const hasCommonWords = relevantBookedWords.some(word => 
          relevantProductWords.some(productWord => 
            productWord.includes(word) || word.includes(productWord)
          )
        );

        return hasCommonWords;
      })
      .slice(0, 4); // Limit to 4 related tours

    // If no related tours found, return random popular tours
    if (relatedTours.length === 0) {
      return allProducts
        .filter((product) => product.status === "ACTIVE" && product.name !== bookedTourName)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
    }

    return relatedTours;
  };

  const relatedTours = bookingDetails ? getRelatedTours(bookingDetails.productName) : [];

  useEffect(() => {
    // Proceed if we have at least the order number
    if (orderNumber) {
      // Fetch booking details from API
      const fetchBookingDetails = async () => {
        try {
          const response = await fetch(`/api/bookings/${orderNumber}`);
          if (response.ok) {
            const bookingData = await response.json();
            setBookingDetails({
              orderNumber,
              transactionId,
              productName: bookingData.productName || "Tour Booking",
              date: bookingData.date || new Date().toISOString().split('T')[0],
              time: bookingData.time || "TBD",
              guests: bookingData.guestCount || 1,
              pickupLocation: bookingData.pickupLocation || "TBD",
              totalAmount: bookingData.totalAmount || 0,
              customerEmail: bookingData.customerEmail || "",
              status: "CONFIRMED",
            });
          } else {
            // Fallback to mock data if API call fails
            setBookingDetails({
              orderNumber,
              transactionId,
              productName: "Tour Booking",
              date: new Date().toISOString().split('T')[0],
              time: "TBD",
              guests: 1,
              pickupLocation: "TBD",
              totalAmount: 0,
              customerEmail: "",
              status: "CONFIRMED",
            });
          }
        } catch (error) {
          console.error("Error fetching booking details:", error);
          // Fallback to mock data
          setBookingDetails({
            orderNumber,
            transactionId,
            productName: "Tour Booking",
            date: new Date().toISOString().split('T')[0],
            time: "TBD",
            guests: 1,
            pickupLocation: "TBD",
            totalAmount: 0,
            customerEmail: "",
            status: "CONFIRMED",
          });
        }
        setLoading(false);
      };

      fetchBookingDetails();
    } else {
      setError("Missing booking information");
      setLoading(false);
    }
  }, [orderNumber, transactionId]);

  const handleDownloadConfirmation = () => {
    // Generate PDF or print confirmation
    window.print();
  };

  const handleShareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: "Booking Confirmation",
        text: `My tour booking is confirmed! Order: ${orderNumber}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
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

   

        {/* Related Tours Section */}
        {relatedTours.length > 0 && (
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.0 }}
            >
            
              <p className="text-gray-600 max-w-2xl mx-auto">
                Since you loved this tour, we think you'll enjoy these similar adventures!
              </p>
            </motion.div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTours.map((tour, index) => (
                <motion.div
                  key={tour.productCode}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 2.2 + (index * 0.1),
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <DynamicTourCard product={tour} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* No Related Tours Fallback */}
        {relatedTours.length === 0 && !productsLoading && (
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-lg">
              <Heart className="h-12 w-12 text-brand-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-brand-primary mb-2">
                Thank You for Choosing Us!
              </h3>
              <p className="text-gray-600 mb-4">
                We're preparing more amazing tours for you. Check back soon!
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-brand-accent hover:bg-brand-accent/90 text-white"
              >
                Explore All Tours
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
