'use client';

import { useState, useMemo } from 'react';
import { ArrowLeft, Heart, RefreshCw, Search, Grid, Code, DollarSign, Package, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useRezdyProducts } from '@/hooks/use-rezdy';
import { RezdyProductCard } from '@/components/rezdy-product-card';
import { getCategoryBySlug } from '@/lib/constants/categories';
import { filterProductsByCategory } from '@/lib/utils/category-filters';
import { RezdyProduct } from '@/lib/types/rezdy';

export default function HensPartyRezdyPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'json'>('cards');
  
  const { data: allProducts, loading, error } = useRezdyProducts(1000, 0);
  
  // Get category configuration
  const categoryConfig = getCategoryBySlug('hens-party');
  
  // Filter products for this category
  const categoryProducts = useMemo(() => {
    if (!allProducts || !categoryConfig) return [];
    return filterProductsByCategory(allProducts, categoryConfig);
  }, [allProducts, categoryConfig]);

  // Apply search filter
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return categoryProducts;
    
    return categoryProducts.filter(product =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categoryProducts, searchTerm]);

  // Group products by product type
  const groupedProducts = useMemo(() => {
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

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProducts = categoryProducts.length;
    const avgPrice = categoryProducts.reduce((sum, p) => sum + (p.advertisedPrice || 0), 0) / totalProducts || 0;
    const priceRange = {
      min: Math.min(...categoryProducts.map(p => p.advertisedPrice || 0)),
      max: Math.max(...categoryProducts.map(p => p.advertisedPrice || 0))
    };
    
    return {
      totalProducts,
      avgPrice,
      priceRange,
      productTypes: Object.keys(groupedProducts).length
    };
  }, [categoryProducts, groupedProducts]);

  const LoadingSkeleton = ({ count = 6 }: { count?: number }) => (
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

  if (!categoryConfig) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Category configuration not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-pink-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hens Party - Rezdy Data</h1>
            <p className="text-muted-foreground">
              Complete data analysis for hens party products from Rezdy API
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Hens party products
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgPrice.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Per person average
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Range</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.priceRange.min} - ${stats.priceRange.max}</div>
            <p className="text-xs text-muted-foreground">
              Min to max pricing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Types</CardTitle>
            <Grid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productTypes}</div>
            <p className="text-xs text-muted-foreground">
              Different categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products ({filteredProducts.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="raw-data" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Raw Data
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hens Party Products</CardTitle>
              <CardDescription>
                All hens party products available in Rezdy, filtered by celebration and bridal party keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search hens party experiences..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="flex items-center gap-2"
                  >
                    <Grid className="h-4 w-4" />
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'json' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('json')}
                    className="flex items-center gap-2"
                  >
                    <Code className="h-4 w-4" />
                    JSON
                  </Button>
                  <Button variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loading ? (
                <LoadingSkeleton />
              ) : filteredProducts.length > 0 ? (
                viewMode === 'cards' ? (
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
                              onViewDetails={(product) => console.log('View details:', product)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Hens Party JSON Data</h3>
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
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hens party experiences found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? 'Try adjusting your search terms.' 
                      : 'No hens party products available.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Product Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(groupedProducts).map(([type, products]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{type}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{products.length}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {((products.length / filteredProducts.length) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Lowest Price:</span>
                    <span className="font-medium">${stats.priceRange.min}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Highest Price:</span>
                    <span className="font-medium">${stats.priceRange.max}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Price:</span>
                    <span className="font-medium">${stats.avgPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Products:</span>
                    <span className="font-medium">{stats.totalProducts}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Raw Data Tab */}
        <TabsContent value="raw-data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Raw Hens Party Data</CardTitle>
              <CardDescription>
                Complete JSON data for all hens party products from Rezdy API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 overflow-auto max-h-[800px]">
                <pre className="text-sm">
                  <code>{JSON.stringify(filteredProducts, null, 2)}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 