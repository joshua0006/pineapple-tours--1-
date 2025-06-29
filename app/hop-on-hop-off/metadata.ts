import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Hop On Hop Off Tours - Explore Brisbane & Gold Coast | Pineapple Tours",
  description:
    "Discover Brisbane and Gold Coast at your own pace with our hop-on hop-off sightseeing tours. Multiple routes, key attractions, and flexible scheduling. Perfect for exploring Queensland's highlights.",
  keywords: [
    "hop on hop off brisbane",
    "hop on hop off gold coast",
    "brisbane sightseeing tours",
    "gold coast sightseeing",
    "city tour brisbane",
    "tourist bus tours",
    "queensland attractions tour",
  ],
  openGraph: {
    title: "Hop On Hop Off Tours - Explore Brisbane & Gold Coast",
    description:
      "Discover Brisbane and Gold Coast at your own pace with flexible sightseeing tours covering key attractions and landmarks.",
    type: "website",
    images: [
      {
        url: "/hop-on-hop-off/hop-on-hop-off-bus-1.jpg",
        width: 1200,
        height: 630,
        alt: "Hop-on hop-off tour bus in Brisbane with city skyline",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hop On Hop Off Tours - Explore Brisbane & Gold Coast",
    description:
      "Discover Brisbane and Gold Coast at your own pace with flexible sightseeing tours.",
    images: ["/hop-on-hop-off/hop-on-hop-off-bus-1.jpg"],
  },
};
