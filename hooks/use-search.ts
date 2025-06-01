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
  city: string;
  location: string;
  page: number;
  limit: number;
}

interface SearchResponse {
  products: RezdyProduct[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters: SearchFilters;
  metadata: {
    hasResults: boolean;
    searchQuery: string;
    appliedFilters: {
      category: string | null;
      priceRange: string | null;
      duration: string | null;
      city: string | null;
      location: string | null;
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
    city: '',
    location: '',
    page: 1,
    limit: 12,
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
        if (value && value !== '' && value !== 'all' && value !== 'any') {
          searchParams.append(key, value.toString());
        }
      });

      // Always include at least one parameter to ensure the search is triggered
      // If no other parameters are set, include a default limit
      if (searchParams.toString() === '') {
        searchParams.append('limit', searchFilters.limit.toString());
      }

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

  const updateFilter = useCallback((key: keyof SearchFilters, value: string | number) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value,
      // Reset to page 1 when filters change (except when changing page itself)
      ...(key !== 'page' ? { page: 1 } : {})
    }));
    setSearchTriggered(true);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ 
      ...prev, 
      ...newFilters,
      // Reset to page 1 when filters change (unless page is explicitly set)
      ...(newFilters.page === undefined ? { page: 1 } : {})
    }));
    setSearchTriggered(true);
  }, []);

  const search = useCallback((searchQuery?: string) => {
    if (searchQuery !== undefined) {
      setFilters(prev => ({ ...prev, query: searchQuery, page: 1 }));
    }
    setSearchTriggered(true);
    performSearch(searchQuery !== undefined ? { ...filters, query: searchQuery, page: 1 } : filters);
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
      city: '',
      location: '',
      page: 1,
      limit: 12,
    });
    setState({
      data: null,
      loading: false,
      error: null,
    });
    setSearchTriggered(false);
  }, []);

  const clearFilter = useCallback((filterKey: keyof SearchFilters) => {
    const defaultValues: Record<keyof SearchFilters, string | number> = {
      query: '',
      category: 'all',
      productType: 'all',
      priceRange: 'all',
      duration: 'any',
      travelers: '2',
      sortBy: 'relevance',
      checkIn: '',
      checkOut: '',
      city: '',
      location: '',
      page: 1,
      limit: 12,
    };
    
    updateFilter(filterKey, defaultValues[filterKey]);
  }, [updateFilter]);

  const goToPage = useCallback((page: number) => {
    updateFilter('page', page);
  }, [updateFilter]);

  const nextPage = useCallback(() => {
    if (state.data?.hasNextPage) {
      updateFilter('page', filters.page + 1);
    }
  }, [state.data?.hasNextPage, filters.page, updateFilter]);

  const previousPage = useCallback(() => {
    if (state.data?.hasPreviousPage) {
      updateFilter('page', filters.page - 1);
    }
  }, [state.data?.hasPreviousPage, filters.page, updateFilter]);

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
    goToPage,
    nextPage,
    previousPage,
    
    // Computed values
    hasActiveFilters: filters.query !== '' || 
                     filters.category !== 'all' || 
                     filters.productType !== 'all' ||
                     filters.priceRange !== 'all' || 
                     filters.duration !== 'any' ||
                     filters.checkIn !== '' ||
                     filters.checkOut !== '' ||
                     filters.city !== '' ||
                     filters.location !== '',
    
    hasResults: state.data?.metadata.hasResults ?? false,
    totalResults: state.data?.totalCount ?? 0,
    totalPages: state.data?.totalPages ?? 0,
    currentPage: state.data?.currentPage ?? 1,
    hasNextPage: state.data?.hasNextPage ?? false,
    hasPreviousPage: state.data?.hasPreviousPage ?? false,
  };
} 