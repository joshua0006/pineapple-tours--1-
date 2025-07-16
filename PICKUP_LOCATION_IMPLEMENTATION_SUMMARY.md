# Pickup Location Implementation Summary

## Overview

The pickup location system securely fetches location data from the Rezdy API for each product, ensuring that the booking component gets the correct pickup locations for the selected tour.

## Security Implementation

### API Key Management
- ✅ **Environment Variable**: The Rezdy API key is stored in `REZDY_API_KEY` environment variable
- ✅ **Server-Side Only**: API calls are made from server-side API routes, never exposing the key to the client
- ✅ **No Hardcoded Keys**: All hardcoded API keys have been removed from the codebase

### API Route Structure
```
/api/rezdy/products/[productCode]/pickups
```

This endpoint:
1. Validates the product code
2. Fetches pickup locations from Rezdy API: `https://api.rezdy.com/v1/products/{productCode}/pickups?apiKey={API_KEY}`
3. Implements caching and rate limiting
4. Returns structured pickup data

## How It Works

### 1. Booking Component Initialization
When the enhanced booking experience loads:

```typescript
// components/enhanced-booking-experience.tsx
useEffect(() => {
  const fetchPickupLocations = async () => {
    if (!product?.productCode) return;
    
    console.log(`🔍 Fetching pickup locations for product: ${product.productCode}`);
    
    const response = await fetch(`/api/rezdy/products/${product.productCode}/pickups`);
    const data = await response.json();
    
    setApiPickupLocations(data.pickups || []);
  };
  
  fetchPickupLocations();
}, [product?.productCode]);
```

### 2. API Route Processing
The API route (`app/api/rezdy/products/[productCode]/pickups/route.ts`):

```typescript
export async function GET(request: NextRequest, { params }: { params: Promise<{ productCode: string }> }) {
  const { productCode } = await params;
  
  // Validate product code
  if (!productCode || productCode.trim() === '') {
    return NextResponse.json({ error: 'Product code required' }, { status: 400 });
  }
  
  // Fetch from Rezdy API
  const url = `${REZDY_BASE_URL}/products/${productCode}/pickups?apiKey=${API_KEY}`;
  const response = await fetch(url);
  
  // Return pickup locations
  return NextResponse.json({
    pickups: data.pickupLocations || [],
    productCode,
    cached: fromCache,
    hasPickups: pickups.length > 0
  });
}
```

### 3. Data Flow
1. **Product Selection**: User selects a tour product
2. **API Call**: Booking component calls `/api/rezdy/products/{productCode}/pickups`
3. **Rezdy Fetch**: Server makes authenticated request to Rezdy API
4. **Data Return**: Pickup locations returned to component
5. **UI Update**: Pickup selector populated with available locations

## Caching Strategy

### File Storage Cache
- Pickup data is cached locally in `data/pickups/` directory
- Cache is used first, API called only if no cached data exists
- Refresh parameter forces API call: `?refresh=true`

### Memory Cache
- In-memory caching prevents duplicate requests
- Request deduplication for concurrent calls
- Rate limiting (600ms between API calls)

## Error Handling

### API Level
- Validates product codes
- Handles 404 responses (no pickup locations)
- Logs all API interactions
- Implements retry logic with exponential backoff

### Component Level
- Loading states during fetch
- Error states with user-friendly messages
- Fallback to session pickup locations if API fails
- Validation of pickup selection requirements

## Debugging and Logging

### Console Output
The system provides detailed logging:

```
🔍 Fetching pickup locations for product: TOUR001
📡 Making API request to: /api/rezdy/products/TOUR001/pickups
✅ Pickup locations response: {
  productCode: "TOUR001",
  totalCount: 5,
  pickupsReceived: 5,
  cached: false,
  source: "rezdy_api"
}
📍 Sample pickup locations: [
  { name: "Gold Coast Central", address: "123 Main St" },
  { name: "Surfers Paradise", address: "456 Beach Rd" }
]
```

### Network Monitoring
- Response times tracked for analytics
- Cache hit/miss ratios monitored
- API failure rates logged

## Environment Setup

### Required Environment Variables
```env
# .env.local
REZDY_API_KEY=your_actual_rezdy_api_key_here
REZDY_API_URL=https://api.rezdy.com/v1
```

### Development Setup
1. Copy `env.example` to `.env.local`
2. Add your Rezdy API key
3. Restart development server
4. Test pickup location fetching

## Validation

### Pickup Location Requirements
- Tours with pickup services must have a pickup location selected
- Validation errors shown if required pickup not selected
- Auto-selection of first available pickup location

### Data Integrity
- Product code validation prevents invalid requests
- Response validation ensures proper data structure
- Type safety with TypeScript interfaces

## Performance Optimizations

### Preloading
- Pickup locations can be preloaded during product browsing
- Smart preloader initiates fetch when user shows booking intent
- Background fetching doesn't block UI interactions

### Efficient Fetching
- Only fetches when product changes
- Skips fetch if preloaded data available
- Implements request deduplication

## Testing

### Manual Testing
1. Navigate to booking page for any tour
2. Check browser console for pickup location logs
3. Verify pickup selector appears with locations
4. Test selection and validation

### API Testing
```bash
curl "http://localhost:3000/api/rezdy/products/TOUR001/pickups"
```

Expected response:
```json
{
  "pickups": [...],
  "productCode": "TOUR001",
  "totalCount": 5,
  "hasPickups": true,
  "source": "rezdy_api"
}
```

## Security Checklist

- ✅ API key stored in environment variables only
- ✅ No client-side exposure of API credentials
- ✅ Server-side API calls only
- ✅ Input validation on all endpoints
- ✅ Error messages don't expose sensitive information
- ✅ Rate limiting implemented
- ✅ Request logging for monitoring

## Troubleshooting

### Common Issues

1. **No pickup locations showing**
   - Check product code is valid
   - Verify API key is set correctly
   - Check console logs for error messages

2. **API errors**
   - Verify `REZDY_API_KEY` environment variable
   - Check Rezdy API status
   - Review server logs for detailed error information

3. **Slow loading**
   - Check if caching is working properly
   - Monitor network tab for API response times
   - Consider preloading for frequently accessed products

### Debug Commands
```bash
# Check environment variables
echo $REZDY_API_KEY

# Test API directly
curl -H "Content-Type: application/json" \
  "https://api.rezdy.com/v1/products/TOUR001/pickups?apiKey=YOUR_KEY"

# Check local cache
ls -la data/pickups/
```

This implementation ensures that pickup locations are fetched correctly and securely for each product, with robust error handling and performance optimizations.

## Recent Fix: Duplicate API Call Prevention

### Issue Resolved (2025-07-16)
Fixed multiple API calls being triggered for the same pickup location data.

### Problem
The pickup location fetching was being triggered up to 3 times:
1. Server-side preload in `app/booking/[productCode]/page.tsx`
2. Client-side fetch in `components/enhanced-booking-experience.tsx` via useEffect
3. Smart preloader call via `preloadOnBookingStart()`

### Solution
1. **Fixed useEffect dependencies**: Removed `preloadedPickupLocations` from dependency array to prevent re-triggering
2. **Early return optimization**: Check for preloaded data at the start of useEffect
3. **Removed redundant preloader**: Eliminated unnecessary `useSmartPickupPreloader` usage

### Result
- Only one API call when no preloaded data exists
- Zero API calls when using preloaded data
- Improved loading performance and reduced server load 