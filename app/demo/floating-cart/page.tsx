"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { ShoppingCart, Plus, Minus } from "lucide-react";

// Mock tour data for demo
const mockTours = [
  {
    id: "tour-1",
    productCode: "WINE001",
    name: "Gold Coast Wine Tour",
    advertisedPrice: 150,
    image: "/private-tours/gold-coast.avif",
    description: "Discover the best wineries on the Gold Coast",
  },
  {
    id: "tour-2",
    productCode: "BREW002",
    name: "Brisbane Brewery Tour",
    advertisedPrice: 120,
    image: "/private-tours/brisbane-tours.webp",
    description: "Explore Brisbane's craft beer scene",
  },
  {
    id: "tour-3",
    productCode: "SCENIC003",
    name: "Scenic Rim Adventure",
    advertisedPrice: 180,
    image: "/private-tours/scenic-rim.avif",
    description: "Adventure through the beautiful Scenic Rim",
  },
];

const mockSession = {
  id: "session-123",
  startTimeLocal: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  totalPrice: 150,
  availability: 10,
};

export default function FloatingCartDemo() {
  const { addToCart, removeFromCart, getCartItemCount, clearCart } = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(mockTours.map((tour) => [tour.id, 2]))
  );

  const handleAddToCart = (tour: (typeof mockTours)[0]) => {
    const quantity = quantities[tour.id];
    addToCart({
      product: {
        productCode: tour.productCode,
        name: tour.name,
        advertisedPrice: tour.advertisedPrice,
        description: tour.description,
        images: [{ url: tour.image, alt: tour.name }],
      } as any,
      session: mockSession as any,
      participants: {
        adults: quantity,
      },
      selectedExtras: [],
      totalPrice: tour.advertisedPrice * quantity,
    });
  };

  const updateQuantity = (tourId: string, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [tourId]: Math.max(1, prev[tourId] + change),
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Floating Cart Demo</h1>
          <p className="text-muted-foreground mb-6">
            Test the floating cart functionality by adding tours to your cart.
            The cart icon will appear in the bottom-right corner with smooth
            animations.
          </p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart Items: {getCartItemCount()}
            </Badge>
            <Button variant="outline" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden">
              <div className="aspect-video relative bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl opacity-20">🍷</div>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-lg">{tour.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {tour.description}
                </p>
                <div className="text-2xl font-bold text-primary">
                  ${tour.advertisedPrice}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    per person
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Adults:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(tour.id, -1)}
                      disabled={quantities[tour.id] <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {quantities[tour.id]}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(tour.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="flex justify-between items-center font-medium">
                  <span>Total:</span>
                  <span className="text-lg text-primary">
                    ${tour.advertisedPrice * quantities[tour.id]}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="w-full"
                  onClick={() => handleAddToCart(tour)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Features Demonstrated:</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Floating cart button appears in bottom-right corner
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Smooth slide-in animation from the right for the cart sidebar
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Bounce animation when items are added to cart
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Notification toast showing "Added to cart!"
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Badge with item count and pulse animation
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Cart visibility based on scroll position and interaction
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Responsive design for mobile and desktop
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
