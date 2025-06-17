import { useState, useEffect, useCallback } from "react";
import { RezdyProduct } from "@/lib/types/rezdy";

interface PaginatedProductsResponse {
  products: RezdyProduct[];
  totalCount?: number;
  hasMore?: boolean;
  cached: boolean;
  lastUpdated: string;
}

interface UsePaginatedProductsState {
  data: PaginatedProductsResponse | null;
  loading: boolean;
  error: string | null;
}

interface UsePaginatedProductsOptions {
  limit?: number;
  offset?: number;
  autoFetch?: boolean;
}

export function usePaginatedProducts(
  options: UsePaginatedProductsOptions = {}
) {
  const { limit = 100, offset = 0, autoFetch = true } = options;

  const [state, setState] = useState<UsePaginatedProductsState>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchProducts = useCallback(
    async (fetchLimit = limit, fetchOffset = offset, forceRefresh = false) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const searchParams = new URLSearchParams();
        searchParams.append("limit", fetchLimit.toString());
        searchParams.append("offset", fetchOffset.toString());

        if (forceRefresh) {
          searchParams.append("refresh", "true");
        }

        const url = `/api/rezdy/products?${searchParams.toString()}`;

        console.log("🔄 Fetching paginated products from:", url);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch products: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        const products = data.products || [];

        // Determine if there are more products
        const hasMore = products.length === fetchLimit;

        const responseData: PaginatedProductsResponse = {
          products,
          totalCount: data.totalCount,
          hasMore,
          cached: response.headers.get("X-Cache") === "HIT",
          lastUpdated: new Date().toISOString(),
        };

        console.log(
          `✅ Fetched ${products.length} products (limit: ${fetchLimit}, offset: ${fetchOffset}, hasMore: ${hasMore})`
        );

        setState({
          data: responseData,
          loading: false,
          error: null,
        });

        return responseData;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch products";
        console.error("❌ Error fetching paginated products:", errorMessage);

        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });

        throw error;
      }
    },
    [limit, offset]
  );

  const refreshProducts = useCallback(() => {
    return fetchProducts(limit, offset, true);
  }, [fetchProducts, limit, offset]);

  // Auto-fetch on mount and when limit/offset change
  useEffect(() => {
    if (autoFetch) {
      fetchProducts(limit, offset);
    }
  }, [fetchProducts, limit, offset, autoFetch]);

  return {
    // State
    ...state,

    // Actions
    fetchProducts,
    refreshProducts,

    // Computed values
    products: state.data?.products || [],
    totalCount: state.data?.totalCount || 0,
    hasMore: state.data?.hasMore || false,
    isCached: state.data?.cached || false,
    lastUpdated: state.data?.lastUpdated,
  };
}
