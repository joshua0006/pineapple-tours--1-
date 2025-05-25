# Rezdy Integration Documentation

This document outlines the Rezdy API integration for Pineapple Tours, including setup instructions, API endpoints, and usage examples.

## Overview

The Rezdy integration provides access to:
- **Products**: Tour products with details, pricing, and images
- **Availability**: Real-time session availability with dates and pricing
- **Bookings**: Customer bookings and order management
- **Sessions**: Detailed session information including pickup locations

## Setup

### 1. Environment Variables

Create a `.env.local` file in your project root and add your Rezdy API key:

```env
REZDY_API_KEY=your_rezdy_api_key_here
```

### 2. API Configuration

The integration uses the following base configuration:
- **Base URL**: `https://api.rezdy.com/v1/`
- **Authentication**: API Key in query parameter
- **Rate Limiting**: 100 calls per minute (managed by server-side caching)

## API Endpoints

### Products (`/api/rezdy/products`)

**GET** - Fetch all products

**Query Parameters:**
- `limit` (optional): Number of products to return (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "products": [
    {
      "productCode": "TOUR001",
      "name": "Sydney Harbour Tour",
      "shortDescription": "Experience the beauty of Sydney Harbour",
      "description": "Full description...",
      "advertisedPrice": 89.00,
      "images": [
        {
          "url": "https://example.com/image.jpg",
          "caption": "Sydney Harbour",
          "isPrimary": true
        }
      ],
      "quantityRequiredMin": 1,
      "quantityRequiredMax": 20,
      "productType": "TOUR",
      "locationAddress": "Circular Quay, Sydney",
      "status": "ACTIVE"
    }
  ]
}
```

### Availability (`/api/rezdy/availability`)

**GET** - Check product availability

**Query Parameters:**
- `productCode` (required): Product code to check
- `startTime` (required): Start date (YYYY-MM-DD format)
- `endTime` (required): End date (YYYY-MM-DD format)
- `participants` (optional): Participant types and quantities (e.g., "ADULT:2,CHILD:1")

**Response:**
```json
{
  "availability": [
    {
      "productCode": "TOUR001",
      "sessions": [
        {
          "id": "session123",
          "startTimeLocal": "2024-01-15T09:00:00",
          "endTimeLocal": "2024-01-15T17:00:00",
          "seatsAvailable": 15,
          "totalPrice": 178.00,
          "pickupLocations": [
            {
              "id": "pickup1",
              "name": "Circular Quay",
              "address": "Circular Quay, Sydney NSW 2000",
              "pickupTime": "08:45:00"
            }
          ]
        }
      ]
    }
  ]
}
```

### Sessions (`/api/rezdy/sessions/[id]`)

**GET** - Get detailed session information

**Path Parameters:**
- `id` (required): Session ID

**Response:**
```json
{
  "id": "session123",
  "startTimeLocal": "2024-01-15T09:00:00",
  "endTimeLocal": "2024-01-15T17:00:00",
  "seatsAvailable": 15,
  "pickupLocations": [
    {
      "id": "pickup1",
      "name": "Circular Quay",
      "address": "Circular Quay, Sydney NSW 2000",
      "pickupTime": "08:45:00",
      "latitude": -33.8688,
      "longitude": 151.2093
    }
  ]
}
```

### Bookings (`/api/rezdy/bookings`)

**GET** - Fetch bookings

**Query Parameters:**
- `limit` (optional): Number of bookings to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**POST** - Create a new booking

**Request Body:**
```json
{
  "customer": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+61400000000"
  },
  "items": [
    {
      "productCode": "TOUR001",
      "startTimeLocal": "2024-01-15T09:00:00",
      "participants": [
        {
          "type": "ADULT",
          "number": 2
        }
      ],
      "amount": 178.00,
      "pickupId": "pickup1"
    }
  ],
  "totalAmount": 178.00,
  "paymentOption": "CREDITCARD",
  "status": "CONFIRMED"
}
```

## React Hooks

### useRezdyProducts

```typescript
import { useRezdyProducts } from '@/hooks/use-rezdy';

function ProductsComponent() {
  const { data: products, loading, error } = useRezdyProducts(100, 0);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {products?.map(product => (
        <div key={product.productCode}>{product.name}</div>
      ))}
    </div>
  );
}
```

### useRezdyAvailability

```typescript
import { useRezdyAvailability } from '@/hooks/use-rezdy';

function AvailabilityComponent() {
  const { data: availability, loading, error } = useRezdyAvailability(
    'TOUR001',
    '2024-01-15',
    '2024-01-20',
    'ADULT:2'
  );
  
  // Component implementation...
}
```

### useRezdyBookings

```typescript
import { useRezdyBookings } from '@/hooks/use-rezdy';

function BookingsComponent() {
  const { data: bookings, loading, error } = useRezdyBookings(50, 0);
  
  // Component implementation...
}
```

## UI Components

### RezdyProductCard

Displays product information with images, pricing, and details.

```typescript
import { RezdyProductCard } from '@/components/rezdy-product-card';

<RezdyProductCard
  product={product}
  onViewDetails={(product) => console.log('View details:', product)}
/>
```

### RezdyAvailabilityCard

Shows session availability with booking options.

```typescript
import { RezdyAvailabilityCard } from '@/components/rezdy-availability-card';

<RezdyAvailabilityCard
  session={session}
  productName="Sydney Harbour Tour"
  onBookSession={(session) => console.log('Book session:', session)}
/>
```

### RezdyBookingCard

Displays booking information with customer and item details.

```typescript
import { RezdyBookingCard } from '@/components/rezdy-booking-card';

<RezdyBookingCard
  booking={booking}
  onViewDetails={(booking) => console.log('View booking:', booking)}
/>
```

## Usage

### Viewing Rezdy Data

Navigate to `/rezdy` to access the Rezdy Data Dashboard, which provides:

1. **Products Tab**: Browse all available products with search functionality
2. **Availability Tab**: Check real-time availability for specific products and date ranges
3. **Bookings Tab**: View and manage customer bookings

### Integration Flow

1. **Product Discovery**: Users browse products in the Products tab
2. **Availability Check**: Click on a product to check availability in the Availability tab
3. **Booking Creation**: Use the availability data to create bookings via the API
4. **Booking Management**: View and manage bookings in the Bookings tab

## Error Handling

All API endpoints include comprehensive error handling:

- **Authentication Errors**: Missing or invalid API key
- **Validation Errors**: Missing required parameters
- **Rate Limiting**: Handled by server-side caching
- **Network Errors**: Proper error messages and retry mechanisms

## Caching Strategy

- **Products**: Cached for 5 minutes (300 seconds)
- **Availability**: Cached for 1 minute (60 seconds) due to volatility
- **Sessions**: Cached for 5 minutes (300 seconds)
- **Bookings**: Cached for 1 minute (60 seconds)

## Security Considerations

- API key is stored securely as an environment variable
- All API calls are made server-side to protect the API key
- Input validation on all endpoints
- Rate limiting protection through caching

## Development

### Adding New Endpoints

1. Create API route in `/app/api/rezdy/`
2. Add TypeScript interfaces in `/lib/types/rezdy.ts`
3. Create React hook in `/hooks/use-rezdy.ts`
4. Add UI components as needed

### Testing

Test the integration by:

1. Setting up your Rezdy API key
2. Running the development server: `npm run dev`
3. Navigating to `/rezdy`
4. Testing each tab functionality

## Support

For issues with the Rezdy integration:

1. Check the API key configuration
2. Verify network connectivity
3. Review error messages in the browser console
4. Check the Rezdy API documentation for any changes 