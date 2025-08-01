"use client";

import { useEffect } from 'react';
import Script from 'next/script';
import { initializeGTM } from '@/lib/gtm';

interface GTMScriptProps {
  gtmId: string;
}

export function GTMScript({ gtmId }: GTMScriptProps) {
  useEffect(() => {
    // Initialize GTM data layer when component mounts
    initializeGTM();
  }, []);

  if (!gtmId || gtmId === 'GTM-XXXXXXX') {
    console.warn('GTM ID not configured properly');
    return null;
  }

  return (
    <>
      {/* Google Tag Manager Script */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
    </>
  );
}

export function GTMNoScript({ gtmId }: GTMScriptProps) {
  if (!gtmId || gtmId === 'GTM-XXXXXXX') {
    return null;
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}