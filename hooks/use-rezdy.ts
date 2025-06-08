import { useState, useEffect } from 'react';
import { 
  RezdyProduct, 
  RezdyAvailability, 
  RezdySession, 
  RezdyBooking,
  RezdyProductsResponse,
  RezdyAvailabilityResponse,
  RezdyBookingsResponse
} from '@/lib/types/rezdy';

interface UseRezdyDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useRezdyProducts(limit = 100, offset = 0) {
  const [state, setState] = useState<UseRezdyDataState<RezdyProduct[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // Add cache-busting parameter to ensure fresh data
        const cacheBuster = Date.now();
        const response = await fetch(`/api/rezdy/products?limit=${limit}&offset=${offset}&_t=${cacheBuster}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: RezdyProductsResponse = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        const products = data.products || data.data || [];
        console.log('useRezdyProducts: Fetched products:', {
          totalProducts: products.length,
          hasProducts: products.length > 0,
          firstProduct: products[0]?.name || 'None',
          cacheBuster
        });
        
        setState({
          data: products,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('useRezdyProducts error:', error);
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch products',
        });
      }
    };

    fetchProducts();
  }, [limit, offset]);

  return state;
}

export function useRezdyAvailability(
  productCode: string | null,
  startTime: string | null,
  endTime: string | null,
  participants?: string
) {
  const [state, setState] = useState<UseRezdyDataState<RezdyAvailability[]>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!productCode || !startTime || !endTime) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const fetchAvailability = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // Ensure dates are properly formatted
        const formatDate = (dateStr: string) => {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format: ${dateStr}`);
          }
          return date.toISOString().split('T')[0];
        };

        const formattedStartTime = formatDate(startTime);
        const formattedEndTime = formatDate(endTime);
        
        let url = `/api/rezdy/availability?productCode=${encodeURIComponent(productCode)}&startTime=${formattedStartTime}&endTime=${formattedEndTime}`;
        if (participants) {
          url += `&participants=${encodeURIComponent(participants)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data: RezdyAvailabilityResponse = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Handle different response structures
        let availabilityData: RezdyAvailability[] = [];
        
        if (data.availability) {
          availabilityData = data.availability;
        } else if (data.data) {
          availabilityData = data.data;
        } else if (data.sessions) {
          // Direct sessions response
          availabilityData = [{ productCode, sessions: data.sessions }];
        } else {
          // Empty response
          availabilityData = [{ productCode, sessions: [] }];
        }
        
        setState({
          data: availabilityData,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error in useRezdyAvailability:', error);
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch availability',
        });
      }
    };

    fetchAvailability();
  }, [productCode, startTime, endTime, participants]);

  return state;
}

export function useRezdySession(sessionId: string | null) {
  const [state, setState] = useState<UseRezdyDataState<RezdySession>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!sessionId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const fetchSession = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await fetch(`/api/rezdy/sessions/${sessionId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setState({
          data: data,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch session',
        });
      }
    };

    fetchSession();
  }, [sessionId]);

  return state;
}

export function useRezdyBookings(limit = 50, offset = 0) {
  const [state, setState] = useState<UseRezdyDataState<RezdyBooking[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await fetch(`/api/rezdy/bookings?limit=${limit}&offset=${offset}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: RezdyBookingsResponse = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        const bookings = data.bookings || data.data || [];
        
        setState({
          data: bookings,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch bookings',
        });
      }
    };

    fetchBookings();
  }, [limit, offset]);

  return state;
}

// Gift Voucher specific hook with enhanced filtering and error handling
export function useRezdyGiftVouchers(filters?: {
  priceRange?: { min?: number; max?: number };
  sortBy?: 'price' | 'name' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}) {
  const [state, setState] = useState<UseRezdyDataState<RezdyProduct[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const fetchGiftVouchers = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // Add cache-busting parameter and retry info
        const cacheBuster = Date.now();
        const response = await fetch(`/api/rezdy/products?limit=${filters?.limit || 100}&offset=${filters?.offset || 0}&_t=${cacheBuster}&retry=${retryCount}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: RezdyProductsResponse = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        const allProducts = data.products || data.data || [];
        
        // Filter for gift voucher products
        let giftVouchers = allProducts.filter(product => 
          product.productType === 'GIFT_CARD' ||
          product.name.toLowerCase().includes('gift voucher') ||
          product.name.toLowerCase().includes('voucher') ||
          (product.shortDescription && product.shortDescription.toLowerCase().includes('gift voucher'))
        );

        // Apply price range filter
        if (filters?.priceRange) {
          giftVouchers = giftVouchers.filter(product => {
            const price = product.advertisedPrice || 0;
            const min = filters.priceRange?.min || 0;
            const max = filters.priceRange?.max || Infinity;
            return price >= min && price <= max;
          });
        }

        // Apply sorting
        if (filters?.sortBy) {
          giftVouchers.sort((a, b) => {
            let comparison = 0;
            
            switch (filters.sortBy) {
              case 'price':
                comparison = (a.advertisedPrice || 0) - (b.advertisedPrice || 0);
                break;
              case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
              case 'popularity':
                // Use a simple heuristic: lower product codes might be older/more popular
                comparison = a.productCode.localeCompare(b.productCode);
                break;
              default:
                comparison = 0;
            }
            
            return filters.sortOrder === 'desc' ? -comparison : comparison;
          });
        }
        
        console.log('useRezdyGiftVouchers: Fetched gift vouchers:', {
          totalGiftVouchers: giftVouchers.length,
          totalProducts: allProducts.length,
          filters,
          retryCount,
          cacheBuster
        });
        
        setState({
          data: giftVouchers,
          loading: false,
          error: null,
        });
        
        // Reset retry count on success
        setRetryCount(0);
        
      } catch (error) {
        console.error('useRezdyGiftVouchers error:', error);
        
        // Implement retry logic
        if (retryCount < maxRetries) {
          console.log(`Retrying gift voucher fetch (${retryCount + 1}/${maxRetries})...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000 * (retryCount + 1)); // Exponential backoff
          return;
        }
        
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch gift vouchers',
        });
      }
    };

    fetchGiftVouchers();
  }, [filters?.limit, filters?.offset, filters?.priceRange?.min, filters?.priceRange?.max, filters?.sortBy, filters?.sortOrder, retryCount]);

  const retry = () => {
    setRetryCount(0);
    setState(prev => ({ ...prev, loading: true, error: null }));
  };

  return { ...state, retry, retryCount, maxRetries };
}

// Hook for fetching gift voucher terms and conditions
export function useGiftVoucherTerms() {
  const [terms, setTerms] = useState({
    validity: '12 months from purchase date',
    redemption: 'Can be redeemed for any tour or experience',
    transferable: 'Vouchers are transferable to other recipients',
    refund: 'Non-refundable but can be rescheduled',
    partial_use: 'Remaining balance stays on voucher for future use',
    expiry_notification: 'Email reminders sent 30 days before expiry',
    booking_process: 'Present voucher code during online booking or contact us directly',
    group_bookings: 'Multiple vouchers can be combined for group bookings',
    seasonal_restrictions: 'Some experiences may have seasonal availability',
    contact_info: 'For assistance, contact us at support@pineappletours.com'
  });

  return terms;
} 