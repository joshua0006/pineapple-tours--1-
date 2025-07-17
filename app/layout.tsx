import type React from "react";
import "@/app/globals.css";
import { Barlow, Open_Sans, Work_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { BookingPromptWrapper } from "@/components/booking-prompt-wrapper";
import { CartProvider } from "@/hooks/use-cart";
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PreloadResources } from "@/components/preload-resources";
import { Prefetcher } from "@/components/prefetcher";
import { DataPreloader } from "@/components/data-preloader";
import { OrganizationSchema } from "@/components/schema-markup";
import { FloatingCart } from "@/components/ui/floating-cart";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-barlow",
  display: "optional",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-open-sans",
  display: "optional",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-work-sans",
  display: "optional",
});

export const metadata = {
  title: {
    default:
      "Pineapple Tours - Gold Coast & Brisbane Wine Tours | Day Tours Australia",
    template: "%s | Pineapple Tours",
  },
  description:
    "Experience the best of Queensland with Pineapple Tours. Wine tours, brewery tours, day trips, and hop-on hop-off tours in Gold Coast, Brisbane & Scenic Rim. Book online today!",
  keywords: [
    "gold coast wine tours",
    "brisbane brewery tours",
    "scenic rim day trips",
    "hop on hop off brisbane",
    "private winery tours",
    "queensland tours",
    "day tours australia",
  ],
  authors: [{ name: "Pineapple Tours" }],
  creator: "Pineapple Tours",
  publisher: "Pineapple Tours",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://pineappletours.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pineapple Tours - Gold Coast & Brisbane Wine Tours",
    description:
      "Experience the best of Queensland with premium wine tours, brewery tours, and day trips in Gold Coast, Brisbane & Scenic Rim.",
    url: "https://pineappletours.com",
    siteName: "Pineapple Tours",
    images: [
      {
        url: "/pineapple-tour-logo.png",
        width: 1200,
        height: 630,
        alt: "Pineapple Tours - Queensland Wine & Brewery Tours",
      },
    ],
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pineapple Tours - Gold Coast & Brisbane Wine Tours",
    description:
      "Experience the best of Queensland with premium wine tours, brewery tours, and day trips.",
    images: ["/pineapple-tour-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/cropped-114x114-1-32x32.png", sizes: "16x16", type: "image/png" },
      { url: "/cropped-114x114-1-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/cropped-114x114-1-32x32.png", sizes: "any" },
    ],
    apple: [
      {
        url: "/cropped-114x114-1-32x32.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "android-chrome",
        url: "/cropped-114x114-1-32x32.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "android-chrome",
        url: "/cropped-114x114-1-32x32.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <PreloadResources />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
        />
      </head>
      <body
        className={`${barlow.variable} ${openSans.variable} ${workSans.variable}`}
      >
        <ThemeProvider attribute="class" forcedTheme="light">
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <BookingPromptWrapper />
            <Toaster />
            <Prefetcher />
            <DataPreloader
              enabled={true}
              priority="high"
              initialLimit={100}
              enableBackground={true}
              enableWarmup={true}
              debug={process.env.NODE_ENV === "development"}
            />
            <FloatingCart />
            <OrganizationSchema />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
