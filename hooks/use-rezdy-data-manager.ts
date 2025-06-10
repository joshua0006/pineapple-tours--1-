import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  RezdyProduct, 
  RezdyBooking, 
  RezdyCustomer,
  RezdyDataState,
  ProcessedData,
  DataInsights,
  DataMetadata,
  ProductFilters,
  FilterCriteria,
  SegmentedProducts,
  SegmentedCustomers,
  DataQualityMetrics,
  DataIssue,
  RefreshOptions,
  DashboardData,
  RevenueAnalytics,
  CustomerAnalytics,
  PerformanceMetrics
} from '@/lib/types/rezdy';

import { dataCleaningPipeline, dataQualityMonitor } from '@/lib/utils/data-validation';
import { dataSegmentationEngine } from '@/lib/utils/data-segmentation';
import { clientCacheManager } from '@/lib/utils/client-cache-manager';

interface UseRezdyDataManagerOptions {
  enableCaching?: boolean;
  enableValidation?: boolean;
  enableSegmentation?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseRezdyDataManagerReturn {
  // Core data
  data: RezdyDataState;
  processedData: ProcessedData | null;
  
  // Filtering and segmentation
  filteredProducts: RezdyProduct[];
  segmentedProducts: SegmentedProducts | null;
  segmentedCustomers: SegmentedCustomers | null;
  
  // Data quality
  qualityMetrics: DataQualityMetrics | null;
  dataIssues: DataIssue[];
  
  // Performance metrics
  performanceMetrics: PerformanceMetrics | null;
  
  // Actions
  refreshData: (options?: RefreshOptions) => Promise<void>;
  filterData: (filters: ProductFilters) => void;
  segmentData: (criteria?: FilterCriteria) => void;
  clearCache: () => void;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useRezdyDataManager(
  options: UseRezdyDataManagerOptions = {}
): UseRezdyDataManagerReturn {
  const {
    enableCaching = true,
    enableValidation = true,
    enableSegmentation = true,
    autoRefresh = false,
    refreshInterval = 300000 // 5 minutes
  } = options;

  // Core state
  const [data, setData] = useState<RezdyDataState>({
    products: [],
    bookings: [],
    availability: {},
    customers: [],
    loading: false,
    error: null,
    last_updated: null,
    sync_status: null
  });

  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({
    searchTerm: '',
    productType: 'all',
    priceRange: 'all',
    availability: 'all',
    location: 'all'
  });
  const [segmentationCriteria, setSegmentationCriteria] = useState<FilterCriteria | null>(null);

  // Computed state
  const filteredProducts = useMemo(() => {
    if (!data.products.length) return [];
    return dataSegmentationEngine.filterProducts(data.products, filters);
  }, [data.products, filters]);

  const segmentedProducts = useMemo(() => {
    if (!enableSegmentation || !data.products.length) return null;
    return dataSegmentationEngine.segmentProducts(data.products, segmentationCriteria || undefined);
  }, [data.products, segmentationCriteria, enableSegmentation]);

  const segmentedCustomers = useMemo(() => {
    if (!enableSegmentation || !data.customers.length || !data.bookings.length) return null;
    return dataSegmentationEngine.segmentCustomers(data.customers, data.bookings);
  }, [data.customers, data.bookings, enableSegmentation]);

  const qualityMetrics = useMemo(() => {
    if (!enableValidation) return null;
    return dataQualityMonitor.generateQualityReport(data);
  }, [data, enableValidation]);

  const dataIssues = useMemo(() => {
    if (!enableValidation) return [];
    return dataQualityMonitor.identifyDataIssues(data);
  }, [data, enableValidation]);

  const performanceMetrics = useMemo(() => {
    if (!enableCaching) return null;
    return clientCacheManager.getPerformanceMetrics();
  }, [enableCaching, data.last_updated]);

  // Data fetching functions
  const fetchProducts = async (): Promise<RezdyProduct[]> => {
    if (enableCaching) {
      const cached = await clientCacheManager.getProducts();
      if (cached) return cached;
    }

    const response = await fetch('/api/rezdy/products?limit=100');
    if (!response.ok) throw new Error('Failed to fetch products');
    
    const result = await response.json();
    const rawProducts = result.products || result.data || [];
    
    let products = rawProducts;
    if (enableValidation) {
      products = await dataCleaningPipeline.cleanProductData(rawProducts);
    }

    if (enableCaching) {
      await clientCacheManager.cacheProducts(products);
    }

    return products;
  };

  const fetchBookings = async (): Promise<RezdyBooking[]> => {
    if (enableCaching) {
      const cached = await clientCacheManager.getBookings();
      if (cached) return cached;
    }

    const response = await fetch('/api/rezdy/bookings?limit=100');
    if (!response.ok) throw new Error('Failed to fetch bookings');
    
    const result = await response.json();
    const rawBookings = result.bookings || result.data || [];
    
    let bookings = rawBookings;
    if (enableValidation) {
      bookings = await dataCleaningPipeline.cleanBookingData(rawBookings);
    }

    if (enableCaching) {
      await clientCacheManager.cacheBookings(bookings);
    }

    return bookings;
  };

  const fetchCustomers = async (bookings: RezdyBooking[]): Promise<RezdyCustomer[]> => {
    // Extract unique customers from bookings
    const customerMap = new Map<string, RezdyCustomer>();
    
    bookings.forEach(booking => {
      if (booking.customer && booking.customer.email) {
        customerMap.set(booking.customer.email, booking.customer);
      }
    });

    return Array.from(customerMap.values());
  };

  // Main refresh function
  const refreshData = useCallback(async (options: RefreshOptions = {}) => {
    const { force = false, include_analytics = true, data_types } = options;

    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const startTime = Date.now();
      
      // Determine what data to fetch
      const shouldFetchProducts = !data_types || data_types.includes('products');
      const shouldFetchBookings = !data_types || data_types.includes('bookings');

      // Clear cache if forced refresh
      if (force && enableCaching) {
        await clientCacheManager.invalidate('products');
        await clientCacheManager.invalidate('bookings');
        await clientCacheManager.invalidate('customers');
      }

      // Fetch data in parallel
      const promises: Promise<any>[] = [];
      
      if (shouldFetchProducts) {
        promises.push(fetchProducts());
      }
      
      if (shouldFetchBookings) {
        promises.push(fetchBookings());
      }

      const results = await Promise.allSettled(promises);
      
      let products: RezdyProduct[] = data.products;
      let bookings: RezdyBooking[] = data.bookings;
      
      if (shouldFetchProducts && results[0].status === 'fulfilled') {
        products = results[0].value;
      }
      
      if (shouldFetchBookings) {
        const bookingIndex = shouldFetchProducts ? 1 : 0;
        if (results[bookingIndex]?.status === 'fulfilled') {
          bookings = results[bookingIndex].value;
        }
      }

      // Extract customers from bookings
      const customers = await fetchCustomers(bookings);

      // Update core data
      const newData: RezdyDataState = {
        products,
        bookings,
        customers,
        availability: data.availability, // Would be updated separately
        loading: false,
        error: null,
        last_updated: new Date(),
        sync_status: {
          last_sync: new Date(),
          sync_type: force ? 'full' : 'incremental',
          status: 'success',
          records_processed: products.length + bookings.length,
          errors: []
        }
      };

      setData(newData);

      // Generate insights if analytics are enabled
      if (include_analytics) {
        const insights = await generateInsights(newData);
        const metadata = generateMetadata(newData, startTime);
        
        setProcessedData({
          data: newData,
          insights,
          metadata
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        sync_status: {
          last_sync: new Date(),
          sync_type: 'full',
          status: 'failed',
          records_processed: 0,
          errors: [{
            type: 'fetch_error',
            message: errorMessage,
            severity: 'high'
          }]
        }
      }));
    }
  }, [data.products, data.bookings, data.availability, enableCaching, enableValidation]);

  // Generate insights
  const generateInsights = async (dataState: RezdyDataState): Promise<DataInsights> => {
    const revenueInsights = generateRevenueAnalytics(dataState.products, dataState.bookings);
    const customerInsights = generateCustomerAnalytics(dataState.customers, dataState.bookings);
    const trendingProducts = identifyTrendingProducts(dataState.products, dataState.bookings);
    const performanceMetrics = enableCaching ? clientCacheManager.getPerformanceMetrics() : {
      api_response_time: 0,
      data_freshness: 1,
      error_rate: 0,
      cache_hit_ratio: 0
    };

    return {
      trending_products: trendingProducts,
      revenue_insights: revenueInsights,
      customer_insights: customerInsights,
      performance_metrics: performanceMetrics
    };
  };

  // Generate metadata
  const generateMetadata = (dataState: RezdyDataState, startTime: number): DataMetadata => {
    const recordCount = dataState.products.length + dataState.bookings.length + dataState.customers.length;
    const qualityScore = enableValidation ? calculateQualityScore(dataState) : 1;

    return {
      processed_at: new Date(),
      record_count: recordCount,
      quality_score: qualityScore,
      data_sources: ['rezdy-api']
    };
  };

  // Analytics helper functions
  const generateRevenueAnalytics = (products: RezdyProduct[], bookings: RezdyBooking[]): RevenueAnalytics => {
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const averageOrderValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;
    
    const revenueByProduct = products.map(product => {
      const productRevenue = bookings
        .filter(booking => booking.items.some(item => item.productCode === product.productCode))
        .reduce((sum, booking) => sum + booking.totalAmount, 0);
      
      return { productCode: product.productCode, revenue: productRevenue };
    }).sort((a, b) => b.revenue - a.revenue);

    // Simple monthly revenue (would need actual date grouping)
    const revenueByPeriod = [
      { period: 'Current Month', revenue: totalRevenue }
    ];

    return {
      total_revenue: totalRevenue,
      revenue_by_product: revenueByProduct,
      revenue_by_period: revenueByPeriod,
      average_order_value: averageOrderValue,
      revenue_growth_rate: 0 // Would need historical data
    };
  };

  const generateCustomerAnalytics = (customers: RezdyCustomer[], bookings: RezdyBooking[]): CustomerAnalytics => {
    const totalCustomers = customers.length;
    const newCustomers = customers.length; // Would need historical data to determine new vs returning
    const returningCustomers = 0; // Would need historical data
    
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const customerLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    return {
      total_customers: totalCustomers,
      new_customers: newCustomers,
      returning_customers: returningCustomers,
      customer_lifetime_value: customerLifetimeValue,
      churn_rate: 0, // Would need historical data
      customer_segments: [] // Would be populated by segmentation engine
    };
  };

  const identifyTrendingProducts = (products: RezdyProduct[], bookings: RezdyBooking[]): RezdyProduct[] => {
    const productBookingCounts = new Map<string, number>();
    
    bookings.forEach(booking => {
      booking.items.forEach(item => {
        const count = productBookingCounts.get(item.productCode) || 0;
        productBookingCounts.set(item.productCode, count + 1);
      });
    });

    return products
      .filter(product => (productBookingCounts.get(product.productCode) || 0) > 0)
      .sort((a, b) => (productBookingCounts.get(b.productCode) || 0) - (productBookingCounts.get(a.productCode) || 0))
      .slice(0, 10);
  };

  const calculateQualityScore = (dataState: RezdyDataState): number => {
    const metrics = dataQualityMonitor.generateQualityReport(dataState);
    const issues = dataQualityMonitor.identifyDataIssues(dataState);
    
    // Simple quality score calculation
    const totalRecords = dataState.products.length + dataState.bookings.length;
    const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;
    const highIssues = issues.filter(issue => issue.severity === 'high').length;
    
    if (totalRecords === 0) return 1;
    
    const issueScore = 1 - ((criticalIssues * 0.5 + highIssues * 0.3) / totalRecords);
    return Math.max(0, Math.min(1, issueScore));
  };

  // Action functions
  const filterData = useCallback((newFilters: ProductFilters) => {
    setFilters(newFilters);
  }, []);

  const segmentData = useCallback((criteria?: FilterCriteria) => {
    setSegmentationCriteria(criteria || null);
  }, []);

  const clearCache = useCallback(() => {
    if (enableCaching) {
      clientCacheManager.clear();
    }
  }, [enableCaching]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshData({ force: false });
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshData]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, []);

  // Cache warming effect
  useEffect(() => {
    if (enableCaching) {
      clientCacheManager.warmCache();
    }
  }, [enableCaching]);

  return {
    // Core data
    data,
    processedData,
    
    // Filtering and segmentation
    filteredProducts,
    segmentedProducts,
    segmentedCustomers,
    
    // Data quality
    qualityMetrics,
    dataIssues,
    
    // Performance metrics
    performanceMetrics,
    
    // Actions
    refreshData,
    filterData,
    segmentData,
    clearCache,
    
    // State
    isLoading: data.loading,
    error: data.error,
    lastUpdated: data.last_updated
  };
}

// Specialized hooks for specific use cases
export function useProductFiltering(products: RezdyProduct[]) {
  const [filters, setFilters] = useState<ProductFilters>({
    searchTerm: '',
    productType: 'all',
    priceRange: 'all',
    availability: 'all',
    location: 'all'
  });

  const filteredProducts = useMemo(() => {
    return dataSegmentationEngine.filterProducts(products, filters);
  }, [products, filters]);

  return { filteredProducts, filters, setFilters };
}

export function useDataQuality(data: RezdyDataState) {
  const qualityMetrics = useMemo(() => {
    return dataQualityMonitor.generateQualityReport(data);
  }, [data]);

  const dataIssues = useMemo(() => {
    return dataQualityMonitor.identifyDataIssues(data);
  }, [data]);

  return { qualityMetrics, dataIssues };
}

export function useCacheMetrics() {
  const [metrics, setMetrics] = useState(clientCacheManager.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(clientCacheManager.getMetrics());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return metrics;
} 