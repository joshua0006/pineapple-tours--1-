'use client';

import { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  RefreshCw, 
  AlertCircle,
  Package,
  Grid,
  Code,
  Tag,
  Calendar,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

import { useRezdyProducts, useRezdyAvailability } from '@/hooks/use-rezdy';
import { RezdyProductCard } from '@/components/rezdy-product-card';
import { RezdyAvailabilityCard } from '@/components/rezdy-availability-card';
import { RezdyProduct, RezdySession } from '@/lib/types/rezdy';

export default function RezdyDataPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [productsViewMode, setProductsViewMode] = useState<'cards' | 'json'>('cards');
  const [selectedProductType, setSelectedProductType] = useState<string>('all');
  const [selectedBudgetRange, setSelectedBudgetRange] = useState<string>('all');
  
  // Selected product for details
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  // Availability state - simplified to show all products
  const [allProductsAvailability, setAllProductsAvailability] = useState<Record<string, any[]>>({});
  const [availabilityLoading, setAvailabilityLoading] = useState<boolean>(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Fetch data
  const { data: products, loading: productsLoading, error: productsError } = useRezdyProducts(1000, 0);

  // Categorize products by budget range based on actual data analysis
  const categorizeByBudget = (product: RezdyProduct): string => {
    const price = product.advertisedPrice;
    if (!price || price <= 0) return 'unknown';
    
    if (price < 99) return 'budget';
    if (price >= 99 && price < 159) return 'mid-range';
    if (price >= 159 && price < 299) return 'premium';
    if (price >= 299) return 'luxury';
    
    return 'unknown';
  };

  // Get unique product types
  const productTypes = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    const types = [...new Set(products.map(p => p.productType).filter((type): type is string => Boolean(type)))];
    return types.sort();
  }, [products]);

  // Budget analysis
  const budgetAnalysis = useMemo(() => {
    if (!products || !Array.isArray(products)) return {
      budget: { count: 0, products: [], avgPrice: 0, totalRevenue: 0 },
      'mid-range': { count: 0, products: [], avgPrice: 0, totalRevenue: 0 },
      premium: { count: 0, products: [], avgPrice: 0, totalRevenue: 0 },
      luxury: { count: 0, products: [], avgPrice: 0, totalRevenue: 0 },
      unknown: { count: 0, products: [], avgPrice: 0, totalRevenue: 0 }
    };

    const analysis = {
      budget: { count: 0, products: [] as RezdyProduct[], avgPrice: 0, totalRevenue: 0 },
      'mid-range': { count: 0, products: [] as RezdyProduct[], avgPrice: 0, totalRevenue: 0 },
      premium: { count: 0, products: [] as RezdyProduct[], avgPrice: 0, totalRevenue: 0 },
      luxury: { count: 0, products: [] as RezdyProduct[], avgPrice: 0, totalRevenue: 0 },
      unknown: { count: 0, products: [] as RezdyProduct[], avgPrice: 0, totalRevenue: 0 }
    };

    products.forEach(product => {
      const category = categorizeByBudget(product);
      if (analysis[category as keyof typeof analysis]) {
        analysis[category as keyof typeof analysis].products.push(product);
        analysis[category as keyof typeof analysis].count++;
        analysis[category as keyof typeof analysis].totalRevenue += product.advertisedPrice || 0;
      }
    });

    // Calculate average prices
    Object.keys(analysis).forEach(key => {
      const category = analysis[key as keyof typeof analysis];
      category.avgPrice = category.count > 0 ? category.totalRevenue / category.count : 0;
    });

    return analysis;
  }, [products]);

  // Filter products based on search, product type, and budget range
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    
    let filtered = products.filter(product =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedProductType !== 'all') {
      filtered = filtered.filter(product => product.productType === selectedProductType);
    }

    if (selectedBudgetRange !== 'all') {
      filtered = filtered.filter(product => categorizeByBudget(product) === selectedBudgetRange);
    }

    return filtered;
  }, [products, searchTerm, selectedProductType, selectedBudgetRange]);

  // Group products by productType
  const groupedProducts = useMemo(() => {
    if (!filteredProducts || !Array.isArray(filteredProducts)) return {};
    
    const grouped = filteredProducts.reduce((acc, product) => {
      const type = product.productType || 'Uncategorized';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(product);
      return acc;
    }, {} as Record<string, RezdyProduct[]>);

    // Sort groups by type name
    const sortedGroups: Record<string, RezdyProduct[]> = {};
    Object.keys(grouped).sort().forEach(key => {
      sortedGroups[key] = grouped[key];
    });

    return sortedGroups;
  }, [filteredProducts]);

  // Group products by budget category
  const groupedByBudget = useMemo(() => {
    if (!filteredProducts || !Array.isArray(filteredProducts)) return {};
    
    const grouped = filteredProducts.reduce((acc, product) => {
      const budget = categorizeByBudget(product);
      if (!acc[budget]) {
        acc[budget] = [];
      }
      acc[budget].push(product);
      return acc;
    }, {} as Record<string, RezdyProduct[]>);

    return grouped;
  }, [filteredProducts]);

  const handleProductSelect = (product: RezdyProduct) => {
    setSelectedProduct(product.productCode);
    setActiveTab('availability');
    console.log('Selected product:', product);
  };

  const handleBookSession = (session: RezdySession) => {
    console.log('Book session:', session);
    // TODO: Implement booking functionality
  };

  // Fetch availability for all products
  const fetchAllProductsAvailability = async () => {
    if (!products || !Array.isArray(products) || products.length === 0) return;
    
    setAvailabilityLoading(true);
    setAvailabilityError(null);
    
    try {
      const startDate = new Date().toISOString();
      const endDate = addDays(new Date(), 30).toISOString(); // Next 30 days
      
      const availabilityPromises = products.map(async (product) => {
        try {
          const response = await fetch(
            `/api/rezdy/availability?productCode=${product.productCode}&startTime=${startDate}&endTime=${endDate}&participants=1`
          );
          if (response.ok) {
            const data = await response.json();
            console.log(`Availability data for ${product.productCode}:`, data);
            // Handle different possible response structures
            let availabilityData = [];
            if (data.sessions) {
              // Rezdy API returns sessions directly
              availabilityData = [{ sessions: data.sessions }];
            } else if (data.availability) {
              availabilityData = data.availability;
            } else if (data.data) {
              availabilityData = data.data;
            } else if (Array.isArray(data)) {
              availabilityData = data;
            }
            return { productCode: product.productCode, data: availabilityData };
          }
          console.error(`HTTP error for ${product.productCode}: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          console.error(`Error response body:`, errorText);
          return { productCode: product.productCode, data: [] };
        } catch (error) {
          console.error(`Error fetching availability for ${product.productCode}:`, error);
          return { productCode: product.productCode, data: [] };
        }
      });
      
      const results = await Promise.all(availabilityPromises);
      const availabilityMap: Record<string, any[]> = {};
      
      results.forEach(result => {
        availabilityMap[result.productCode] = result.data;
      });
      
      setAllProductsAvailability(availabilityMap);
    } catch (error) {
      setAvailabilityError('Failed to fetch availability data');
      console.error('Error fetching all products availability:', error);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Auto-load availability when switching to availability tab
  useEffect(() => {
    if (activeTab === 'availability' && products && Array.isArray(products) && products.length > 0 && Object.keys(allProductsAvailability).length === 0) {
      fetchAllProductsAvailability();
    }
  }, [activeTab, products]);

  const LoadingSkeleton = ({ count = 3 }: { count?: number }) => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Rezdy Data Dashboard</h1>
        <p className="text-muted-foreground">
          View and manage products, availability, and bookings from Rezdy API
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-1 h-auto p-1">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            All Products
            {products && Array.isArray(products) && <Badge variant="secondary">{products.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="budget-analysis" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Budget Analysis
            <Badge variant="secondary">
              {Object.values(budgetAnalysis).reduce((sum, category) => sum + category.count, 0)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Availability
            <Badge variant="secondary">
              {Object.values(allProductsAvailability).reduce((total, productAvail) => 
                total + productAvail.reduce((sum, avail) => sum + (avail.sessions?.length || 0), 0), 0
              )}
            </Badge>
          </TabsTrigger>
          {productTypes.slice(0, 5).map((type) => {
            const typeProducts = groupedProducts[type] || [];
            return (
              <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {type}
                <Badge variant="secondary">{typeProducts.length}</Badge>
              </TabsTrigger>
            );
          })}
          {productTypes.length > 5 && (
            <TabsTrigger value="more" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              More
              <Badge variant="secondary">{productTypes.length - 5}</Badge>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Budget Analysis Tab */}
        <TabsContent value="budget-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Budget Category Analysis
              </CardTitle>
              <CardDescription>
                Product distribution and revenue analysis by price ranges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(budgetAnalysis).map(([category, data]) => (
                  <Card key={category} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold capitalize">
                        {category === 'mid-range' ? 'Mid-Range' : category}
                      </h3>
                      <Badge variant="outline">{data.count}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Price:</span>
                        <span className="font-medium">${data.avgPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Value:</span>
                        <span className="font-medium">${data.totalRevenue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price Range:</span>
                        <span className="font-medium">
                          {category === 'budget' && 'Under $99'}
                          {category === 'mid-range' && '$99-$159'}
                          {category === 'premium' && '$159-$299'}
                          {category === 'luxury' && '$299+'}
                          {category === 'unknown' && 'No Price'}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Budget Category Products */}
              <div className="mt-8 space-y-6">
                {Object.entries(groupedByBudget).map(([category, categoryProducts]) => (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold capitalize">
                        {category === 'mid-range' ? 'Mid-Range Products' : `${category} Products`}
                      </h3>
                      <Badge variant="outline">{categoryProducts.length} products</Badge>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {categoryProducts.slice(0, 6).map((product) => (
                        <RezdyProductCard
                          key={product.productCode}
                          product={product}
                          onViewDetails={handleProductSelect}
                        />
                      ))}
                    </div>
                    {categoryProducts.length > 6 && (
                      <div className="text-center">
                        <Button variant="outline" size="sm">
                          View All {categoryProducts.length} {category} Products
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Products Tab */}
        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                All products available in Rezdy, categorized by product type and budget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedProductType} onValueChange={setSelectedProductType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {productTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedBudgetRange} onValueChange={setSelectedBudgetRange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Budgets</SelectItem>
                      <SelectItem value="budget">Budget (Under $99)</SelectItem>
                      <SelectItem value="mid-range">Mid-Range ($99-$159)</SelectItem>
                      <SelectItem value="premium">Premium ($159-$299)</SelectItem>
                      <SelectItem value="luxury">Luxury ($299+)</SelectItem>
                      <SelectItem value="unknown">No Price Set</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={productsViewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setProductsViewMode('cards')}
                    className="flex items-center gap-2"
                  >
                    <Grid className="h-4 w-4" />
                    Cards
                  </Button>
                  <Button
                    variant={productsViewMode === 'json' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setProductsViewMode('json')}
                    className="flex items-center gap-2"
                  >
                    <Code className="h-4 w-4" />
                    JSON
                  </Button>
                </div>
              </div>

              {/* Active Filters Display */}
              {(selectedProductType !== 'all' || selectedBudgetRange !== 'all' || searchTerm) && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Active Filters:</span>
                      {searchTerm && (
                        <Badge variant="secondary">
                          Search: "{searchTerm}"
                        </Badge>
                      )}
                      {selectedProductType !== 'all' && (
                        <Badge variant="secondary">
                          Type: {selectedProductType}
                        </Badge>
                      )}
                      {selectedBudgetRange !== 'all' && (
                        <Badge variant="secondary">
                          Budget: {selectedBudgetRange === 'mid-range' ? 'Mid-Range' : selectedBudgetRange}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedProductType('all');
                        setSelectedBudgetRange('all');
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              )}

              {/* Product Type Summary */}
              {!productsLoading && products && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Product Categories ({filteredProducts.length} products)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(groupedProducts).map(([type, typeProducts]) => (
                      <Badge 
                        key={type} 
                        variant={selectedProductType === type ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => setSelectedProductType(selectedProductType === type ? 'all' : type)}
                      >
                        {type} ({typeProducts.length})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {productsError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{productsError}</AlertDescription>
                </Alert>
              )}

              {productsLoading ? (
                <LoadingSkeleton />
              ) : filteredProducts.length > 0 ? (
                productsViewMode === 'cards' ? (
                  <div className="space-y-8">
                    {Object.entries(groupedProducts).map(([type, typeProducts]) => (
                      <div key={type} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold">{type}</h3>
                          <Badge variant="outline">{typeProducts.length} products</Badge>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {typeProducts.map((product) => (
                            <RezdyProductCard
                              key={product.productCode}
                              product={product}
                              onViewDetails={handleProductSelect}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Products JSON Data</h3>
                      <Badge variant="outline">{filteredProducts.length} products</Badge>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 overflow-auto max-h-[600px]">
                      <pre className="text-sm">
                        <code>{JSON.stringify(groupedProducts, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedProductType !== 'all' || selectedBudgetRange !== 'all'
                      ? 'Try adjusting your search terms or filters.' 
                      : 'No products available.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Product Availability Overview
              </CardTitle>
              <CardDescription>
                View availability dates for all products (next 30 days)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Load Data Button */}
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Click "Load Availability" to fetch availability data for all products
                  </p>
                  <Button 
                    onClick={fetchAllProductsAvailability}
                    disabled={availabilityLoading || !products || !Array.isArray(products) || products.length === 0}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={cn("h-4 w-4", availabilityLoading && "animate-spin")} />
                    {availabilityLoading ? 'Loading...' : 'Load Availability'}
                  </Button>
                </div>

                {/* Error Display */}
                {availabilityError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{availabilityError}</AlertDescription>
                  </Alert>
                )}

                {/* Availability Results */}
                {availabilityLoading ? (
                  <LoadingSkeleton />
                ) : Object.keys(allProductsAvailability).length > 0 ? (
                  <div className="space-y-6">
                    {products?.map((product) => {
                      const productAvailability = allProductsAvailability[product.productCode] || [];
                      const allSessions = productAvailability.flatMap(avail => avail.sessions || []);
                      const availableDates = [...new Set(allSessions.map(session => 
                        format(new Date(session.startTimeLocal), 'yyyy-MM-dd')
                      ))].sort();

                      return (
                        <Card key={product.productCode} className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">{product.productCode}</p>
                              {product.shortDescription && (
                                <p className="text-sm text-muted-foreground mt-1">{product.shortDescription}</p>
                              )}
                            </div>
                            <Badge variant={availableDates.length > 0 ? "default" : "secondary"}>
                              {availableDates.length} available dates
                            </Badge>
                          </div>
                          
                          {availableDates.length > 0 ? (
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Available Dates:
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {availableDates.map((date) => (
                                  <Badge key={date} variant="outline" className="text-xs">
                                    {format(new Date(date), 'MMM dd, yyyy')}
                                  </Badge>
                                ))}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Total sessions: {allSessions.length}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">No availability in the next 30 days</p>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Data Loaded</h3>
                    <p className="text-muted-foreground">
                      Click "Load Availability" to view availability dates for all products
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Product Type Tabs */}
        {productTypes.map((type) => {
          const typeProducts = groupedProducts[type] || [];
          const filteredTypeProducts = typeProducts.filter(product =>
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );

          return (
            <TabsContent key={type} value={type} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    {type} Products
                  </CardTitle>
                  <CardDescription>
                    Products of type "{type}" - {typeProducts.length} total products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={`Search ${type} products...`}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button variant="outline" size="icon">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant={productsViewMode === 'cards' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setProductsViewMode('cards')}
                        className="flex items-center gap-2"
                      >
                        <Grid className="h-4 w-4" />
                        Cards
                      </Button>
                      <Button
                        variant={productsViewMode === 'json' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setProductsViewMode('json')}
                        className="flex items-center gap-2"
                      >
                        <Code className="h-4 w-4" />
                        JSON
                      </Button>
                    </div>
                  </div>

                  {productsError && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{productsError}</AlertDescription>
                    </Alert>
                  )}

                  {productsLoading ? (
                    <LoadingSkeleton />
                  ) : filteredTypeProducts.length > 0 ? (
                    productsViewMode === 'cards' ? (
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTypeProducts.map((product) => (
                          <RezdyProductCard
                            key={product.productCode}
                            product={product}
                            onViewDetails={handleProductSelect}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{type} Products JSON Data</h3>
                          <Badge variant="outline">{filteredTypeProducts.length} products</Badge>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 overflow-auto max-h-[600px]">
                          <pre className="text-sm">
                            <code>{JSON.stringify(filteredTypeProducts, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No {type} products found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm 
                          ? `No ${type} products match your search criteria.` 
                          : `No ${type} products available.`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}

        {/* More Tab for additional product types */}
        {productTypes.length > 5 && (
          <TabsContent value="more" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid className="h-5 w-5" />
                  Additional Product Types
                </CardTitle>
                <CardDescription>
                  More product categories - {productTypes.length - 5} additional types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {productTypes.slice(5).map((type) => {
                    const typeProducts = groupedProducts[type] || [];
                    return (
                      <Card key={type} className="cursor-pointer hover:shadow-md transition-shadow" 
                            onClick={() => setActiveTab(type)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              <h3 className="font-medium">{type}</h3>
                            </div>
                            <Badge variant="secondary">{typeProducts.length}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Click to view {type} products
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 