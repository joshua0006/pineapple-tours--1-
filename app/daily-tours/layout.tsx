import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Tours - Scheduled Group Tours | Pineapple Tours",
  description:
    "Join our scheduled daily tours with fixed departure times. Wine tours, brewery tours, and sightseeing adventures in Gold Coast, Brisbane & Scenic Rim. Book your spot today!",
  keywords: [
    "daily tours",
    "scheduled tours",
    "group tours",
    "gold coast daily tours",
    "brisbane daily tours",
    "wine tours daily",
    "brewery tours daily",
    "scenic rim tours",
    "hop on hop off",
    "shared tours",
    "fixed departure tours",
  ],
  openGraph: {
    title: "Daily Tours - Scheduled Group Tours | Pineapple Tours",
    description:
      "Join our scheduled daily tours with fixed departure times. Wine tours, brewery tours, and sightseeing adventures in Queensland.",
    type: "website",
    images: [
      {
        url: "/pineapple-tour-logo.png",
        width: 1200,
        height: 630,
        alt: "Pineapple Tours Daily Tours",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Tours - Scheduled Group Tours | Pineapple Tours",
    description:
      "Join our scheduled daily tours with fixed departure times. Wine tours, brewery tours, and sightseeing adventures in Queensland.",
    images: ["/pineapple-tour-logo.png"],
  },
  alternates: {
    canonical: "/daily-tours",
  },
};

export default function DailyToursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
