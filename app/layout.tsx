import type React from "react";
import "@/app/globals.css";
import { Barlow, Open_Sans, Work_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { BookingPromptWrapper } from "@/components/booking-prompt-wrapper";
import { CartProvider } from "@/hooks/use-cart";
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-barlow",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-open-sans",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-work-sans",
});

export const metadata = {
  title: "Pineapple Tours",
  description:
    "Discover paradise with Pineapple Tours. We specialize in creating unforgettable tropical vacation experiences in Hawaii, the Caribbean, Fiji, and beyond.",
  generator: "v0.dev",
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico", sizes: "any" },
    ],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "android-chrome",
        url: "/favicon/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "android-chrome",
        url: "/favicon/android-chrome-512x512.png",
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
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
