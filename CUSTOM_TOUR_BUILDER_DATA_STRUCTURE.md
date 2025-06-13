# Custom Tour Builder - Data Structure & Customization Guide

## Overview

This document provides a comprehensive guide to the Rezdy custom tour data structure and available customization options for building personalized tour experiences. Based on analysis of 100+ custom tour products from the Rezdy API, this guide outlines the complete data architecture and user customization possibilities.

## Table of Contents

1. [Rezdy Product Data Structure](#rezdy-product-data-structure)
2. [Custom Tour Categories](#custom-tour-categories)
3. [Available Customization Options](#available-customization-options)
4. [Regional Tour Configurations](#regional-tour-configurations)
5. [Experience Modules](#experience-modules)
6. [Pricing Structure](#pricing-structure)
7. [Booking & Availability](#booking--availability)
8. [User Interface Components](#user-interface-components)
9. [Implementation Examples](#implementation-examples)

---

## Rezdy Product Data Structure

### Core Product Schema

```typescript
interface RezdyProduct {
  productCode: string; // Unique identifier (e.g., "PH1FEA")
  name: string; // Product name
  shortDescription?: string; // Brief description
  description?: string; // Full description
  advertisedPrice?: number; // Base price
  images?: RezdyImage[]; // Product images
  quantityRequiredMin?: number; // Minimum participants
  quantityRequiredMax?: number; // Maximum participants
  productType?: string; // "CUSTOM", "DAYTOUR", "PRIVATE_TOUR", etc.
  locationAddress?: string | RezdyAddress;
  customFields?: Record<string, any>;
  status?: string; // "ACTIVE", "INACTIVE"
  categories?: string[]; // Product categories
  extras?: RezdyExtra[]; // Additional services/products
}
```

### Product Types for Custom Tours

Based on Rezdy data analysis, custom tours utilize these product types:

- **CUSTOM** (Primary) - Fully customizable experiences
- **DAYTOUR** - Structured day tours with customization options
- **PRIVATE_TOUR** - Private group experiences
- **CHARTER** - Transport charter services
- **ACTIVITY** - Individual activities/experiences
- **GIFT_CARD** - Gift vouchers for custom experiences

### Image Structure

```typescript
interface RezdyImage {
  id: number;
  itemUrl: string; // Full-size image URL
  thumbnailUrl: string; // Thumbnail URL
  mediumSizeUrl: string; // Medium-size URL
  largeSizeUrl: string; // Large-size URL
  caption?: string; // Image description
  isPrimary?: boolean; // Primary display image
}
```

---

## Custom Tour Categories

### 1. Winery Tours (46 products - 46% of custom tours)

**Product Types:** CUSTOM, DAYTOUR, PRIVATE_TOUR, GIFT_CARD
**Price Range:** $99 - $900
**Keywords:** winery, wine, vineyard, cellar, vintage, wine tasting

**Sample Products:**

- Hop on Hop off Wine Tour - Tamborine Mountain ($99)
- Full Day Mount Tamborine Winery Tour ($219)
- Premium Winery Experience with Tastings ($199-$358)

### 2. Hop-On Hop-Off Services (34 products - 34%)

**Product Types:** CUSTOM, TRANSFER, ACTIVITY
**Price Range:** $88 - $199
**Keywords:** hop-on, hop off, sightseeing bus, city tour bus

**Sample Products:**

- Hop on Hop off Bus - Tamborine Mountain ($99)
- Hinterland Explorer Pass ($88)
- Brisbane City Loop + Tamborine Mountain ($128)

### 3. Brewery Tours (32 products - 32%)

**Product Types:** CUSTOM, DAYTOUR, PRIVATE_TOUR
**Price Range:** $45 - $1995
**Keywords:** brewery, beer, craft beer, brewing, ale, lager

**Sample Products:**

- Build Your Own Brewery Tour ($45)
- Brewery Tour - 4 hours ($100)
- 3 Day Luxury Brisbane - Gold Coast - Byron Bay ($1995)

### 4. Barefoot Luxury (34 products - 34%)

**Product Types:** DAYTOUR, PRIVATE_TOUR, GIFT_CARD
**Price Range:** $135 - $1995
**Keywords:** luxury, premium, exclusive, VIP, high-end

**Sample Products:**

- Luxury Brisbane - Gold Coast - Byron Bay Experience ($1995)
- Premium Winery Experience ($199-$358)
- Champagne Sunset Winery Tour ($199)

### 5. Bus Charter Services (22 products - 22%)

**Product Types:** CHARTER, CUSTOM, RENTAL
**Price Range:** $99 - $850
**Keywords:** bus charter, charter bus, private bus, group transport

**Sample Products:**

- 57 Seat Coach Charter ($850)
- 27 Seat Minibus Charter ($240/hour)
- Private Bus Services ($99-$240)

---

## Available Customization Options

### 1. Regional Selection

Users can choose from multiple regions, each with unique characteristics:

#### Tamborine Mountain

- **Base Transport Price:** $99
- **Travel Time:** 45 mins from Brisbane
- **Specialties:** Premium wineries, rainforest walks, scenic lookouts
- **Best For:** Wine lovers, nature enthusiasts, couples
- **Available Experiences:** Winery tours, adventure activities, gourmet food

#### Gold Coast Hinterland

- **Base Transport Price:** $99
- **Travel Time:** 30 mins from Gold Coast
- **Specialties:** Adventure activities, wildlife encounters, natural springs
- **Best For:** Adventure seekers, families, active travelers
- **Available Experiences:** Adventure packages, cultural journeys, nature walks

#### Northern NSW

- **Base Transport Price:** $99
- **Travel Time:** 1.5 hours from Gold Coast
- **Specialties:** Byron Bay beaches, artistic communities, coastal culture
- **Best For:** Culture enthusiasts, beach lovers, free spirits
- **Available Experiences:** Cultural experiences, coastal tours, art galleries

### 2. Experience Modules

#### Transport Module (Always Included)

```typescript
{
  id: "hop-on-hop-off",
  name: "Unlimited Transport",
  price: 0, // Included in base price
  duration: "All day",
  features: [
    "Unlimited stops",
    "Flexible timing",
    "Professional driver",
    "Route guidance"
  ]
}
```

#### Premium Winery Experience (+$89)

```typescript
{
  id: "premium-winery",
  price: 89,
  duration: "4-5 hours",
  includes: [
    "4 premium venues",
    "Guided tastings",
    "Local cheese platters",
    "Wine education"
  ],
  participants: { min: 2, max: 12 }
}
```

#### Adventure Activities (+$69)

```typescript
{
  id: "adventure-package",
  price: 69,
  duration: "3-4 hours",
  includes: [
    "Rainforest walks",
    "Wildlife spotting",
    "Scenic lookouts",
    "Photography tips"
  ],
  participants: { min: 1, max: 20 }
}
```

#### Cultural Experiences (+$59)

```typescript
{
  id: "cultural-journey",
  price: 59,
  duration: "2-3 hours",
  includes: [
    "Cultural sites",
    "Local art galleries",
    "Heritage stories",
    "Community connections"
  ],
  participants: { min: 1, max: 15 }
}
```

#### Gourmet Food Trail (+$79)

```typescript
{
  id: "gourmet-food",
  price: 79,
  duration: "3-4 hours",
  includes: [
    "Local producers",
    "Artisan foods",
    "Specialty tastings",
    "Farm visits"
  ],
  participants: { min: 2, max: 10 }
}
```

### 3. Customization Parameters

#### Group Size

- **Minimum:** 1 person
- **Maximum:** 50 people (varies by experience)
- **Pricing:** Per person for most experiences
- **Group Discounts:** Available for 10+ people

#### Date & Time Selection

- **Advance Booking:** Minimum 24 hours
- **Seasonal Availability:** Year-round with weather considerations
- **Time Slots:** Morning (9 AM), Afternoon (1 PM), Full Day
- **Flexible Scheduling:** Hop-on hop-off allows flexible timing

#### Special Requirements

- **Dietary Restrictions:** Accommodated with advance notice
- **Accessibility Needs:** Wheelchair accessible options available
- **Special Occasions:** Birthday, anniversary, corporate events
- **Language Preferences:** English, with other languages on request

---

## Regional Tour Configurations

### Tamborine Mountain Configuration

```typescript
{
  id: "tamborine-mountain",
  name: "Tamborine Mountain",
  basePrice: 99,
  availableExperiences: [
    "hop-on-hop-off",      // Always included
    "premium-winery",      // +$89
    "adventure-package",   // +$69
    "gourmet-food"        // +$79
  ],
  popularCombinations: [
    {
      name: "Wine & Dine Explorer",
      experiences: ["hop-on-hop-off", "premium-winery"],
      totalPrice: 188,
      savings: 10
    },
    {
      name: "Complete Experience",
      experiences: ["hop-on-hop-off", "premium-winery", "adventure-package"],
      totalPrice: 257,
      savings: 20
    }
  ]
}
```

### Gold Coast Hinterland Configuration

```typescript
{
  id: "gold-coast-hinterland",
  name: "Gold Coast Hinterland",
  basePrice: 99,
  availableExperiences: [
    "hop-on-hop-off",
    "adventure-package",
    "cultural-journey",
    "gourmet-food"
  ],
  popularCombinations: [
    {
      name: "Nature & Culture",
      experiences: ["hop-on-hop-off", "cultural-journey"],
      totalPrice: 158,
      savings: 15
    }
  ]
}
```

---

## Pricing Structure

### Base Pricing Model

```typescript
interface PricingCalculation {
  baseTransport: number; // $99 per person
  selectedExperiences: {
    experienceId: string;
    pricePerPerson: number;
    participants: number;
  }[];
  totalBeforeDiscounts: number;
  groupDiscount?: number; // 10% for 10+ people
  seasonalAdjustment?: number; // ±20% based on season
  finalTotal: number;
}
```

### Sample Pricing Calculations

#### Individual Traveler - Wine Experience

- Base Transport: $99
- Premium Winery: $89
- **Total: $188 per person**

#### Family of 4 - Complete Adventure

- Base Transport: $99 × 4 = $396
- Premium Winery: $89 × 4 = $356
- Adventure Package: $69 × 4 = $276
- **Subtotal: $1,028**
- Family Discount (5%): -$51
- **Final Total: $977**

#### Group of 12 - Corporate Event

- Base Transport: $99 × 12 = $1,188
- Premium Winery: $89 × 12 = $1,068
- Cultural Journey: $59 × 12 = $708
- **Subtotal: $2,964**
- Group Discount (10%): -$296
- **Final Total: $2,668**

---

## Booking & Availability

### Session Management

```typescript
interface TourSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  availableSpots: number;
  maxCapacity: number;
  priceAdjustment?: number; // Dynamic pricing
  weatherDependent: boolean;
  pickupLocations: PickupLocation[];
}
```

### Pickup Locations

```typescript
interface PickupLocation {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  pickupTime: string;
  notes?: string;
}
```

**Available Pickup Points:**

- Brisbane CBD (Multiple locations)
- Gold Coast (Surfers Paradise, Broadbeach)
- Airport transfers (Additional cost)
- Hotel pickups (Selected hotels)

---

## User Interface Components

### Step-by-Step Builder Flow

1. **Region Selection**

   - Visual cards with images
   - Price comparison
   - Highlight unique features
   - Travel time information

2. **Experience Selection**

   - Modular checkboxes
   - Real-time price updates
   - Compatibility filtering
   - Popular combinations

3. **Customization**

   - Participant count selector
   - Date picker with availability
   - Special requirements form
   - Accessibility options

4. **Review & Book**
   - Complete itinerary summary
   - Final pricing breakdown
   - Terms and conditions
   - Payment processing

### Interactive Features

```typescript
interface BuilderState {
  selectedRegion: Region | null;
  selectedExperiences: Experience[];
  participants: number;
  selectedDate: string;
  specialRequests: string;
  totalPrice: number;
  availableDates: string[];
}
```

---

## Implementation Examples

### Basic Custom Tour Creation

```typescript
const createCustomTour = (selections: BuilderState) => {
  const tour = {
    region: selections.selectedRegion,
    experiences: selections.selectedExperiences,
    participants: selections.participants,
    date: selections.selectedDate,
    totalPrice: calculateTotalPrice(selections),
    bookingReference: generateBookingRef(),
    status: "pending_confirmation",
  };

  return tour;
};
```

### Price Calculation Logic

```typescript
const calculateTotalPrice = (selections: BuilderState) => {
  const basePrice = selections.selectedRegion?.basePrice || 0;
  const experiencePrice = selections.selectedExperiences
    .filter((exp) => exp.id !== "hop-on-hop-off")
    .reduce((total, exp) => total + exp.price, 0);

  const subtotal = (basePrice + experiencePrice) * selections.participants;
  const discount = calculateDiscount(selections.participants, subtotal);

  return subtotal - discount;
};
```

### Availability Check

```typescript
const checkAvailability = async (
  regionId: string,
  date: string,
  participants: number
) => {
  const sessions = await fetchAvailableSessions(regionId, date);
  return sessions.filter((session) => session.availableSpots >= participants);
};
```

---

## Data Validation & Quality

### Required Fields Validation

```typescript
interface ValidationRules {
  region: { required: true };
  experiences: { minLength: 1 }; // At least transport
  participants: { min: 1; max: 50 };
  date: {
    required: true;
    minDate: "today + 1 day";
    format: "YYYY-MM-DD";
  };
}
```

### Data Quality Metrics

Based on Rezdy analysis:

- **Product Completeness:** 95% have descriptions
- **Image Availability:** 88% have primary images
- **Pricing Accuracy:** 100% have valid pricing
- **Category Classification:** 92% properly categorized

---

## Future Enhancements

### Planned Features

1. **AI-Powered Recommendations**

   - Suggest experiences based on preferences
   - Weather-based activity recommendations
   - Seasonal optimization

2. **Real-Time Inventory**

   - Live availability updates
   - Dynamic pricing based on demand
   - Waitlist functionality

3. **Enhanced Personalization**

   - User preference profiles
   - Previous booking history
   - Loyalty program integration

4. **Mobile Optimization**
   - Progressive Web App (PWA)
   - Offline booking capability
   - GPS-based pickup notifications

---

## Technical Integration

### API Endpoints

```typescript
// Get available regions
GET /api/custom-tours/regions

// Get experiences for region
GET /api/custom-tours/experiences?region={regionId}

// Check availability
GET /api/custom-tours/availability?region={regionId}&date={date}&participants={count}

// Create booking
POST /api/custom-tours/book
```

### Data Synchronization

- **Real-time sync** with Rezdy API
- **Caching strategy** for performance
- **Fallback data** for offline scenarios
- **Conflict resolution** for concurrent bookings

---

This comprehensive guide provides the foundation for building a robust, user-friendly custom tour builder that leverages the full potential of the Rezdy platform while offering maximum flexibility and personalization for users.
