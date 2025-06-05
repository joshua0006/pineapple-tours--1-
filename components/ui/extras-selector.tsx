"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, ShoppingBag, Info } from "lucide-react"
import { RezdyExtra } from "@/lib/types/rezdy"
import { SelectedExtra } from "@/lib/utils/pricing-utils"
import { formatCurrency } from "@/lib/utils/pricing-utils"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ExtrasSelectorProps {
  extras: RezdyExtra[]
  selectedExtras: SelectedExtra[]
  onExtrasChange: (extras: SelectedExtra[]) => void
  guestCount: number
  className?: string
}

export function ExtrasSelector({
  extras,
  selectedExtras,
  onExtrasChange,
  guestCount,
  className = ""
}: ExtrasSelectorProps) {
  const [localSelectedExtras, setLocalSelectedExtras] = useState<SelectedExtra[]>(selectedExtras)

  useEffect(() => {
    setLocalSelectedExtras(selectedExtras)
  }, [selectedExtras])

  const handleQuantityChange = (extra: RezdyExtra, newQuantity: number) => {
    const maxQuantity = extra.maxQuantity || 10
    const minQuantity = extra.minQuantity || 0
    
    // Ensure quantity is within bounds
    const quantity = Math.max(minQuantity, Math.min(maxQuantity, newQuantity))
    
    let updatedExtras = [...localSelectedExtras]
    const existingIndex = updatedExtras.findIndex(item => item.extra.id === extra.id)
    
    if (quantity === 0) {
      // Remove the extra if quantity is 0
      if (existingIndex !== -1) {
        updatedExtras.splice(existingIndex, 1)
      }
    } else {
      // Add or update the extra
      if (existingIndex !== -1) {
        updatedExtras[existingIndex] = { extra, quantity }
      } else {
        updatedExtras.push({ extra, quantity })
      }
    }
    
    setLocalSelectedExtras(updatedExtras)
    onExtrasChange(updatedExtras)
  }

  const getSelectedQuantity = (extraId: string): number => {
    const selected = localSelectedExtras.find(item => item.extra.id === extraId)
    return selected ? selected.quantity : 0
  }

  const calculateExtraPrice = (extra: RezdyExtra, quantity: number): number => {
    switch (extra.priceType) {
      case 'PER_PERSON':
        return extra.price * guestCount * quantity
      case 'PER_BOOKING':
        return extra.price * quantity
      case 'PER_DAY':
        return extra.price * quantity
      default:
        return extra.price * quantity
    }
  }

  const getPriceDisplayText = (extra: RezdyExtra): string => {
    switch (extra.priceType) {
      case 'PER_PERSON':
        return `${formatCurrency(extra.price)} per person`
      case 'PER_BOOKING':
        return `${formatCurrency(extra.price)} per booking`
      case 'PER_DAY':
        return `${formatCurrency(extra.price)} per day`
      default:
        return formatCurrency(extra.price)
    }
  }

  if (!extras || extras.length === 0) {
    return null
  }

  const availableExtras = extras.filter(extra => extra.isAvailable !== false)

  if (availableExtras.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Optional Extras
          <Badge variant="secondary" className="text-xs">
            {localSelectedExtras.length} selected
          </Badge>
          {localSelectedExtras.length > 0 && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              +{formatCurrency(localSelectedExtras.reduce((total, { extra, quantity }) => 
                total + calculateExtraPrice(extra, quantity), 0
              ))}
            </Badge>
          )}
        </CardTitle>
        {localSelectedExtras.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Your selected extras will be added to the total booking cost
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {availableExtras.map((extra) => {
          const selectedQuantity = getSelectedQuantity(extra.id)
          const totalPrice = calculateExtraPrice(extra, selectedQuantity)
          const maxQuantity = extra.maxQuantity || 10
          const minQuantity = extra.minQuantity || 0

          return (
            <Card 
              key={extra.id} 
              className={cn(
                "transition-all duration-200",
                selectedQuantity > 0 
                  ? "ring-2 ring-coral-500 bg-coral-50" 
                  : "hover:bg-gray-50"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
               
                  {/* Extra Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                          {extra.name}
                          {extra.isRequired && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </h4>
                        {extra.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {extra.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-medium text-gray-900">
                          {getPriceDisplayText(extra)}
                        </div>
                        {selectedQuantity > 0 && (
                          <div className="text-sm text-green-600 font-medium">
                            Total: {formatCurrency(totalPrice)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(extra, selectedQuantity - 1)}
                          disabled={selectedQuantity <= minQuantity}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="font-medium min-w-[2rem] text-center">
                          {selectedQuantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(extra, selectedQuantity + 1)}
                          disabled={selectedQuantity >= maxQuantity}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {(extra.maxQuantity || extra.minQuantity) && (
                        <div className="text-xs text-gray-500">
                          {extra.minQuantity && extra.maxQuantity 
                            ? `${extra.minQuantity}-${extra.maxQuantity} allowed`
                            : extra.maxQuantity 
                            ? `Max ${extra.maxQuantity}`
                            : `Min ${extra.minQuantity}`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        
        {localSelectedExtras.length > 0 && (
          <>
            <Separator />
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h4 className="font-medium text-yellow-800 mb-2">Selected Extras Summary</h4>
              <div className="space-y-1">
                {localSelectedExtras.map(({ extra, quantity }) => (
                  <div key={extra.id} className="flex justify-between text-sm">
                    <span className="text-yellow-700">
                      {extra.name} × {quantity}
                    </span>
                    <span className="font-medium text-yellow-800">
                      {formatCurrency(calculateExtraPrice(extra, quantity))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 