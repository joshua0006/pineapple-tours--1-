"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BookingDebugPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Fetching products...");
        const response = await fetch("/api/rezdy/products?limit=10");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Products API response:", data);

        const products = data.products || data.data || [];
        console.log("Parsed products:", products);

        setProducts(products);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const testBookingLink = async (productCode: string) => {
    try {
      console.log(`Testing booking link for product: ${productCode}`);
      const response = await fetch(`/api/rezdy/products?limit=1000`);
      const data = await response.json();
      const products = data.products || data.data || [];
      const product = products.find((p: any) => p.productCode === productCode);

      console.log(`Found product:`, product);

      if (product) {
        console.log(`✅ Product found! Navigating to /booking/${productCode}`);
        window.location.href = `/booking/${productCode}`;
      } else {
        console.log(`❌ Product not found for code: ${productCode}`);
        alert(`Product not found for code: ${productCode}`);
      }
    } catch (err) {
      console.error("Error testing booking link:", err);
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading products...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Debug Page</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Found {products.length} products. Testing booking functionality...
          </p>

          <div className="space-y-4">
            {products.slice(0, 5).map((product, index) => (
              <Card key={index} className="border">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-600">
                      Product Code:{" "}
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {product.productCode}
                      </code>
                    </p>
                    <p className="text-sm">{product.shortDescription}</p>

                    <div className="flex gap-2 mt-4">
                      <Link href={`/booking/${product.productCode}`}>
                        <Button variant="default">Book Now (Link)</Button>
                      </Link>

                      <Button
                        variant="outline"
                        onClick={() => testBookingLink(product.productCode)}
                      >
                        Test Booking Link
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          console.log("Product details:", product);
                          alert(
                            `Check console for product details: ${product.productCode}`
                          );
                        }}
                      >
                        Debug Product
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h4 className="font-semibold mb-2">Debug Info:</h4>
            <ul className="text-sm space-y-1">
              <li>Total products found: {products.length}</li>
              <li>API endpoint: /api/rezdy/products</li>
              <li>Booking URL pattern: /booking/[productCode]</li>
              <li>
                Sample product codes:{" "}
                {products
                  .slice(0, 3)
                  .map((p) => p.productCode)
                  .join(", ")}
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
