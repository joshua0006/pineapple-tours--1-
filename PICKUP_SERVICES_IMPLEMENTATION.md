# Pickup Services Implementation

This document outlines the implementation of pickup services for Pineapple Tours, ensuring that pickup location selection only appears for products that actually provide pickup services.

## Overview

The pickup services feature automatically detects which products offer pickup services and conditionally displays pickup location selection in booking forms. This ensures a clean user experience where pickup options only appear when relevant.

## Key Components

### 1. Pickup Service Detection (`lib/utils/product-utils.ts`)

#### `hasPickupServices(product: RezdyProduct): boolean`
Detects if a product offers pickup services by analyzing:
- **Product name keywords**: "pickup", "door to door", "transfer", "shuttle", "hop on hop off", "from brisbane", etc.
- **Description keywords**: "pickup", "door-to-door", "shuttle service", "departing from", etc.
- **Product types**: "TRANSFER", "SHUTTLE", "CUSTOM" (many hop-on hop-off services)

#### `getPickupServiceType(product: RezdyProduct)`
Returns the type of pickup service:
- `'door-to-door'`: Direct pickup from accommodation
- `'shuttle'`: Shuttle service with designated stops
- `'designated-points'`: Pickup from specific locations
- `'none'`: No pickup service

#### `extractPickupLocations(product: RezdyProduct): string[]`
Extracts mentioned pickup locations from product name/description:
- Brisbane, Gold Coast, Tamborine Mountain, Surfers Paradise, etc.

### 2. Pickup Location Selector Component (`components/ui/pickup-location-selector.tsx`)

A reusable component for pickup location selection featuring:
- **Visual selection**: Radio-style selection with clear visual feedback
- **Location details**: Name, address, pickup time display
- **Directions integration**: Google Maps directions links
- **Validation**: Required field validation with error messages
- **Responsive design**: Works on all screen sizes

#### Props:
```typescript
interface PickupLocationSelectorProps {
  pickupLocations: RezdyPickupLocation[]
  selectedPickupLocation: RezdyPickupLocation | null
  onPickupLocationSelect: (location: RezdyPickupLocation) => void
  className?: string
  showDirections?: boolean
  required?: boolean
}
```

### 3. Enhanced Booking Forms

#### Enhanced Booking Experience (`components/enhanced-booking-experience.tsx`)
- Detects pickup services using utility functions
- Shows pickup location selector only when session has pickup locations
- Displays pickup service information for products without specific locations
- Validates pickup location selection in step progression
- Includes pickup data in booking submission

#### Simple Booking Form (`components/booking-form.tsx`)
- Similar pickup service detection and display
- Integrated pickup location validation
- Pickup information in booking summary
- Pickup data included in booking submission

### 4. Tour Detail Page Integration (`app/tours/[slug]/page.tsx`)

- Displays pickup service information in tour overview
- Shows pickup service type and available areas
- Provides context about what pickup service is included

## Data Flow

### 1. Product Analysis
```typescript
const productHasPickupServices = hasPickupServices(product)
const pickupServiceType = getPickupServiceType(product)
const mentionedPickupLocations = extractPickupLocations(product)
```

### 2. Session-Based Pickup Locations
```typescript
// If session has specific pickup locations
if (selectedSession?.pickupLocations?.length > 0) {
  // Show PickupLocationSelector component
  // Require pickup location selection
}
```

### 3. Fallback Pickup Information
```typescript
// If product has pickup services but no session locations
if (productHasPickupServices && !sessionPickupLocations) {
  // Show pickup service information
  // Explain that details will be provided after booking
}
```

### 4. Validation
```typescript
const needsPickupLocation = productHasPickupServices && 
  selectedSession?.pickupLocations?.length > 0
const hasValidPickupLocation = !needsPickupLocation || selectedPickupLocation
```

## Booking Data Structure

Pickup information is included in booking data:

```typescript
interface BookingData {
  product: {
    code: string
    name: string
    hasPickupServices: boolean
    pickupServiceType: 'door-to-door' | 'designated-points' | 'shuttle' | 'none'
  }
  session: {
    id: string
    startTime: string
    endTime: string
  }
  pickupLocation?: RezdyPickupLocation | null
  // ... other booking data
}
```

## Products with Pickup Services

Based on the Rezdy data analysis, the following product types include pickup services:

### Door-to-Door Services
- **PBMUT0**: "Candice's Rainforest experience 2Hrs - Gourmet Two Course Meal - Door to Door Pickup from the Gold Coast"

### Gift Vouchers for Pickup Tours
- **P30VE2**: "$458 Gift Voucher - Two people Full Day Wine Tour including Pickup"
- **PWGSA9**: "$598 Gift Voucher - Two people Premium Full Day Wine Tour including Pickup"

### Hop-on Hop-off with Specific Pickup Points
- **PNYY7C**: "Hop on Hop off Day Pass + Glow Worm Tour - Brisbane Pickup"
- **PZ6FNP**: "Hop on Hop off Day Pass + Glow Worm Tour - Gold Coast Pickup"

### Shuttle Services
- **PJKCEW**: "Brisbane to Tamborine Mountain Shuttle Service"
- **PMP0H7**: "Gold Coast - Tamborine Mountain Shuttle Service"
- **PT1CFA**: "Currumbin Wildlife Sanctuary - Southern Gold Coast - Northern NSW - Hop on Hop off Shuttle"

## User Experience

### For Products WITH Pickup Services:

1. **Tour Detail Page**: Shows pickup service information in overview
2. **Booking Form**: 
   - If session has pickup locations → Shows pickup location selector (required)
   - If no session locations → Shows pickup service information
3. **Validation**: Prevents booking progression without pickup location selection when required
4. **Booking Summary**: Includes pickup location/service information

### For Products WITHOUT Pickup Services:

1. **Tour Detail Page**: No pickup information shown
2. **Booking Form**: No pickup-related fields or information
3. **Clean Experience**: No unnecessary pickup options

## Testing

Use the test function in `lib/utils/pickup-service-test.ts`:

```typescript
import { testPickupServiceDetection } from '@/lib/utils/pickup-service-test'

// Run in browser console or test environment
testPickupServiceDetection()
```

This tests the pickup service detection against real Rezdy product data.

## Future Enhancements

1. **Dynamic Pickup Locations**: Support for pickup locations that change based on date/time
2. **Pickup Time Optimization**: Suggest optimal pickup times based on location
3. **Real-time Tracking**: Integration with pickup vehicle tracking
4. **Pickup Preferences**: User preferences for pickup location types
5. **Multi-language Support**: Pickup location names in multiple languages

## API Integration

The implementation is designed to work with the Rezdy API structure:

```typescript
interface RezdySession {
  id: string
  startTimeLocal: string
  endTimeLocal: string
  seatsAvailable: number
  totalPrice?: number
  pickupId?: string
  pickupLocations?: RezdyPickupLocation[]
}

interface RezdyPickupLocation {
  id: string
  name: string
  pickupTime?: string
  address?: string | RezdyAddress
  latitude?: number
  longitude?: number
}
```

This ensures compatibility with existing Rezdy data structures while providing enhanced pickup service functionality. 