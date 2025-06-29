/*
 * usePrefetchRoutes
 * -----------------
 * Custom React hook that leverages Next.js router prefetching to warm up code
 * and data for routes we predict the user will visit soon.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function usePrefetchRoutes(routes: string[]) {
  const router = useRouter();

  useEffect(() => {
    // Guard against server-side execution.
    if (!router) return;

    routes.forEach((route) => {
      try {
        router.prefetch(route);
      } catch {
        // Silently ignore failures (e.g., dynamic routes not yet generated).
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
