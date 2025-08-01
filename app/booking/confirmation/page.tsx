"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { HorizontalScrollableProductCard } from "@/components/horizontal-scrollable-product-card";
import { MarketplaceProduct, MarketplaceProductsResponse } from "@/lib/types/rezdy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { trackPurchase, getProductCategory, formatCurrencyForGTM } from "@/lib/gtm";

interface SelectedProduct {
  product: MarketplaceProduct;
  quantity: number;
}

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const sessionId = searchParams.get("session_id");
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseTracked, setPurchaseTracked] = useState(false);

  // Fetch marketplace products from Rezdy API
  useEffect(() => {
    const fetchMarketplaceProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/rezdy/marketplace/products?search=skywalk');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }
        
        const data: MarketplaceProductsResponse = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching marketplace products:', error);
        setError(error instanceof Error ? error.message : 'Failed to load additional experiences');
        setProducts([]); // Clear products on error
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplaceProducts();
  }, []);

  // Track purchase event when page loads with order details
  useEffect(() => {
    const trackBookingPurchase = async () => {
      if (!orderNumber || !sessionId || purchaseTracked) {
        return;
      }

      try {
        // Fetch booking details from API or local storage
        const response = await fetch(`/api/bookings/${orderNumber}`);
        if (response.ok) {
          const bookingData = await response.json();
          
          // Track the purchase in GTM
          trackPurchase({
            transactionId: orderNumber,
            value: formatCurrencyForGTM(bookingData.total || 0),
            currency: 'AUD',
            items: [{
              productCode: bookingData.productCode || 'unknown',
              productName: bookingData.productName || 'Tour Booking',
              category: getProductCategory(bookingData.productCode || '', bookingData.productName || ''),
              quantity: bookingData.quantity || 1,
              price: formatCurrencyForGTM(bookingData.total || 0),
            }],
            customerEmail: bookingData.customerEmail,
          });
          
          setPurchaseTracked(true);
          console.log('Purchase event tracked for order:', orderNumber);
        }
      } catch (error) {
        console.error('Error tracking purchase:', error);
        
        // Fallback tracking with minimal data
        if (orderNumber) {
          trackPurchase({
            transactionId: orderNumber,
            value: 0,
            currency: 'AUD',
            items: [{
              productCode: 'unknown',
              productName: 'Tour Booking',
              category: 'Day Tours',
              quantity: 1,
              price: 0,
            }],
          });
          setPurchaseTracked(true);
        }
      }
    };

    trackBookingPurchase();
  }, [orderNumber, sessionId, purchaseTracked]);

  // Filter out products without images
  const filteredProducts = products.filter(product => product.images && product.images.length > 0);

  const handleProductSelect = (product: MarketplaceProduct, quantity: number) => {
    setSelectedProducts(prev => {
      const existing = prev.find(item => item.product.productCode === product.productCode);
      if (existing) {
        return prev.map(item => 
          item.product.productCode === product.productCode 
            ? { ...item, quantity }
            : item
        );
      } else {
        return [...prev, { product, quantity }];
      }
    });
  };

  const handleProductRemove = (productCode: string) => {
    setSelectedProducts(prev => prev.filter(item => item.product.productCode !== productCode));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-coral-50 py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Congratulations! Your adventure awaits. We've sent your booking confirmation to your email.
          </p>
        </div>

        {/* Marketplace Products Section */}
        {!loading && filteredProducts.length > 0 && (
          <div className="mt-16">
            <Card className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-blue-200 shadow-lg">
              <CardHeader className="text-center pb-6">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl">
              
                  <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                    Enhance Your Adventure
                  </span>
                </CardTitle>
                <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                  Complete your experience with these carefully curated add-ons. 
                  Perfect complements to make your adventure even more memorable!
                </p>
              </CardHeader>
              
              <CardContent className="px-8 pb-6">
                <HorizontalScrollableProductCard
                  products={filteredProducts}
                  selectedProducts={selectedProducts}
                  onProductSelect={handleProductSelect}
                  onProductRemove={handleProductRemove}
                  guestCount={2}
                  showAddToCart={true}
                  maxQuantity={10}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-16">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="pt-8 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 bg-brand-accent rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Loading additional experiences...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mt-16">
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
              <CardContent className="pt-8 text-center">
                <p className="text-red-600 mb-2">Unable to load additional experiences</p>
                <p className="text-sm text-red-500">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
