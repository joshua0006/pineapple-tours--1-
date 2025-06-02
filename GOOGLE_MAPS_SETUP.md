# Google Maps Setup Guide

This guide will help you set up Google Maps integration for the Pineapple Tours application.

## Prerequisites

1. A Google Cloud Platform account
2. A project in Google Cloud Console
3. Billing enabled on your Google Cloud project

## Step 1: Enable Google Maps APIs

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to "APIs & Services" > "Library"
4. Enable the following APIs:
   - **Maps JavaScript API** (required for map display)
   - **Geocoding API** (required for address-to-coordinate conversion)
   - **Places API** (optional, for enhanced location search)

## Step 2: Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Recommended) Click on the API key to configure restrictions:
   - **Application restrictions**: Set to "HTTP referrers" and add your domain(s)
   - **API restrictions**: Restrict to the APIs you enabled above

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root (if it doesn't exist) and add:

```bash
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here

# Rezdy API Key (if not already configured)
REZDY_API_KEY=your_rezdy_api_key_here
```

**Important Notes:**
- Replace `your_actual_api_key_here` with your actual Google Maps API key
- The `NEXT_PUBLIC_` prefix is required for client-side access in Next.js
- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`

## Step 4: Test the Integration

1. Restart your development server: `npm run dev`
2. Navigate to any tour detail page
3. Click on the "Location & Map" tab
4. You should see:
   - An interactive Google Map (if coordinates are available)
   - Location markers for the main location and pickup points
   - Clickable info windows with directions links

## Features

### What Works Now

✅ **Interactive Maps**: Full Google Maps integration with zoom, pan, and satellite view
✅ **Smart Geocoding**: Automatically converts string addresses to coordinates
✅ **Multiple Markers**: Shows main location (yellow) and pickup points (blue)
✅ **Info Windows**: Click markers for details and directions
✅ **Fallback Display**: Shows location information even without API key
✅ **Error Handling**: Graceful handling of API failures
✅ **Responsive Design**: Works on desktop and mobile devices
✅ **Singleton Loading**: Prevents multiple API script loading (fixed duplicate loading issue)

### Data Sources

The component automatically handles different types of location data from Rezdy:

1. **Coordinates Available**: Direct display on map
2. **String Addresses**: Geocoded to coordinates automatically
3. **Structured Addresses**: Formatted and geocoded if coordinates missing
4. **Pickup Locations**: Multiple pickup points with individual markers

### Fallback Behavior

When Google Maps is not available:
- Shows location information in text format
- Provides links to Google Maps search
- Displays pickup location details
- Maintains full functionality without interactive map

## Troubleshooting

### Common Issues

**Map not loading:**
- Check that your API key is correctly set in `.env.local`
- Verify the API key has the correct permissions
- Check browser console for error messages

**"Multiple API loads" error (FIXED):**
- This has been resolved with singleton pattern implementation
- The component now ensures Google Maps API is loaded only once
- Multiple component instances share the same API instance

**Geocoding not working:**
- Ensure Geocoding API is enabled in Google Cloud Console
- Check API key restrictions
- Verify billing is enabled on your Google Cloud project

**Markers not appearing:**
- Check that location data includes coordinates or valid addresses
- Look for geocoding errors in browser console
- Verify pickup locations have proper address data

### Debug Information

The component logs helpful information to the browser console:
- Geocoding attempts and results
- Map initialization status
- Location data processing
- API loading status

### API Quotas and Billing

- Google Maps APIs have usage quotas and may incur charges
- Monitor usage in Google Cloud Console
- Set up billing alerts to avoid unexpected charges
- Consider implementing usage limits for production

## Technical Implementation

### Singleton Pattern
The component uses a singleton pattern to ensure Google Maps API is loaded only once:
- Global state tracking prevents duplicate script loading
- Existing script detection in DOM
- Promise-based loading with shared instances
- Proper cleanup and error handling

### Performance Optimizations
- Script loading is deferred and asynchronous
- Map initialization only occurs when needed
- Geocoding is batched and cached
- Responsive loading states

## Security Best Practices

1. **Restrict API Keys**: Always restrict your API keys to specific domains
2. **Monitor Usage**: Set up alerts for unusual API usage
3. **Environment Variables**: Never expose API keys in client-side code
4. **Regular Rotation**: Consider rotating API keys periodically

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Google Cloud Console configuration
3. Test with a simple address first
4. Clear browser cache and reload
5. Contact support if problems persist

## Cost Optimization

To minimize Google Maps API costs:
- Enable only the APIs you need
- Set up usage quotas
- Cache geocoding results when possible
- Use map styling to reduce tile requests
- Consider implementing lazy loading for maps

## Recent Fixes

### v1.1 - Multiple API Loading Fix
- ✅ Fixed "Google Maps JavaScript API multiple times" error
- ✅ Implemented singleton pattern for script loading
- ✅ Added DOM script detection
- ✅ Improved error handling and recovery
- ✅ Better loading state management 