"use client";

import { ShoppingCart, X, Trash2, Plus, Minus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import {
  useCart,
  registerCartOpener,
  unregisterCartOpener,
} from "@/hooks/use-cart";
import { formatPrice, getPrimaryImageUrl } from "@/lib/utils/product-utils";
import { generateBookingUrl } from "@/lib/utils/booking-utils";
import { useResponsive } from "@/hooks/use-responsive";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function FloatingCart() {
  const {
    cart,
    removeFromCart,
    updateCartItem,
    getCartItemCount,
    getCartTotal,
  } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const { isMobile } = useResponsive();
  const itemCount = getCartItemCount();
  const total = getCartTotal();
  const router = useRouter();
  const prevItemCount = useRef(itemCount);

  // Show cart when items are added or after user interaction
  useEffect(() => {
    if (itemCount > 0) {
      setIsVisible(true);
      // Trigger bounce animation when item count increases (not decreases)
      if (itemCount > prevItemCount.current) {
        setJustAdded(true);
        setShowNotification(true);
        const bounceTimer = setTimeout(() => setJustAdded(false), 600);
        const notificationTimer = setTimeout(
          () => setShowNotification(false),
          3000
        );

        return () => {
          clearTimeout(bounceTimer);
          clearTimeout(notificationTimer);
        };
      }
    } else if (!hasInteracted) {
      setIsVisible(false);
    }

    // Always update the previous count
    prevItemCount.current = itemCount;
  }, [itemCount, hasInteracted]);

  // Register cart opener function
  useEffect(() => {
    registerCartOpener(() => {
      setIsVisible(true);
      setIsOpen(true);
    });
    return () => unregisterCartOpener();
  }, []);

  // Handle scroll to show/hide cart icon
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 100;
      if (itemCount > 0 || hasInteracted) {
        setIsVisible(scrolled || itemCount > 0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [itemCount, hasInteracted]);

  const updateQuantity = (itemId: string, newAdults: number) => {
    if (newAdults < 1) return;

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) return;

    const newParticipants = { ...item.participants, adults: newAdults };
    const basePrice =
      item.session.totalPrice || item.product.advertisedPrice || 0;
    const participantTotal = newAdults + (item.participants.children || 0);
    const extrasTotal = item.selectedExtras.reduce(
      (sum, extra) => sum + extra.totalPrice,
      0
    );
    const newTotalPrice = basePrice * participantTotal + extrasTotal;

    updateCartItem(itemId, {
      participants: newParticipants,
      totalPrice: newTotalPrice,
    });
  };

  const handleProceedToBooking = (item: any) => {
    setIsOpen(false);

    // Generate booking URL with pre-selected data
    const bookingUrl = generateBookingUrl(item.product.productCode, {
      adults: item.participants.adults,
      children: item.participants.children || 0,
      infants: item.participants.infants || 0,
      sessionId: item.session.id,
      extras: item.selectedExtras,
    });

    // Navigate to the booking page
    router.push(bookingUrl);
  };

  const handleCartClick = () => {
    setHasInteracted(true);
    setIsOpen(true);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Cart Button */}
      <div
        className={cn(
          "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 transition-all duration-300 ease-out",
          "transform hover:scale-110 active:scale-95",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0",
          itemCount > 0 && !hasInteracted && "animate-pulse"
        )}
      >
        <Button
          size="lg"
          onClick={handleCartClick}
          className={cn(
            "relative h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl",
            "bg-primary/90 hover:bg-primary backdrop-blur-sm transition-all duration-200",
            "border-2 border-white/20",
            justAdded && "animate-bounce"
          )}
          aria-label={`Shopping cart with ${itemCount} items`}
        >
          <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          {itemCount > 0 && (
            <Badge
              className={cn(
                "absolute -top-2 -right-2 h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center p-0 text-xs",
                "bg-red-500 text-white border-2 border-white animate-pulse"
              )}
            >
              {itemCount > 99 ? "99+" : itemCount}
            </Badge>
          )}
        </Button>

        {/* Notification Toast */}
        {showNotification && itemCount > 0 && (
          <div
            className={cn(
              "absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-lg",
              "bg-green-500 text-white text-sm font-medium whitespace-nowrap",
              "shadow-lg animate-in slide-in-from-bottom-2 duration-300",
              "after:absolute after:top-full after:right-3 after:border-4",
              "after:border-transparent after:border-t-green-500"
            )}
          >
            Added to cart!
          </div>
        )}
      </div>

      {/* Sidebar Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className={cn(
            "w-full sm:w-[480px] p-0 overflow-hidden",
            "bg-background border-l border-border/50",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-right",
            "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right"
          )}
        >
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle className="text-xl font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart
              {itemCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {itemCount} item{itemCount > 1 ? "s" : ""}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100vh-80px)]">
            {cart.items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-muted-foreground">
                    Add some tours to get started!
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Cart Items - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {cart.items.map((item, index) => {
                    const primaryImage = getPrimaryImageUrl(item.product);
                    const sessionDate = new Date(item.session.startTimeLocal);

                    return (
                      <Card key={item.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {/* Tour Image */}
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={primaryImage}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>

                            {/* Tour Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-base line-clamp-2 mb-2">
                                {item.product.name}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                {sessionDate.toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}{" "}
                                at{" "}
                                {sessionDate.toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>

                              {/* Quantity Controls */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updateQuantity(
                                        item.id,
                                        item.participants.adults - 1
                                      )
                                    }
                                    disabled={item.participants.adults <= 1}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="text-base font-medium w-8 text-center">
                                    {item.participants.adults}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updateQuantity(
                                        item.id,
                                        item.participants.adults + 1
                                      )
                                    }
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                  <span className="text-sm text-muted-foreground">
                                    adult
                                    {item.participants.adults > 1 ? "s" : ""}
                                  </span>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-destructive hover:text-destructive h-8 w-8 p-0"
                                  aria-label="Remove from cart"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Price */}
                              <div className="flex justify-between items-center mt-3">
                                <div className="font-semibold text-lg text-primary">
                                  {formatPrice(item.totalPrice)}
                                </div>
                              </div>

                              {/* Extras */}
                              {item.selectedExtras.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {item.selectedExtras.map(
                                    (extra, extraIndex) => (
                                      <div
                                        key={extraIndex}
                                        className="flex justify-between text-sm text-muted-foreground"
                                      >
                                        <span>
                                          + {extra.extra.name} (×
                                          {extra.quantity})
                                        </span>
                                        <span>
                                          {formatPrice(extra.totalPrice)}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}

                              {/* Proceed to Booking Button */}
                              <Button
                                className="w-full mt-4"
                                onClick={() => handleProceedToBooking(item)}
                              >
                                Proceed to Booking
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Cart Footer - Fixed at bottom */}
                <div className="border-t bg-background p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">
                      Total ({itemCount} item{itemCount > 1 ? "s" : ""})
                    </span>
                    <span className="font-bold text-2xl text-primary">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
