import { useState, useEffect, useCallback } from 'react';
import { RezdyProduct } from '@/lib/types/rezdy';

interface SearchFilters {
  query: string;
  category: string;
  productType: string;
  priceRange: string;
  duration: string;
  travelers: string;
  sortBy: string;
  checkIn: string;
  checkOut: string;
}

interface SearchResponse {
  products: RezdyProduct[];
  totalCount: number;
  filters: SearchFilters;
  metadata: {
    hasResults: boolean;
    searchQuery: string;
    appliedFilters: {
      category: string | null;
      priceRange: string | null;
      duration: string | null;
    };
  };
}

interface UseSearchState {
  data: SearchResponse | null;
  loading: boolean;
  error: string | null;
}

export function useSearch(initialFilters?: Partial<SearchFilters>) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    productType: 'all',
    priceRange: 'all',
    duration: 'any',
    travelers: '2',
    sortBy: 'relevance',
    checkIn: '',
    checkOut: '',
    ...initialFilters,
  });

  const [state, setState] = useState<UseSearchState>({
    data: null,
    loading: false,
    error: null,
  });

  const [searchTriggered, setSearchTriggered] = useState(false);

  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const searchParams = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value && value !== '') {
          searchParams.append(key, value);
        }
      });

      const response = await fetch(`/api/search?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();

      setState({
        data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed',
      });
    }
  }, []);

  // Auto-search when filters change (debounced)
  useEffect(() => {
    if (!searchTriggered) return;

    const timeoutId = setTimeout(() => {
      performSearch(filters);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, performSearch, searchTriggered]);

  const updateFilter = useCallback((key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSearchTriggered(true);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setSearchTriggered(true);
  }, []);

  const search = useCallback((searchQuery?: string) => {
    if (searchQuery !== undefined) {
      setFilters(prev => ({ ...prev, query: searchQuery }));
    }
    setSearchTriggered(true);
    performSearch(searchQuery !== undefined ? { ...filters, query: searchQuery } : filters);
  }, [filters, performSearch]);

  const clearSearch = useCallback(() => {
    setFilters({
      query: '',
      category: 'all',
      productType: 'all',
      priceRange: 'all',
      duration: 'any',
      travelers: '2',
      sortBy: 'relevance',
      checkIn: '',
      checkOut: '',
    });
    setState({
      data: null,
      loading: false,
      error: null,
    });
    setSearchTriggered(false);
  }, []);

  const clearFilter = useCallback((filterKey: keyof SearchFilters) => {
    const defaultValues: Record<keyof SearchFilters, string> = {
      query: '',
      category: 'all',
      productType: 'all',
      priceRange: 'all',
      duration: 'any',
      travelers: '2',
      sortBy: 'relevance',
      checkIn: '',
      checkOut: '',
    };
    
    updateFilter(filterKey, defaultValues[filterKey]);
  }, [updateFilter]);

  return {
    // State
    ...state,
    filters,
    searchTriggered,
    
    // Actions
    search,
    updateFilter,
    updateFilters,
    clearSearch,
    clearFilter,
    performSearch: () => performSearch(filters),
    
    // Computed values
    hasActiveFilters: filters.query !== '' || 
                     filters.category !== 'all' || 
                     filters.productType !== 'all' ||
                     filters.priceRange !== 'all' || 
                     filters.duration !== 'any' ||
                     filters.checkIn !== '' ||
                     filters.checkOut !== '',
    
    hasResults: state.data?.metadata.hasResults ?? false,
    totalResults: state.data?.totalCount ?? 0,
  };
} 