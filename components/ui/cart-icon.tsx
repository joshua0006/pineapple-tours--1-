"use client";

import { ShoppingCart, X, Trash2, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, getPrimaryImageUrl } from "@/lib/utils/product-utils";
import { generateBookingUrl } from "@/lib/utils/booking-utils";
import { useResponsive } from "@/hooks/use-responsive";
import { useRouter } from "next/navigation";

interface CartIconProps {
  className?: string;
  showDropdown?: boolean;
}

export function CartIcon({
  className = "",
  showDropdown = true,
}: CartIconProps) {
  const {
    cart,
    removeFromCart,
    updateCartItem,
    getCartItemCount,
    getCartTotal,
  } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { isMobile } = useResponsive();
  const itemCount = getCartItemCount();
  const total = getCartTotal();
  const router = useRouter();

  // Handle animation timing
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, []);

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${className}`}
          onClick={() => showDropdown && setIsOpen(!isOpen)}
          aria-label={`Shopping cart with ${itemCount} items`}
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {itemCount > 99 ? "99+" : itemCount}
            </Badge>
          )}
        </Button>

        {/* Cart Dropdown */}
        {showDropdown && (isOpen || isAnimating) && (
          <>
            {/* Backdrop */}
            <div
              className={`fixed z-40 transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0"
              } bg-black/50 sm:bg-transparent sm:inset-0 top-16 left-0 right-0 bottom-0`}
              onClick={handleClose}
              aria-hidden="true"
            />

            {/* Mobile Full Screen Modal */}
            <div
              className={`sm:hidden fixed top-16 inset-0 z-50 transition-all duration-300 ease-out ${
                isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <Card className="h-screen w-full rounded-none border-0 flex flex-col bg-white shadow-lg">
                <CardContent className="p-0 flex-1 flex flex-col bg-white min-h-0">
                  {cart.items.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center p-6 text-center text-muted-foreground bg-white">
                      <div>
                        <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">Your cart is empty</p>
                        <p className="text-sm">
                          Add some tours to get started!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Cart Items - Scrollable */}
                      <div className="flex-1 overflow-y-auto bg-white min-h-0">
                        {cart.items.map((item, index) => {
                          const primaryImage = getPrimaryImageUrl(item.product);
                          const sessionDate = new Date(
                            item.session.startTimeLocal
                          );

                          return (
                            <div key={item.id}>
                              <div className="p-4 space-y-3 bg-white">
                                <div className="flex gap-3">
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
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateQuantity(
                                              item.id,
                                              item.participants.adults - 1
                                            );
                                          }}
                                          disabled={
                                            item.participants.adults <= 1
                                          }
                                        >
                                          <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="text-base font-medium w-10 text-center">
                                          {item.participants.adults}
                                        </span>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateQuantity(
                                              item.id,
                                              item.participants.adults + 1
                                            );
                                          }}
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm text-muted-foreground ml-1">
                                          adult
                                          {item.participants.adults > 1
                                            ? "s"
                                            : ""}
                                        </span>
                                      </div>

                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeFromCart(item.id);
                                        }}
                                        aria-label="Remove from cart"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Price */}
                                <div className="flex justify-between items-center">
                                  <div className="font-medium text-lg">
                                    {formatPrice(item.totalPrice)}
                                  </div>
                                </div>

                                {/* Extras */}
                                {item.selectedExtras.length > 0 && (
                                  <div className="space-y-1">
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

                                {/* Individual Proceed to Booking Button */}
                                <div className="pt-2">
                                  <Button
                                    size="default"
                                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                                    onClick={() => handleProceedToBooking(item)}
                                  >
                                    Proceed to Booking
                                  </Button>
                                </div>
                              </div>

                              {index < cart.items.length - 1 && <Separator />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Cart Footer - Fixed at bottom */}
                      <div className="flex-shrink-0 bg-white border-t">
                        <Separator />
                        <div className="p-4 space-y-4">
                          <div className="flex justify-between items-center font-medium text-lg">
                            <span>
                              Total ({itemCount} item{itemCount > 1 ? "s" : ""})
                            </span>
                            <span className="text-xl">
                              {formatPrice(total)}
                            </span>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full h-12 text-base"
                            onClick={handleClose}
                          >
                            Continue Shopping
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Desktop/Tablet Dropdown */}
            <Card
              className={`hidden sm:block absolute right-0 sm:right-0 top-full mt-2 z-50 shadow-lg border-2 w-[95vw] sm:w-96 max-w-[95vw] transition-all duration-200 ease-out ${
                isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Shopping Cart</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="h-8 w-8"
                    aria-label="Close cart"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {cart.items.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Your cart is empty</p>
                    <p className="text-sm mt-1">
                      Add some tours to get started!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Cart Items */}
                    <div className="max-h-96 overflow-y-auto">
                      {cart.items.map((item, index) => {
                        const primaryImage = getPrimaryImageUrl(item.product);
                        const sessionDate = new Date(
                          item.session.startTimeLocal
                        );

                        return (
                          <div key={item.id}>
                            <div className="p-4 space-y-3">
                              <div className="flex gap-3">
                                {/* Tour Image */}
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                  <Image
                                    src={primaryImage}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>

                                {/* Tour Details */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm line-clamp-2 mb-1">
                                    {item.product.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mb-2">
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
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateQuantity(
                                            item.id,
                                            item.participants.adults - 1
                                          );
                                        }}
                                        disabled={item.participants.adults <= 1}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="text-sm font-medium w-8 text-center">
                                        {item.participants.adults}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateQuantity(
                                            item.id,
                                            item.participants.adults + 1
                                          );
                                        }}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                      <span className="text-xs text-muted-foreground ml-1">
                                        adult
                                        {item.participants.adults > 1
                                          ? "s"
                                          : ""}
                                      </span>
                                    </div>

                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromCart(item.id);
                                      }}
                                      aria-label="Remove from cart"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Price */}
                                <div className="text-right flex-shrink-0">
                                  <div className="font-medium text-sm">
                                    {formatPrice(item.totalPrice)}
                                  </div>
                                </div>
                              </div>

                              {/* Extras */}
                              {item.selectedExtras.length > 0 && (
                                <div className="ml-19 space-y-1">
                                  {item.selectedExtras.map(
                                    (extra, extraIndex) => (
                                      <div
                                        key={extraIndex}
                                        className="flex justify-between text-xs text-muted-foreground"
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

                              {/* Individual Proceed to Booking Button */}
                              <div className="pt-2">
                                <Button
                                  size="sm"
                                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                                  onClick={() => handleProceedToBooking(item)}
                                >
                                  Proceed to Booking
                                </Button>
                              </div>
                            </div>

                            {index < cart.items.length - 1 && <Separator />}
                          </div>
                        );
                      })}
                    </div>

                    <Separator />

                    {/* Cart Footer */}
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center font-medium">
                        <span>
                          Total ({itemCount} item{itemCount > 1 ? "s" : ""})
                        </span>
                        <span className="text-lg">{formatPrice(total)}</span>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleClose}
                      >
                        Continue Shopping
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
