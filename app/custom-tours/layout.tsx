import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Self-Guided Tours | Pineapple Tours",
  description:
    "Design your own adventure with flexible hop-on hop-off services, modular experiences, and day-pass pricing. Explore Queensland at your own pace with unlimited transport.",
  keywords:
    "custom tours, self-guided tours, hop-on hop-off, flexible transport, day pass, Queensland tours, modular experiences, Tamborine Mountain, Gold Coast Hinterland",
  openGraph: {
    title: "Custom Self-Guided Tours | Pineapple Tours",
    description:
      "Design your own adventure with flexible hop-on hop-off services, modular experiences, and day-pass pricing.",
    type: "website",
  },
};

export default function CustomToursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
