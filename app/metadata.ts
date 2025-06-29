import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gold Coast Wine Tours & Brisbane Day Tours | Pineapple Tours",
  description:
    "Make memories with friends, make friends with wine! Premium wine tours, brewery tours, and hop-on hop-off experiences in Gold Coast, Brisbane & Scenic Rim. Book your Queensland adventure today.",
  keywords: [
    "gold coast wine tours",
    "brisbane wine tours",
    "scenic rim winery tours",
    "hop on hop off brisbane",
    "private wine tours",
    "brewery tours gold coast",
    "day tours queensland",
  ],
  openGraph: {
    title: "Gold Coast Wine Tours & Brisbane Day Tours | Pineapple Tours",
    description:
      "Make memories with friends, make friends with wine! Premium wine tours and day trips in Queensland.",
    images: [
      {
        url: "/scenic-rim-landscape.jpg",
        width: 1200,
        height: 630,
        alt: "Scenic Rim landscape with vineyard views - Pineapple Tours",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gold Coast Wine Tours & Brisbane Day Tours | Pineapple Tours",
    description:
      "Make memories with friends, make friends with wine! Premium wine tours and day trips in Queensland.",
    images: ["/scenic-rim-landscape.jpg"],
  },
};
