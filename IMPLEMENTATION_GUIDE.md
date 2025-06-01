# Enhanced Booking System - Implementation Guide

This guide provides step-by-step instructions for implementing the enhanced booking system in your tour booking application.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-progress
npm install @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-checkbox
npm install lucide-react date-fns
```

### 2. Environment Setup

Create or update your `.env.local` file:

```env
REZDY_API_KEY=your_rezdy_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 3. Basic Implementation

#### Replace Basic Booking Form

**Before:**
```tsx
import { BookingForm } from "@/components/booking-form"

// In your component
<BookingForm 
  product={product}
  onClose={() => setShowBooking(false)}
/>
```

**After:**
```tsx
import { EnhancedBookingExperience } from "@/components/enhanced-booking-experience"

// In your component
<EnhancedBookingExperience 
  product={product}
  onClose={() => setShowBooking(false)}
  onBookingComplete={(bookingData) => {
    console.log('Booking completed:', bookingData)
    // Handle successful booking (redirect, show success message, etc.)
    setShowBooking(false)
  }}
/>
```

#### Add Booking Dashboard

```tsx
import { BookingDashboard } from "@/components/booking-dashboard"

// In your admin/dashboard page
<BookingDashboard className="container mx-auto py-8" />
```

## 📋 Component Integration

### 1. Tour Detail Page Integration

Update your tour detail page to use the enhanced booking experience:

```tsx
// app/tours/[slug]/page.tsx
import { EnhancedBookingExperience } from "@/components/enhanced-booking-experience"

export default function TourDetailPage({ params }) {
  const [showBooking, setShowBooking] = useState(false)
  
  return (
    <div>
      {/* Your existing tour content */}
      
      {/* Enhanced Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-none mx-4 my-8">
            <EnhancedBookingExperience 
              product={selectedProduct}
              onClose={() => setShowBooking(false)}
              onBookingComplete={(bookingData) => {
                // Handle successful booking
                console.log('Booking completed:', bookingData)
                setShowBooking(false)
                // Optional: redirect to confirmation page
                // router.push(`/booking-confirmation/${bookingData.id}`)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
```

### 2. Product Listing Integration

Add quick booking buttons to your product listings:

```tsx
// components/product-card.tsx
import { useState } from "react"
import { EnhancedBookingExperience } from "@/components/enhanced-booking-experience"

export function ProductCard({ product }) {
  const [showBooking, setShowBooking] = useState(false)
  
  return (
    <Card>
      {/* Product card content */}
      <Button onClick={() => setShowBooking(true)}>
        Book Now
      </Button>
      
      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-none mx-4 my-8">
            <EnhancedBookingExperience 
              product={product}
              onClose={() => setShowBooking(false)}
              onBookingComplete={(bookingData) => {
                setShowBooking(false)
                // Handle booking completion
              }}
            />
          </div>
        </div>
      )}
    </Card>
  )
}
```

## 🔧 Configuration Options

### 1. Customize Pricing Configuration

```tsx
// lib/utils/pricing-utils.ts
const CUSTOM_PRICING_CONFIG = {
  taxRate: 0.10, // 10% tax rate
  serviceFeesRate: 0.05, // 5% service fees
  childDiscountRate: 0.30, // 30% discount for children
  infantDiscountRate: 1.0, // Free for infants
}

// Use in your pricing calculations
const pricingBreakdown = calculatePricing(product, session, {
  adults: guestCounts.adults,
  children: guestCounts.children,
  infants: guestCounts.infants,
  extras: selectedExtras,
  ...CUSTOM_PRICING_CONFIG
})
```

### 2. Customize Booking Steps

```tsx
// components/enhanced-booking-experience.tsx
const CUSTOM_BOOKING_STEPS = [
  { id: 1, title: "Choose Experience", description: "Select your tour date and time" },
  { id: 2, title: "Party Details", description: "Tell us about your group" },
  { id: 3, title: "Your Information", description: "Contact and special requests" },
  { id: 4, title: "Secure Payment", description: "Complete your reservation" },
  { id: 5, title: "All Set!", description: "Your booking is confirmed" }
]
```

### 3. Add Custom Validation

```tsx
// Custom validation function
const customValidation = (guests: GuestInfo[], product: RezdyProduct) => {
  const errors: string[] = []
  
  // Custom business rules
  if (guests.length > 8) {
    errors.push('Maximum 8 guests per booking. Contact us for larger groups.')
  }
  
  // Age restrictions
  const hasMinors = guests.some(g => g.age < 18)
  const hasAdults = guests.some(g => g.age >= 18)
  
  if (hasMinors && !hasAdults) {
    errors.push('At least one adult (18+) required when booking for minors.')
  }
  
  return errors
}
```

## 🎨 Styling Customization

### 1. Custom Theme Colors

```css
/* globals.css */
:root {
  --primary: 45 100% 51%; /* Custom yellow */
  --primary-foreground: 0 0% 0%;
  --secondary: 210 40% 98%;
  --secondary-foreground: 222.2 84% 4.9%;
}
```

### 2. Custom Component Styling

```tsx
// Custom styled booking experience
<EnhancedBookingExperience 
  product={product}
  onClose={() => setShowBooking(false)}
  className="custom-booking-theme"
  onBookingComplete={(bookingData) => {
    // Handle completion
  }}
/>
```

```css
/* Custom styles */
.custom-booking-theme {
  --booking-primary: #your-brand-color;
  --booking-secondary: #your-secondary-color;
}

.custom-booking-theme .booking-step {
  background: var(--booking-primary);
}
```

## 📊 Analytics Integration

### 1. Google Analytics Events

```tsx
// Track booking funnel events
const trackBookingStep = (step: number, productCode: string) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'booking_step', {
      event_category: 'booking',
      event_label: productCode,
      value: step
    })
  }
}

// Track booking completion
const trackBookingComplete = (bookingData: any) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'purchase', {
      transaction_id: bookingData.id,
      value: bookingData.pricing.total,
      currency: 'USD',
      items: [{
        item_id: bookingData.product.code,
        item_name: bookingData.product.name,
        category: 'tour',
        quantity: bookingData.guests.length,
        price: bookingData.pricing.total
      }]
    })
  }
}
```

### 2. Custom Analytics Dashboard

```tsx
// Add custom metrics to the dashboard
<BookingDashboard 
  customMetrics={{
    conversionGoal: 0.20, // 20% target conversion rate
    revenueGoal: 50000, // Monthly revenue goal
    averageBookingGoal: 250 // Target average booking value
  }}
  onMetricClick={(metric) => {
    // Handle metric drill-down
    console.log('Metric clicked:', metric)
  }}
/>
```

## 🔒 Security Considerations

### 1. Payment Security

```tsx
// Ensure secure payment handling
const handlePaymentSubmission = async (paymentData: PaymentInfo) => {
  // Never log or store sensitive payment data
  const securePaymentData = {
    ...paymentData,
    cardNumber: paymentData.cardNumber.slice(-4), // Only store last 4 digits
    cvv: undefined, // Never store CVV
  }
  
  // Submit to secure payment processor
  const result = await submitSecurePayment(securePaymentData)
  return result
}
```

### 2. Data Validation

```tsx
// Server-side validation
export async function POST(request: Request) {
  const bookingData = await request.json()
  
  // Validate all booking data server-side
  const validation = validateBookingData(bookingData)
  if (!validation.isValid) {
    return NextResponse.json({ error: validation.errors }, { status: 400 })
  }
  
  // Process booking
  const result = await processBooking(bookingData)
  return NextResponse.json(result)
}
```

## 🧪 Testing

### 1. Component Testing

```tsx
// __tests__/enhanced-booking-experience.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { EnhancedBookingExperience } from '@/components/enhanced-booking-experience'

describe('EnhancedBookingExperience', () => {
  const mockProduct = {
    productCode: 'TEST001',
    name: 'Test Tour',
    advertisedPrice: 100
  }
  
  it('renders booking steps correctly', () => {
    render(
      <EnhancedBookingExperience 
        product={mockProduct}
        onClose={jest.fn()}
        onBookingComplete={jest.fn()}
      />
    )
    
    expect(screen.getByText('Select Date & Time')).toBeInTheDocument()
  })
  
  it('handles step navigation', () => {
    render(
      <EnhancedBookingExperience 
        product={mockProduct}
        onClose={jest.fn()}
        onBookingComplete={jest.fn()}
      />
    )
    
    // Test step navigation
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    
    expect(screen.getByText('Guest Details')).toBeInTheDocument()
  })
})
```

### 2. Integration Testing

```tsx
// __tests__/booking-flow.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BookingFlow } from '@/components/booking-flow'

describe('Booking Flow Integration', () => {
  it('completes full booking flow', async () => {
    render(<BookingFlow />)
    
    // Step 1: Select date
    fireEvent.click(screen.getByText('Choose Date'))
    fireEvent.click(screen.getByText('15')) // Select date
    
    // Step 2: Add guests
    fireEvent.click(screen.getByText('Add Guest'))
    
    // Step 3: Fill contact info
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    
    // Step 4: Complete payment
    fireEvent.click(screen.getByText('Complete Booking'))
    
    await waitFor(() => {
      expect(screen.getByText('Booking Confirmed')).toBeInTheDocument()
    })
  })
})
```

## 🚀 Deployment

### 1. Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Deploy to your hosting platform
npm run deploy
```

### 2. Environment Variables

```bash
# Production environment variables
REZDY_API_KEY=prod_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=prod_maps_key
NODE_ENV=production
```

### 3. Performance Monitoring

```tsx
// Add performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric)
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

## 📞 Support

### Common Issues

1. **Booking modal not showing**: Check z-index values and modal container
2. **Pricing calculations incorrect**: Verify pricing configuration
3. **API errors**: Check Rezdy API key and network connectivity
4. **Mobile responsiveness**: Test on various device sizes

### Getting Help

- Check the [Enhanced Booking System Documentation](./ENHANCED_BOOKING_SYSTEM.md)
- Review component props and TypeScript definitions
- Test with sample data before connecting to live APIs
- Monitor browser console for error messages

---

This implementation guide provides everything you need to integrate the enhanced booking system into your application. The system is designed to be flexible and customizable while providing a comprehensive booking experience out of the box. 