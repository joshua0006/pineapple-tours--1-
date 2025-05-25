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
        
        const response = await fetch(`/api/rezdy/products?limit=${limit}&offset=${offset}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: RezdyProductsResponse = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setState({
          data: data.products || data.data || [],
          loading: false,
          error: null,
        });
      } catch (error) {
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
        
        setState({
          data: data.bookings || data.data || [],
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