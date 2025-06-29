import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Private Wine Tours - Exclusive Gold Coast & Brisbane Tours | Pineapple Tours",
  description:
    "Experience luxury private wine tours in Gold Coast, Brisbane & Scenic Rim. Customized itineraries, premium wineries, and personalized service. Perfect for couples, groups, and special occasions.",
  keywords: [
    "private wine tours",
    "luxury wine tours gold coast",
    "private brewery tours brisbane",
    "exclusive wine experiences",
    "custom wine tours",
    "private scenic rim tours",
    "vip wine tours",
  ],
  openGraph: {
    title: "Private Wine Tours - Exclusive Gold Coast & Brisbane Tours",
    description:
      "Experience luxury private wine tours with customized itineraries, premium wineries, and personalized service in Queensland.",
    type: "website",
    images: [
      {
        url: "/private-tours/gold-coast.avif",
        width: 1200,
        height: 630,
        alt: "Private wine tour group enjoying premium wines in Gold Coast",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Private Wine Tours - Exclusive Gold Coast & Brisbane Tours",
    description:
      "Experience luxury private wine tours with customized itineraries and premium wineries.",
    images: ["/private-tours/gold-coast.avif"],
  },
};
