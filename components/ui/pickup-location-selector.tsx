"use client"

import React from "react"
import { MapPin, Clock, Navigation } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RezdyPickupLocation, RezdyAddress } from "@/lib/types/rezdy"
import { cn } from "@/lib/utils"

interface PickupLocationSelectorProps {
  pickupLocations: RezdyPickupLocation[]
  selectedPickupLocation: RezdyPickupLocation | null
  onPickupLocationSelect: (location: RezdyPickupLocation) => void
  className?: string
  showDirections?: boolean
  required?: boolean
}

export function PickupLocationSelector({
  pickupLocations,
  selectedPickupLocation,
  onPickupLocationSelect,
  className,
  showDirections = false,
  required = false
}: PickupLocationSelectorProps) {
  if (!pickupLocations || pickupLocations.length === 0) {
    return null
  }

  const formatAddress = (address: string | RezdyAddress | undefined): string => {
    if (!address) return ''
    
    if (typeof address === 'string') {
      return address
    }
    
    const parts = []
    if (address.addressLine) parts.push(address.addressLine)
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    if (address.postCode) parts.push(address.postCode)
    return parts.join(', ')
  }

  const getDirectionsUrl = (location: RezdyPickupLocation): string => {
    if (location.latitude && location.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
    }
    
    const address = formatAddress(location.address)
    if (address) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
    }
    
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.name)}`
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Label className="text-base font-medium">
          Pickup Location{required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Badge variant="secondary" className="text-xs">
          {pickupLocations.length} location{pickupLocations.length > 1 ? 's' : ''} available
        </Badge>
      </div>
      
      <div className="space-y-2">
        {pickupLocations.map((location) => (
          <Card 
            key={location.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md",
              selectedPickupLocation?.id === location.id 
                ? "ring-2 ring-coral-500 bg-coral-50 border-coral-200" 
                : "hover:bg-gray-50 border-gray-200"
            )}
            onClick={() => onPickupLocationSelect(location)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                  selectedPickupLocation?.id === location.id
                    ? "border-coral-500 bg-coral-500"
                    : "border-gray-300 bg-white"
                )}>
                  {selectedPickupLocation?.id === location.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{location.name}</div>
                  
                  {formatAddress(location.address) && (
                    <div className="text-sm text-gray-600 mt-1 flex items-start gap-1">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{formatAddress(location.address)}</span>
                    </div>
                  )}
                  
                  {location.pickupTime && (
                    <div className="text-sm text-yellow-700 font-medium mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Pickup: {location.pickupTime}</span>
                    </div>
                  )}
                  
                  {showDirections && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-2 text-blue-600 hover:text-blue-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(getDirectionsUrl(location), '_blank')
                      }}
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Get Directions
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {required && !selectedPickupLocation && (
        <p className="text-sm text-red-600 mt-2">
          Please select a pickup location to continue
        </p>
      )}
    </div>
  )
} 