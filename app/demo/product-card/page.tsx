"use client";

import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProductCardDemo() {
  const handleCustomBooking = (productTitle: string) => {
    toast.success(`Booking initiated for: ${productTitle}`);
    // Custom booking logic here
  };

  const sampleProducts = [
    {
      id: "1",
      title: "Mount Tamborine Wine Tour",
      description:
        "Experience the best of Mount Tamborine's wine region with guided tastings at 3 premium wineries, gourmet lunch, and scenic mountain views.",
      image: "/hop-on-hop-off/hop-on-hop-off-attractions-3.jpg",
      price: 159,
      originalPrice: 199,
      location: "Mount Tamborine, QLD",
      duration: 6,
      maxGuests: 12,
      rating: 4.8,
      reviewCount: 124,
      category: "Wine Tour",
      isPopular: true,
      isFeatured: true,
      slug: "mount-tamborine-wine-tour",
    },
    {
      id: "2",
      title: "Gold Coast Hop-On Hop-Off",
      description:
        "Explore Gold Coast's top attractions at your own pace with unlimited rides, audio commentary, and convenient stops throughout the city.",
      image: "/hop-on-hop-off/hop-on-hop-off-bus-1.jpg",
      price: 45,
      location: "Gold Coast, QLD",
      duration: 8,
      maxGuests: 25,
      rating: 4.7,
      reviewCount: 89,
      category: "City Tour",
      isPopular: true,
      slug: "gold-coast-hop-on-hop-off",
    },
    {
      id: "3",
      title: "Scenic Rim Wildlife Adventure",
      description:
        "Discover Queensland's unique wildlife in their natural habitat with guided nature walks, wildlife spotting, and conservation education.",
      image: "/scenic-rim-landscape.jpg",
      price: 139,
      location: "Scenic Rim, QLD",
      duration: 7,
      maxGuests: 8,
      rating: 4.9,
      reviewCount: 67,
      category: "Wildlife",
      isFeatured: true,
      slug: "scenic-rim-wildlife-adventure",
    },
    {
      id: "4",
      title: "Brisbane City Cultural Tour",
      description:
        "Immerse yourself in Brisbane's rich cultural heritage with visits to museums, galleries, and historic landmarks in the heart of the city.",
      image: "/placeholder.svg?height=300&width=400",
      price: 89,
      location: "Brisbane, QLD",
      duration: 4,
      maxGuests: 15,
      rating: 4.6,
      reviewCount: 156,
      category: "Cultural",
      slug: "brisbane-city-cultural-tour",
    },
    {
      id: "5",
      title: "Byron Bay Lighthouse Experience",
      description:
        "Visit Australia's easternmost point with lighthouse tours, coastal walks, and breathtaking ocean views. Perfect for photography enthusiasts.",
      image: "/placeholder.svg?height=300&width=400",
      price: 75,
      location: "Byron Bay, NSW",
      duration: 3,
      maxGuests: 10,
      rating: 4.5,
      reviewCount: 93,
      category: "Scenic",
      slug: "byron-bay-lighthouse-experience",
    },
    {
      id: "6",
      title: "Premium Brewery Tour",
      description:
        "Taste craft beers at 3 award-winning breweries with behind-the-scenes tours, food pairings, and expert brewmaster insights.",
      image: "/placeholder.svg?height=300&width=400",
      price: 129,
      originalPrice: 149,
      location: "Gold Coast, QLD",
      duration: 5,
      maxGuests: 12,
      rating: 4.7,
      reviewCount: 78,
      category: "Food & Drink",
      slug: "premium-brewery-tour",
    },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Product Card Component Demo</h1>
        <p className="text-muted-foreground mb-6">
          This page demonstrates the ProductCard component with various
          configurations and states. The component includes image display,
          product details, pricing, ratings, and two action buttons.
        </p>

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Features Demonstrated:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Product image with hover effects</li>
            <li>• Title, description, and location display</li>
            <li>• Duration and guest capacity information</li>
            <li>• Pricing with discount calculation</li>
            <li>• Rating and review count display</li>
            <li>• Category badges and status indicators</li>
            <li>• Two action buttons: "View Details" and "Book Now"</li>
            <li>• Responsive design and hover animations</li>
          </ul>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sampleProducts.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            onBookNow={() => handleCustomBooking(product.title)}
          />
        ))}
      </div>

      {/* Usage Examples */}
      <div className="mt-12 space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Usage Examples</h2>
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Basic Usage:</h3>
            <pre className="text-sm bg-background p-4 rounded border overflow-x-auto">
              {`<ProductCard
  id="tour-1"
  title="Amazing Tour Experience"
  description="Discover beautiful destinations..."
  image="/tour-image.jpg"
  price={99}
  location="Gold Coast, QLD"
  duration={4}
  slug="amazing-tour-experience"
/>`}
            </pre>
          </div>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h3 className="font-semibold mb-3">With All Optional Props:</h3>
          <pre className="text-sm bg-background p-4 rounded border overflow-x-auto">
            {`<ProductCard
  id="premium-tour"
  title="Premium Wine Tour"
  description="Exclusive wine tasting experience..."
  image="/wine-tour.jpg"
  price={159}
  originalPrice={199}
  location="Mount Tamborine, QLD"
  duration={6}
  maxGuests={12}
  rating={4.8}
  reviewCount={124}
  category="Wine Tour"
  isPopular={true}
  isFeatured={true}
  slug="premium-wine-tour"
  onBookNow={() => handleCustomBooking()}
/>`}
          </pre>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h3 className="font-semibold mb-3">Component Props:</h3>
          <div className="text-sm space-y-2">
            <p>
              <strong>Required Props:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>
                <code>id</code> - Unique identifier
              </li>
              <li>
                <code>title</code> - Product title
              </li>
              <li>
                <code>description</code> - Product description
              </li>
              <li>
                <code>image</code> - Product image URL
              </li>
              <li>
                <code>price</code> - Current price
              </li>
              <li>
                <code>location</code> - Tour location
              </li>
              <li>
                <code>duration</code> - Duration in hours
              </li>
              <li>
                <code>slug</code> - URL slug for routing
              </li>
            </ul>

            <p className="mt-4">
              <strong>Optional Props:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>
                <code>originalPrice</code> - Original price for discount display
              </li>
              <li>
                <code>maxGuests</code> - Maximum number of guests
              </li>
              <li>
                <code>rating</code> - Product rating (default: 4.5)
              </li>
              <li>
                <code>reviewCount</code> - Number of reviews
              </li>
              <li>
                <code>category</code> - Product category badge
              </li>
              <li>
                <code>isPopular</code> - Show popular badge
              </li>
              <li>
                <code>isFeatured</code> - Show featured badge
              </li>
              <li>
                <code>onBookNow</code> - Custom booking handler
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
