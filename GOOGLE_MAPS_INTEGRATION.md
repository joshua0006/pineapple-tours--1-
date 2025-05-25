# Google Maps Integration

This document describes the Google Maps integration added to the Pineapple Tours application.

## Overview

The Google Maps integration provides an interactive map display for tour locations, including:
- Main tour location with coordinates
- Pickup locations (if available)
- Interactive markers with info windows
- Direct links to Google Maps for directions
- Responsive design that works on all devices

## Features

### Map Display
- **Interactive Map**: Full Google Maps integration with zoom, pan, and satellite view
- **Custom Markers**: Distinctive markers for main locations (yellow) and pickup points (blue)
- **Info Windows**: Click markers to see location details and get directions
- **Auto-fitting**: Map automatically adjusts to show all relevant locations

### Location Information
- **Main Location**: Primary tour location with detailed address information
- **Pickup Locations**: Multiple pickup points with individual addresses and times
- **Directions**: Direct links to Google Maps for turn-by-turn navigation
- **Fallback Display**: Graceful handling when coordinates are not available

## Setup Instructions

### 1. Google Maps API Key

To enable the Google Maps functionality, you need to:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (optional, for enhanced location search)
4. Create credentials (API Key)
5. Add the API key to your environment variables

### 2. Environment Configuration

Add the following to your `.env.local` file:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Important**: The `NEXT_PUBLIC_` prefix is required for client-side access in Next.js.

### 3. API Key Security

For production deployments, make sure to:
- Restrict your API key to specific domains
- Set up billing alerts
- Monitor API usage
- Consider implementing usage quotas

## Component Usage

The Google Maps component is integrated into the tour detail page as a new tab called "Location & Map".

### Component Props

```typescript
interface GoogleMapsProps {
  address?: string | RezdyAddress     // Main location address
  pickupLocations?: RezdyPickupLocation[]  // Array of pickup locations
  tourName?: string                   // Tour name for marker titles
  className?: string                  // Additional CSS classes
}
```

### Data Requirements

The component works with Rezdy API data structure:

```typescript
interface RezdyAddress {
  addressLine?: string
  postCode?: string
  city?: string
  state?: string
  countryCode?: string
  latitude?: number    // Required for map display
  longitude?: number   // Required for map display
}

interface RezdyPickupLocation {
  id: string
  name: string
  pickupTime?: string
  address?: string | RezdyAddress
  latitude?: number    // Required for map display
  longitude?: number   // Required for map display
}
```

## Error Handling

The component includes comprehensive error handling:

1. **Missing API Key**: Shows a configuration message
2. **Loading Errors**: Displays error state with retry option
3. **No Coordinates**: Falls back to address-only display
4. **Network Issues**: Graceful degradation with loading states

## Fallback Behavior

When Google Maps cannot be loaded or coordinates are unavailable:
- Shows a clean card layout with location information
- Displays text-based address information
- Provides alternative ways to access location data
- Maintains consistent UI/UX

## Browser Compatibility

The Google Maps integration is compatible with:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Maps are loaded on-demand when the tab is accessed
- API calls are cached to prevent unnecessary requests
- Responsive images and optimized marker icons
- Lazy loading of map tiles

## Customization

The component supports customization through:
- CSS classes for styling
- Custom marker icons (SVG-based)
- Map styling options
- Info window content formatting

## Troubleshooting

### Common Issues

1. **Map not loading**: Check API key configuration
2. **Markers not appearing**: Verify latitude/longitude data
3. **Styling issues**: Check CSS conflicts with map container
4. **Mobile responsiveness**: Ensure proper viewport settings

### Debug Mode

To enable debug logging, check the browser console for:
- API loading status
- Coordinate validation
- Map initialization events
- Error messages

## Future Enhancements

Potential improvements for the maps integration:
- Street View integration
- Route planning between pickup locations
- Real-time traffic information
- Satellite imagery toggle
- Custom map themes
- Geolocation for user position
- Distance calculations
- Nearby attractions overlay 