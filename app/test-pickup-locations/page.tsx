"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, MapPin, CheckCircle, XCircle } from "lucide-react";
import { PickupLocationService } from "@/lib/services/pickup-location-service";
import { getPickupLocationSummary } from "@/lib/utils/pickup-location-utils";
import { RezdyProduct } from "@/lib/types/rezdy";

export default function TestPickupLocationsPage() {
  const [products, setProducts] = useState<RezdyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/rezdy/products/all");
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = selectedLocation === "all" 
    ? products 
    : PickupLocationService.filterProductsByPickupLocation(products, selectedLocation);

  const summary = getPickupLocationSummary(products);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Error: {error}</p>
            <Button onClick={fetchProducts} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Pickup Location Test</h1>
        <p className="text-muted-foreground">
          Testing the pickup location extraction and filtering system
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">With Pickup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalWithPickup}</div>
            <p className="text-xs text-muted-foreground">
              {((summary.totalWithPickup / products.length) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Multi-Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.multiLocationProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products with 2+ locations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Filter Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedLocation === "all" ? "None" : selectedLocation}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredProducts.length} products shown
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Location Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pickup Location Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(summary.locationCounts).map(([location, count]) => (
              <div
                key={location}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{location}</p>
                    <p className="text-sm text-muted-foreground">
                      {count} products
                    </p>
                  </div>
                </div>
                <Button
                  variant={selectedLocation === location ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLocation(location)}
                >
                  Filter
                </Button>
              </div>
            ))}
          </div>
          {selectedLocation !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLocation("all")}
              className="mt-4"
            >
              Clear Filter
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Sample Products */}
      <Card>
        <CardHeader>
          <CardTitle>
            Sample Products {selectedLocation !== "all" && `from ${selectedLocation}`}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing first 10 products to verify pickup location extraction
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.slice(0, 10).map((product) => {
              const hasPickup = product.pickupLocations && product.pickupLocations.length > 0;
              return (
                <div key={product.productCode} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{product.name}</h3>
                    {hasPickup ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {product.shortDescription}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.pickupLocations?.map((location) => (
                      <Badge key={location} variant="secondary">
                        <MapPin className="mr-1 h-3 w-3" />
                        {location}
                      </Badge>
                    )) || (
                      <Badge variant="outline" className="text-muted-foreground">
                        No pickup locations detected
                      </Badge>
                    )}
                  </div>
                  {product.locationAddress && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Location: {typeof product.locationAddress === "string" 
                        ? product.locationAddress 
                        : product.locationAddress.city || "Unknown"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <Button onClick={fetchProducts} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Products
        </Button>
      </div>
    </div>
  );
}