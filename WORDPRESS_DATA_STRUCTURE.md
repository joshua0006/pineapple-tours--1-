# WordPress Data Structure & API Integration

## Overview

This document outlines the WordPress REST API integration for the Pineapple Tours application, including data categorization, structure, and usage patterns.

## Base Configuration

- **WordPress Site**: https://pineappletours.com.au
- **API Base URL**: https://pineappletours.com.au/wp-json/wp/v2/
- **Authentication**: Public endpoints (no authentication required for published content)

## Data Categories

The WordPress data is organized into four main categories:

### 1. Pages (`/pages`)

Static content pages like "About Us", "Contact", etc.

**Key Fields:**

- `id`: Unique page identifier
- `slug`: URL-friendly page identifier
- `title.rendered`: Page title (HTML rendered)
- `content.rendered`: Full page content (HTML)
- `excerpt.rendered`: Page summary
- `featured_media`: Featured image ID
- `modified`: Last modification timestamp
- `status`: Publication status (publish, draft, etc.)
- `link`: Full URL to the page

**Usage:**

```typescript
const pages = await WordPressAPIService.fetchPages();
const aboutPage = await WordPressAPIService.fetchPageBySlug("about-us");
```

### 2. Posts (`/posts`)

Blog posts and articles with taxonomy support.

**Key Fields:**

- `id`: Unique post identifier
- `slug`: URL-friendly post identifier
- `title.rendered`: Post title
- `content.rendered`: Full post content
- `excerpt.rendered`: Post excerpt
- `featured_media`: Featured image ID
- `date`: Publication date
- `modified`: Last modification timestamp
- `categories`: Array of category IDs
- `tags`: Array of tag IDs
- `author`: Author user ID
- `status`: Publication status

**Associated Data:**

- **Categories**: Hierarchical taxonomy for organizing posts
- **Tags**: Non-hierarchical taxonomy for tagging posts

**Usage:**

```typescript
const posts = await WordPressAPIService.fetchPosts();
const categoryPosts = await WordPressAPIService.fetchPostsByCategory(1);
const specificPost = await WordPressAPIService.fetchPostBySlug(
  "tour-guide-tips"
);
```

### 3. Media (`/media`)

Images, videos, and file attachments.

**Key Fields:**

- `id`: Unique media identifier
- `source_url`: Direct URL to the media file
- `alt_text`: Alternative text for images
- `title.rendered`: Media title
- `caption.rendered`: Media caption
- `media_type`: Type (image, video, file)
- `mime_type`: MIME type (image/jpeg, video/mp4, etc.)
- `media_details`: Detailed metadata including dimensions and sizes

**Usage:**

```typescript
const media = await WordPressAPIService.fetchAllMedia();
const featuredImage = await WordPressAPIService.fetchMediaById(123);
const imageUrl = await WordPressAPIService.getFeaturedImageUrl(123);
```

### 4. Users (`/users`)

Authors and contributors.

**Key Fields:**

- `id`: Unique user identifier
- `name`: Display name
- `slug`: URL-friendly username
- `description`: User bio/description
- `avatar_urls`: Avatar images in different sizes

**Usage:**

```typescript
const users = await WordPressAPIService.fetchUsers();
```

## Categorized Data Structure

The API service returns data in a structured format:

```typescript
interface CategorizedWordPressData {
  pages: {
    data: WordPressPage[];
    count: number;
    lastUpdated: string;
  };
  posts: {
    data: WordPressPost[];
    count: number;
    lastUpdated: string;
    categories: WordPressCategory[];
    tags: WordPressTag[];
  };
  media: {
    data: WordPressMedia[];
    count: number;
    lastUpdated: string;
  };
  users: {
    data: WordPressUser[];
    count: number;
    lastUpdated: string;
  };
  metadata: {
    fetchedAt: string;
    apiVersion: string;
    baseUrl: string;
    totalItems: number;
  };
}
```

## API Service Implementation

### Core Service: `WordPressAPIService`

Located in: `lib/services/wordpress-api.ts`

**Key Methods:**

1. **Data Fetching:**

   - `fetchPages(perPage?: number)`: Get all pages
   - `fetchPosts(perPage?: number)`: Get all posts
   - `fetchAllMedia(perPage?: number)`: Get all media
   - `fetchUsers()`: Get all users
   - `fetchCategories()`: Get post categories
   - `fetchTags()`: Get post tags

2. **Specific Item Fetching:**

   - `fetchPageBySlug(slug: string)`: Get page by slug
   - `fetchPostBySlug(slug: string)`: Get post by slug
   - `fetchPostsByCategory(categoryId: number)`: Get posts by category
   - `fetchMediaById(id: number)`: Get specific media item

3. **Helper Methods:**
   - `getFeaturedImageUrl(mediaId: number)`: Get featured image URL
   - `enrichWithFeaturedImages(items)`: Add featured image URLs to items
   - `fetchAllCategorizedData()`: Get complete categorized data structure

### API Route Implementation

Located in: `app/api/wordpress/route.ts`

Provides a server-side endpoint to fetch and return categorized WordPress data:

```typescript
GET / api / wordpress;
```

**Response Format:**

```json
{
  "success": true,
  "data": CategorizedWordPressData,
  "message": "WordPress data fetched successfully"
}
```

## Dashboard Implementation

### Page Location: `/wordpress-data`

Located in: `app/wordpress-data/page.tsx`

**Features:**

- Real-time data fetching from WordPress API
- Categorized data display with tabs
- Metadata overview with statistics
- JSON download functionality
- Error handling and retry mechanisms
- Responsive design with shadcn/ui components

**Dashboard Sections:**

1. **Metadata Overview**: API information, fetch timestamp, total items
2. **Statistics Cards**: Count summaries for each data category
3. **Raw JSON Display**: Complete data structure preview
4. **Action Buttons**: Refresh data, download JSON file

## Data Categorization Strategy

### Why This Structure?

1. **Clear Separation**: Each content type has distinct characteristics and use cases
2. **Hierarchical Organization**: Posts include their taxonomy (categories/tags)
3. **Metadata Enrichment**: Additional context like counts and timestamps
4. **Performance Optimization**: Parallel fetching of all data types
5. **Extensibility**: Easy to add new data types or modify existing ones

### Content Mapping Strategy

**For React Application Integration:**

1. **Pages** → Static routes and content management
2. **Posts** → Blog/article system with filtering
3. **Media** → Asset management and optimization
4. **Users** → Author profiles and attribution

### Featured Image Handling

The service includes special handling for featured images:

```typescript
// Get featured image URL for a post/page
const imageUrl = await WordPressAPIService.getFeaturedImageUrl(
  item.featured_media
);

// Enrich multiple items with featured images
const enrichedPosts = await WordPressAPIService.enrichWithFeaturedImages(posts);
```

## Usage Examples

### Basic Data Fetching

```typescript
// Get all categorized data
const wordpressData = await WordPressAPIService.fetchAllCategorizedData();

// Access specific categories
const pages = wordpressData.pages.data;
const posts = wordpressData.posts.data;
const media = wordpressData.media.data;
```

### Content Integration

```typescript
// Get specific page content
const aboutPage = await WordPressAPIService.fetchPageBySlug("about-us");
const content = aboutPage[0]?.content.rendered;

// Get blog posts with categories
const posts = await WordPressAPIService.fetchPosts();
const categories = await WordPressAPIService.fetchCategories();

// Map category names to posts
const postsWithCategories = posts.map((post) => ({
  ...post,
  categoryNames: post.categories
    .map((catId) => categories.find((cat) => cat.id === catId)?.name)
    .filter(Boolean),
}));
```

### Image Handling

```typescript
// Get featured image for a post
const post = await WordPressAPIService.fetchPostBySlug("tour-guide");
const featuredImageUrl = await WordPressAPIService.getFeaturedImageUrl(
  post[0].featured_media
);

// Get all media with filtering
const allMedia = await WordPressAPIService.fetchAllMedia();
const images = allMedia.filter((media) => media.media_type === "image");
```

## Error Handling

The service implements comprehensive error handling:

1. **HTTP Errors**: Proper status code checking
2. **Network Errors**: Timeout and connection handling
3. **Data Validation**: Type checking and structure validation
4. **Graceful Degradation**: Fallback mechanisms for missing data

## Performance Considerations

1. **Parallel Fetching**: All data types fetched simultaneously
2. **Pagination Support**: Configurable page sizes for large datasets
3. **Caching Strategy**: Consider implementing Redis/memory caching
4. **Image Optimization**: Multiple image sizes available from WordPress

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live content updates
2. **Advanced Filtering**: More sophisticated search and filter options
3. **Content Caching**: Implement intelligent caching strategies
4. **Content Synchronization**: Automated sync between WordPress and React app
5. **Rich Content Support**: Better handling of embedded content and shortcodes

## Security Considerations

1. **Public API**: Only public content is accessible
2. **Rate Limiting**: Consider implementing API rate limiting
3. **Data Sanitization**: Sanitize HTML content before rendering
4. **CORS Configuration**: Proper cross-origin request handling

## Testing

Consider implementing tests for:

1. **API Service Methods**: Unit tests for all service methods
2. **Data Structure Validation**: Ensure proper TypeScript interfaces
3. **Error Handling**: Test error scenarios and fallbacks
4. **Integration Tests**: End-to-end testing of the dashboard

---

This WordPress integration provides a solid foundation for content management while maintaining the flexibility and performance of a modern React application.
