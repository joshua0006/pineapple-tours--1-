# Rezdy Categories Integration

A comprehensive integration plan for combining Rezdy API categories with the existing Pineapple Tours category system.

## Overview

This document outlines the integration strategy for merging Rezdy's dynamic category system with our curated website categories to create a unified, real-time product filtering system.

## Rezdy API Categories Analysis

### Total Categories from API: 37
- **Visible Categories**: 11 (actively displayed)
- **Hidden Categories**: 26 (backend organization)

### Key Rezdy Categories

#### Active Tour Categories (Visible: true)
1. **Hop on Hop off Tours - Brisbane** (ID: 610656)
   - Primary focus on Brisbane city loop tours
   - Sample products: City Loop, Brewery Adventures, Rainforest + Glow Worms
   - Price range: $29 - $165

2. **Hop on Hop off Tours - Gold Coast** (ID: 610660)
   - Gold Coast region hop-on-hop-off services
   - Includes Currumbin Wildlife Sanctuary shuttles

3. **Day Tours - Gold Coast** (ID: 276149)
   - Premium full-day experiences
   - Sample products: Mt Tamborine Winery Tour ($299), Hinterland Explorer ($99)
   - Includes private charter options ($680+)

4. **Day Tours - Brisbane** (ID: 276150)
   - Brisbane-based day tour experiences
   - Similar structure to Gold Coast offerings

5. **All Tours and Experiences** (ID: 292802)
   - Comprehensive category containing all tour types
   - Used for general browsing and search

#### Specialty Categories
- **Barefoot Luxury Tours**: Premium experiential tours
- **Private Tours**: Customizable private experiences
- **Winery Tours (Small Group)**: Intimate wine experiences
- **Corporate Tours**: Business and group bookings

## Category Mapping Strategy

### 1. Direct Mapping
Map Rezdy categories that directly correspond to website categories:

| Website Category | Rezdy Category ID | Rezdy Name |
|------------------|-------------------|------------|
| `hop-on-hop-off` | 610656, 610660 | Hop on Hop off Tours |
| `winery-tours` | [TBD] | Winery Tours (Small Group) |
| `private-tours` | [TBD] | Private Tours |
| `luxury-tours` | [TBD] | Barefoot Luxury Tours |
| `corporate-tours` | [TBD] | Corporate Tours |

### 2. Regional Mapping
Combine location-based Rezdy categories with destination filters:

| Destination | Rezdy Category IDs | Combined Filter |
|-------------|-------------------|-----------------|
| Gold Coast | 610660, 276149 | `gold-coast` + tour type |
| Brisbane | 610656, 276150 | `brisbane` + tour type |
| Mt Tamborine | [Various] | `mt-tamborine` + tour type |

### 3. Aggregated Categories
Create unified categories from multiple Rezdy categories:

- **Nature & Adventure Tours**: Combine rainforest, glow worm, and outdoor categories
- **Food & Wine Tours**: Merge winery, brewery, and food experience categories
- **Transportation Services**: Group shuttle, transfer, and hop-on-hop-off services

## Product Structure Analysis

Based on API sampling, Rezdy products include:

### Core Product Fields
- `productCode`: Unique identifier
- `name`: Product title
- `shortDescription`: Brief summary
- `description`: Detailed information
- `advertisedPrice`: Base pricing
- `priceOptions`: Detailed pricing structure
- `images`: Product imagery
- `productType`: Classification
- `status`: Availability status
- `categoryId`: Associated category

### Price Structure
- Adult pricing (primary)
- Child/Senior discounts
- Group rates
- Seasonal variations
- Add-on options (hotel pickup, extras)

### Duration & Logistics
- Tour duration (typically 6-8 hours)
- Pickup locations
- Operating days/schedule
- Capacity limits

## Integration Implementation

### Phase 1: API Enhancement
1. **Enhance Category Types** (`lib/types/rezdy.ts`)
   - Add comprehensive category interface
   - Include visibility flags and metadata
   - Support hierarchical relationships

2. **Update Category Constants** (`lib/constants/categories.ts`)
   - Integrate Rezdy category IDs
   - Maintain backward compatibility
   - Add mapping functions

### Phase 2: API Routes
1. **Replace Mock Categories** (`app/api/categories/route.ts`)
   - Fetch real Rezdy categories
   - Apply visibility filtering
   - Cache category data

2. **Unified Category Endpoint** (`app/api/categories/unified/route.ts`)
   - Combine website and Rezdy categories
   - Provide mapping relationships
   - Support filtering options

### Phase 3: Frontend Integration
1. **Category Components**
   - Update dropdowns with real data
   - Add dynamic product counts
   - Implement hierarchical filtering

2. **Search Enhancement**
   - Multi-level category filtering
   - Location + category combinations
   - Price range integration

## Caching Strategy

### Category Data Caching
- **TTL**: 30 minutes (static category structure)
- **Keys**: `categories:visible`, `categories:all`
- **Invalidation**: Manual refresh for category changes

### Product-Category Relationship
- **TTL**: 30 minutes (dynamic product availability)
- **Keys**: `category:{id}:products:{limit}:{offset}`
- **Shared Cache**: Cross-category product lookup

### Performance Optimization
- **Request Deduplication**: Prevent simultaneous API calls
- **Preload Strategy**: Warm popular categories
- **Lazy Loading**: Load category products on demand

## SEO and Metadata Integration

### Rezdy SEO Tags
- Utilize category `seoTags` for enhanced filtering
- Map to website metadata structure
- Improve search engine visibility

### Dynamic Meta Content
- Generate category descriptions from Rezdy data
- Update product counts in real-time
- Maintain SEO-friendly URLs

## Error Handling and Fallbacks

### API Failure Scenarios
1. **Rezdy API Down**: Fall back to cached data
2. **Category Not Found**: Display friendly error message
3. **Product Load Failure**: Show category without products
4. **Rate Limiting**: Implement exponential backoff

### Data Validation
- Validate category structure on fetch
- Sanitize product data
- Handle missing images/descriptions

## Migration Timeline

### Week 1: Foundation
- Create types and constants
- Set up unified category service
- Implement basic caching

### Week 2: API Integration
- Replace mock data
- Create unified endpoints
- Add error handling

### Week 3: Frontend Updates
- Update category components
- Enhance search functionality
- Test user experience

### Week 4: Optimization
- Performance tuning
- SEO optimization
- Monitor and refine

## Testing Strategy

### Unit Tests
- Category mapping functions
- API response parsing
- Cache management

### Integration Tests
- End-to-end category flow
- Product filtering accuracy
- Performance benchmarks

### User Testing
- Category navigation UX
- Search functionality
- Mobile responsiveness

## Benefits of Integration

### For Users
- **Real-time Availability**: See only available tours
- **Accurate Pricing**: Current pricing information
- **Better Filtering**: More granular search options
- **Dynamic Content**: Up-to-date product information

### For Business
- **Inventory Sync**: Automatic product management
- **Reduced Maintenance**: Fewer manual updates
- **Better Analytics**: Track category performance
- **Scalability**: Easy addition of new categories

### For Developers
- **Single Source of Truth**: Unified category system
- **API Consistency**: Standardized data structure
- **Cache Efficiency**: Optimized data loading
- **Maintainability**: Cleaner codebase

## Monitoring and Analytics

### Key Metrics
- Category page load times
- API response times
- Cache hit rates
- User engagement per category

### Alerts
- Rezdy API failures
- Cache invalidation events
- Performance degradation
- High error rates

---

*This integration plan ensures a seamless transition to a dynamic, real-time category system while maintaining the user experience and SEO benefits of the current implementation.*