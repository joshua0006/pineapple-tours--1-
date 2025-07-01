# Rezdy Data Dashboard

A comprehensive dashboard for viewing and analyzing Rezdy product data with intelligent caching and rate limiting.

## Features

### 🚀 Performance & Caching

- **Intelligent Caching**: 30-minute TTL for product data, 1-minute for availability
- **Rate Limiting**: Prevents API abuse with smart request throttling
- **Cache Statistics**: Real-time monitoring of cache hit/miss ratios
- **Background Refresh**: Automatic cache updates without blocking UI

### 📊 Data Visualization

- **Product Overview**: Statistics cards showing key metrics
- **Filterable Products**: Search by name, category, budget range
- **JSON Export**: Copy or download raw data in JSON format
- **Analytics Dashboard**: Category distribution and performance metrics

### 🎯 Key Capabilities

- Real-time product data from Rezdy API
- Advanced filtering and search functionality
- Responsive design with mobile support
- Export capabilities (JSON download/copy)
- Cache performance monitoring

## Usage

### Accessing the Dashboard

Navigate to `/rezdy` to access the main dashboard.

### Tabs Overview

#### 1. Overview Tab

- **Statistics Cards**: Total products, average pricing, active products
- **Cache Performance**: Hit/miss ratios, cache size, last update time
- **Quick Metrics**: Filtered results count and refresh status

#### 2. Products Tab

- **Advanced Filters**: Search by name/code, filter by category and budget
- **Product List**: Scrollable list with status badges and pricing
- **Real-time Results**: Updates as you type in search

#### 3. JSON Data Tab

- **Raw Data Export**: Complete JSON output of filtered products
- **Copy to Clipboard**: One-click copying of JSON data
- **Download Option**: Save JSON file with timestamp
- **Syntax Highlighting**: Formatted JSON display

#### 4. Analytics Tab

- **Category Distribution**: Visual breakdown of product categories
- **Performance Metrics**: API response times and cache effectiveness
- **System Information**: Rate limiting and TTL configuration

## Technical Implementation

### Caching Strategy

```typescript
// Cache TTL Configuration
products: 1800,    // 30 minutes
availability: 60,  // 1 minute
bookings: 180,     // 3 minutes
sessions: 900,     // 15 minutes
search: 600,       // 10 minutes
categories: 3600   // 1 hour
```

### Rate Limiting

- **Request Throttling**: Intelligent queuing of API requests
- **Priority Headers**: High-priority requests for urgent data
- **Timeout Handling**: 15-second timeout for priority requests
- **Error Recovery**: Graceful fallback to cached data

### API Endpoints

- `GET /api/rezdy/products` - Fetch products with caching
- `GET /api/rezdy/products?stats=true` - Get cache statistics
- `GET /api/rezdy/products?limit=X&offset=Y` - Paginated results

### Cache Headers

```http
Cache-Control: public, s-maxage=1800, stale-while-revalidate=3600
X-Cache: HIT|MISS
X-Cache-Key: products:limit:offset
```

## Performance Optimization

### Client-Side

- **Memoized Calculations**: Efficient filtering and statistics
- **Debounced Search**: Prevents excessive re-renders
- **Virtual Scrolling**: Handles large product lists efficiently
- **Background Updates**: Non-blocking cache refreshes

### Server-Side

- **Memory Cache**: Fast in-memory storage for frequently accessed data
- **LRU Eviction**: Automatic cleanup of old cache entries
- **Compression**: Optimized data transfer
- **CDN Integration**: Edge caching support

## Monitoring & Debugging

### Cache Statistics

Monitor cache performance in real-time:

- **Hit Ratio**: Percentage of requests served from cache
- **Memory Usage**: Current cache size and memory consumption
- **Request Patterns**: Analysis of API usage patterns

### Performance Metrics

- **Response Times**: Average API response duration
- **Error Rates**: Failed requests and recovery statistics
- **Data Freshness**: Age of cached data

## Environment Configuration

Ensure these environment variables are set:

```bash
REZDY_API_KEY=your_rezdy_api_key
NEXT_PUBLIC_SITE_URL=your_site_url
```

## Rate Limiting Best Practices

1. **Use Filters**: Reduce data volume with targeted searches
2. **Batch Requests**: Combine multiple data needs into single requests
3. **Monitor Cache**: Check hit ratios to optimize performance
4. **Respect Limits**: API has built-in rate limiting to prevent abuse

## Troubleshooting

### Common Issues

- **Cache Miss**: Check if REZDY_API_KEY is configured
- **Slow Loading**: Verify network connectivity to Rezdy API
- **Data Staleness**: Use manual refresh if real-time data needed

### Debug Features

- **Console Logging**: Detailed cache hit/miss information
- **Error Boundaries**: Graceful error handling with user feedback
- **Fallback Data**: Cached data served during API outages

## Security Considerations

- **API Key Protection**: Server-side only, never exposed to client
- **Request Validation**: Input sanitization and rate limiting
- **CORS Handling**: Proper cross-origin request management
- **Error Masking**: Sensitive error details hidden from users

This dashboard provides a robust, production-ready interface for Rezdy data management with enterprise-grade caching and performance optimization.
