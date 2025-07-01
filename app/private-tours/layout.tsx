import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Private Tours - Exclusive Custom Tours | Pineapple Tours",
  description:
    "Book exclusive private tours with personalized itineraries. Wine tours, brewery tours, and custom experiences in Gold Coast, Brisbane & Scenic Rim. Premium service guaranteed.",
  keywords: [
    "private tours",
    "exclusive tours",
    "custom tours",
    "personalized tours",
    "private wine tours",
    "private brewery tours",
    "luxury tours",
    "vip tours",
    "gold coast private tours",
    "brisbane private tours",
    "scenic rim private tours",
    "custom itinerary",
    "premium tours",
  ],
  openGraph: {
    title: "Private Tours - Exclusive Custom Tours | Pineapple Tours",
    description:
      "Book exclusive private tours with personalized itineraries. Wine tours, brewery tours, and custom experiences in Queensland with premium service.",
    type: "website",
    images: [
      {
        url: "/private-tours/gold-coast.avif",
        width: 1200,
        height: 630,
        alt: "Pineapple Tours Private Tours",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Private Tours - Exclusive Custom Tours | Pineapple Tours",
    description:
      "Book exclusive private tours with personalized itineraries. Wine tours, brewery tours, and custom experiences in Queensland.",
    images: ["/private-tours/gold-coast.avif"],
  },
  alternates: {
    canonical: "/private-tours",
  },
};

export default function PrivateToursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
