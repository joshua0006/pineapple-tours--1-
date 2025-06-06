"use client"

import { useState } from "react"
import { ShoppingCart, Check, Users, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { RezdyProduct, RezdySession } from "@/lib/types/rezdy"
import { formatPrice } from "@/lib/utils/product-utils"
import { useToast } from "@/hooks/use-toast"

interface AddToCartButtonProps {
  product: RezdyProduct
  session?: RezdySession
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  showIcon?: boolean
  children?: React.ReactNode
}

export function AddToCartButton({
  product,
  session,
  className = "",
  variant = "default",
  size = "default",
  showIcon = true,
  children
}: AddToCartButtonProps) {
  const { addToCart, isInCart } = useCart()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [adults, setAdults] = useState(2)
  const [childrenCount, setChildrenCount] = useState(0)
  const [isAdding, setIsAdding] = useState(false)

  // Check if this specific session is already in cart
  const alreadyInCart = session ? isInCart(product.productCode, session.id) : false

  const basePrice = session?.totalPrice || product.advertisedPrice || 0
  const totalParticipants = adults + childrenCount
  const totalPrice = basePrice * totalParticipants

  const handleAddToCart = async () => {
    if (!session) {
      toast({
        title: "Please select a date",
        description: "Choose a specific date and time to add this tour to your cart.",
        variant: "destructive"
      })
      return
    }

    setIsAdding(true)
    
    try {
      addToCart({
        product,
        session,
        participants: {
          adults,
          children: childrenCount > 0 ? childrenCount : undefined
        },
        selectedExtras: [],
        totalPrice
      })

      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
        action: (
          <Button variant="outline" size="sm">
            View Cart
          </Button>
        )
      })

      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tour to cart. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleQuickAdd = () => {
    if (!session) {
      setIsOpen(true)
      return
    }
    
    // Quick add with default 2 adults
    handleAddToCart()
  }

  if (alreadyInCart) {
    return (
      <Button
        variant="success"
        size={size}
        className={className}
        disabled
      >
        <Check className="h-4 w-4 mr-2" />
        In Cart
      </Button>
    )
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={(e) => {
          e.stopPropagation()
          if (session) {
            handleQuickAdd()
          } else {
            setIsOpen(true)
          }
        }}
        disabled={isAdding}
      >
        {showIcon && <ShoppingCart className="h-4 w-4 mr-2" />}
        {children || (isAdding ? "Adding..." : "Add to Cart")}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Cart</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tour Info */}
            <div>
              <h4 className="font-medium mb-1">{product.name}</h4>
              {session && (
                <p className="text-sm text-muted-foreground">
                  {new Date(session.startTimeLocal).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} at {new Date(session.startTimeLocal).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>

            <Separator />

            {/* Participant Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Select Participants</Label>
              
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Adults</Label>
                  <p className="text-sm text-muted-foreground">Age 18+</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">{adults}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setAdults(adults + 1)}
                    disabled={adults >= 10}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Children</Label>
                  <p className="text-sm text-muted-foreground">Age 3-17</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                    disabled={childrenCount <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">{childrenCount}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setChildrenCount(childrenCount + 1)}
                    disabled={childrenCount >= 8}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Price Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base price per person</span>
                    <span>{formatPrice(basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Participants</span>
                    <span>{totalParticipants} person{totalParticipants > 1 ? 's' : ''}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isAdding || !session}
              >
                {isAdding ? "Adding..." : "Add to Cart"}
              </Button>
            </div>

            {!session && (
              <div className="text-center">
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Please select a date first
                </Badge>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 