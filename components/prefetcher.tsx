"use client";

import { usePrefetchRoutes } from "@/hooks/use-prefetch-routes";

// Adjust this list based on actual navigation patterns.
const ROUTES_TO_PREFETCH = ["/about", "/tours", "/blog"];

export function Prefetcher() {
  usePrefetchRoutes(ROUTES_TO_PREFETCH);
  return null;
}
