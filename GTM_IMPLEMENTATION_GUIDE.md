# Google Tag Manager (GTM) Implementation Guide

## Overview
This document explains how Google Tag Manager has been integrated into the Pineapple Tours website to track sales and user behavior.

## Implementation Summary

### 1. Environment Configuration
GTM configuration is managed through environment variables:
- `NEXT_PUBLIC_GTM_ID` - Your GTM container ID (e.g., GTM-XXXXXXX)
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID` - Your Google Analytics 4 measurement ID (optional)

### 2. Core Files Created/Modified

#### New Files:
- `lib/gtm.ts` - GTM utility functions and TypeScript types
- `components/gtm-script.tsx` - GTM script component for proper loading

#### Modified Files:
- `app/layout.tsx` - Added GTM scripts to the root layout
- `app/booking/confirmation/page.tsx` - Added purchase event tracking
- `components/enhanced-booking-experience.tsx` - Added begin checkout tracking
- `components/ui/stripe-payment-form.tsx` - Added payment info tracking

### 3. Tracked Events

#### E-commerce Events:
1. **Begin Checkout** (`begin_checkout`)
   - Triggered: When user clicks "Complete Booking" button
   - Location: `components/enhanced-booking-experience.tsx`
   - Data: Product details, quantity, value

2. **Add Payment Info** (`add_payment_info`)
   - Triggered: When payment form is submitted
   - Location: `components/ui/stripe-payment-form.tsx`
   - Data: Payment method, product details, value

3. **Purchase** (`purchase`)
   - Triggered: On booking confirmation page load
   - Location: `app/booking/confirmation/page.tsx`
   - Data: Transaction ID, revenue, product details, customer email

#### Data Collected:
- Transaction ID (order number)
- Product code and name
- Product category (automatically categorized)
- Revenue amount in AUD
- Customer email (when available)
- Quantity of participants

### 4. Product Categorization
Products are automatically categorized based on their name and code:
- Wine Tours
- Brewery Tours
- Hop On Hop Off
- Private Tours
- Corporate Tours
- Special Events (Hen's parties, etc.)
- Custom Tours
- Day Tours (default)

### 5. GTM Setup Requirements

#### In Google Tag Manager:
1. Create a new container for your domain
2. Set up Google Analytics 4 configuration tag
3. Create triggers for the events:
   - `begin_checkout`
   - `add_payment_info`
   - `purchase`
4. Configure Enhanced E-commerce settings
5. Set up conversion goals for purchases

#### Recommended Tags:
- GA4 Configuration
- GA4 Event (for each e-commerce event)
- Conversion tracking tags
- Custom events for additional tracking

### 6. Testing and Verification

#### Development Testing:
```bash
# Run the application locally
npm run dev

# Check browser console for GTM logs
# Look for messages like "Pushing GTM event:"
```

#### Production Verification:
1. Use GTM Preview mode
2. Check Google Analytics Real-time reports
3. Verify events are firing in GTM debug panel
4. Use Google Tag Assistant browser extension

### 7. Data Flow

```
User Action → GTM Event → GA4/Other Tags → Analytics Dashboard
```

1. User performs action (checkout, payment, etc.)
2. React component calls GTM tracking function
3. Event is pushed to GTM dataLayer
4. GTM triggers fire configured tags
5. Data is sent to Google Analytics and other platforms

### 8. Privacy Compliance

- Customer email is only tracked for completed purchases
- No sensitive payment information is tracked
- All tracking respects user consent preferences
- Events can be easily disabled by not setting GTM_ID

### 9. Error Handling

- GTM tracking errors are caught and logged to console
- Failed tracking doesn't break the user experience
- Fallback tracking with minimal data for purchase events

### 10. Future Enhancements

Consider implementing:
- View item events on tour detail pages
- Search tracking for tour searches
- Lead generation tracking for contact forms
- Custom dimensions for user segments
- Attribution modeling for marketing campaigns

## Configuration Checklist

- [ ] Set `NEXT_PUBLIC_GTM_ID` environment variable
- [ ] Create GTM container and workspace
- [ ] Configure GA4 property in GTM
- [ ] Set up e-commerce tracking tags
- [ ] Test purchase flow in GTM preview mode
- [ ] Verify events in Google Analytics
- [ ] Set up conversion goals
- [ ] Configure audience and remarketing lists

## Support

For technical issues or questions about the GTM implementation, refer to:
- GTM utility functions in `lib/gtm.ts`
- Component tracking in relevant booking components
- Google Tag Manager documentation
- Google Analytics 4 Enhanced E-commerce guides