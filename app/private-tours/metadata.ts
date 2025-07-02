import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Private Tours - Luxury Custom Tours | Pineapple Tours",
  description:
    "Experience personalized luxury with our private tours. Flexible schedules, custom itineraries, and dedicated guides for an exclusive adventure. Perfect for special occasions.",
  keywords: [
    "private tours",
    "luxury tours",
    "custom tours",
    "private charter",
    "Brisbane private tours",
    "Gold Coast private tours",
    "exclusive tours",
    "personalized tours",
    "premium experiences",
    "corporate tours",
  ],
  openGraph: {
    title: "Private Tours - Luxury Custom Tours | Pineapple Tours",
    description:
      "Experience personalized luxury with our private tours. Flexible schedules, custom itineraries, and dedicated guides for exclusive adventures.",
    type: "website",
    url: "https://pineappletours.com.au/private-tours",
    images: [
      {
        url: "/private-tours/gold-coast.avif",
        width: 1200,
        height: 630,
        alt: "Private Tours Gold Coast - Luxury Tourism",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Private Tours - Luxury Custom Tours | Pineapple Tours",
    description:
      "Experience personalized luxury with our private tours. Flexible schedules, custom itineraries, and dedicated guides.",
    images: ["/private-tours/gold-coast.avif"],
  },
  alternates: {
    canonical: "https://pineappletours.com.au/private-tours",
  },
};
