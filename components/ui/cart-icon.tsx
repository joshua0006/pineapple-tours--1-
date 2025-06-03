"use client"

import { ShoppingCart, X, Trash2, Plus, Minus } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { formatPrice, getPrimaryImageUrl } from "@/lib/utils/product-utils"
import { EnhancedBookingExperience } from "@/components/enhanced-booking-experience"
import { RezdyProduct } from "@/lib/types/rezdy"

interface CartIconProps {
  className?: string
  showDropdown?: boolean
}

export function CartIcon({ className = "", showDropdown = true }: CartIconProps) {
  const { cart, removeFromCart, updateCartItem, getCartItemCount, getCartTotal } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [selectedBookingProduct, setSelectedBookingProduct] = useState<RezdyProduct | null>(null)
  const [selectedCartItem, setSelectedCartItem] = useState<any>(null)
  const itemCount = getCartItemCount()
  const total = getCartTotal()

  const updateQuantity = (itemId: string, newAdults: number) => {
    if (newAdults < 1) return
    
    const item = cart.items.find(i => i.id === itemId)
    if (!item) return
    
    const newParticipants = { ...item.participants, adults: newAdults }
    const basePrice = item.session.totalPrice || item.product.advertisedPrice || 0
    const participantTotal = newAdults + (item.participants.children || 0)
    const extrasTotal = item.selectedExtras.reduce((sum, extra) => sum + extra.totalPrice, 0)
    const newTotalPrice = (basePrice * participantTotal) + extrasTotal
    
    updateCartItem(itemId, {
      participants: newParticipants,
      totalPrice: newTotalPrice
    })
  }

  const handleProceedToBooking = (item: any) => {
    setIsOpen(false)
    setSelectedBookingProduct(item.product)
    setSelectedCartItem(item)
    setShowBooking(true)
  }

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
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-yellow-500 text-black hover:bg-yellow-600"
            >
              {itemCount > 99 ? '99+' : itemCount}
            </Badge>
          )}
        </Button>

        {/* Cart Dropdown */}
        {showDropdown && isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            
            {/* Dropdown Content */}
            <Card className="absolute right-0 top-full mt-2 w-96 max-w-[90vw] z-50 shadow-lg border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Shopping Cart</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
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
                    <p className="text-sm mt-1">Add some tours to get started!</p>
                  </div>
                ) : (
                  <>
                    {/* Cart Items */}
                    <div className="max-h-96 overflow-y-auto">
                      {cart.items.map((item, index) => {
                        const primaryImage = getPrimaryImageUrl(item.product)
                        const sessionDate = new Date(item.session.startTimeLocal)
                        
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
                                    {sessionDate.toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })} at {sessionDate.toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
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
                                          e.stopPropagation()
                                          updateQuantity(item.id, item.participants.adults - 1)
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
                                          e.stopPropagation()
                                          updateQuantity(item.id, item.participants.adults + 1)
                                        }}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                      <span className="text-xs text-muted-foreground ml-1">
                                        adult{item.participants.adults > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                    
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        removeFromCart(item.id)
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
                                  {item.selectedExtras.map((extra, extraIndex) => (
                                    <div key={extraIndex} className="flex justify-between text-xs text-muted-foreground">
                                      <span>+ {extra.extra.name} (×{extra.quantity})</span>
                                      <span>{formatPrice(extra.totalPrice)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Individual Proceed to Booking Button */}
                              <div className="pt-2">
                                <Button 
                                  size="sm"
                                  className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
                                  onClick={() => handleProceedToBooking(item)}
                                >
                                  Proceed to Booking
                                </Button>
                              </div>
                            </div>
                            
                            {index < cart.items.length - 1 && <Separator />}
                          </div>
                        )
                      })}
                    </div>
                    
                    <Separator />
                    
                    {/* Cart Footer */}
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center font-medium">
                        <span>Total ({itemCount} item{itemCount > 1 ? 's' : ''})</span>
                        <span className="text-lg">{formatPrice(total)}</span>
                      </div>
                      
                      <Button 
                        className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
                        onClick={() => {
                          setIsOpen(false)
                          // Navigate to checkout or booking flow for all items
                          console.log('Proceeding to checkout with entire cart:', cart)
                        }}
                      >
                        Proceed to Checkout All
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setIsOpen(false)}
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

      {/* Booking Modal */}
      {showBooking && selectedBookingProduct && selectedCartItem && (
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
        >
          <div className="h-screen w-screen">
            <div className="bg-white h-full w-full">
              <EnhancedBookingExperience 
                product={selectedBookingProduct}
                preSelectedSession={selectedCartItem.session}
                preSelectedParticipants={selectedCartItem.participants}
                preSelectedExtras={selectedCartItem.selectedExtras}
                onClose={() => {
                  setShowBooking(false)
                  setSelectedBookingProduct(null)
                  setSelectedCartItem(null)
                }}
                onBookingComplete={(bookingData) => {
                  console.log('Booking completed:', bookingData)
                  setShowBooking(false)
                  setSelectedBookingProduct(null)
                  setSelectedCartItem(null)
                  // Optionally remove the item from cart after successful booking
                  // removeFromCart(bookingData.cartItemId)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
} 