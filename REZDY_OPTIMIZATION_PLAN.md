# Rezdy Product Fetching Optimization Plan

## Overview

This document outlines the plan to optimize Rezdy product fetching across the Pineapple Tours website to ensure we're displaying the complete product inventory and providing accurate product counts.

## Current State Analysis

### Issues Identified

1. **Incomplete Product Display**: Main Rezdy dashboard was fetching only 100 products (default limit)
2. **Inconsistent Limits**: Different pages use different limits (100 vs 1000)
3. **No Total Count API**: No dedicated endpoint to get total product count without fetching all products
4. **Potential Performance Impact**: Large product fetches may impact page load times

### Current Implementation Status

| Page/Component | Current Limit | Status | Notes |
|----------------|---------------|--------|-------|
| `/rezdy` (Main Dashboard) | ✅ 1000 | **UPDATED** | Changed from default 100 to 1000 |
| `/rezdy/hop-on-hop-off` | 1000 | ✅ Good | Already optimized |
| `/rezdy/winery-tours` | 1000 | ✅ Good | Already optimized |
| `/rezdy/day-tours` | 1000 | ✅ Good | Already optimized |
| `/rezdy/corporate-tours` | 1000 | ✅ Good | Already optimized |
| `/rezdy/hens-party` | 1000 | ✅ Good | Already optimized |
| `/rezdy/barefoot-luxury` | 1000 | ✅ Good | Already optimized |
| `/rezdy/brewery-tours` | 1000 | ✅ Good | Already optimized |
| Search API | 1000 | ✅ Good | Already optimized |
| Gift Vouchers | 100 | ⚠️ Needs Review | May need increase |

## Implementation Plan

### Phase 1: Immediate Optimizations (Completed)

- [x] **Main Dashboard Update**: Updated `/rezdy` page to fetch 1000 products
- [x] **Verification**: Ensure all category pages are using 1000 limit

### Phase 2: Enhanced Product Fetching Strategy

#### 2.1 Implement Smart Pagination Hook

Create a new hook `useAllRezdyProducts` that automatically fetches all products using pagination:

```typescript
// hooks/use-all-rezdy-products.ts
export function useAllRezdyProducts() {
  const [state, setState] = useState({
    data: [],
    loading: true,
    error: null,
    totalFetched: 0,
    estimatedTotal: null
  });

  useEffect(() => {
    const fetchAllProducts = async () => {
      const allProducts = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        try {
          const response = await fetch(`/api/rezdy/products?limit=${limit}&offset=${offset}`);
          const data = await response.json();
          
          if (data.products && data.products.length > 0) {
            allProducts.push(...data.products);
            offset += limit;
            hasMore = data.products.length === limit;
            
            // Update state with progress
            setState(prev => ({
              ...prev,
              data: [...allProducts],
              totalFetched: allProducts.length
            }));
          } else {
            hasMore = false;
          }
        } catch (error) {
          setState(prev => ({ ...prev, error: error.message }));
          break;
        }
      }

      setState(prev => ({
        ...prev,
        loading: false,
        estimatedTotal: allProducts.length
      }));
    };

    fetchAllProducts();
  }, []);

  return state;
}
```

#### 2.2 Add Product Count API Endpoint

Create a lightweight endpoint to get just the total count:

```typescript
// app/api/rezdy/products/count/route.ts
export async function GET() {
  try {
    // Fetch with minimal data to get count
    const response = await fetch(`${REZDY_BASE_URL}/products?apiKey=${API_KEY}&limit=1&offset=0`);
    const data = await response.json();
    
    // If Rezdy provides total count in response, use it
    // Otherwise, implement pagination to count all
    
    return NextResponse.json({ 
      totalCount: estimatedTotal,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get product count' }, { status: 500 });
  }
}
```

#### 2.3 Implement Progressive Loading

Add progressive loading for better UX:

```typescript
// components/progressive-product-loader.tsx
export function ProgressiveProductLoader() {
  const { data, loading, totalFetched, estimatedTotal } = useAllRezdyProducts();
  
  return (
    <div>
      {loading && (
        <div className="flex items-center gap-2">
          <Spinner />
          <span>Loading products... {totalFetched} loaded</span>
          {estimatedTotal && (
            <span>of ~{estimatedTotal}</span>
          )}
        </div>
      )}
      {/* Render products as they load */}
    </div>
  );
}
```

### Phase 3: Performance Optimizations

#### 3.1 Implement Caching Strategy

- **Browser Caching**: Extend cache headers for product data
- **Memory Caching**: Cache products in React context/state management
- **Background Refresh**: Implement background refresh for stale data

#### 3.2 Virtual Scrolling for Large Lists

For pages with many products, implement virtual scrolling:

```typescript
// components/virtualized-product-grid.tsx
import { FixedSizeGrid as Grid } from 'react-window';

export function VirtualizedProductGrid({ products }) {
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const productIndex = rowIndex * COLUMNS_PER_ROW + columnIndex;
    const product = products[productIndex];
    
    return (
      <div style={style}>
        {product && <RezdyProductCard product={product} />}
      </div>
    );
  };

  return (
    <Grid
      columnCount={COLUMNS_PER_ROW}
      columnWidth={300}
      height={600}
      rowCount={Math.ceil(products.length / COLUMNS_PER_ROW)}
      rowHeight={400}
      width={1200}
    >
      {Cell}
    </Grid>
  );
}
```

#### 3.3 Lazy Loading for Category Pages

Implement lazy loading for category-specific product fetching:

```typescript
// hooks/use-category-products.ts
export function useCategoryProducts(categorySlug: string) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Only fetch when category is actually viewed
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && products.length === 0) {
        fetchCategoryProducts(categorySlug);
      }
    });
    
    // Observe category container
    const element = document.getElementById(`category-${categorySlug}`);
    if (element) observer.observe(element);
    
    return () => observer.disconnect();
  }, [categorySlug]);
  
  return { products, loading };
}
```

### Phase 4: Monitoring and Analytics

#### 4.1 Performance Monitoring

Add monitoring for:
- Product fetch times
- Total products loaded
- Cache hit rates
- User engagement with product data

#### 4.2 Error Handling and Fallbacks

Implement robust error handling:
- Retry mechanisms for failed requests
- Fallback to cached data
- Graceful degradation for API failures

## Implementation Timeline

### Week 1: Foundation
- [x] Update main dashboard (completed)
- [ ] Create `useAllRezdyProducts` hook
- [ ] Add product count API endpoint

### Week 2: Performance
- [ ] Implement progressive loading
- [ ] Add virtual scrolling for large lists
- [ ] Optimize caching strategy

### Week 3: Enhancement
- [ ] Add lazy loading for category pages
- [ ] Implement background refresh
- [ ] Add performance monitoring

### Week 4: Testing & Optimization
- [ ] Load testing with large product sets
- [ ] Performance optimization
- [ ] Documentation updates

## Success Metrics

### Performance Targets
- **Initial Load Time**: < 2 seconds for first 100 products
- **Complete Load Time**: < 10 seconds for all products
- **Cache Hit Rate**: > 80% for repeat visits
- **Error Rate**: < 1% for product fetching

### User Experience Targets
- **Accurate Counts**: 100% accurate product counts across all pages
- **Responsive UI**: No blocking during product loading
- **Search Performance**: < 500ms for product filtering

## Risk Mitigation

### API Rate Limiting
- **Risk**: Hitting Rezdy's 100 calls/minute limit
- **Mitigation**: Implement exponential backoff and request queuing

### Large Dataset Performance
- **Risk**: Poor performance with 1000+ products
- **Mitigation**: Virtual scrolling and progressive loading

### Cache Invalidation
- **Risk**: Stale product data
- **Mitigation**: Smart cache invalidation and background refresh

## Testing Strategy

### Unit Tests
- Test pagination logic
- Test error handling
- Test cache mechanisms

### Integration Tests
- Test full product loading flow
- Test API rate limiting scenarios
- Test cache invalidation

### Performance Tests
- Load testing with various product counts
- Memory usage monitoring
- Network request optimization

## Documentation Updates

### Developer Documentation
- Update API documentation with new endpoints
- Document new hooks and components
- Add performance guidelines

### User Documentation
- Update Rezdy integration guide
- Add troubleshooting section
- Document new features

## Rollout Plan

### Phase 1: Internal Testing
- Deploy to staging environment
- Test with full product dataset
- Performance validation

### Phase 2: Gradual Rollout
- Deploy to production with feature flags
- Monitor performance metrics
- Gradual increase in usage

### Phase 3: Full Deployment
- Enable for all users
- Monitor and optimize
- Gather user feedback

## Maintenance Plan

### Regular Tasks
- **Weekly**: Monitor performance metrics
- **Monthly**: Review cache effectiveness
- **Quarterly**: Optimize based on usage patterns

### Updates
- Keep up with Rezdy API changes
- Update caching strategies as needed
- Optimize based on user feedback

## Conclusion

This optimization plan ensures that the Pineapple Tours website displays complete and accurate Rezdy product information while maintaining excellent performance. The phased approach allows for careful testing and optimization at each step.

The immediate update to fetch 1000 products provides an immediate improvement, while the planned enhancements will create a robust, scalable solution for handling large product inventories efficiently. 