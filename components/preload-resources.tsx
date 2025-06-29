import React from "react";

/**
 * PreloadResources embeds <link rel="preload"> directives for critical assets
 * that are required for the first paint. Only include truly critical assets here
 * to avoid degrading performance by clogging the preload queue.
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

      {/* Fonts are automatically preloaded by next/font. Preconnect to speed them up further. */}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />

      {/* Hero / Above-the-fold images */}
      <link
        rel="preload"
        href="/scenic-rim-landscape.jpg"
        as="image"
        type="image/jpeg"
      />
      <link
        rel="preload"
        href="/pineapple-tour-logo.png"
        as="image"
        type="image/png"
      />

      {/* Private tours hero image */}
      <link
        rel="preload"
        href="/private-tours/gold-coast.avif"
        as="image"
        type="image/avif"
      />

      {/* Hop-on hop-off critical images */}
      <link
        rel="preload"
        href="/hop-on-hop-off/hop-on-hop-off-bus-1.jpg"
        as="image"
        type="image/jpeg"
      />

      {/* Prefetch critical API endpoints for faster navigation */}
      <link rel="prefetch" href="/api/tours" />
      <link rel="prefetch" href="/api/categories" />

      {/* DNS prefetch for external services */}
      <link rel="dns-prefetch" href="//api.rezdy.com" />
      <link rel="dns-prefetch" href="//maps.googleapis.com" />

      {/* Future-critical JS bundles (inlined via Next.js) are automatically pushed; we only
          need to handle third-party scripts. Example shown for analytics. */}
      {/* <link rel="preload" href="https://www.googletagmanager.com/gtag/js?id=GA_ID" as="script" /> */}
    </>
  );
}
