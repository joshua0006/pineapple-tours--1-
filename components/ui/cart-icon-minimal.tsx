"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

interface CartIconMinimalProps {
  className?: string;
  onClick?: () => void;
}

export function CartIconMinimal({
  className = "",
  onClick,
}: CartIconMinimalProps) {
  const { getCartItemCount, openCart } = useCart();
  const itemCount = getCartItemCount();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      openCart();
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative", className)}
        onClick={handleClick}
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
    </div>
  );
}
