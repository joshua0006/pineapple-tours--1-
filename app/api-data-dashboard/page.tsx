'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { 
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
  BarChart3,
  Search,
  Database,
  Server,
  Activity,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tour {
  productCode: string;
  name: string;
  shortDescription?: string;
  description?: string;
  advertisedPrice?: number;
  productType?: string;
  locationAddress?: any;
  images?: any[];
}

interface TourCategory {
  id: string;
  title: string;
  description: string;
  productTypes: string[];
  keywords: string[];
  slug: string;
  categoryGroup: 'tours' | 'experiences' | 'transportation';
  tourCount: number;
  products?: Tour[];
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  cached?: boolean;
  lastUpdated?: string;
  totalCount?: number;
  filters?: any;
  fetchStats?: any;
  stats?: any;
}

export default function ApiDataDashboard() {
  const [activeTab, setActiveTab] = useState('tours');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'json'>('cards');
  
  // Tours data
  const [toursData, setToursData] = useState<ApiResponse<Tour[]> & { tours?: Tour[] }>({});
  const [toursLoading, setToursLoading] = useState(false);
  const [toursError, setToursError] = useState<string | null>(null);
  
  // Categories data
  const [categoriesData, setCategoriesData] = useState<ApiResponse<TourCategory[]> & { categories?: TourCategory[] }>({});
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  
  // Individual tour data
  const [selectedTour, setSelectedTour] = useState<string>('');
  const [tourDetailData, setTourDetailData] = useState<ApiResponse<Tour> & { tour?: Tour }>({});
  const [tourDetailLoading, setTourDetailLoading] = useState(false);
  const [tourDetailError, setTourDetailError] = useState<string | null>(null);

  // Fetch all tours
  const fetchTours = async (refresh = false) => {
    setToursLoading(true);
    setToursError(null);
    
    try {
      const params = new URLSearchParams();
      if (refresh) params.append('refresh', 'true');
      params.append('limit', '100');
      
      const response = await fetch(`/api/tours?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setToursData(data);
      console.log('Tours API Response:', data);
    } catch (error) {
      setToursError(error instanceof Error ? error.message : 'Failed to fetch tours');
      console.error('Error fetching tours:', error);
    } finally {
      setToursLoading(false);
    }
  };

  // Fetch tour categories
  const fetchCategories = async (refresh = false) => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    
    try {
      const params = new URLSearchParams();
      if (refresh) params.append('refresh', 'true');
      params.append('includeProducts', 'false');
      params.append('minCount', '1');
      
      const response = await fetch(`/api/tour-categories?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCategoriesData(data);
      console.log('Categories API Response:', data);
    } catch (error) {
      setCategoriesError(error instanceof Error ? error.message : 'Failed to fetch categories');
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch individual tour details
  const fetchTourDetails = async (productCode: string, refresh = false) => {
    if (!productCode) return;
    
    setTourDetailLoading(true);
    setTourDetailError(null);
    
    try {
      const params = new URLSearchParams();
      if (refresh) params.append('refresh', 'true');
      
      const response = await fetch(`/api/tours/${productCode}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTourDetailData(data);
      console.log('Tour Detail API Response:', data);
    } catch (error) {
      setTourDetailError(error instanceof Error ? error.message : 'Failed to fetch tour details');
      console.error('Error fetching tour details:', error);
    } finally {
      setTourDetailLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchTours();
    fetchCategories();
  }, []);

  // Handle tour selection
  const handleTourSelect = (productCode: string) => {
    setSelectedTour(productCode);
    setActiveTab('tour-detail');
    fetchTourDetails(productCode);
  };

  // Filter tours based on search
  const filteredTours = (toursData.tours || []).filter(tour =>
    tour.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tour.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tour.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold tracking-tight">API Data Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive view of all data from the Tours API endpoints
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-1 h-auto p-1">
          <TabsTrigger value="tours" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            All Tours
            {toursData.tours && <Badge variant="secondary">{toursData.tours.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categories
            {categoriesData.categories && <Badge variant="secondary">{categoriesData.categories.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="tour-detail" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Tour Detail
            {selectedTour && <Badge variant="secondary">{selectedTour}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="api-info" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            API Info
          </TabsTrigger>
        </TabsList>

        {/* All Tours Tab */}
        <TabsContent value="tours" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Tours Data (/api/tours)
                  </CardTitle>
                  <CardDescription>
                    All tours from Pineapple Tours products (cached from Rezdy Supplier API)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchTours(true)}
                    disabled={toursLoading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={cn("h-4 w-4", toursLoading && "animate-spin")} />
                    Refresh
                  </Button>
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'json' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('json')}
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* API Response Metadata */}
              {toursData && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    API Response Metadata
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Count:</span>
                      <div className="font-medium">{toursData.totalCount || 0}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cached:</span>
                      <div className="font-medium">
                        <Badge variant={toursData.cached ? "default" : "secondary"}>
                          {toursData.cached ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Updated:</span>
                      <div className="font-medium text-xs">
                        {toursData.lastUpdated ? new Date(toursData.lastUpdated).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fetch Stats:</span>
                      <div className="font-medium">
                        {toursData.fetchStats ? `${toursData.fetchStats.totalProducts} products` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tours..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {toursError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{toursError}</AlertDescription>
                </Alert>
              )}

              {toursLoading ? (
                <LoadingSkeleton />
              ) : filteredTours.length > 0 ? (
                viewMode === 'cards' ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTours.map((tour) => (
                      <Card key={tour.productCode} className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleTourSelect(tour.productCode)}>
                        <CardHeader>
                          <CardTitle className="text-lg">{tour.name}</CardTitle>
                          <CardDescription>{tour.productCode}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {tour.shortDescription && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {tour.shortDescription}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{tour.productType || 'Unknown'}</Badge>
                              {tour.advertisedPrice && (
                                <span className="font-semibold">${tour.advertisedPrice}</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Tours JSON Data</h3>
                      <Badge variant="outline">{filteredTours.length} tours</Badge>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 overflow-auto max-h-[600px]">
                      <pre className="text-sm">
                        <code>{JSON.stringify(toursData, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tours found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms.' : 'No tours available.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tour Categories (/api/tour-categories)
                  </CardTitle>
                  <CardDescription>
                    Available tour categories derived from product data
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCategories(true)}
                  disabled={categoriesLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={cn("h-4 w-4", categoriesLoading && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* API Response Metadata */}
              {categoriesData && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    API Response Metadata
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Categories:</span>
                      <div className="font-medium">{categoriesData.categories?.length || 0}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cached:</span>
                      <div className="font-medium">
                        <Badge variant={categoriesData.cached ? "default" : "secondary"}>
                          {categoriesData.cached ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Updated:</span>
                      <div className="font-medium text-xs">
                        {categoriesData.lastUpdated ? new Date(categoriesData.lastUpdated).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Products:</span>
                      <div className="font-medium">
                        {categoriesData.stats?.totalProducts || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  {categoriesData.stats?.topCategories && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Top Categories:</h4>
                      <div className="flex flex-wrap gap-2">
                        {categoriesData.stats.topCategories.map((cat: any) => (
                          <Badge key={cat.id} variant="outline">
                            {cat.title} ({cat.count})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {categoriesError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{categoriesError}</AlertDescription>
                </Alert>
              )}

              {categoriesLoading ? (
                <LoadingSkeleton />
              ) : categoriesData.categories && categoriesData.categories.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {categoriesData.categories.map((category) => (
                      <Card key={category.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{category.title}</CardTitle>
                            <Badge variant="outline">{category.tourCount}</Badge>
                          </div>
                          <CardDescription>{category.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium">Category Group:</span>
                              <Badge variant="secondary" className="ml-2 capitalize">
                                {category.categoryGroup}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Product Types:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {category.productTypes.slice(0, 3).map((type) => (
                                  <Badge key={type} variant="outline" className="text-xs">
                                    {type}
                                  </Badge>
                                ))}
                                {category.productTypes.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{category.productTypes.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Keywords:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {category.keywords.slice(0, 4).map((keyword) => (
                                  <Badge key={keyword} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                                {category.keywords.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{category.keywords.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* JSON View */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Categories JSON Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 overflow-auto max-h-[400px]">
                        <pre className="text-sm">
                          <code>{JSON.stringify(categoriesData, null, 2)}</code>
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No categories found</h3>
                  <p className="text-muted-foreground">No tour categories available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tour Detail Tab */}
        <TabsContent value="tour-detail" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Tour Detail (/api/tours/:productCode)
                  </CardTitle>
                  <CardDescription>
                    Detailed information for a single product
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchTourDetails(selectedTour, true)}
                    disabled={tourDetailLoading || !selectedTour}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={cn("h-4 w-4", tourDetailLoading && "animate-spin")} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedTour ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tour selected</h3>
                  <p className="text-muted-foreground">
                    Select a tour from the "All Tours" tab to view its details.
                  </p>
                </div>
              ) : (
                <>
                  {/* API Response Metadata */}
                  {tourDetailData && (
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        API Response Metadata
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Product Code:</span>
                          <div className="font-medium">{selectedTour}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cached:</span>
                          <div className="font-medium">
                            <Badge variant={tourDetailData.cached ? "default" : "secondary"}>
                              {tourDetailData.cached ? "Yes" : "No"}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Updated:</span>
                          <div className="font-medium text-xs">
                            {tourDetailData.lastUpdated ? new Date(tourDetailData.lastUpdated).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {tourDetailError && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{tourDetailError}</AlertDescription>
                    </Alert>
                  )}

                  {tourDetailLoading ? (
                    <LoadingSkeleton count={1} />
                  ) : tourDetailData.tour ? (
                    <div className="space-y-6">
                      {/* Tour Details Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle>{tourDetailData.tour.name}</CardTitle>
                          <CardDescription>{tourDetailData.tour.productCode}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <span className="text-sm font-medium">Product Type:</span>
                              <div className="mt-1">
                                <Badge variant="outline">{tourDetailData.tour.productType || 'Unknown'}</Badge>
                              </div>
                            </div>
                            {tourDetailData.tour.advertisedPrice && (
                              <div>
                                <span className="text-sm font-medium">Price:</span>
                                <div className="mt-1 font-semibold text-lg">
                                  ${tourDetailData.tour.advertisedPrice}
                                </div>
                              </div>
                            )}
                            {tourDetailData.tour.shortDescription && (
                              <div className="md:col-span-2">
                                <span className="text-sm font-medium">Short Description:</span>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {tourDetailData.tour.shortDescription}
                                </p>
                              </div>
                            )}
                            {tourDetailData.tour.description && (
                              <div className="md:col-span-2">
                                <span className="text-sm font-medium">Full Description:</span>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {tourDetailData.tour.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* JSON View */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Tour Detail JSON Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 overflow-auto max-h-[400px]">
                            <pre className="text-sm">
                              <code>{JSON.stringify(tourDetailData, null, 2)}</code>
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Tour not found</h3>
                      <p className="text-muted-foreground">
                        The selected tour could not be loaded.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Info Tab */}
        <TabsContent value="api-info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                API Endpoints Information
              </CardTitle>
              <CardDescription>
                Overview of all available API endpoints and their functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Tours Endpoint */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">GET /api/tours</CardTitle>
                    <CardDescription>Fetch all Pineapple Tours products</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Controller:</span>
                        <span className="ml-2 text-sm">TourController.getTours</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Service:</span>
                        <span className="ml-2 text-sm">RezdyService.getAllProducts</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Functionality:</span>
                        <ul className="ml-2 text-sm text-muted-foreground list-disc list-inside mt-1">
                          <li>Fetch all products from cache or Rezdy API</li>
                          <li>Accept query parameters for filtering (category, productType)</li>
                          <li>Transform data for frontend consumption</li>
                          <li>Support pagination with limit/offset</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Query Parameters:</span>
                        <div className="ml-2 mt-1 space-y-1">
                          <Badge variant="outline" className="text-xs">refresh=true</Badge>
                          <Badge variant="outline" className="text-xs">category=string</Badge>
                          <Badge variant="outline" className="text-xs">productType=string</Badge>
                          <Badge variant="outline" className="text-xs">limit=number</Badge>
                          <Badge variant="outline" className="text-xs">offset=number</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Tour Endpoint */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">GET /api/tours/:productCode</CardTitle>
                    <CardDescription>Fetch detailed information for a single product</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Controller:</span>
                        <span className="ml-2 text-sm">TourController.getTourByProductCode</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Service:</span>
                        <span className="ml-2 text-sm">RezdyService.getProductDetails</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Functionality:</span>
                        <ul className="ml-2 text-sm text-muted-foreground list-disc list-inside mt-1">
                          <li>Fetch detailed information for a single product</li>
                          <li>Cache individual product details</li>
                          <li>Handle 404 errors for non-existent products</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Query Parameters:</span>
                        <div className="ml-2 mt-1">
                          <Badge variant="outline" className="text-xs">refresh=true</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Categories Endpoint */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">GET /api/tour-categories</CardTitle>
                    <CardDescription>Provide a list of available tour categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Controller:</span>
                        <span className="ml-2 text-sm">TourController.getTourCategories</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Service:</span>
                        <span className="ml-2 text-sm">RezdyService.getProductCategories</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Functionality:</span>
                        <ul className="ml-2 text-sm text-muted-foreground list-disc list-inside mt-1">
                          <li>Derive categories from product data</li>
                          <li>Count products in each category</li>
                          <li>Filter categories by minimum product count</li>
                          <li>Optionally include product lists in categories</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Query Parameters:</span>
                        <div className="ml-2 mt-1 space-y-1">
                          <Badge variant="outline" className="text-xs">refresh=true</Badge>
                          <Badge variant="outline" className="text-xs">includeProducts=boolean</Badge>
                          <Badge variant="outline" className="text-xs">minCount=number</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Scheduled Job Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scheduled Job: Product Cache Refresh</CardTitle>
                    <CardDescription>Periodic cache refresh functionality</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Job:</span>
                        <span className="ml-2 text-sm">CacheRefreshJob.refreshAllProducts</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Functionality:</span>
                        <ul className="ml-2 text-sm text-muted-foreground list-disc list-inside mt-1">
                          <li>Periodically calls RezdyService.getAllProducts</li>
                          <li>Forces fetch from Rezdy API</li>
                          <li>Updates Redis cache with fresh data</li>
                          <li>Ensures data freshness for high-traffic scenarios</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Implementation:</span>
                        <p className="ml-2 text-sm text-muted-foreground mt-1">
                          Currently implemented as manual refresh via API endpoints. 
                          Can be extended with cron jobs or background workers.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 