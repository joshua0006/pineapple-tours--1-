import { useState, useEffect } from "react";
import { RezdyProduct } from "@/lib/types/rezdy";

interface UseToursOnlyState {
  data: RezdyProduct[] | null;
  loading: boolean;
  error: string | null;
}

export function useToursOnly(forceRefresh = false) {
  const [state, setState] = useState<UseToursOnlyState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchToursOnly = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const url = `/api/rezdy/products/tours-only${
          forceRefresh ? "?refresh=true" : ""
        }`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const products = data.products || [];
        console.log("useToursOnly: Fetched tours-only products:", {
          totalProducts: products.length,
          hasProducts: products.length > 0,
          cached: data.cached || false,
          filterInfo: data.filterInfo,
        });

        setState({
          data: products,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("useToursOnly error:", error);
        setState({
          data: null,
          loading: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch tours",
        });
      }
    };

    fetchToursOnly();
  }, [forceRefresh]);

  return state;
}
