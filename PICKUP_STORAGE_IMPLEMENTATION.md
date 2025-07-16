# Pickup Location Storage Implementation

## Overview

This document describes the implementation of permanent file-based storage for pickup location data, eliminating the need for repeated API calls to Rezdy for the same product pickup information.

## Architecture

### Core Components

1. **PickupStorage Service** (`/lib/services/pickup-storage.ts`)
   - Handles all file I/O operations for pickup data
   - Provides CRUD operations for pickup location files
   - Manages storage statistics and cleanup

2. **Updated API Route** (`/app/api/rezdy/products/[productCode]/pickups/route.ts`)
   - Uses file storage as primary data source
   - Falls back to Rezdy API only when no file exists
   - Saves API responses to file storage automatically

3. **Enhanced Filter Integration** (`/lib/services/enhanced-pickup-filter.ts`)
   - Uses stored pickup data when available
   - Maintains small memory cache for client-side performance
   - Falls back to text-based extraction when needed

## File Storage Structure

### Directory Layout
```
/data/
  /pickups/
    PWQF1Y.json        # Brisbane tour pickups
    GOLD123.json       # Gold Coast tour pickups  
    TAMB456.json       # Tamborine tour pickups
    ...
  .gitignore           # Ignores pickup files in git
```

### File Format
Each pickup file contains:
```json
{
  "productCode": "PWQF1Y",
  "pickups": [
    {
      "locationName": "Brisbane CBD",
      "address": "123 Queen St, Brisbane QLD 4000",
      "latitude": -27.4705,
      "longitude": 153.0260,
      "minutesPrior": 15,
      "additionalInstructions": "Meet at hotel lobby"
    }
  ],
  "fetchedAt": "2025-01-16T12:00:00Z",
  "source": "rezdy_api",
  "lastAccessed": "2025-01-16T12:30:00Z",
  "accessCount": 5
}
```

## Benefits

### Performance Improvements
- **Zero API calls** for products with cached pickup data
- **Instant response** times (no network latency)
- **Reduced memory usage** (no large in-memory caches)

### Cost Savings
- **Minimal Rezdy API usage** (one call per product ever)
- **Reduced bandwidth** consumption
- **Lower server load** during peak traffic

### Reliability
- **Offline capability** - works without internet connection
- **No cache expiration** - data persists until manually refreshed
- **Graceful degradation** - falls back to text extraction if needed

## API Endpoints

### Get Pickup Locations
```http
GET /api/rezdy/products/{productCode}/pickups
```

**Response (from storage):**
```json
{
  "pickups": [...],
  "productCode": "PWQF1Y",
  "totalCount": 3,
  "cached": true,
  "lastUpdated": "cached",
  "hasPickups": true,
  "source": "file_storage",
  "cacheStats": {
    "hitCount": 1,
    "age": "permanent"
  }
}
```

### Force Refresh
```http
GET /api/rezdy/products/{productCode}/pickups?refresh=true
```

Forces a fresh fetch from Rezdy API and updates the stored file.

### Delete Stored Data
```http
DELETE /api/rezdy/products/{productCode}/pickups
```

Removes the pickup data file for a specific product.

## PickupStorage Service API

### Core Methods

```typescript
// Check if pickup data exists
await PickupStorage.hasPickupData(productCode: string): Promise<boolean>

// Load pickup data from file
await PickupStorage.loadPickupData(productCode: string): Promise<RezdyPickupLocation[] | null>

// Save pickup data to file
await PickupStorage.savePickupData(
  productCode: string, 
  pickups: RezdyPickupLocation[],
  source?: 'rezdy_api' | 'manual' | 'imported'
): Promise<void>

// Delete pickup data file
await PickupStorage.deletePickupData(productCode: string): Promise<void>

// Get pickup data with API fallback
await PickupStorage.getPickupData(
  productCode: string,
  apiClient?: { fetchFromApi: (code: string) => Promise<RezdyPickupLocation[]> }
): Promise<RezdyPickupLocation[]>

// Force refresh from API
await PickupStorage.refreshPickupData(
  productCode: string,
  apiClient: { fetchFromApi: (code: string) => Promise<RezdyPickupLocation[]> }
): Promise<RezdyPickupLocation[]>
```

### Management Methods

```typescript
// Get storage statistics
await PickupStorage.getStorageStats(): Promise<StorageStats>

// Cleanup old files
await PickupStorage.cleanup(options?: {
  maxAge?: number;
  minAccessCount?: number;
  dryRun?: boolean;
}): Promise<CleanupResult>

// Bulk preload data
await PickupStorage.preloadPickupData(
  productCodes: string[],
  apiClient: ApiClient,
  options?: PreloadOptions
): Promise<PreloadResult>
```

## Usage Examples

### Basic Usage (API Route)
```typescript
// In API route - automatic storage handling
const pickups = await PickupStorage.getPickupData(productCode, {
  fetchFromApi: async (code) => {
    // Fetch from Rezdy API
    const response = await fetch(`${REZDY_URL}/products/${code}/pickups?apiKey=${API_KEY}`);
    const data = await response.json();
    return data.pickupLocations || [];
  }
});
```

### Client-Side Usage (React Component)
```typescript
// In React component - uses API route
useEffect(() => {
  const fetchPickups = async () => {
    const response = await fetch(`/api/rezdy/products/${productCode}/pickups`);
    const data = await response.json();
    setPickupLocations(data.pickups);
  };
  
  fetchPickups();
}, [productCode]);
```

### Bulk Preloading
```typescript
// Preload pickup data for multiple products
const result = await PickupStorage.preloadPickupData(
  ['PWQF1Y', 'GOLD123', 'TAMB456'],
  apiClient,
  {
    skipExisting: true,
    maxConcurrent: 3,
    onProgress: (completed, total, productCode) => {
      console.log(`Preloaded ${completed}/${total}: ${productCode}`);
    }
  }
);

console.log(`Successful: ${result.successful.length}`);
console.log(`Failed: ${result.failed.length}`);
console.log(`Skipped: ${result.skipped.length}`);
```

## Migration from Memory Cache

### Before (Memory Cache)
- ✅ Fast access after first load
- ❌ Lost on server restart
- ❌ Memory usage grows with products
- ❌ Background refresh complexity
- ❌ API calls on every server start

### After (File Storage)
- ✅ Fast access always
- ✅ Persists across server restarts
- ✅ Minimal memory footprint
- ✅ Simple refresh mechanism
- ✅ Zero API calls after first fetch

## Configuration

### Environment Variables
```bash
# Optional: Disable pickup storage (fallback to memory cache)
PICKUP_STORAGE_ENABLED=true

# Optional: Custom storage directory
PICKUP_STORAGE_DIR=./data/pickups

# Optional: Enable cleanup on startup
PICKUP_CLEANUP_ON_STARTUP=false
```

## Monitoring and Maintenance

### Storage Statistics
```typescript
const stats = await PickupStorage.getStorageStats();
console.log(`Total files: ${stats.totalFiles}`);
console.log(`Total size: ${stats.totalSize} bytes`);
console.log(`Oldest file: ${stats.oldestFile}`);
console.log(`Newest file: ${stats.newestFile}`);
```

### Cleanup Operations
```typescript
// Remove files older than 30 days
const result = await PickupStorage.cleanup({
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  dryRun: false
});

console.log(`Deleted ${result.deletedFiles.length} files`);
console.log(`Saved ${result.savedSpace} bytes`);
```

## Error Handling

### File System Errors
- **Permission denied**: Falls back to memory-only caching
- **Disk full**: Logs error and continues with existing data
- **Corrupted files**: Automatically deleted and re-fetched
- **Directory missing**: Created automatically

### API Errors
- **Network failure**: Uses existing stored data if available
- **Rate limiting**: Respects Rezdy API rate limits (600ms between calls)
- **Invalid response**: Logs warning and returns empty array

## Testing

### Manual Testing
```bash
# Test the storage system
node scripts/test-pickup-storage.js

# Test API integration
curl http://localhost:3000/api/rezdy/products/TEST123/pickups

# Check stored files
ls -la data/pickups/
```

### Automated Testing
The system includes comprehensive error handling and validation:
- File integrity checks
- JSON parsing validation
- Product code sanitization
- Concurrent access protection

## Future Enhancements

### Planned Features
1. **Compression**: Gzip compression for large pickup datasets
2. **Encryption**: Optional encryption for sensitive location data
3. **Backup**: Automatic backup to cloud storage
4. **Sync**: Multi-server synchronization capabilities
5. **Analytics**: Track pickup location usage patterns

### Performance Optimizations
1. **Lazy loading**: Load pickup files only when needed
2. **Batch operations**: Bulk file operations for efficiency
3. **Memory mapping**: Use memory-mapped files for large datasets
4. **Indexing**: Create index files for faster lookups

## Troubleshooting

### Common Issues

**Q: Files not being created**
A: Check directory permissions and disk space

**Q: Data not updating**
A: Use `?refresh=true` parameter to force API refresh

**Q: High memory usage**
A: Clear the memory cache with `EnhancedPickupFilter.clearCache()`

**Q: Old data being served**
A: Delete specific file and let system re-fetch from API

### Debug Commands
```bash
# Check storage directory
ls -la data/pickups/

# View file contents
cat data/pickups/PWQF1Y.json | jq .

# Check file permissions
ls -l data/pickups/

# Monitor file access
tail -f data/pickups/*.json
```

This implementation provides a robust, efficient, and maintainable solution for pickup location storage that eliminates redundant API calls while maintaining data freshness and system reliability.