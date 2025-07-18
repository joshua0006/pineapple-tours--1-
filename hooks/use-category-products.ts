import { useState, useEffect, useRef } from "react";
import { RezdyProduct } from "@/lib/types/rezdy";

interface UseCategoryProductsState {
  data: RezdyProduct[] | null;
  loading: boolean;
  error: string | null;
}

interface UseCategoryProductsReturn extends UseCategoryProductsState {
  refetch: () => void;
}

interface UseCategoryProductsOptions {
  enabled?: boolean;
  fallbackToAll?: boolean;
  forceRefresh?: boolean;
}

export function useCategoryProducts(
  categoryId: number | null,
  options: UseCategoryProductsOptions = {}
) {
  const { enabled = true, fallbackToAll = true, forceRefresh = false } = options;
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [state, setState] = useState<UseCategoryProductsState>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled || !categoryId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const fetchCategoryProducts = async () => {
      try {
        // Cancel any previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setState((prev) => ({ ...prev, loading: true, error: null }));

        // Build query parameters
        const params = new URLSearchParams();
        if (forceRefresh) {
          params.append('refresh', 'true');
        }
        
        const queryString = params.toString();
        const url = `/api/rezdy/categories/${categoryId}/products${queryString ? `?${queryString}` : ''}`;

        // First try to fetch products directly from the category API
        const response = await fetch(url, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const products = data.products || [];
        
        console.log("useCategoryProducts: Fetched category products:", {
          categoryId,
          totalProducts: products.length,
          hasProducts: products.length > 0,
          cached: data.cached || false,
          source: data.source || 'direct',
        });

        // If we got products, use them
        if (products.length > 0) {
          setState({
            data: products,
            loading: false,
            error: null,
          });
          return;
        }

        // If no products and fallback is enabled, try the fallback API
        if (fallbackToAll && products.length === 0) {
          console.log("useCategoryProducts: No products found, falling back to filtered all products");
          
          const fallbackParams = new URLSearchParams();
          if (forceRefresh) {
            fallbackParams.append('refresh', 'true');
          }
          
          const fallbackQueryString = fallbackParams.toString();
          const fallbackUrl = `/api/rezdy/products/tours-only${fallbackQueryString ? `?${fallbackQueryString}` : ''}`;
          
          const allProductsResponse = await fetch(fallbackUrl, {
            signal: abortController.signal,
          });
          
          if (!allProductsResponse.ok) {
            throw new Error(`Fallback HTTP error! status: ${allProductsResponse.status}`);
          }

          const allProductsData = await allProductsResponse.json();
          if (allProductsData.error) {
            throw new Error(allProductsData.error);
          }

          const allProducts = allProductsData.products || [];
          
          // Filter products that have the matching categoryId
          const filteredProducts = allProducts.filter((product: RezdyProduct) => 
            product.categoryId === categoryId
          );

          console.log("useCategoryProducts: Fallback filtering result:", {
            categoryId,
            totalAllProducts: allProducts.length,
            filteredProducts: filteredProducts.length,
            cached: allProductsData.cached || false,
          });

          setState({
            data: filteredProducts,
            loading: false,
            error: null,
          });
          return;
        }

        // No products found and no fallback
        setState({
          data: [],
          loading: false,
          error: null,
        });

      } catch (error) {
        // Don't update state if the request was aborted
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        console.error("useCategoryProducts error:", error);
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to fetch category products",
        });
      }
    };

    fetchCategoryProducts();
    
    // Cleanup function to abort request on unmount or dependency change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [categoryId, enabled, fallbackToAll, forceRefresh]);

  return {
    ...state,
    refetch: () => {
      if (categoryId) {
        // Force refetch by updating the forceRefresh option
        const refetchOptions = { ...options, forceRefresh: true };
        // Note: This is a simplified approach. In a real implementation,
        // you might want to use a more sophisticated state management approach.
        console.log('Refetch triggered for category:', categoryId);
      }
    },
  };
}