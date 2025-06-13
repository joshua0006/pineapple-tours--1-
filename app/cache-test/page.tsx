"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CacheTestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const testCache = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Make multiple requests to test caching
      const requests = [
        { name: "First Request", url: "/api/rezdy/products?limit=5" },
        {
          name: "Second Request (should be cached)",
          url: "/api/rezdy/products?limit=5",
        },
        { name: "Cache Stats", url: "/api/rezdy/products?stats=true" },
      ];

      for (const request of requests) {
        const startTime = Date.now();
        const response = await fetch(request.url);
        const endTime = Date.now();

        const data = await response.json();
        const cacheStatus = response.headers.get("X-Cache") || "UNKNOWN";
        const cacheKey = response.headers.get("X-Cache-Key") || "N/A";

        setResults((prev) => [
          ...prev,
          {
            name: request.name,
            duration: endTime - startTime,
            cacheStatus,
            cacheKey,
            productCount: data.products?.length || 0,
            data: request.name === "Cache Stats" ? data : null,
          },
        ]);

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Cache test error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Rezdy Products Cache Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testCache} disabled={loading}>
            {loading ? "Testing..." : "Test Cache Performance"}
          </Button>

          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results:</h3>
              {results.map((result, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>{result.name}</strong>
                        <p>Duration: {result.duration}ms</p>
                        <p>
                          Cache Status:{" "}
                          <span
                            className={
                              result.cacheStatus === "HIT"
                                ? "text-green-600"
                                : "text-orange-600"
                            }
                          >
                            {result.cacheStatus}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p>Cache Key: {result.cacheKey}</p>
                        <p>Products: {result.productCount}</p>
                      </div>
                    </div>
                    {result.data && (
                      <div className="mt-4">
                        <h4 className="font-semibold">Cache Statistics:</h4>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-2">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
