# 🔍 Booking Debug System Setup Guide

This enhanced debugging system will help you track down issues with Rezdy booking submissions by providing comprehensive logging, error tracking, and flow visualization.

## 🚀 Quick Setup

### 1. Add Debug Provider to Your App

Add the debug provider to your root layout or main app component:

```tsx
// In your layout.tsx or _app.tsx
import { DebugProvider, DebugModeIndicator } from '@/components/debug/debug-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DebugProvider enableInProduction={false}>
          {children}
          <DebugModeIndicator />
        </DebugProvider>
      </body>
    </html>
  );
}
```

### 2. Enable Debug Mode

**Development Mode**: Debug mode is automatically enabled in development.

**Production Mode**: Press `Ctrl+Shift+D` to toggle debug mode on/off.

### 3. Access Debug Dashboard

Once debug mode is enabled:
- Press `Ctrl+Shift+L` to open/close the debug dashboard
- Click the floating debug button in the bottom-right corner
- The yellow debug indicator will appear in the top-right when active

## 📊 What Gets Logged

### Automatic Tracking

The system automatically captures:

1. **All Console Output**: Every `console.log`, `console.error`, etc. that mentions booking-related keywords
2. **Network Requests**: All HTTP requests to booking/payment APIs with full request/response data
3. **Booking Flow Steps**: Step-by-step progression through the booking process
4. **Validation Errors**: All validation failures with detailed error information
5. **API Responses**: Full Rezdy API responses including error codes and messages

### Booking Keywords Detected

The system looks for these keywords to identify booking-related activity:
- `booking`, `rezdy`, `payment`, `stripe`, `guest`, `customer`
- `quantity`, `validation`, `api/bookings`, `transform`, `registration`

## 🔧 Using the Debug Dashboard

### 1. Recent Logs Tab
- Shows the last 50 log entries
- Color-coded by severity (error, warning, info, debug)
- Expandable data sections for detailed inspection

### 2. Errors Tab
- Filtered view of all error-level logs
- Stack traces for JavaScript errors
- Complete error context and data

### 3. Console Tab
- Raw console output from your application
- Only shows booking-related console messages
- Useful for seeing existing logging output

### 4. Network Tab
- Shows all pending network requests
- Indicates which requests are booking-related
- Network interceptor status information

### 5. Sessions Tab
- Complete booking session flows
- Step-by-step progression tracking
- Session success/failure statistics
- Duration and performance metrics

## 🧪 Testing the System

### 1. Make a Test Booking

Try to make a booking that you expect to fail. The system will capture:
- The complete booking request payload
- Validation steps and any failures
- Network requests to Rezdy API
- Complete API response (including error details)

### 2. Check the Debug Dashboard

Open the dashboard (`Ctrl+Shift+L`) and look for:
- **Errors Tab**: Any validation or API errors
- **Network Tab**: Failed API requests
- **Sessions Tab**: Complete booking flow with failed steps

### 3. Export Logs for Analysis

Click the "Export" button to download all logs as a JSON file for deeper analysis.

## 🎯 Common Issues to Look For

### 1. Validation Failures
Look for:
- Missing required fields (customer email, phone, etc.)
- Invalid quantities (must be > 0)
- Payment type issues (must be CASH or CREDITCARD)

### 2. API Errors
Check for:
- Rezdy Error Code 10: Missing required data
- Network timeouts or connection issues
- Authentication failures (API key problems)

### 3. Data Transformation Issues
Watch for:
- Incorrect price option labels
- Missing pickup location mapping
- Guest count vs individual guest mismatches

## 🔍 Advanced Debugging

### Global Debug Functions

When debug mode is active, these functions are available in the browser console:

```javascript
// Clear all debug logs
window.__bookingDebug.clearLogs();

// Export logs to file
window.__bookingDebug.exportLogs();

// Enable verbose logging
window.__bookingDebug.enableVerbose();

// Disable verbose logging
window.__bookingDebug.disableVerbose();
```

### Access Current Session Data

```javascript
// Get the current console monitor
const monitor = window.__consoleMonitor;

// Get booking-related errors
const errors = monitor.getBookingErrorLogs();

// Get validation logs
const validation = monitor.getBookingValidationLogs();

// Get network logs
const network = monitor.getBookingNetworkLogs();
```

## 📝 Understanding Log Levels

- **🔍 Debug**: Detailed diagnostic information
- **ℹ️ Info**: General operational messages
- **⚠️ Warn**: Warning conditions that should be noted
- **❌ Error**: Error conditions that prevent operation

## 🔧 Customization

### Enable in Production

```tsx
<DebugProvider enableInProduction={true}>
  {children}
</DebugProvider>
```

### Add Custom Logging

```tsx
import { bookingLogger } from '@/lib/utils/booking-debug-logger';

// Log custom events
bookingLogger.log('info', 'validation', 'custom_check', 'My custom validation', {
  data: myData
});

// Start/end custom sessions
const sessionId = bookingLogger.startSession('custom_operation');
// ... do work ...
bookingLogger.endSession('completed', 'Custom operation finished');
```

## 🚨 Next Steps

1. **Add the DebugProvider** to your app layout
2. **Enable debug mode** (auto-enabled in development)
3. **Try a booking** that you know fails
4. **Open the dashboard** and examine the logs
5. **Export the logs** if you need to analyze them further

The enhanced logging should now capture exactly what's happening when bookings fail to submit to Rezdy, making it much easier to identify and fix the root cause of the issues.