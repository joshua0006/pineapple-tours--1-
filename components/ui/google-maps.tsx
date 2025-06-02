"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation, ExternalLink, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  originalAddress?: string | RezdyAddress
}

interface GeocodeResult {
  lat: number
  lng: number
  formattedAddress: string
}

// Global state for Google Maps loading
let isGoogleMapsLoading = false
let isGoogleMapsLoaded = false
let googleMapsLoadPromise: Promise<void> | null = null

// Function to load Google Maps script only once
const loadGoogleMapsScript = (): Promise<void> => {
  // If already loaded, resolve immediately
  if (isGoogleMapsLoaded || (window.google && window.google.maps)) {
    isGoogleMapsLoaded = true
    return Promise.resolve()
  }

  // If already loading, return the existing promise
  if (isGoogleMapsLoading && googleMapsLoadPromise) {
    return googleMapsLoadPromise
  }

  // Check if script already exists in DOM
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
  if (existingScript) {
    isGoogleMapsLoaded = true
    return Promise.resolve()
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return Promise.reject(new Error('Google Maps API key not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.'))
  }

  isGoogleMapsLoading = true

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      isGoogleMapsLoading = false
      isGoogleMapsLoaded = true
      resolve()
    }
    
    script.onerror = () => {
      isGoogleMapsLoading = false
      googleMapsLoadPromise = null
      reject(new Error('Failed to load Google Maps. Please check your API key and internet connection.'))
    }
    
    document.head.appendChild(script)
  })

  return googleMapsLoadPromise
}

export function GoogleMaps({ address, pickupLocations = [], tourName, className }: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locations, setLocations] = useState<MapLocation[]>([])
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodingError, setGeocodingError] = useState<string | null>(null)

  // Extract coordinates and address info
  const getLocationData = () => {
    const mainLocation: MapLocation | null = (() => {
      if (typeof address === 'object' && address?.latitude && address?.longitude) {
        return {
          lat: address.latitude,
          lng: address.longitude,
          title: tourName || 'Tour Location',
          type: 'main',
          address: formatAddress(address),
          originalAddress: address
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
        address: typeof pickup.address === 'object' ? formatAddress(pickup.address) : pickup.address,
        originalAddress: pickup.address
      }))

    return { mainLocation, pickupLocs }
  }

  const formatAddress = (addr: RezdyAddress): string => {
    const parts = []
    if (addr.addressLine) parts.push(addr.addressLine)
    if (addr.city) parts.push(addr.city)
    if (addr.state) parts.push(addr.state)
    if (addr.postCode) parts.push(addr.postCode)
    if (addr.countryCode) parts.push(addr.countryCode)
    return parts.join(', ')
  }

  // Geocode string addresses to get coordinates
  const geocodeAddress = async (addressString: string): Promise<GeocodeResult | null> => {
    if (!window.google || !window.google.maps) {
      throw new Error('Google Maps not loaded')
    }

    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ address: addressString }, (results: any[], status: string) => {
        if (status === 'OK' && results && results.length > 0) {
          const location = results[0].geometry.location
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formattedAddress: results[0].formatted_address
          })
        } else {
          console.warn(`Geocoding failed for "${addressString}": ${status}`)
          resolve(null)
        }
      })
    })
  }

  // Get all locations including geocoded ones
  const getAllLocations = async (): Promise<MapLocation[]> => {
    const { mainLocation, pickupLocs } = getLocationData()
    const allLocations: MapLocation[] = []

    // Add locations that already have coordinates
    if (mainLocation) allLocations.push(mainLocation)
    allLocations.push(...pickupLocs)

    // Try to geocode string addresses
    if (typeof address === 'string' && !mainLocation) {
      setIsGeocoding(true)
      try {
        const geocoded = await geocodeAddress(address)
        if (geocoded) {
          allLocations.push({
            lat: geocoded.lat,
            lng: geocoded.lng,
            title: tourName || 'Tour Location',
            type: 'main',
            address: geocoded.formattedAddress,
            originalAddress: address
          })
        }
      } catch (err) {
        console.warn('Failed to geocode main address:', err)
      }
      setIsGeocoding(false)
    }

    // Try to geocode pickup locations without coordinates
    const pickupsToGeocode = pickupLocations.filter(pickup => 
      !pickup.latitude && !pickup.longitude && 
      (typeof pickup.address === 'string' || 
       (typeof pickup.address === 'object' && pickup.address))
    )

    if (pickupsToGeocode.length > 0) {
      setIsGeocoding(true)
      for (const pickup of pickupsToGeocode) {
        try {
          const addressString = typeof pickup.address === 'string' 
            ? pickup.address 
            : formatAddress(pickup.address as RezdyAddress)
          
          if (addressString) {
            const geocoded = await geocodeAddress(addressString)
            if (geocoded) {
              allLocations.push({
                lat: geocoded.lat,
                lng: geocoded.lng,
                title: pickup.name,
                type: 'pickup',
                address: geocoded.formattedAddress,
                originalAddress: pickup.address
              })
            }
          }
        } catch (err) {
          console.warn(`Failed to geocode pickup location "${pickup.name}":`, err)
        }
      }
      setIsGeocoding(false)
    }

    return allLocations
  }

  // Load Google Maps script
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        setError(null)
        
        // Check if already loaded
        if (isGoogleMapsLoaded || (window.google && window.google.maps)) {
          setIsLoaded(true)
          return
        }

        // Load the script
        await loadGoogleMapsScript()
        setIsLoaded(true)
      } catch (err) {
        console.error('Error loading Google Maps:', err)
        setError(err instanceof Error ? err.message : 'Error loading Google Maps')
      }
    }

    initializeGoogleMaps()
  }, [])

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    const initializeMap = async () => {
      try {
        setGeocodingError(null)
        const allLocations = await getAllLocations()
        
        if (allLocations.length === 0) {
          setError('No location data available for mapping')
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
        setError(null)
      } catch (err) {
        console.error('Error initializing map:', err)
        setGeocodingError(err instanceof Error ? err.message : 'Failed to initialize map')
      }
    }

    initializeMap()
  }, [isLoaded, address, pickupLocations, tourName])

  // Get display information for fallback
  const getDisplayInfo = () => {
    const { mainLocation, pickupLocs } = getLocationData()
    
    const mainAddressString = typeof address === 'string' 
      ? address 
      : typeof address === 'object' 
        ? formatAddress(address)
        : null

    const pickupAddresses = pickupLocations.map(pickup => ({
      name: pickup.name,
      address: typeof pickup.address === 'string' 
        ? pickup.address 
        : typeof pickup.address === 'object' 
          ? formatAddress(pickup.address as RezdyAddress)
          : null
    })).filter(p => p.address)

    return {
      mainLocation,
      pickupLocs,
      mainAddressString,
      pickupAddresses,
      hasAnyLocationData: mainLocation || pickupLocs.length > 0 || mainAddressString || pickupAddresses.length > 0
    }
  }

  const displayInfo = getDisplayInfo()

  // API Key not configured
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-yellow-500" />
            Location & Map
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Google Maps is not configured. To enable interactive maps, please add your Google Maps API key to the environment variables.
            </AlertDescription>
          </Alert>
          
          {/* Show location information without map */}
          {displayInfo.hasAnyLocationData && (
            <div className="space-y-3">
              {displayInfo.mainAddressString && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <MapPin className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-yellow-900">Main Location</div>
                    <div className="text-sm text-yellow-700">{displayInfo.mainAddressString}</div>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-yellow-600 hover:text-yellow-700"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayInfo.mainAddressString!)}`, '_blank')}
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      View on Google Maps
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {displayInfo.pickupAddresses.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Pickup Locations</h4>
                    <Badge variant="secondary" className="text-xs">
                      {displayInfo.pickupAddresses.length} location{displayInfo.pickupAddresses.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {displayInfo.pickupAddresses.map((pickup, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-blue-900">{pickup.name}</div>
                        <div className="text-sm text-blue-700">{pickup.address}</div>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-blue-600 hover:text-blue-700"
                          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickup.address!)}`, '_blank')}
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          View on Google Maps
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Loading or error states
  if (error || geocodingError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-yellow-500" />
            Location & Map
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || geocodingError}
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setError(null)
              setGeocodingError(null)
              window.location.reload()
            }}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>

          {/* Show location information as fallback */}
          {displayInfo.hasAnyLocationData && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm text-muted-foreground">Location Information</h4>
              {displayInfo.mainAddressString && (
                <div className="text-sm">
                  <div className="font-medium">Main Location:</div>
                  <div className="text-muted-foreground">{displayInfo.mainAddressString}</div>
                </div>
              )}
              {displayInfo.pickupAddresses.length > 0 && (
                <div className="text-sm">
                  <div className="font-medium">Pickup Locations:</div>
                  {displayInfo.pickupAddresses.map((pickup, index) => (
                    <div key={index} className="text-muted-foreground">
                      • {pickup.name}: {pickup.address}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // No location data available
  if (!displayInfo.hasAnyLocationData) {
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
            <p>No location information available for this tour</p>
            <p className="text-sm mt-2">Location details will be provided upon booking confirmation</p>
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
          {(!isLoaded || isGeocoding) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">
                  {isGeocoding ? 'Finding locations...' : 'Loading map...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Location Details */}
        <div className="space-y-3">
          {locations.filter(loc => loc.type === 'main').map((mainLocation, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
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
          ))}

          {locations.filter(loc => loc.type === 'pickup').length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Pickup Locations</h4>
                <Badge variant="secondary" className="text-xs">
                  {locations.filter(loc => loc.type === 'pickup').length} location{locations.filter(loc => loc.type === 'pickup').length > 1 ? 's' : ''}
                </Badge>
              </div>
              {locations.filter(loc => loc.type === 'pickup').map((pickup, index) => (
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

          {/* Show non-geocoded locations as text */}
          {displayInfo.mainAddressString && !locations.some(loc => loc.type === 'main') && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <MapPin className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Main Location</div>
                <div className="text-sm text-gray-700">{displayInfo.mainAddressString}</div>
                <div className="text-xs text-gray-500 mt-1">Coordinates not available</div>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-gray-600 hover:text-gray-700"
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayInfo.mainAddressString!)}`, '_blank')}
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Search on Google Maps
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
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