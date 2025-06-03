'use client'

import { useState } from 'react'
import { EnhancedBookingExperience } from '@/components/enhanced-booking-experience'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RezdyProduct } from '@/lib/types/rezdy'

// Sample product for testing - using real product code from Rezdy system
const sampleProduct: RezdyProduct = {
  productCode: 'PH1FEA', // Real product code from your Rezdy system
  name: 'Hop on Hop off Bus - Tamborine Mountain - From Brisbane',
  shortDescription: 'Embark on an adventure from Brisbane to the enchanting heights of Tamborine Mountain with our exclusive hop-on, hop-off bus service.',
  description: 'Departing every morning from Brisbane. Enjoy the flexibility to explore Tamborine Mountain at your own pace with our convenient hop-on, hop-off service. Visit wineries, rainforest walks, local shops, and scenic lookouts.',
  advertisedPrice: 99,
  images: [
    {
      id: 1,
      itemUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&h=150&fit=crop',
      mediumSizeUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
      largeSizeUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop',
      caption: 'Tamborine Mountain Hop-on Hop-off Bus',
      isPrimary: true
    }
  ],
  quantityRequiredMin: 1,
  quantityRequiredMax: 12,
  productType: 'CUSTOM',
  locationAddress: 'Brisbane, QLD, Australia',
  status: 'ACTIVE',
  extras: [
    {
      id: 'photo-package',
      name: 'Professional Photo Package',
      description: 'High-quality photos of your tour experience',
      price: 49,
      priceType: 'PER_BOOKING',
      maxQuantity: 1,
      isRequired: false
    },
    {
      id: 'lunch-upgrade',
      name: 'Gourmet Lunch Upgrade',
      description: 'Upgrade to a gourmet lunch at a local winery',
      price: 35,
      priceType: 'PER_PERSON',
      maxQuantity: 8,
      isRequired: false
    }
  ]
}

export default function TestBookingPage() {
  const [showBooking, setShowBooking] = useState(false)

  const handleBookingComplete = (bookingData: any) => {
    console.log('Booking completed:', bookingData)
    alert('Booking completed successfully! Check the console for details.')
  }

  if (showBooking) {
    return (
      <EnhancedBookingExperience
        product={sampleProduct}
        onClose={() => setShowBooking(false)}
        onBookingComplete={handleBookingComplete}
      />
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Enhanced Booking Experience Test</h1>
          <p className="text-muted-foreground">
            Test the enhanced booking experience with a sample tour product
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sample Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img 
                  src={sampleProduct.images?.[0]?.itemUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'} 
                  alt={sampleProduct.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">{sampleProduct.name}</h3>
                <p className="text-muted-foreground">{sampleProduct.shortDescription}</p>
                <div className="text-2xl font-bold text-green-600">
                  ${sampleProduct.advertisedPrice}
                </div>
                <div className="text-sm text-muted-foreground">
                  Product Code: {sampleProduct.productCode}
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={() => setShowBooking(true)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                size="lg"
              >
                Start Booking Experience
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Availability Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Real-time availability checking</li>
                  <li>Fallback to demo data if API fails</li>
                  <li>Calendar with available/sold out dates</li>
                  <li>Session time selection</li>
                  <li>Seat availability display</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Booking Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Multi-step booking process</li>
                  <li>Guest management</li>
                  <li>Contact information collection</li>
                  <li>Payment form (demo)</li>
                  <li>Booking confirmation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 