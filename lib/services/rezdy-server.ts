import { RezdyProduct } from "@/lib/types/rezdy";
import { cache } from "react";

const REZDY_BASE_URL = "https://api.rezdy.com/v1";
const API_KEY = process.env.REZDY_API_KEY;

/**
 * getRezdyProducts
 * ----------------
 * Server-side helper that fetches products from Rezdy API directly during build time
 * and falls back to internal API during runtime. This avoids URL parsing issues
 * during static generation when NEXT_PUBLIC_SITE_URL might not be available.
 */
export const getRezdyProducts = cache(
  async (limit: number = 100, offset: number = 0): Promise<RezdyProduct[]> => {
    try {
      // During build time or when NEXT_PUBLIC_SITE_URL is not available,
      // call Rezdy API directly to avoid URL parsing issues
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      const isBuilding = !siteUrl || siteUrl === "";

      if (isBuilding) {
        // Direct API call to Rezdy during build time
        if (!API_KEY) {
          console.warn(
            "⚠️ REZDY_API_KEY not found, returning empty products array"
          );
          return [];
        }

        const url = `${REZDY_BASE_URL}/products?apiKey=${API_KEY}&limit=${limit}&offset=${offset}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          next: { revalidate: 3600 },
          cache: "force-cache",
        });

        if (!res.ok) {
          console.error(`Failed to fetch from Rezdy API: ${res.status}`);
          return [];
        }

        const data = await res.json();
        return (data.products ?? data.data ?? []) as RezdyProduct[];
      } else {
        // Runtime: Use internal API route
        const res = await fetch(
          `${siteUrl}/api/rezdy/products?limit=${limit}&offset=${offset}`,
          {
            next: { revalidate: 3600 },
            cache: "force-cache",
          }
        );

        if (!res.ok) {
          console.error(`Failed to preload Rezdy products – ${res.status}`);
          return [];
        }

        const json = await res.json();
        return (json.products ?? json.data ?? []) as RezdyProduct[];
      }
    } catch (error) {
      console.error("Error in getRezdyProducts:", error);
      return [];
    }
  }
);
