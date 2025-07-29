"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MarketplaceProduct } from "@/lib/types/rezdy";
import { 
  Calendar,
  Star,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GuestDetailsReusePopup } from "@/components/guest-details-reuse-popup";
import { useGuestDetails, encodeGuestDetailsForUrl } from "@/hooks/use-guest-details";

interface SelectedProduct {
  product: MarketplaceProduct;
  quantity: number;
}

interface HorizontalScrollableProductCardProps {
  products: MarketplaceProduct[];
  selectedProducts?: SelectedProduct[];
  onProductSelect?: (product: MarketplaceProduct, quantity: number) => void;
  onProductRemove?: (productCode: string) => void;
  guestCount?: number;
  showAddToCart?: boolean;
  maxQuantity?: number;
}

export function HorizontalScrollableProductCard({
  products,
  selectedProducts = [],
  onProductSelect,
  onProductRemove,
  guestCount = 2,
  showAddToCart = true,
  maxQuantity = 10
}: HorizontalScrollableProductCardProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<MarketplaceProduct | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGuestDetailsPopup, setShowGuestDetailsPopup] = useState(false);
  const [selectedProductForBooking, setSelectedProductForBooking] = useState<MarketplaceProduct | null>(null);
  
  // Guest details hook
  const { hasStoredDetails, storedDetails, clearStoredDetails } = useGuestDetails();

  const handleBookNow = (product: MarketplaceProduct) => {
    // Check if we have stored guest details
    if (hasStoredDetails && storedDetails) {
      // Show popup to ask if user wants to reuse details
      setSelectedProductForBooking(product);
      setShowGuestDetailsPopup(true);
    } else {
      // No stored details, proceed with normal booking
      navigateToBooking(product);
    }
  };

  const navigateToBooking = (product: MarketplaceProduct, useStoredDetails = false) => {
    let bookingUrl = `/booking/${product.productCode}`;
    
    if (useStoredDetails && storedDetails) {
      // Encode guest details for URL
      const encodedDetails = encodeGuestDetailsForUrl(storedDetails);
      if (encodedDetails) {
        bookingUrl += `?guestDetails=${encodeURIComponent(encodedDetails)}&prefill=true`;
      }
    }
    
    // Navigate to booking page
    window.location.href = bookingUrl;
  };

  const handleUseStoredDetails = () => {
    if (selectedProductForBooking) {
      navigateToBooking(selectedProductForBooking, true);
    }
  };

  const handleEnterNewDetails = () => {
    if (selectedProductForBooking) {
      navigateToBooking(selectedProductForBooking, false);
    }
  };

  const handleCloseGuestDetailsPopup = () => {
    setShowGuestDetailsPopup(false);
    setSelectedProductForBooking(null);
  };

  const isSelected = (productCode: string): boolean => {
    return selectedProducts.some(selected => selected.product.productCode === productCode);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of one card plus gap
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    return `$${price.toFixed(0)}`;
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedProductForDetails?.images) return;
    
    const totalImages = selectedProductForDetails.images.length;
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    } else {
      setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Reset image index when modal opens
  const handleModalOpen = (product: MarketplaceProduct) => {
    setSelectedProductForDetails(product);
    setCurrentImageIndex(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedProductForDetails) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          navigateImage('prev');
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigateImage('next');
          break;
        case 'Escape':
          event.preventDefault();
          setSelectedProductForDetails(null);
          break;
      }
    };

    if (selectedProductForDetails) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedProductForDetails, currentImageIndex]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      <div className="hidden md:block">
        <Button
          variant="outline"
          size="sm"
          onClick={() => scroll('left')}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-lg border-gray-200 hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => scroll('right')}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-lg border-gray-200 hover:bg-gray-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}
      >
        {products.map((product, index) => {
          const selected = isSelected(product.productCode);
          const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

          return (
            <motion.div
              key={product.productCode}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex-shrink-0 w-80 h-96"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className={`group relative h-full overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                selected ? 'ring-2 ring-brand-accent shadow-lg' : ''
              }`}>
                {/* Background Image */}
                <div className="absolute inset-0">
                  {primaryImage?.itemUrl ? (
                    <Image
                      src={primaryImage.itemUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
                      <div className="w-20 h-20 bg-brand-accent/20 rounded-full flex items-center justify-center">
                        <Star className="w-10 h-10 text-brand-accent" />
                      </div>
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="relative h-full flex flex-col justify-between p-6">
                  {/* Top section with title and price */}
                  <div className="text-center">
                    <h3 className="font-bold text-xl text-white drop-shadow-lg mb-2">
                      {product.name}
                    </h3>
                    {product.advertisedPrice && (
                      <div className="flex items-center justify-center gap-1 text-white/90 text-sm">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">{formatPrice(product.advertisedPrice)}</span>
                      </div>
                    )}
                  </div>

                  {/* Middle section with description (if available) */}
                  {product.shortDescription && (
                    <div className="flex-1 flex items-center">
                      <p className="text-white/80 text-sm text-center line-clamp-3 drop-shadow">
                        {product.shortDescription}
                      </p>
                    </div>
                  )}

                  {/* Bottom section with buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleModalOpen(product)}
                      variant="outline"
                      className="flex items-center gap-2 transition-all duration-300 px-4 py-3 bg-white/90 hover:bg-white border-white/50 text-gray-700 hover:text-gray-900"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                    {showAddToCart && (
                      <Button
                        onClick={() => handleBookNow(product)}
                        className={`flex items-center gap-2 transition-all duration-300 px-6 py-3 flex-1 ${
                          selected 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-brand-accent hover:bg-brand-accent/90 text-white'
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        {selected ? 'Booked' : 'Book Now'}
                      </Button>
                    )}
                  </div>

                  {/* Status overlay */}
                  {product.status === 'INACTIVE' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Currently Unavailable
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Scroll Indicator Dots */}
      <div className="flex justify-center mt-4 gap-2 md:hidden">
        {products.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-gray-300"
          />
        ))}
      </div>

      {/* Product Details Dialog */}
      <Dialog open={!!selectedProductForDetails} onOpenChange={(open) => !open && setSelectedProductForDetails(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProductForDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {selectedProductForDetails.name}
                </DialogTitle>
                {selectedProductForDetails.shortDescription && (
                  <DialogDescription className="text-lg text-gray-600">
                    {selectedProductForDetails.shortDescription}
                  </DialogDescription>
                )}
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Product Images Carousel */}
                <div className="w-full">
                  {selectedProductForDetails.images && selectedProductForDetails.images.length > 0 ? (
                    <div className="relative max-w-2xl mx-auto">
                      {/* Main Image Display */}
                      <div className="relative h-80 rounded-lg overflow-hidden">
                        <motion.div
                          key={currentImageIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="w-full h-full"
                        >
                          <Image
                            src={selectedProductForDetails.images[currentImageIndex].itemUrl}
                            alt={selectedProductForDetails.images[currentImageIndex].caption || selectedProductForDetails.name}
                            fill
                            className="object-cover"
                          />
                          {selectedProductForDetails.images[currentImageIndex].caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3 text-sm">
                              {selectedProductForDetails.images[currentImageIndex].caption}
                            </div>
                          )}
                        </motion.div>

                        {/* Navigation Arrows */}
                        {selectedProductForDetails.images.length > 1 && (
                          <>
                            <Button
                              onClick={() => navigateImage('prev')}
                              variant="outline"
                              size="sm"
                              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg border-gray-200"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => navigateImage('next')}
                              variant="outline"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg border-gray-200"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {/* Image Counter */}
                        {selectedProductForDetails.images.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                            {currentImageIndex + 1} of {selectedProductForDetails.images.length}
                          </div>
                        )}
                      </div>

                      {/* Image Indicators */}
                      {selectedProductForDetails.images.length > 1 && (
                        <div className="flex justify-center gap-2 mt-3">
                          {selectedProductForDetails.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => goToImage(index)}
                              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                index === currentImageIndex 
                                  ? 'bg-brand-accent scale-125' 
                                  : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto h-80 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                      <Star className="w-16 h-16 text-brand-accent" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pricing */}
                  {selectedProductForDetails.advertisedPrice && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">Pricing</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-600">
                          {formatPrice(selectedProductForDetails.advertisedPrice)}
                        </span>
                      </div>
                    </div>
                  )}


                  {/* Status */}
                  {selectedProductForDetails.status && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Status</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                        selectedProductForDetails.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedProductForDetails.status}
                      </span>
                    </div>
                  )}

                  {/* Extras */}
                  {selectedProductForDetails.extras && selectedProductForDetails.extras.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Available Extras</h3>
                      <div className="space-y-2">
                        {selectedProductForDetails.extras.map((extra, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{extra.name}</p>
                                {extra.description && (
                                  <p className="text-sm text-gray-600">{extra.description}</p>
                                )}
                              </div>
                              <span className="text-sm font-semibold text-green-600">
                                ${extra.price}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Add to Cart Section */}
                {showAddToCart && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => {
                        handleBookNow(selectedProductForDetails);
                        setSelectedProductForDetails(null);
                      }}
                      className={`w-full flex items-center justify-center gap-2 py-3 ${
                        isSelected(selectedProductForDetails.productCode)
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-brand-accent hover:bg-brand-accent/90 text-white'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      {isSelected(selectedProductForDetails.productCode) ? 'Booked' : 'Book Now'}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Guest Details Reuse Popup */}
      {showGuestDetailsPopup && storedDetails && (
        <GuestDetailsReusePopup
          isOpen={showGuestDetailsPopup}
          onClose={handleCloseGuestDetailsPopup}
          onUseStoredDetails={handleUseStoredDetails}
          onEnterNewDetails={handleEnterNewDetails}
          onClearStoredDetails={clearStoredDetails}
          storedDetails={storedDetails}
        />
      )}
    </div>
  );
}