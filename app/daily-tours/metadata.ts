import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Tours - Scheduled Group Tours | Pineapple Tours",
  description:
    "Join our daily scheduled group tours with fixed departure times. Perfect for meeting fellow travelers and exploring with expert guides. Book online for guaranteed departures.",
  keywords: [
    "daily tours",
    "group tours",
    "scheduled tours",
    "fixed departure",
    "Brisbane tours",
    "Gold Coast tours",
    "Queensland tours",
    "day tours",
    "guided tours",
    "tourist attractions",
  ],
  openGraph: {
    title: "Daily Tours - Scheduled Group Tours | Pineapple Tours",
    description:
      "Join our daily scheduled group tours with fixed departure times. Expert guides, guaranteed departures, competitive pricing.",
    type: "website",
    url: "https://pineappletours.com.au/daily-tours",
    images: [
      {
        url: "/private-tours/brisbane-tours.webp",
        width: 1200,
        height: 630,
        alt: "Daily Tours Brisbane - Group Tourism",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Tours - Scheduled Group Tours | Pineapple Tours",
    description:
      "Join our daily scheduled group tours with fixed departure times. Expert guides, guaranteed departures, competitive pricing.",
    images: ["/private-tours/brisbane-tours.webp"],
  },
  alternates: {
    canonical: "https://pineappletours.com.au/daily-tours",
  },
};
