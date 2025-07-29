# Rezdy Availability API Integration Guide

## Overview

This document explains how to integrate the Rezdy Availability API to enable real-time availability checking for tour date filtering, replacing the current placeholder implementation.

## Current Implementation Status

The current tour date filtering in `/app/tours/page.tsx` (lines 121-127) is a UI-only placeholder:

```typescript
// Tour Date filter - check if product has availability on selected date
// Note: This is a basic filter. For real availability, you'd need to call Rezdy API
if (filters.tourDate) {
  // For now, we'll include all products if a date is selected
  // In a real implementation, you'd filter based on actual availability
  // This could be enhanced with availability checking logic
}
```

## Rezdy Availability API

### API Endpoint
```
GET https://api.rezdy-staging.com/v1/availability
```

### Authentication
All requests require an API key parameter:
```
?apiKey=69f708868ddc45eaa1f9b9fad1ddeba5
```

### Key Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `apiKey` | string | **Required.** API authentication key | `69f708868ddc45eaa1f9b9fad1ddeba5` |
| `productCode` | string | **Required.** Product code(s) to check availability for. Can be repeated for multiple products | `P00TNX` |
| `startTimeLocal` | string | **Required.** Start date/time in local timezone | `2025-08-01 00:00:00` |
| `endTimeLocal` | string | **Required.** End date/time in local timezone | `2025-09-01 00:00:00` |

### Example Request
```
GET https://api.rezdy-staging.com/v1/availability?apiKey=69f708868ddc45eaa1f9b9fad1ddeba5&productCode=P00TNX&productCode=PWQF1Y&startTimeLocal=2025-08-01%2000:00:00&endTimeLocal=2025-09-01%2000:00:00
```

### Response Structure

The API returns an array of availability sessions:

```typescript
interface RezdyAvailabilityResponse {
  sessions: RezdyAvailabilitySession[];
}

interface RezdyAvailabilitySession {
  productCode: string;
  startTimeLocal: string;      // e.g., "2025-08-15 09:00:00"
  endTimeLocal: string;        // e.g., "2025-08-15 17:00:00"
  startTimeUTC: string;
  endTimeUTC: string;
  totalSeats: number;
  seatsAvailable: number;
  priceOptions: RezdyPriceOption[];
  bookingMode: string;         // "INVENTORY", "DATE_ENQUIRY", "NO_DATE"
}
```

## Implementation Strategy

### 1. Create Availability Service

Create a new service to handle availability API calls:

```typescript
// lib/services/availability-service.ts
export class AvailabilityService {
  private static readonly BASE_URL = 'https://api.rezdy-staging.com/v1';
  private static readonly API_KEY = process.env.NEXT_PUBLIC_REZDY_API_KEY;

  static async checkProductAvailability(
    productCodes: string[],
    startDate: string,
    endDate: string
  ): Promise<Map<string, RezdyAvailabilitySession[]>> {
    const params = new URLSearchParams({
      apiKey: this.API_KEY,
      startTimeLocal: `${startDate} 00:00:00`,
      endTimeLocal: `${endDate} 23:59:59`
    });

    // Add product codes
    productCodes.forEach(code => {
      params.append('productCode', code);
    });

    const response = await fetch(`${this.BASE_URL}/availability?${params}`);
    const data: RezdyAvailabilityResponse = await response.json();

    // Group sessions by product code
    const availabilityMap = new Map<string, RezdyAvailabilitySession[]>();
    data.sessions.forEach(session => {
      const existing = availabilityMap.get(session.productCode) || [];
      availabilityMap.set(session.productCode, [...existing, session]);
    });

    return availabilityMap;
  }

  static hasAvailabilityOnDate(
    sessions: RezdyAvailabilitySession[],
    targetDate: string
  ): boolean {
    return sessions.some(session => {
      const sessionDate = session.startTimeLocal.split(' ')[0];
      return sessionDate === targetDate && session.seatsAvailable > 0;
    });
  }
}
```

### 2. Update Tours Page Filtering

Replace the placeholder filtering logic in `/app/tours/page.tsx`:

```typescript
// Enhanced client-side filtering with real availability checking
const {
  filteredProducts,
  currentPage,
  totalPages,
  availabilityLoading
} = useMemo(() => {
  let filtered = [...products];

  // Apply comprehensive product filtering using the ProductFilterService
  filtered = ProductFilterService.filterProducts(filtered);

  // Text search
  if (filters.query) {
    const query = filters.query.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.shortDescription?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
    );
  }

  // Region-based location filter
  if (filters.region && filters.region !== PickupRegion.ALL) {
    const regionResult = RegionFilterService.filterProductsByRegion(
      filtered, 
      filters.region,
      { fallbackToCity: true }
    );
    filtered = regionResult.filteredProducts;
  }

  // Participants filter
  if (filters.participants && parseInt(filters.participants) > 0) {
    const participantCount = parseInt(filters.participants);
    filtered = filtered.filter((product) => {
      const minRequired = product.quantityRequiredMin || 1;
      const maxAllowed = product.quantityRequiredMax || 999;
      return participantCount >= minRequired && participantCount <= maxAllowed;
    });
  }

  // ===== ENHANCED TOUR DATE FILTER WITH REAL AVAILABILITY =====
  if (filters.tourDate && availabilityData) {
    filtered = filtered.filter((product) => {
      const productSessions = availabilityData.get(product.productCode);
      if (!productSessions) return false; // No availability data = not available
      
      return AvailabilityService.hasAvailabilityOnDate(
        productSessions,
        filters.tourDate
      );
    });
  }

  // Client-side pagination logic...
  const limit = parseInt(filters.limit) || 100;
  const offset = parseInt(filters.offset) || 0;
  const currentPage = Math.floor(offset / limit) + 1;
  const paginated = filtered.slice(offset, offset + limit);
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));

  return {
    filteredProducts: paginated,
    currentPage,
    totalPages,
    availabilityLoading: isLoadingAvailability
  };
}, [products, filters, availabilityData, isLoadingAvailability]);
```

### 3. Add Availability Hook

Create a custom hook to manage availability data:

```typescript
// hooks/use-availability.ts
export function useAvailability(
  products: RezdyProduct[],
  tourDate: string | null
) {
  const [availabilityData, setAvailabilityData] = useState<Map<string, RezdyAvailabilitySession[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tourDate || products.length === 0) {
      setAvailabilityData(new Map());
      return;
    }

    const fetchAvailability = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const productCodes = products.map(p => p.productCode);
        const startDate = tourDate;
        const endDate = tourDate; // Same day for single date selection
        
        const availability = await AvailabilityService.checkProductAvailability(
          productCodes,
          startDate,
          endDate
        );
        
        setAvailabilityData(availability);
      } catch (err) {
        setError('Failed to check availability');
        console.error('Availability check failed:', err);
        // Fallback: show all products if availability check fails
        setAvailabilityData(new Map());
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce availability checks to avoid excessive API calls
    const timeoutId = setTimeout(fetchAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [products, tourDate]);

  return {
    availabilityData,
    isLoading,
    error
  };
}
```

### 4. Performance Optimizations

#### Caching Strategy
```typescript
// lib/services/availability-cache.ts
class AvailabilityCache {
  private static cache = new Map<string, {
    data: Map<string, RezdyAvailabilitySession[]>;
    timestamp: number;
    expiresAt: number;
  }>();

  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getCacheKey(productCodes: string[], date: string): string {
    return `${productCodes.sort().join(',')}-${date}`;
  }

  static get(productCodes: string[], date: string): Map<string, RezdyAvailabilitySession[]> | null {
    const key = this.getCacheKey(productCodes, date);
    const cached = this.cache.get(key);
    
    if (!cached || Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  static set(
    productCodes: string[], 
    date: string, 
    data: Map<string, RezdyAvailabilitySession[]>
  ): void {
    const key = this.getCacheKey(productCodes, date);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION
    });
  }

  static clear(): void {
    this.cache.clear();
  }
}
```

#### Batch API Requests
```typescript
// Enhanced AvailabilityService with caching
static async checkProductAvailability(
  productCodes: string[],
  startDate: string,
  endDate: string
): Promise<Map<string, RezdyAvailabilitySession[]>> {
  // Check cache first
  const cached = AvailabilityCache.get(productCodes, startDate);
  if (cached) {
    return cached;
  }

  // Batch products in chunks to avoid URL length limits
  const BATCH_SIZE = 20;
  const allSessions: RezdyAvailabilitySession[] = [];

  for (let i = 0; i < productCodes.length; i += BATCH_SIZE) {
    const batch = productCodes.slice(i, i + BATCH_SIZE);
    const params = new URLSearchParams({
      apiKey: this.API_KEY,
      startTimeLocal: `${startDate} 00:00:00`,
      endTimeLocal: `${endDate} 23:59:59`
    });

    batch.forEach(code => params.append('productCode', code));

    const response = await fetch(`${this.BASE_URL}/availability?${params}`);
    const data: RezdyAvailabilityResponse = await response.json();
    
    allSessions.push(...data.sessions);
  }

  // Group sessions by product code
  const availabilityMap = new Map<string, RezdyAvailabilitySession[]>();
  allSessions.forEach(session => {
    const existing = availabilityMap.get(session.productCode) || [];
    availabilityMap.set(session.productCode, [...existing, session]);
  });

  // Cache the result
  AvailabilityCache.set(productCodes, startDate, availabilityMap);

  return availabilityMap;
}
```

## Error Handling

### Graceful Degradation
When availability API fails, the system should:

1. **Show all products** (current behavior)
2. **Display a warning message** to users
3. **Log errors** for monitoring
4. **Retry with exponential backoff**

```typescript
// In the tours page component
{availabilityError && (
  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
    <div className="flex items-center gap-2 text-yellow-800">
      <AlertTriangle className="h-4 w-4" />
      <span className="text-sm">
        Unable to check real-time availability. Showing all tours.
      </span>
    </div>
  </div>
)}
```

## Environment Configuration

Add to `.env.local`:
```
NEXT_PUBLIC_REZDY_API_KEY=69f708868ddc45eaa1f9b9fad1ddeba5
NEXT_PUBLIC_REZDY_API_URL=https://api.rezdy-staging.com/v1
```

## Testing Strategy

### 1. Unit Tests
```typescript
// Test availability service
describe('AvailabilityService', () => {
  it('should filter products with availability on selected date', () => {
    const sessions = [
      { productCode: 'P001', startTimeLocal: '2025-08-15 09:00:00', seatsAvailable: 5 },
      { productCode: 'P001', startTimeLocal: '2025-08-16 09:00:00', seatsAvailable: 0 }
    ];
    
    expect(AvailabilityService.hasAvailabilityOnDate(sessions, '2025-08-15')).toBe(true);
    expect(AvailabilityService.hasAvailabilityOnDate(sessions, '2025-08-16')).toBe(false);
  });
});
```

### 2. Integration Tests
- Test with actual Rezdy staging API
- Verify caching behavior
- Test error handling scenarios

## Monitoring & Analytics

Track key metrics:
- **API response times**
- **Cache hit rates**
- **Availability check failures**
- **User filtering behavior**

## Migration Plan

1. **Phase 1**: Implement availability service and caching
2. **Phase 2**: Add availability hook with fallback to current behavior
3. **Phase 3**: Update tours page filtering logic
4. **Phase 4**: Add error handling and user feedback
5. **Phase 5**: Monitor and optimize performance

## Benefits of Real Availability

- **Improved user experience**: Users only see available tours
- **Reduced booking failures**: Less disappointment from unavailable dates
- **Better conversion rates**: More targeted search results
- **Real-time accuracy**: Always up-to-date availability information

## Technical Considerations

### API Rate Limits
- Monitor API usage to stay within Rezdy limits
- Implement request throttling if needed
- Use caching aggressively to reduce API calls

### Performance Impact
- Availability checks add ~200-500ms to page load
- Caching reduces subsequent checks to ~10ms
- Consider server-side caching for better performance

### Booking Mode Handling
Different Rezdy booking modes affect availability:
- **INVENTORY**: Real seat-based availability
- **DATE_ENQUIRY**: Enquiry-based bookings
- **NO_DATE**: Always available products

Handle each mode appropriately in the filtering logic.