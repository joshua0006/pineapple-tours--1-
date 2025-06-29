import { RezdyProduct } from "@/lib/types/rezdy";
import { cache } from "react";

/**
 * getRezdyProducts
 * ----------------
 * Small server-side helper that talks to our existing edge function at
 * `/api/rezdy/products` but with Next.js native caching semantics. Because
 * this executes in a React Server Component (RSC) context it will be run
 * **at build-time** for `force-static`/ISR pages and **on the server** for
 * dynamic pages.  We keep the inner `fetch` cached for one hour via the
 * `revalidate` option – downstream requests hit the same cache-entry so we
 * don't re-query Rezdy more than once per hour across the entire app.
 *
 * NOTE: We purposefully talk to our own internal API route rather than the
 * external Rezdy API so we can reuse the existing `simpleCacheManager`
 * logic and rate-limit handling already implemented there.
 */
export const getRezdyProducts = cache(
  async (limit: number = 100, offset: number = 0): Promise<RezdyProduct[]> => {
    // Internal relative request – This is resolved by Next.js / Edge-runtime
    // without an external network hop.
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_SITE_URL ?? ""
      }/api/rezdy/products?limit=${limit}&offset=${offset}`,
      {
        // Revalidate once every 3600 seconds (1 h). You can tune this easily.
        next: { revalidate: 3600 },
        // Keep identical requests deduped.
        cache: "force-cache",
      }
    );

    if (!res.ok) {
      // Surface a friendlier error for the calling component.
      throw new Error(`Failed to preload Rezdy products – ${res.status}`);
    }

    const json = await res.json();
    // The API returns either `products` or `data` – normalise that.
    return (json.products ?? json.data ?? []) as RezdyProduct[];
  }
);
