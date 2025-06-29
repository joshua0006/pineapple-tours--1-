import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Bus,
  RefreshCw,
  Search,
  Grid,
  Code,
  DollarSign,
  Package,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useRezdyProducts } from "@/hooks/use-rezdy";
import { RezdyProductCard } from "@/components/rezdy-product-card";
import {
  filterProductsByCategory,
  getCategoryBySlug,
} from "@/lib/constants/categories";
import { RezdyProduct } from "@/lib/types/rezdy";

("use client");

interface Props {
  initialProducts: RezdyProduct[];
}

export default function HopOnHopOffClient({ initialProducts }: Props) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "json">("cards");

  const {
    data: allProducts,
    loading,
    error,
  } = useRezdyProducts(1000, 0, initialProducts);

  // Get category configuration
  const categoryConfig = getCategoryBySlug("hop-on-hop-off");

  // Filter products for this category
  const categoryProducts = useMemo(() => {
    if (!allProducts || !categoryConfig) return [];
    return filterProductsByCategory(allProducts, categoryConfig);
  }, [allProducts, categoryConfig]);

  // Apply search filter
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return categoryProducts;

    return categoryProducts.filter(
      (product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categoryProducts, searchTerm]);

  // Group products by product type
  const groupedProducts = useMemo(() => {
    const grouped = filteredProducts.reduce((acc, product) => {
      const type = product.productType || "Uncategorized";
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(product);
      return acc;
    }, {} as Record<string, RezdyProduct[]>);

    // Sort groups by type name
    const sortedGroups: Record<string, RezdyProduct[]> = {};
    Object.keys(grouped)
      .sort()
      .forEach((key) => {
        sortedGroups[key] = grouped[key];
      });

    return sortedGroups;
  }, [filteredProducts]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProducts = categoryProducts.length;
    const avgPrice =
      categoryProducts.reduce((sum, p) => sum + (p.advertisedPrice || 0), 0) /
        totalProducts || 0;
    const priceRange = {
      min: Math.min(...categoryProducts.map((p) => p.advertisedPrice || 0)),
      max: Math.max(...categoryProducts.map((p) => p.advertisedPrice || 0)),
    };

    return {
      totalProducts,
      avgPrice,
      priceRange,
      productTypes: Object.keys(groupedProducts).length,
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
          <Bus className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Hop-On Hop-Off - Rezdy Data
            </h1>
            <p className="text-muted-foreground">
              Complete data analysis for hop-on hop-off products from Rezdy API
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Hop-on hop off products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.avgPrice.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Per person average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Range</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.priceRange.min} - ${stats.priceRange.max}
            </div>
            <p className="text-xs text-muted-foreground">Min to max pricing</p>
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
              <CardTitle>Hop-On Hop-Off Products</CardTitle>
              <CardDescription>
                All hop-on hop-off products available in Rezdy, filtered by
                sightseeing and transport keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search hop-on hop-off tours..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant={viewMode === "cards" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("cards")}
                    className="flex items-center gap-2"
                  >
                    <Grid className="h-4 w-4" />
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === "json" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("json")}
                    className="flex items-center gap-2"
                  >
                    <Code className="h-4 w-4" />
                    JSON
                  </Button>
                </div>
              </div>

              {loading && <LoadingSkeleton count={6} />}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!loading && viewMode === "cards" && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <RezdyProductCard
                      key={product.productCode}
                      product={product}
                    />
                  ))}
                </div>
              )}

              {!loading && viewMode === "json" && (
                <pre className="bg-muted p-4 text-sm rounded-md overflow-x-auto max-h-[600px]">
                  {JSON.stringify(filteredProducts, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics (Coming Soon)</CardTitle>
              <CardDescription>
                Detailed analytics will be available in a future update.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We are working hard to bring you comprehensive analytics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Raw Data Tab */}
        <TabsContent value="raw-data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Raw Data</CardTitle>
              <CardDescription>Inspect the raw product data.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 text-sm rounded-md overflow-x-auto max-h-[600px]">
                {JSON.stringify(filteredProducts, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
