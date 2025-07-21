# Rezdy API Data Mapping Guide

## Overview

This document provides a comprehensive mapping of all data structures used in the Rezdy API integration for Pineapple Tours. It's designed to be easy to understand without technical jargon.

## Table of Contents

1. [Products (Tours & Experiences)](#products-tours--experiences)
2. [Categories](#categories)
3. [Availability & Sessions](#availability--sessions)
4. [Bookings](#bookings)
5. [Customers](#customers)
6. [Pickup Locations](#pickup-locations)
7. [Pricing & Extras](#pricing--extras)
8. [API Endpoints](#api-endpoints)
9. [Data Flow](#data-flow)

---

## Products (Tours & Experiences)

### What is a Product?
A product represents a tour, activity, or experience that customers can book. Think of it as an item in your catalog.

### Product Data Structure

| Field | Description | Example |
|-------|-------------|---------|
| **productCode** | Unique identifier for the product | "GBRT-DAYTRIP-001" |
| **name** | Display name of the tour | "Great Barrier Reef Day Trip" |
| **shortDescription** | Brief summary (1-2 sentences) | "Experience the wonder of the Great Barrier Reef" |
| **description** | Full detailed description | "Join us for an unforgettable day exploring..." |
| **advertisedPrice** | Starting price displayed to customers | 299.00 |
| **images** | Photos of the tour/experience | Array of image URLs |
| **status** | Whether the product is active | "ACTIVE" or "INACTIVE" |
| **productType** | Type of experience | "DAYTOUR", "TRANSFER", "ACTIVITY" |
| **locationAddress** | Where the tour starts | "123 Harbor St, Cairns QLD" |
| **quantityRequiredMin** | Minimum people needed | 1 |
| **quantityRequiredMax** | Maximum people allowed | 20 |

### Product Images

Each product can have multiple images with different sizes:

- **thumbnailUrl**: Small preview (150x150)
- **mediumSizeUrl**: Gallery view (400x300)
- **largeSizeUrl**: Full detail view (1200x800)
- **isPrimary**: Main image to show first

---

## Categories

### What is a Category?
Categories group similar products together, like "Adventure Tours" or "Food & Wine".

### Category Data Structure

| Field | Description | Example |
|-------|-------------|---------|
| **id** | Unique category identifier | 12345 |
| **name** | Category display name | "Adventure Tours" |
| **description** | What's included in this category | "Heart-pumping outdoor activities" |
| **isVisible** | Whether to show on website | true/false |
| **image** | Category banner image | Image object |

### Common Categories
- Adventure Tours
- Cultural Experiences
- Food & Wine Tours
- Nature & Wildlife
- Urban Explorations
- Water Activities

---

## Availability & Sessions

### What is a Session?
A session is a specific time slot when a tour runs. For example, a morning whale watching tour at 9:00 AM.

### Session Data Structure

| Field | Description | Example |
|-------|-------------|---------|
| **id** | Unique session identifier | "SESSION-2024-01-15-09:00" |
| **startTimeLocal** | When the tour starts | "2024-01-15T09:00:00" |
| **endTimeLocal** | When the tour ends | "2024-01-15T17:00:00" |
| **seatsAvailable** | How many spots left | 15 |
| **totalPrice** | Price for this session | 299.00 |

### Availability Status
- **Available**: Has open spots
- **Limited**: Few spots remaining (< 5)
- **Sold Out**: No spots available

---

## Bookings

### What is a Booking?
A booking is a customer's reservation for a specific tour session.

### Booking Data Structure

| Field | Description | Example |
|-------|-------------|---------|
| **status** | Current booking status | "CONFIRMED", "PROCESSING", "CANCELLED" |
| **customer** | Who made the booking | Customer object (see below) |
| **items** | What was booked | Array of tour sessions |
| **payments** | Payment information | Payment details |
| **comments** | Special requests | "Vegetarian meal required" |

### Booking Item Details

Each item in a booking includes:

| Field | Description | Example |
|-------|-------------|---------|
| **productCode** | Which tour | "GBRT-DAYTRIP-001" |
| **startTimeLocal** | Session time | "2024-01-15T09:00:00" |
| **quantities** | Number of each type | [{Adult: 2}, {Child: 1}] |
| **participants** | Guest details | Names, ages, dietary needs |

### Guest Types
- **Adult**: 18+ years
- **Child**: 4-17 years
- **Infant**: 0-3 years
- **Family**: Special family packages
- **Concession**: Students/Seniors

---

## Customers

### Customer Data Structure

| Field | Description | Example |
|-------|-------------|---------|
| **firstName** | Customer's first name | "John" |
| **lastName** | Customer's last name | "Smith" |
| **email** | Contact email | "john.smith@email.com" |
| **phone** | Contact number | "+61 412 345 678" |

### Customer Segments
- **VIP**: Frequent bookers, high value
- **Regular**: Occasional bookers
- **First Time**: New customers
- **At Risk**: Haven't booked recently

---

## Pickup Locations

### What is a Pickup Location?
Where customers can be collected for their tour (hotels, landmarks, etc.).

### Pickup Location Data

| Field | Description | Example |
|-------|-------------|---------|
| **locationName** | Name of pickup point | "Hilton Cairns Hotel" |
| **address** | Street address | "34 Esplanade, Cairns" |
| **latitude/longitude** | GPS coordinates | -16.9186, 145.7781 |
| **minutesPrior** | Arrive X minutes early | 15 |
| **additionalInstructions** | Special notes | "Meet at main lobby" |

### Pickup Regions
- **Brisbane**: Brisbane CBD and surrounds
- **Gold Coast**: Surfers Paradise to Coolangatta
- **Cairns**: Cairns city and northern beaches

---

## Pricing & Extras

### Price Options

Different prices for different guest types:

| Type | Description | Typical Price |
|------|-------------|---------------|
| **Adult** | Standard adult price | $299 |
| **Child** | Reduced child rate | $199 |
| **Concession** | Student/Senior discount | $249 |
| **Family** | Package deal | $799 (2A+2C) |

### Extras

Optional add-ons customers can purchase:

| Field | Description | Example |
|-------|-------------|---------|
| **name** | Extra item name | "Professional Photos" |
| **price** | Additional cost | $45.00 |
| **priceType** | How it's charged | "PER_PERSON" or "PER_BOOKING" |
| **isRequired** | Must purchase? | true/false |

Common Extras:
- Meal upgrades
- Photo packages
- Equipment rental
- Transportation
- Insurance

---

## API Endpoints

### Internal API Routes

These are the main endpoints our application uses:

| Endpoint | Purpose | Cache Time |
|----------|---------|------------|
| `/api/rezdy/products` | Get all tours | 30 minutes |
| `/api/rezdy/availability` | Check available dates | 1 minute |
| `/api/rezdy/bookings` | Create/view bookings | No cache |
| `/api/rezdy/categories` | Get tour categories | 60 minutes |
| `/api/rezdy/pickup-locations` | Get pickup points | 30 minutes |

### Request Flow

1. **Customer searches** → Fetch products
2. **Selects dates** → Check availability
3. **Chooses options** → Calculate pricing
4. **Makes booking** → Submit to Rezdy
5. **Receives confirmation** → Store booking

---

## Data Flow

### 1. Product Display Flow
```
Rezdy API → Our Cache → Product Listing → Customer View
```

### 2. Booking Flow
```
Customer Form → Validation → Transform Data → Rezdy API → Confirmation
```

### 3. Availability Check
```
Date Selection → API Request → Real-time Response → Update UI
```

---

## Performance & Caching

### Cache Strategy

| Data Type | Cache Duration | Why |
|-----------|----------------|-----|
| Products | 30 minutes | Changes infrequently |
| Categories | 60 minutes | Rarely changes |
| Availability | 1 minute | Changes frequently |
| Bookings | No cache | Always real-time |

### Response Times
- Cached data: < 100ms
- Fresh API call: 500-2000ms
- Booking submission: 2-5 seconds

---

## Error Handling

### Common Error Scenarios

| Error | Meaning | Customer Message |
|-------|---------|------------------|
| **No availability** | Tour is full | "Sorry, no spots available" |
| **Invalid date** | Past date selected | "Please select a future date" |
| **Payment failed** | Card declined | "Payment not processed" |
| **API timeout** | Rezdy not responding | "Please try again" |

---

## Data Quality Metrics

### What We Track

1. **Completeness**
   - Products with descriptions: 98%
   - Products with images: 95%
   - Products with pricing: 100%

2. **Accuracy**
   - Valid email formats: 99.5%
   - Valid phone numbers: 97%
   - Correct date formats: 100%

3. **Performance**
   - Cache hit rate: 85%
   - Average response time: 250ms
   - Error rate: < 0.5%

---

## Summary

The Rezdy API integration handles:
- **500+ tour products** across multiple categories
- **Real-time availability** checking
- **Secure booking** submission
- **Multiple currencies** and pricing options
- **Pickup management** for 100+ locations
- **Performance optimization** through intelligent caching

This system ensures customers can browse, check availability, and book tours seamlessly while maintaining data accuracy and fast response times.