import { useState, useEffect, useCallback } from 'react';
import { RezdyProduct } from '@/lib/types/rezdy';

interface AllProductsResponse {
  products: RezdyProduct[];
  totalCount: number;
  cached: boolean;
  lastUpdated: string;
  fetchStats?: {
    totalProducts: number;
    fetchTime: string;
  };
}

interface UseAllProductsState {
  data: AllProductsResponse | null;
  loading: boolean;
  error: string | null;
}

export function useAllProducts() {
  const [state, setState] = useState<UseAllProductsState>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchAllProducts = useCallback(async (forceRefresh = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const searchParams = new URLSearchParams();
      if (forceRefresh) {
        searchParams.append('refresh', 'true');
      }

      const url = `/api/rezdy/products/all${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      
      console.log('🔄 Fetching all products from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }

      const data: AllProductsResponse = await response.json();

      console.log(`✅ Fetched ${data.totalCount} products (cached: ${data.cached})`);

      setState({
        data,
        loading: false,
        error: null,
      });

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
      console.error('❌ Error fetching all products:', errorMessage);
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      
      throw error;
    }
  }, []);

  const refreshProducts = useCallback(() => {
    return fetchAllProducts(true);
  }, [fetchAllProducts]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  return {
    // State
    ...state,
    
    // Actions
    fetchAllProducts,
    refreshProducts,
    
    // Computed values
    products: state.data?.products || [],
    totalCount: state.data?.totalCount || 0,
    isCached: state.data?.cached || false,
    lastUpdated: state.data?.lastUpdated,
    fetchStats: state.data?.fetchStats,
  };
} 