import { useState, useEffect } from "react";
import { RezdyProduct } from "@/lib/types/rezdy";


const REZDY_BASE_URL = "https://api.rezdy.com/v1";
//const API_KEY = process.env.REZDY_API_KEY;
const API_KEY ='5d306fa86b9e4bc5b8c1692ed2a95069';

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

        /*const url = `/api/rezdy/products/tours-only${
          forceRefresh ? "?refresh=true" : ""
        }`;*/

        const url = `${REZDY_BASE_URL}/categories/292796/products?apiKey=${API_KEY}`;

        //const response = await fetch(url);
        
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('proData: ' + data);
        
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
