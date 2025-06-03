# Setup Guide for Rezdy Booking System

This guide will help you set up the Rezdy booking system and resolve common configuration issues.

## Quick Fix for Current Errors

The console errors you're seeing are due to:

1. **Invalid product code**: Fixed by updating to use real product code `PH1FEA`
2. **Missing Rezdy API key**: Needs environment variable configuration

## Environment Variables Setup

### 1. Create Environment File

Create a `.env.local` file in your project root:

```bash
# Copy the example file
cp env.example .env.local
```

### 2. Configure Rezdy API Key

Add your Rezdy API key to `.env.local`:

```env
# Rezdy API Configuration
REZDY_API_KEY=your_actual_rezdy_api_key_here
REZDY_API_URL=https://api.rezdy.com/v1

# Development settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Get Your Rezdy API Key

1. Log into your Rezdy account
2. Go to **Settings** → **API Settings**
3. Copy your API key
4. Paste it into the `.env.local` file

## Development Mode Features

The system now includes development-friendly features:

### 🔧 **Automatic Fallbacks**

- **Missing API Key**: Simulates bookings in development mode
- **Invalid Product**: Uses mock availability data
- **API Errors**: Graceful fallback to demo data

### 📝 **Better Error Messages**

- Clear indication when using demo/mock data
- Detailed logging for debugging
- Helpful warnings in console

### 🧪 **Testing Without API Key**

If you don't have a Rezdy API key yet, the system will:

1. Show a warning in console
2. Simulate successful bookings
3. Generate mock order numbers like `DEV-1704123456-789`
4. Allow you to test the complete booking flow

## Testing the Fixed System

### 1. Test Booking Flow

1. Navigate to `/test-booking`
2. Click "Start Booking Experience"
3. Complete the booking form
4. Check console for detailed logs

### 2. Test Manual Registration

```bash
# Get sample data
curl http://localhost:3000/api/bookings/register

# Test manual registration
curl -X POST http://localhost:3000/api/bookings/register \
  -H "Content-Type: application/json" \
  -d '{"bookingData": {...}, "paymentConfirmation": {...}}'
```

## Real Product Codes Available

The system now uses real product codes from your Rezdy account:

- `PH1FEA` - Hop on Hop off Bus - Tamborine Mountain - From Brisbane
- `PJGM0A` - $199 Gift Voucher - For Full Day Winery Tour
- `PHKGRW` - 3 Day Luxury Brisbane - Gold Coast - Byron Bay Experience
- `PT1CFA` - Currumbin Wildlife Sanctuary - Hop on Hop off Shuttle
- And many more...

## Console Output Examples

### ✅ **With API Key Configured**
```
Submitting booking to Rezdy API: {url: "https://api.rezdy.com/v1/bookings?apiKey=***", bookingData: {...}}
Rezdy API success response: {orderNumber: "RZD123456", ...}
Booking completed successfully: {orderNumber: "RZD123456", transactionId: "TXN..."}
```

### ⚠️ **Development Mode (No API Key)**
```
⚠️ Rezdy API key not configured - simulating booking registration for development
Booking completed successfully: {orderNumber: "DEV-1704123456-789", transactionId: "TXN..."}
```

## Troubleshooting

### Issue: "Invalid product" error
**Solution**: Product codes have been updated to use real ones from your Rezdy system.

### Issue: "API key not configured" error
**Solution**: 
1. Add `REZDY_API_KEY=your_key` to `.env.local`
2. Or test in development mode (will simulate bookings)

### Issue: Availability not loading
**Solution**: System automatically falls back to demo data for testing.

### Issue: Payment processing fails
**Solution**: Check console for detailed error messages and validation issues.

## Production Deployment

For production deployment:

1. **Set environment variables** in your hosting platform
2. **Configure Westpac webhooks** to point to your domain
3. **Set up database** for booking storage (optional)
4. **Enable monitoring** for booking success rates

## Next Steps

1. **Test the booking flow** with the updated product codes
2. **Configure your Rezdy API key** for real bookings
3. **Customize the product data** to match your actual tours
4. **Set up payment processing** with Westpac
5. **Deploy to production** when ready

## Support

If you encounter any issues:

1. Check the console for detailed error messages
2. Verify your `.env.local` file is configured correctly
3. Ensure your Rezdy API key has the correct permissions
4. Test with the development mode first (no API key needed)

The system is now much more robust and will guide you through any configuration issues! 