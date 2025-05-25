"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RezdyAddress, RezdyPickupLocation } from "@/lib/types/rezdy"

interface GoogleMapsProps {
  address?: string | RezdyAddress
  pickupLocations?: RezdyPickupLocation[]
  tourName?: string
  className?: string
}

interface MapLocation {
  lat: number
  lng: number
  title: string
  type: 'main' | 'pickup'
  address?: string
}

export function GoogleMaps({ address, pickupLocations = [], tourName, className }: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locations, setLocations] = useState<MapLocation[]>([])

  // Extract coordinates and address info
  const getLocationData = () => {
    const mainLocation: MapLocation | null = (() => {
      if (typeof address === 'object' && address?.latitude && address?.longitude) {
        return {
          lat: address.latitude,
          lng: address.longitude,
          title: tourName || 'Tour Location',
          type: 'main',
          address: formatAddress(address)
        }
      }
      return null
    })()

    const pickupLocs: MapLocation[] = pickupLocations
      .filter(pickup => pickup.latitude && pickup.longitude)
      .map(pickup => ({
        lat: pickup.latitude!,
        lng: pickup.longitude!,
        title: pickup.name,
        type: 'pickup',
        address: typeof pickup.address === 'object' ? formatAddress(pickup.address) : pickup.address
      }))

    return { mainLocation, pickupLocs }
  }

  const formatAddress = (addr: RezdyAddress): string => {
    const parts = []
    if (addr.addressLine) parts.push(addr.addressLine)
    if (addr.city) parts.push(addr.city)
    if (addr.state) parts.push(addr.state)
    if (addr.postCode) parts.push(addr.postCode)
    return parts.join(', ')
  }

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          setIsLoaded(true)
          return
        }

        // Create script element
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.defer = true
        
        script.onload = () => setIsLoaded(true)
        script.onerror = () => setError('Failed to load Google Maps')
        
        document.head.appendChild(script)
      } catch (err) {
        setError('Error loading Google Maps')
      }
    }

    loadGoogleMaps()
  }, [])

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    const { mainLocation, pickupLocs } = getLocationData()
    const allLocations = [mainLocation, ...pickupLocs].filter(Boolean) as MapLocation[]
    
    if (allLocations.length === 0) {
      setError('No location data available')
      return
    }

    setLocations(allLocations)

    // Calculate center and bounds
    const bounds = new window.google.maps.LatLngBounds()
    allLocations.forEach(loc => bounds.extend({ lat: loc.lat, lng: loc.lng }))
    
    const center = bounds.getCenter()
    
    // Initialize map
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: allLocations.length === 1 ? 15 : 12,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    })

    // Add markers
    allLocations.forEach((location, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: mapInstance,
        title: location.title,
        icon: {
          url: location.type === 'main' 
            ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EAB308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              `)
            : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              `),
          scaledSize: new window.google.maps.Size(location.type === 'main' ? 32 : 24, location.type === 'main' ? 32 : 24)
        }
      })

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h4 style="margin: 0 0 4px 0; font-weight: bold; color: #1f2937;">${location.title}</h4>
            ${location.address ? `<p style="margin: 0; font-size: 12px; color: #6b7280;">${location.address}</p>` : ''}
            <div style="margin-top: 8px;">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}" 
                 target="_blank" 
                 style="color: #3b82f6; text-decoration: none; font-size: 12px;">
                Get Directions →
              </a>
            </div>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker)
      })
    })

    // Fit bounds if multiple locations
    if (allLocations.length > 1) {
      mapInstance.fitBounds(bounds)
    }

    setMap(mapInstance)
  }, [isLoaded, address, pickupLocations, tourName])

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-yellow-500" />
            Location & Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>Google Maps API key not configured</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-yellow-500" />
            Location & Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { mainLocation, pickupLocs } = getLocationData()
  const hasLocationData = mainLocation || pickupLocs.length > 0

  if (!hasLocationData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-yellow-500" />
            Location & Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>Location coordinates not available</p>
            {typeof address === 'string' && (
              <p className="mt-2 text-sm">{address}</p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-yellow-500" />
          Location & Map
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Container */}
        <div className="relative">
          <div 
            ref={mapRef} 
            className="w-full h-64 md:h-80 rounded-lg bg-gray-100"
            style={{ minHeight: '256px' }}
          />
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Location Details */}
        <div className="space-y-3">
          {mainLocation && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <MapPin className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-yellow-900">Main Location</div>
                <div className="text-sm text-yellow-700">{mainLocation.address || mainLocation.title}</div>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-yellow-600 hover:text-yellow-700"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${mainLocation.lat},${mainLocation.lng}`, '_blank')}
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Get Directions
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {pickupLocs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Pickup Locations</h4>
                <Badge variant="secondary" className="text-xs">
                  {pickupLocs.length} location{pickupLocs.length > 1 ? 's' : ''}
                </Badge>
              </div>
              {pickupLocs.map((pickup, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-blue-900">{pickup.title}</div>
                    {pickup.address && (
                      <div className="text-sm text-blue-700">{pickup.address}</div>
                    )}
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-blue-600 hover:text-blue-700"
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${pickup.lat},${pickup.lng}`, '_blank')}
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Get Directions
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Extend the Window interface to include google
declare global {
  interface Window {
    google: any
  }
} 