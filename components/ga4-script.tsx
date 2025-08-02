"use client";

import Script from 'next/script';

interface GA4ScriptProps {
  measurementId: string;
}

export function GA4Script({ measurementId }: GA4ScriptProps) {
  if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
    console.warn('GA4 Measurement ID not configured properly');
    return null;
  }

  return (
    <>
      {/* Google Analytics 4 Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        id="ga4-gtag"
      />
      <Script
        id="ga4-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}');
          `,
        }}
      />
    </>
  );
}