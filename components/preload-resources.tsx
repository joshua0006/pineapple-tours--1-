import React from "react";

/**
 * PreloadResources embeds <link rel="preload"> directives for critical assets
 * that are required for the first paint. Only include truly critical assets here
 * to avoid degrading performance by clogging the preload queue.
 * 
 * Note: Font preloading has been intentionally removed. The fonts (Barlow, Open_Sans, Work_Sans)
 * use display: "optional" which allows them to be skipped on slow connections. Preloading fonts
 * with display: "optional" is counterproductive as it forces downloads that may not be used,
 * causing unused preload warnings and wasting bandwidth.
 */
export function PreloadResources() {
  return (
    <>
      {/* Critical CSS */}
      {/* Next.js hashes CSS filenames at build time; rely on route-based CSS chunks. */}
      {/* If you move global styles into their own file outside the _app import, you
          can expose its stable path and preload it here. Placeholder retained for
          future-proofing. */}
      {/* <link rel="preload" href="/styles/globals.css" as="style" /> */}

      {/* Hero / Above-the-fold images */}
      {/* Logo preload removed to prevent unused preload warnings.
          The logo is used in conditionally rendered components (mobile nav, popups)
          that may not appear immediately on page load. The main header logo
          will load fast enough without preloading due to its small size. */}

      {/* Note: hop-on-hop-off images removed from preload as they're loaded conditionally
          with skeleton loading states, causing unused preload warnings */}

      {/* Prefetch critical API endpoints for faster navigation */}
      <link rel="prefetch" href="/api/tours" />
      <link rel="prefetch" href="/api/categories" />
      <link rel="prefetch" href="/api/rezdy/products?limit=100&offset=0" />
      <link rel="prefetch" href="/api/rezdy/products?limit=20&offset=0" />

      {/* DNS prefetch for external services */}
      <link rel="dns-prefetch" href="//api.rezdy.com" />
      <link rel="dns-prefetch" href="//maps.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />

      {/* Preconnect to external services for faster loading */}
      <link rel="preconnect" href="https://api.rezdy.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

      {/* Prefetch common product data endpoints */}
      <link rel="prefetch" href="/api/rezdy/categories" />
      <link rel="prefetch" href="/api/tour-categories" />

      {/* Future-critical JS bundles (inlined via Next.js) are automatically pushed; we only
          need to handle third-party scripts. Example shown for analytics. */}
      {/* <link rel="preload" href="https://www.googletagmanager.com/gtag/js?id=GA_ID" as="script" /> */}
    </>
  );
}
