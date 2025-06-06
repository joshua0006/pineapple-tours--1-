# Search Functionality Documentation

This document outlines the comprehensive search functionality implemented for the Pineapple Tours Next.js application.

## Overview

The search functionality enables users to search for tours and vacations using keywords, filters, categories, and date ranges. It provides a seamless user experience with real-time search results, advanced filtering options, calendar-based date selection, and intuitive navigation.

## Features

### 🔍 Core Search Features
- **Keyword Search**: Search by tour names, descriptions, tours, and activities
- **Category Filtering**: Filter by tour types (Family, Honeymoon, Adventure, Cultural, Nature, Luxury)
- **Price Range Filtering**: Filter by budget ranges (Under $500, $500-$1,000, etc.)
- **Duration Filtering**: Filter by trip duration (1-3 days, 4-7 days, etc.)
- **Date Range Filtering**: Select check-in and check-out dates with calendar interface
- **Sorting Options**: Sort by relevance, name, price (low to high, high to low), newest
- **Real-time Results**: Debounced search with instant feedback
- **URL State Management**: Search parameters are reflected in the URL for bookmarking and sharing

### 🎯 Advanced Features
- **Multi-term Search**: Supports searching with multiple keywords
- **Fuzzy Matching**: Intelligent search across multiple product fields
- **Calendar Date Picker**: Interactive calendar for date selection with validation
- **Date Range Validation**: Prevents invalid date selections (past dates, check-out before check-in)
- **Empty State Handling**: Graceful handling of no results with helpful suggestions
- **Error Handling**: Robust error handling with retry mechanisms
- **Loading States**: Skeleton loading for better UX
- **Filter Management**: Easy filter clearing and management

## Implementation Structure

### API Endpoints

#### `/api/search` (GET)
Main search endpoint that handles all search queries and filtering.

**Query Parameters:**
- `query` (string): Search keywords
- `category` (string): Tour category filter
- `priceRange` (string): Price range filter
- `duration` (string): Duration filter
- `participants` (string): Number of participants
- `sortBy` (string): Sort order
- `checkIn` (string): Check-in date (YYYY-MM-DD format)
- `checkOut` (string): Check-out date (YYYY-MM-DD format)
- `limit` (number): Results limit
- `offset` (number): Pagination offset

**Response:**
```json
{
  "products": [/* RezdyProduct[] */],
  "totalCount": 25,
  "filters": {/* applied filters */},
  "metadata": {
    "hasResults": true,
    "searchQuery": "sydney",
    "appliedFilters": {
      "category": "adventure",
      "priceRange": "500-1000",
      "duration": null
    }
  }
}
```

### React Hooks

#### `useSearch`
Custom hook for managing search state and operations.

```typescript
const {
  data,           // Search results
  loading,        // Loading state
  error,          // Error state
  filters,        // Current filters (including checkIn/checkOut)
  updateFilter,   // Update single filter
  updateFilters,  // Update multiple filters
  search,         // Trigger search
  clearFilter,    // Clear specific filter
  clearSearch,    // Clear all filters
  hasActiveFilters, // Boolean for active filters
  hasResults,     // Boolean for results
  totalResults,   // Total result count
} = useSearch(initialFilters)
```

### Components

#### `DatePicker`
New calendar-based date picker component for selecting dates.

**Props:**
- `date?: Date` - Currently selected date
- `onDateChange?: (date: Date | undefined) => void` - Date change handler
- `placeholder?: string` - Input placeholder text
- `disabled?: boolean` - Whether the picker is disabled
- `className?: string` - Additional CSS classes
- `id?: string` - HTML id attribute
- `minDate?: Date` - Minimum selectable date
- `maxDate?: Date` - Maximum selectable date

**Features:**
- Interactive calendar popup
- Date validation (min/max dates)
- Keyboard navigation support
- Accessible design with proper ARIA labels
- Automatic popup closing on selection

#### `SearchForm`
Main search form component used in the hero section.

**Props:**
- `onSearch?: (searchData: any) => void` - Custom search handler
- `showRedirect?: boolean` - Whether to redirect to search page

**Features:**
- Dual search modes: Location search and Tour type search
- Calendar-based date selection for check-in/check-out
- Date validation (check-in must be today or later, check-out must be after check-in)
- Form validation and submission
- Controlled inputs with state management

**Date Handling:**
- Check-in date: Minimum date is today, maximum is one day before check-out
- Check-out date: Minimum date is one day after check-in, maximum is 365 days from today
- Automatic date formatting to YYYY-MM-DD for API compatibility

#### `SearchResults`
Reusable component for displaying search results.

**Props:**
- `products: RezdyProduct[]` - Products to display
- `loading: boolean` - Loading state
- `error: string | null` - Error message
- `totalResults: number` - Total result count
- `hasResults: boolean` - Whether there are results
- `onRetry?: () => void` - Retry function
- `onClearSearch?: () => void` - Clear search function
- `onBrowseAll?: () => void` - Browse all function

#### `QuickSearch`
Compact search component for headers and navigation.

**Props:**
- `placeholder?: string` - Input placeholder
- `className?: string` - Additional CSS classes
- `onSearch?: (query: string) => void` - Custom search handler
- `showButton?: boolean` - Whether to show search button

#### `SearchSuggestions`
Component showing popular searches and categories.

**Props:**
- `onSuggestionClick?: (suggestion: string, type: 'query' | 'category') => void`
- `className?: string`

### Pages

#### `/search`
Dedicated search results page with full filtering capabilities.

**Features:**
- URL parameter initialization (including date parameters)
- Advanced filtering interface with date pickers
- Real-time search updates
- Active filter display with removal options (including date badges)
- Responsive design
- Back navigation

#### `/tours`
Enhanced tours listing page with integrated search.

**Features:**
- Search integration with existing tour display
- Filter synchronization (including date filters)
- Category-based browsing
- Sort functionality

## Search Algorithm

### Filtering Logic

1. **Keyword Search**:
   - Searches across: product name, short description, description, location address
   - Splits query into terms and requires all terms to match
   - Case-insensitive matching

2. **Category Filtering**:
   - Maps categories to keyword patterns:
     - Family: "family", "kids", "children"
     - Honeymoon: "romantic", "honeymoon", "couples"
     - Adventure: "adventure", "hiking", "diving", "expedition"
     - Cultural: "cultural", "culture", "heritage", "traditional"
     - Nature: "nature", "wildlife", "national park", "scenic"
     - Luxury: "luxury", "premium", "exclusive"

3. **Price Filtering**:
   - Under $500: price < 500
   - $500-$1,000: 500 ≤ price < 1000
   - $1,000-$2,000: 1000 ≤ price < 2000
   - Over $2,000: price ≥ 2000

4. **Duration Filtering**:
   - Basic keyword matching in product descriptions
   - 1-3 Days: "day", "half day", "3 day"
   - 4-7 Days: "week", "7 day", "4 day", "5 day", "6 day"
   - 8-14 Days: "10 day", "14 day", "two week"
   - 15+ Days: "month", "extended", "long"

5. **Date Filtering**:
   - Basic date range validation
   - Ensures check-in date is not in the past
   - Ensures check-out date is after check-in date
   - **Note**: For production use, this should be enhanced to check actual tour availability via the Rezdy availability API

### Sorting Options

- **Relevance**: Prioritizes exact name matches, then description matches
- **Name A-Z**: Alphabetical sorting
- **Price Low to High**: Ascending price order
- **Price High to Low**: Descending price order
- **Newest**: Based on product code (basic implementation)

## Usage Examples

### Basic Search with Dates
```typescript
// Initialize search with filters including dates
const search = useSearch({
  query: 'sydney',
  category: 'adventure',
  checkIn: '2024-06-15',
  checkOut: '2024-06-20'
})

// Trigger search
search.search()

// Update date filters
search.updateFilter('checkIn', '2024-07-01')
search.updateFilter('checkOut', '2024-07-05')
```

### Search Form with Date Handling
```tsx
<SearchForm 
  onSearch={(data) => {
    // Handle search data with dates
    console.log(data.checkIn, data.checkOut)
  }}
  showRedirect={false}
/>
```

### Date Picker Usage
```tsx
<DatePicker
  date={selectedDate}
  onDateChange={setSelectedDate}
  placeholder="Select check-in date"
  minDate={new Date()}
  maxDate={addDays(new Date(), 365)}
/>
```

## Error Handling

### API Errors
- Network failures are caught and displayed with retry options
- Invalid API responses are handled gracefully
- Fallback to empty results with appropriate messaging

### Date Validation
- Past dates are prevented for check-in
- Check-out dates before check-in are prevented
- Invalid date ranges are handled gracefully
- Clear error messaging for date-related issues

### User Input Validation
- Empty search queries are handled appropriately
- Invalid filter combinations are prevented
- URL parameter validation and sanitization
- Date format validation (YYYY-MM-DD)

### Edge Cases
- No results found: Shows helpful suggestions and clear filter options
- Server errors: Displays error state with retry functionality
- Loading states: Shows skeleton placeholders during data fetching
- Invalid date selections: Prevents submission and shows validation

## Performance Considerations

### Debouncing
- Search requests are debounced by 300ms to prevent excessive API calls
- Filter changes trigger debounced searches automatically
- Date changes are included in the debounced search

### Caching
- API responses are cached for 60 seconds with stale-while-revalidate
- Search results are cached in the hook state
- Date picker state is managed efficiently

### Optimization
- Lazy loading of search results
- Efficient re-rendering with React.memo where appropriate
- Minimal re-renders through careful state management
- Calendar component is only rendered when needed

## Accessibility

### Keyboard Navigation
- Full keyboard support for all search interfaces
- Enter key triggers search in all input fields
- Tab navigation through filters and results
- Calendar navigation with arrow keys

### Screen Reader Support
- Proper ARIA labels for search inputs and filters
- Descriptive text for search results and states
- Semantic HTML structure
- Date picker accessibility with proper announcements

### Visual Indicators
- Clear loading states with skeleton placeholders
- Error states with descriptive messages
- Active filter indicators with removal options
- Date validation feedback

## Date Picker Implementation Details

### Calendar Integration
- Uses `react-day-picker` for calendar functionality
- Integrates with Radix UI Popover for popup behavior
- Styled with Tailwind CSS for consistency

### Date Formatting
- Uses `date-fns` for date manipulation and formatting
- API expects YYYY-MM-DD format
- Display format uses localized date strings (PPP format)

### Validation Rules
- Check-in date: Must be today or later
- Check-out date: Must be after check-in date
- Maximum booking window: 365 days from today
- Automatic adjustment when dates conflict

### State Management
- Date state managed as Date objects in components
- Converted to string format for API calls
- URL parameters use YYYY-MM-DD format
- Proper handling of undefined/null dates

## Future Enhancements

### Planned Features
1. **Real Availability Integration**: Connect with Rezdy availability API for real-time availability checking
2. **Multi-date Selection**: Support for multiple date ranges or flexible dates
3. **Date Presets**: Quick selection for "This Weekend", "Next Week", etc.
4. **Search History**: Store and display recent searches including date ranges
5. **Auto-complete**: Suggest search terms as user types
6. **Saved Searches**: Allow users to save and manage search queries with dates
7. **Advanced Filters**: Add more granular filtering options
8. **Search Analytics**: Track popular searches and optimize results
9. **Geolocation**: Location-based search suggestions
10. **Voice Search**: Voice input for search queries

### Technical Improvements
1. **Availability API Integration**: Real-time availability checking for selected dates
2. **Search Indexing**: Implement full-text search with better relevance scoring
3. **Faceted Search**: Add faceted navigation for better filtering
4. **Search Suggestions API**: Backend API for search suggestions
5. **Performance Monitoring**: Track search performance and optimize
6. **A/B Testing**: Test different search interfaces and algorithms
7. **Date Range Optimization**: Optimize date filtering for large datasets
8. **Calendar Localization**: Support for different date formats and locales

## Testing

### Unit Tests
- Test search hook functionality including date handling
- Test component rendering with different states
- Test filter logic and edge cases
- Test date validation logic

### Integration Tests
- Test search API endpoints with date parameters
- Test search flow from form to results
- Test URL parameter handling including dates
- Test date picker integration

### E2E Tests
- Test complete search user journeys with date selection
- Test search across different devices and browsers
- Test accessibility compliance including date picker
- Test date validation scenarios

## Deployment Notes

### Environment Variables
Ensure the following environment variables are set:
- `REZDY_API_KEY`: Required for accessing tour data

### Performance Monitoring
Monitor the following metrics:
- Search API response times
- Search success/failure rates
- User search patterns and popular queries
- Date filter usage patterns

### SEO Considerations
- Search result pages are server-side rendered for SEO
- URL parameters are SEO-friendly including date parameters
- Meta tags are dynamically generated based on search queries
- Date ranges in URLs are human-readable

## Support and Maintenance

### Common Issues
1. **Slow Search Results**: Check API response times and caching
2. **No Results Found**: Verify API connectivity and data availability
3. **Filter Not Working**: Check filter logic and API parameter mapping
4. **Date Picker Issues**: Verify date-fns and calendar component versions
5. **Date Validation Problems**: Check date formatting and validation logic

### Monitoring
- Set up alerts for search API failures
- Monitor search performance metrics
- Track user search behavior for optimization
- Monitor date filter usage and patterns

### Updates
- Regular updates to search algorithms based on user feedback
- Periodic review of popular search terms for optimization
- Continuous improvement of search relevance and performance
- Keep date picker dependencies updated for security and features 