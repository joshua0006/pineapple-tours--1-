"use client";

import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  RefreshCw,
  AlertCircle,
  Package,
  Code,
  Tag,
  Clock,
  DollarSign,
  Download,
  Copy,
  CheckCircle,
  Info,
  Zap,
} from "lucide-react";
import { format } from "date-fns";

import { useRezdyProducts } from "@/hooks/use-rezdy";
import { RezdyProduct, RezdyPickupLocation } from "@/lib/types/rezdy";

interface Props {
  initialProducts: RezdyProduct[];
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  lastUpdate: string;
}

export default function RezdyDataClient({ initialProducts }: Props) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductType, setSelectedProductType] = useState<string>("all");
  const [selectedBudgetRange, setSelectedBudgetRange] = useState<string>("all");
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedProduct, setSelectedProduct] = useState<RezdyProduct | null>(null);
  const [pickupData, setPickupData] = useState<RezdyPickupLocation[] | null>(null);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [pickupError, setPickupError] = useState<string | null>(null);
  const [jsonMode, setJsonMode] = useState<"products" | "pickups">("products");

  // Fetch data with initial products
  const {
    data: products,
    loading: productsLoading,
    error: productsError,
  } = useRezdyProducts(1000, 0, initialProducts);

  // Fetch cache statistics
  const fetchCacheStats = async () => {
    try {
      const response = await fetch("/api/rezdy/products?stats=true");
      if (response.ok) {
        const data = await response.json();
        setCacheStats({
          hits: data.cache.hits,
          misses: data.cache.misses,
          size: data.cache.size,
          lastUpdate: data.timestamp,
        });
      }
    } catch (error) {
      console.error("Failed to fetch cache stats:", error);
    }
  };

  useEffect(() => {
    fetchCacheStats();
    const interval = setInterval(fetchCacheStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      // Exclude gift cards
      if (product.productType === "GIFT_CARD") {
        return false;
      }

      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.shortDescription &&
          product.shortDescription
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      // Type filter
      const matchesType =
        selectedProductType === "all" ||
        (product.categories &&
          product.categories.some((cat) =>
            cat.toLowerCase().includes(selectedProductType.toLowerCase())
          ));

      // Budget filter
      let matchesBudget = true;
      if (selectedBudgetRange !== "all" && product.advertisedPrice) {
        const price = product.advertisedPrice;
        switch (selectedBudgetRange) {
          case "budget":
            matchesBudget = price < 100;
            break;
          case "mid":
            matchesBudget = price >= 100 && price < 300;
            break;
          case "premium":
            matchesBudget = price >= 300;
            break;
        }
      }

      return matchesSearch && matchesType && matchesBudget;
    });
  }, [products, searchTerm, selectedProductType, selectedBudgetRange]);

  // Get unique product types for filter
  const productTypes = useMemo(() => {
    if (!products) return [];
    const types = new Set<string>();
    products.forEach((product) => {
      if (product.categories) {
        product.categories.forEach((cat) => types.add(cat));
      }
    });
    return Array.from(types).sort();
  }, [products]);

  // Statistics
  const stats = useMemo(() => {
    if (!products) return null;

    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.status === "ACTIVE").length;
    const avgPrice =
      products
        .filter((p) => p.advertisedPrice)
        .reduce((sum, p) => sum + (p.advertisedPrice || 0), 0) /
      products.filter((p) => p.advertisedPrice).length;

    const categoryCounts = products.reduce((acc, product) => {
      if (product.categories) {
        product.categories.forEach((cat) => {
          acc[cat] = (acc[cat] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProducts,
      activeProducts,
      avgPrice: avgPrice || 0,
      categoryCounts,
      filteredCount: filteredProducts.length,
    };
  }, [products, filteredProducts]);

  const handleRefresh = async () => {
    setLastRefresh(new Date());
    await fetchCacheStats();
    // Force refresh by clearing cache
    window.location.reload();
  };

  // Fetch pickup data for selected product
  const fetchPickupData = async (productCode: string) => {
    setPickupLoading(true);
    setPickupError(null);
    try {
      const response = await fetch(
        `/api/rezdy/products/${productCode}/pickups`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch pickups: ${response.status}`);
      }
      const data = await response.json();
      setPickupData(data.pickups || []);
    } catch (error) {
      console.error("Error fetching pickup data:", error);
      setPickupError(
        error instanceof Error ? error.message : "Failed to fetch pickups"
      );
      setPickupData([]);
    } finally {
      setPickupLoading(false);
    }
  };

  // Handle product selection for pickups
  const handleProductSelect = async (product: RezdyProduct) => {
    setSelectedProduct(product);
    await fetchPickupData(product.productCode);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(filteredProducts, null, 2)
      );
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const handleDownloadJson = () => {
    const dataStr = JSON.stringify(filteredProducts, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rezdy-products-${format(
      new Date(),
      "yyyy-MM-dd-HHmm"
    )}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (productsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load Rezdy products: {productsError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Rezdy Data Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time product data with caching and rate limiting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {cacheStats && (
            <Badge variant="secondary">
              <Zap className="h-3 w-3 mr-1" />
              Cache: {cacheStats.hits}H/{cacheStats.misses}M
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="pickups">Pickups</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="json">JSON Data</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Products
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalProducts}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeProducts} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Price
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats.avgPrice.toFixed(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Per tour</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Filtered Results
                  </CardTitle>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.filteredCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Matching filters
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Last Updated
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {format(lastRefresh, "HH:mm")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(lastRefresh, "MMM dd")}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cache Information */}
          {cacheStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Cache Performance
                </CardTitle>
                <CardDescription>
                  Rate limiting and caching statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Cache Hits</Label>
                    <div className="text-2xl font-bold text-green-600">
                      {cacheStats.hits}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Cache Misses</Label>
                    <div className="text-2xl font-bold text-orange-600">
                      {cacheStats.misses}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Hit Rate</Label>
                    <div className="text-2xl font-bold">
                      {cacheStats.hits + cacheStats.misses > 0
                        ? Math.round(
                            (cacheStats.hits /
                              (cacheStats.hits + cacheStats.misses)) *
                              100
                          )
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">Search Products</Label>
                  <Input
                    id="search"
                    placeholder="Search by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Product Type</Label>
                  <Select
                    value={selectedProductType}
                    onValueChange={setSelectedProductType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
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
                </div>
                <div>
                  <Label htmlFor="budget">Budget Range</Label>
                  <Select
                    value={selectedBudgetRange}
                    onValueChange={setSelectedBudgetRange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All budgets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Budgets</SelectItem>
                      <SelectItem value="budget">Budget (&lt; $100)</SelectItem>
                      <SelectItem value="mid">Mid-range ($100-$300)</SelectItem>
                      <SelectItem value="premium">Premium ($300+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products List */}
          <Card>
            <CardHeader>
              <CardTitle>Products ({filteredProducts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.productCode}
                        className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                        onClick={() => {
                          handleProductSelect(product);
                          setActiveTab("pickups");
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          <Badge
                            variant={
                              product.status === "ACTIVE"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {product.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Code: {product.productCode}
                        </p>
                        {product.advertisedPrice && (
                          <p className="text-sm font-medium">
                            From ${product.advertisedPrice}
                          </p>
                        )}
                        {product.categories && (
                          <div className="flex gap-1 mt-2">
                            {product.categories.map((cat) => (
                              <Badge
                                key={cat}
                                variant="outline"
                                className="text-xs"
                              >
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pickups" className="space-y-6">
          {/* Product Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select a Product</CardTitle>
              <CardDescription>
                {selectedProduct
                  ? `Viewing pickups for: ${selectedProduct.name}`
                  : "Choose a product from the Products tab to view its pickup locations"}
              </CardDescription>
            </CardHeader>
            {selectedProduct && (
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-semibold">{selectedProduct.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Code: {selectedProduct.productCode}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchPickupData(selectedProduct.productCode)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Pickups
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Pickup Locations */}
          {selectedProduct && (
            <Card>
              <CardHeader>
                <CardTitle>Pickup Locations</CardTitle>
                <CardDescription>
                  Available pickup points from Rezdy API with detailed location information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pickupLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : pickupError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{pickupError}</AlertDescription>
                  </Alert>
                ) : pickupData && pickupData.length > 0 ? (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {pickupData.map((pickup) => (
                        <div
                          key={pickup.id}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold">{pickup.locationName}</h4>
                          </div>
                          {pickup.address && (
                            <div className="flex items-start gap-2 text-sm">
                              <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span>{pickup.address}</span>
                            </div>
                          )}
                          {(pickup.latitude && pickup.longitude) && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Info className="h-4 w-4" />
                              <span>
                                Coordinates: {pickup.latitude}, {pickup.longitude}
                              </span>
                            </div>
                          )}
                          {pickup.minutesPrior && (
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>Arrive {Math.abs(pickup.minutesPrior)} minutes early</span>
                            </div>
                          )}
                          {pickup.additionalInstructions && (
                            <div className="flex items-start gap-2 text-sm bg-blue-50 p-2 rounded">
                              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                              <span className="text-blue-800">{pickup.additionalInstructions}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No pickup locations found for this product in the Rezdy API.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pickup JSON Data */}
          {selectedProduct && pickupData && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pickup JSON Data</CardTitle>
                    <CardDescription>
                      Raw pickup data for {selectedProduct.name}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            JSON.stringify(pickupData, null, 2)
                          );
                          setCopiedToClipboard(true);
                          setTimeout(() => setCopiedToClipboard(false), 2000);
                        } catch (error) {
                          console.error("Failed to copy:", error);
                        }
                      }}
                    >
                      {copiedToClipboard ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copiedToClipboard ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const dataStr = JSON.stringify(pickupData, null, 2);
                        const dataBlob = new Blob([dataStr], {
                          type: "application/json",
                        });
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `pickups-${selectedProduct.productCode}-${
                          format(new Date(), "yyyy-MM-dd-HHmm")
                        }.json`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{JSON.stringify(pickupData, null, 2)}</code>
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          {/* API Endpoints Documentation */}
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Rezdy Products API Endpoints
                </CardTitle>
                <CardDescription>
                  Complete documentation of all /products endpoints with JSON
                  examples
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Main Products Endpoint */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  1. Main Products Endpoint
                </CardTitle>
                <Badge variant="secondary">GET /api/rezdy/products</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Parameters:</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>?limit=100&offset=0&featured=true&stats=true</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Response Structure:</h4>
                  <ScrollArea className="h-64">
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      <code>
                        {JSON.stringify(
                          {
                            products: [
                              {
                                productCode: "TOUR001",
                                name: "Sydney Harbour Bridge Climb",
                                shortDescription:
                                  "Climb the iconic Sydney Harbour Bridge",
                                description:
                                  "Experience breathtaking views from the top of the Sydney Harbour Bridge...",
                                advertisedPrice: 189.0,
                                images: [
                                  {
                                    id: 1,
                                    itemUrl: "https://example.com/image.jpg",
                                    thumbnailUrl:
                                      "https://example.com/thumb.jpg",
                                    mediumSizeUrl:
                                      "https://example.com/medium.jpg",
                                    largeSizeUrl:
                                      "https://example.com/large.jpg",
                                    caption: "Bridge Climb View",
                                    isPrimary: true,
                                  },
                                ],
                                quantityRequiredMin: 1,
                                quantityRequiredMax: 20,
                                productType: "TOUR",
                                locationAddress:
                                  "Sydney Harbour Bridge, Sydney NSW",
                                status: "ACTIVE",
                                categories: [
                                  "Adventure",
                                  "Sightseeing",
                                  "Iconic",
                                ],
                                extras: [],
                              },
                            ],
                            pagination: {
                              limit: 100,
                              offset: 0,
                              count: 1,
                              hasMore: false,
                            },
                          },
                          null,
                          2
                        )}
                      </code>
                    </pre>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* All Products Endpoint */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  2. All Products (Batched)
                </CardTitle>
                <Badge variant="secondary">GET /api/rezdy/products/all</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Parameters:</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>?refresh=true</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Response Structure:</h4>
                  <ScrollArea className="h-64">
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      <code>
                        {JSON.stringify(
                          {
                            products: ["... all products array ..."],
                            totalCount: 250,
                            cached: false,
                            lastUpdated: "2024-01-15T10:30:00.000Z",
                            fetchStats: {
                              totalProducts: 250,
                              fetchTime: "2024-01-15T10:30:00.000Z",
                            },
                          },
                          null,
                          2
                        )}
                      </code>
                    </pre>
                  </ScrollArea>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Fetches ALL products using batch processing with rate
                    limiting (600ms delay between batches)
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Tours Only Endpoint */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">3. Tours Only Filter</CardTitle>
                <Badge variant="secondary">
                  GET /api/rezdy/products/tours-only
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Parameters:</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>?refresh=true&stats=true</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Filtering Logic:</h4>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <strong>Excludes:</strong> GIFT_CARD, vouchers, gift cards,
                    certificates
                    <br />
                    <strong>Filters:</strong> Names/descriptions containing
                    "gift", "voucher", "card", "certificate"
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    Complete Response Structure:
                  </h4>
                  <ScrollArea className="h-96">
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      <code>
                        {JSON.stringify(
                          {
                            products: [
                              {
                                productCode: "PH1FEA",
                                name: "Hop on Hop off Bus - Tamborine Mountain - From Brisbane",
                                shortDescription:
                                  "Experience the scenic beauty of Tamborine Mountain with our hop-on hop-off service",
                                description:
                                  "Take in the breathtaking views of the Gold Coast hinterland as you explore Tamborine Mountain at your own pace. Our hop-on hop-off bus service allows you to discover wineries, galleries, and rainforest walks.",
                                advertisedPrice: 99.0,
                                images: [
                                  {
                                    id: 1,
                                    itemUrl:
                                      "https://example.com/tamborine-bus.jpg",
                                    thumbnailUrl:
                                      "https://example.com/tamborine-bus-thumb.jpg",
                                    mediumSizeUrl:
                                      "https://example.com/tamborine-bus-medium.jpg",
                                    largeSizeUrl:
                                      "https://example.com/tamborine-bus-large.jpg",
                                    caption: "Hop on Hop off Bus",
                                    isPrimary: true,
                                  },
                                ],
                                quantityRequiredMin: 1,
                                quantityRequiredMax: 20,
                                productType: "CUSTOM",
                                locationAddress: "Brisbane, QLD",
                                customFields: {},
                                status: "ACTIVE",
                                categories: [
                                  "Tours",
                                  "Sightseeing",
                                  "Transportation",
                                ],
                                extras: [],
                              },
                              {
                                productCode: "PRPEE2",
                                name: "27 Seat Minibus Charter South East QLD and Northern NSW - Hourly Rate",
                                shortDescription:
                                  "Private minibus charter service for groups",
                                description:
                                  "Professional charter service with experienced drivers covering South East Queensland and Northern NSW regions.",
                                advertisedPrice: 240.0,
                                images: [],
                                quantityRequiredMin: 1,
                                quantityRequiredMax: 27,
                                productType: "RENTAL",
                                locationAddress: "South East QLD",
                                status: "ACTIVE",
                                categories: [
                                  "Charter",
                                  "Transportation",
                                  "Group Tours",
                                ],
                                extras: [],
                              },
                              {
                                productCode: "PHKGRW",
                                name: "3 Day Luxury Brisbane - Gold Coast - Byron Bay Experience",
                                shortDescription:
                                  "Luxury multi-day tour covering Brisbane, Gold Coast and Byron Bay",
                                description:
                                  "Indulge in a premium 3-day experience showcasing the best of South East Queensland. Visit Brisbane's cultural highlights, Gold Coast beaches, and Byron Bay's bohemian charm.",
                                advertisedPrice: 1995.0,
                                images: [
                                  {
                                    id: 1,
                                    itemUrl:
                                      "https://example.com/luxury-tour.jpg",
                                    thumbnailUrl:
                                      "https://example.com/luxury-tour-thumb.jpg",
                                    mediumSizeUrl:
                                      "https://example.com/luxury-tour-medium.jpg",
                                    largeSizeUrl:
                                      "https://example.com/luxury-tour-large.jpg",
                                    caption: "Luxury Tour Experience",
                                    isPrimary: true,
                                  },
                                ],
                                quantityRequiredMin: 2,
                                quantityRequiredMax: 8,
                                productType: "DAYTOUR",
                                locationAddress: "Brisbane to Byron Bay",
                                status: "ACTIVE",
                                categories: ["Luxury", "Multi-day", "Premium"],
                                extras: [
                                  {
                                    id: "MEAL_UPGRADE",
                                    name: "Premium Dining Package",
                                    description:
                                      "Upgrade to fine dining experiences",
                                    price: 150.0,
                                    currency: "AUD",
                                    priceType: "PER_PERSON",
                                    isRequired: false,
                                    isAvailable: true,
                                  },
                                ],
                              },
                            ],
                            totalCount: 200,
                            cached: false,
                            lastUpdated: "2025-01-15T10:30:00.000Z",
                            filterInfo: {
                              type: "tours-only",
                              excludes: [
                                "GIFT_CARD",
                                "vouchers",
                                "gift cards",
                                "certificates",
                              ],
                              originalCount: 214,
                              filteredCount: 200,
                              excludedCount: 14,
                            },
                            productTypes: [
                              "CUSTOM",
                              "RENTAL",
                              "DAYTOUR",
                              "CHARTER",
                              "PRIVATE_TOUR",
                              "TRANSFER",
                              "LESSON",
                              "ACTIVITY",
                              "MERCHANDISE",
                              "TICKET",
                              "MULTIDAYTOUR",
                            ],
                            priceRange: {
                              min: 1,
                              max: 2550,
                              average: 290.72,
                            },
                            batchInfo: {
                              rateLimitDelay: "600ms",
                              maxBatches: 50,
                              batchSize: 100,
                            },
                          },
                          null,
                          2
                        )}
                      </code>
                    </pre>
                  </ScrollArea>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Smart Filtering:</strong> Automatically excludes 14
                    gift cards/vouchers from 214 total products, returning 200
                    actual tours with detailed filtering info and price
                    analytics.
                  </AlertDescription>
                </Alert>
                <div>
                  <h4 className="font-semibold mb-2">
                    Cache Response (when cached=true):
                  </h4>
                  <ScrollArea className="h-32">
                    <pre className="text-xs bg-green-50 p-3 rounded overflow-x-auto">
                      <code>
                        {JSON.stringify(
                          {
                            products: ["... cached products array ..."],
                            totalCount: 200,
                            cached: true,
                            lastUpdated: "2025-01-15T10:30:00.000Z",
                            filterInfo: {
                              type: "tours-only",
                              excludes: [
                                "GIFT_CARD",
                                "vouchers",
                                "gift cards",
                                "certificates",
                              ],
                            },
                          },
                          null,
                          2
                        )}
                      </code>
                    </pre>
                  </ScrollArea>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    Stats Response (?stats=true):
                  </h4>
                  <ScrollArea className="h-24">
                    <pre className="text-xs bg-blue-50 p-3 rounded overflow-x-auto">
                      <code>
                        {JSON.stringify(
                          {
                            cache: {
                              hits: 87,
                              misses: 12,
                              size: 1048576,
                              hitRate: 87.9,
                            },
                            timestamp: "2025-01-15T10:30:00.000Z",
                          },
                          null,
                          2
                        )}
                      </code>
                    </pre>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* Single Product Endpoint */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  4. Single Product by Code
                </CardTitle>
                <Badge variant="secondary">GET /api/tours/[productCode]</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">URL Example:</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>/api/tours/TOUR001?refresh=false</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Response:</h4>
                  <ScrollArea className="h-40">
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      <code>
                        {JSON.stringify(
                          {
                            tour: {
                              productCode: "TOUR001",
                              name: "Sydney Harbour Bridge Climb",
                              description: "Full product details...",
                              advertisedPrice: 189.0,
                              status: "ACTIVE",
                            },
                            cached: true,
                            lastUpdated: "2024-01-15T10:30:00.000Z",
                          },
                          null,
                          2
                        )}
                      </code>
                    </pre>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* Product Pickups Endpoint */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  5. Product Pickups
                </CardTitle>
                <Badge variant="secondary">
                  GET /api/rezdy/products/[productCode]/pickups
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">URL Example:</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>/api/rezdy/products/PH1FEA/pickups?refresh=false</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Response Structure:</h4>
                  <ScrollArea className="h-96">
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      <code>
                        {JSON.stringify(
                          {
                            pickups: [
                              {
                                locationName: "Brisbane Marriott",
                                address: "1 Howard Street, Brisbane City QLD, Australia",
                                latitude: -27.4638665,
                                longitude: 153.0317271,
                                minutesPrior: -15,
                                additionalInstructions: "Please meet at the Howard St Entrance of Brisbane Marriott, Hotel, Please make sure that you are 15 minutes early as the time listed is the departure time. If there are any changes we will notify you via WhatsApp text the evening before your tour."
                              },
                              {
                                locationName: "Royal on the Park",
                                address: "152 Alice St, Brisbane City QLD 4000, Australia",
                                minutesPrior: -30,
                                additionalInstructions: "Please meet at the Main entrance of Royal on the Park on Alice St, Please make sure that you are 15 minutes early as the time listed is the departure time. If there are any changes we will notify you via WhatsApp text the evening before your tour."
                              },
                              {
                                locationName: "Near Emporium Southbank",
                                address: "267 Grey St, South Brisbane Brisbane, QLD, Australia",
                                latitude: -27.4821317,
                                longitude: 153.0238281,
                                minutesPrior: -40,
                                additionalInstructions: "Meet at the Grey St Entrance of Emporium Hotel, Please make sure that you are 15 minutes early as the time listed is the departure time. If there are any changes we will notify you via WhatsApp text the evening before your tour."
                              }
                            ],
                            productCode: "PH1FEA",
                            totalCount: 3,
                            cached: false,
                            lastUpdated: "2025-01-15T10:30:00.000Z",
                            hasPickups: true,
                            requestStatus: {
                              success: true,
                              version: "v1"
                            }
                          },
                          null,
                          2
                        )}
                      </code>
                    </pre>
                  </ScrollArea>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Real Rezdy API Data:</strong> This endpoint fetches actual pickup locations
                    from Rezdy's /products/[productCode]/pickups endpoint with detailed location
                    information, GPS coordinates, timing instructions, and pickup instructions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Search Endpoint */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  6. Search with Availability
                </CardTitle>
                <Badge variant="secondary">GET /api/search</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Parameters:</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>
                      ?query=bridge&category=adventure&checkIn=2024-01-20&checkOut=2024-01-21&participants=2
                    </code>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Response:</h4>
                  <ScrollArea className="h-48">
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      <code>
                        {JSON.stringify(
                          {
                            products: ["... filtered products ..."],
                            totalCount: 25,
                            pagination: {
                              page: 1,
                              limit: 12,
                              totalPages: 3,
                            },
                            filters: {
                              query: "bridge",
                              category: "adventure",
                              checkIn: "2024-01-20",
                              checkOut: "2024-01-21",
                              participants: "2",
                            },
                            availabilityChecked: true,
                          },
                          null,
                          2
                        )}
                      </code>
                    </pre>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* Cache Stats Endpoint */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">7. Cache Statistics</CardTitle>
                <Badge variant="secondary">
                  GET /api/rezdy/products?stats=true
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Response:</h4>
                  <ScrollArea className="h-32">
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      <code>
                        {JSON.stringify(
                          {
                            cache: {
                              hits: 145,
                              misses: 23,
                              size: 1024000,
                              hitRate: 86.3,
                            },
                            timestamp: "2024-01-15T10:30:00.000Z",
                          },
                          null,
                          2
                        )}
                      </code>
                    </pre>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* Error Responses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  8. Error Response Formats
                </CardTitle>
                <Badge variant="destructive">Error Handling</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">
                      API Key Missing (500):
                    </h4>
                    <pre className="text-xs bg-red-50 p-3 rounded">
                      <code>
                        {JSON.stringify(
                          {
                            error: "Rezdy API key not configured",
                          },
                          null,
                          2
                        )}
                      </code>
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Product Not Found (404):
                    </h4>
                    <pre className="text-xs bg-red-50 p-3 rounded">
                      <code>
                        {JSON.stringify(
                          {
                            error: "Tour not found",
                          },
                          null,
                          2
                        )}
                      </code>
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Rate Limit (500):</h4>
                    <pre className="text-xs bg-red-50 p-3 rounded">
                      <code>
                        {JSON.stringify(
                          {
                            error: "Failed to fetch products from Rezdy",
                            details: "Rate limit exceeded",
                          },
                          null,
                          2
                        )}
                      </code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Direct Rezdy API */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  9. Direct Rezdy API Structure
                </CardTitle>
                <Badge variant="outline">External API</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Rezdy API URL:</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>
                      https://api.rezdy.com/v1/products?apiKey=YOUR_KEY&limit=100&offset=0
                    </code>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Raw Rezdy Response:</h4>
                  <ScrollArea className="h-40">
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      <code>
                        {JSON.stringify(
                          {
                            requestStatus: {
                              success: true,
                            },
                            products: [
                              {
                                productCode: "TOUR001",
                                name: "Product Name",
                                advertisedPrice: 100.0,
                                productType: "TOUR",
                                images: [
                                  {
                                    itemUrl: "https://example.com/image.jpg",
                                    thumbnailUrl:
                                      "https://example.com/thumb.jpg",
                                  },
                                ],
                              },
                            ],
                          },
                          null,
                          2
                        )}
                      </code>
                    </pre>
                  </ScrollArea>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    All internal APIs transform the raw Rezdy response into a
                    consistent format with enhanced caching and error handling.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="json" className="space-y-6">
          {/* JSON Mode Selector */}
          <Card>
            <CardHeader>
              <CardTitle>JSON Data Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={jsonMode === "products" ? "default" : "outline"}
                  onClick={() => setJsonMode("products")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Products JSON
                </Button>
                <Button
                  variant={jsonMode === "pickups" ? "default" : "outline"}
                  onClick={() => setJsonMode("pickups")}
                  disabled={!selectedProduct || !pickupData}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Pickups JSON
                </Button>
              </div>
              {jsonMode === "pickups" && !selectedProduct && (
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Select a product from the Products or Pickups tab to view pickup JSON data.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* JSON Data Display */}
          {jsonMode === "products" ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Products JSON Data</CardTitle>
                    <CardDescription>
                      Raw product data in JSON format ({filteredProducts.length}{" "}
                      products)
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyJson}>
                      {copiedToClipboard ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copiedToClipboard ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadJson}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] w-full">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{JSON.stringify(filteredProducts, null, 2)}</code>
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : selectedProduct && pickupData ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pickups JSON Data</CardTitle>
                    <CardDescription>
                      Pickup locations for {selectedProduct.name} ({pickupData.length} locations)
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            JSON.stringify(pickupData, null, 2)
                          );
                          setCopiedToClipboard(true);
                          setTimeout(() => setCopiedToClipboard(false), 2000);
                        } catch (error) {
                          console.error("Failed to copy:", error);
                        }
                      }}
                    >
                      {copiedToClipboard ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copiedToClipboard ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const dataStr = JSON.stringify(pickupData, null, 2);
                        const dataBlob = new Blob([dataStr], {
                          type: "application/json",
                        });
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `pickups-${selectedProduct.productCode}-${
                          format(new Date(), "yyyy-MM-dd-HHmm")
                        }.json`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] w-full">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{JSON.stringify(pickupData, null, 2)}</code>
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {stats && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.categoryCounts)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 10)
                      .map(([category, count]) => (
                        <div
                          key={category}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm">{category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${
                                    (count /
                                      Math.max(
                                        ...Object.values(stats.categoryCounts)
                                      )) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Performance</CardTitle>
                  <CardDescription>
                    Rate limiting and caching effectiveness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          30 min
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Cache TTL
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          1000
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Max Products
                        </div>
                      </div>
                    </div>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        This dashboard implements intelligent caching with a
                        30-minute TTL for products and 1-minute TTL for
                        availability data. Rate limiting prevents API abuse
                        while ensuring fresh data availability.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
