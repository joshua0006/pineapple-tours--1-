# Enhanced Gift Voucher System

## Overview

This document describes the enhanced gift voucher system that integrates with the Rezdy API to provide a comprehensive solution for selling and managing gift vouchers for tours and experiences.

## Features

### ✅ Core Requirements Implemented

1. **Rezdy API Integration**
   - Dedicated hook `useRezdyGiftVouchers` for fetching gift voucher products
   - Automatic filtering of products with `productType: "GIFT_CARD"`
   - Enhanced error handling with retry mechanism
   - Real-time data synchronization

2. **Dynamic Display**
   - Responsive grid layout for gift vouchers
   - Real-time loading states and skeleton screens
   - Fallback to default voucher types when API is unavailable
   - Mobile-optimized design

3. **User-Friendly Presentation**
   - Custom `GiftVoucherCard` component with enhanced features
   - Beautiful image overlays and pricing display
   - Interactive terms & conditions modal
   - Clear call-to-action buttons

4. **Error Handling**
   - Comprehensive error states with retry functionality
   - Exponential backoff for failed requests
   - User-friendly error messages
   - Success notifications when data loads

5. **Voucher Information Display**
   - Voucher codes (generated automatically)
   - Expiry dates (12 months from purchase)
   - Terms & conditions in detailed modal
   - Redemption instructions

6. **Responsive Design**
   - Mobile-first approach
   - Consistent branding with existing site
   - Smooth animations and transitions
   - Accessible UI components

7. **Filtering & Pagination**
   - Advanced filtering by price range, voucher type, availability
   - Search functionality
   - Sorting options (price, name, popularity)
   - Real-time filter updates with debouncing

8. **Redemption Instructions**
   - Clear booking process explanation
   - Contact information for assistance
   - Step-by-step redemption guide
   - FAQ section with common questions

## Architecture

### Components

#### 1. Main Page (`app/gift-vouchers/page.tsx`)
- Enhanced with new hooks and components
- Improved error handling and user feedback
- Integrated filtering and search functionality
- Responsive design with better mobile experience

#### 2. Gift Voucher Card (`components/ui/gift-voucher-card.tsx`)
- Specialized component for displaying voucher information
- Interactive terms & conditions modal
- Purchase button with callback handling
- Responsive design with hover effects

#### 3. Filters Component (`components/ui/gift-voucher-filters.tsx`)
- Advanced filtering with price range slider
- Search functionality with debouncing
- Sorting options with clear labels
- Active filter indicators

### Hooks

#### 1. `useRezdyGiftVouchers`
```typescript
const { data, loading, error, retry, retryCount, maxRetries } = useRezdyGiftVouchers({
  priceRange: { min: 0, max: 1000 },
  sortBy: 'popularity',
  sortOrder: 'desc',
  limit: 12,
  offset: 0
})
```

Features:
- Automatic filtering for gift voucher products
- Price range and sorting filters
- Retry mechanism with exponential backoff
- Cache busting for fresh data

#### 2. `useGiftVoucherTerms`
```typescript
const terms = useGiftVoucherTerms()
```

Provides standardized terms and conditions for all vouchers.

### API Endpoints

#### 1. Gift Voucher Purchase (`/api/gift-vouchers/purchase`)
- Validates purchase data
- Generates unique voucher codes
- Processes payments (integration ready)
- Sends confirmation emails
- Returns voucher details

### Types

#### Core Types
```typescript
interface GiftVoucher extends RezdyProduct {
  productType: 'GIFT_CARD'
  voucherCode?: string
  expiryDate?: string
  // ... additional voucher-specific fields
}

interface GiftVoucherFilters {
  priceRange?: { min?: number; max?: number }
  sortBy?: 'price' | 'name' | 'popularity'
  sortOrder?: 'asc' | 'desc'
  // ... additional filter options
}
```

## Usage

### Basic Implementation

```tsx
import { useRezdyGiftVouchers, useGiftVoucherTerms } from '@/hooks/use-rezdy'
import { GiftVoucherCard } from '@/components/ui/gift-voucher-card'

function GiftVouchersPage() {
  const { data: vouchers, loading, error } = useRezdyGiftVouchers()
  const terms = useGiftVoucherTerms()

  const handlePurchase = (productCode: string) => {
    // Handle voucher purchase
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {vouchers?.map(voucher => (
        <GiftVoucherCard
          key={voucher.productCode}
          product={voucher}
          terms={terms}
          onPurchase={handlePurchase}
        />
      ))}
    </div>
  )
}
```

### Advanced Filtering

```tsx
import { GiftVoucherFiltersComponent } from '@/components/ui/gift-voucher-filters'

function FilteredGiftVouchers() {
  const [filters, setFilters] = useState<GiftVoucherFilters>({
    sortBy: 'popularity',
    sortOrder: 'desc'
  })

  const { data: vouchers } = useRezdyGiftVouchers(filters)

  return (
    <>
      <GiftVoucherFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        totalResults={vouchers?.length || 0}
      />
      {/* Render vouchers */}
    </>
  )
}
```

## Configuration

### Environment Variables

```env
# Rezdy API Configuration
REZDY_API_KEY=your_rezdy_api_key
REZDY_API_URL=https://api.rezdy.com/v1

# Payment Processing (example for Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email Service (example for SendGrid)
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@yourdomain.com
```

### Customization Options

#### 1. Voucher Terms
Modify the `useGiftVoucherTerms` hook to customize terms and conditions:

```typescript
export function useGiftVoucherTerms() {
  return {
    validity: '12 months from purchase date',
    redemption: 'Can be redeemed for any tour or experience',
    // ... customize other terms
  }
}
```

#### 2. Filtering Options
Extend the `GiftVoucherFilters` interface for additional filter criteria:

```typescript
interface GiftVoucherFilters {
  // Existing filters...
  location?: string
  category?: string
  duration?: { min: number; max: number }
}
```

#### 3. Voucher Code Generation
Customize the voucher code format in the purchase API:

```typescript
function generateVoucherCode(): string {
  const prefix = 'YOUR_PREFIX'
  // ... custom generation logic
  return voucherCode
}
```

## Integration Points

### 1. Payment Processing
The system is designed to integrate with popular payment processors:

- **Stripe**: Add Stripe Elements for card processing
- **PayPal**: Integrate PayPal SDK for alternative payments
- **Square**: Use Square Payment Form for in-person sales

### 2. Email Services
Configure email templates and delivery:

- **SendGrid**: For transactional emails
- **Mailgun**: Alternative email service
- **AWS SES**: Cost-effective email delivery

### 3. Database Storage
Store voucher data in your preferred database:

- **PostgreSQL**: Recommended for production
- **MongoDB**: For flexible document storage
- **Supabase**: For rapid development

## Error Handling

### API Errors
- Network failures: Automatic retry with exponential backoff
- Rate limiting: Graceful degradation with cached data
- Invalid responses: Fallback to default voucher types

### User Errors
- Form validation: Real-time validation with helpful messages
- Payment failures: Clear error messages with retry options
- Network issues: Offline indicators and retry buttons

## Performance Optimizations

### 1. Caching
- API responses cached with configurable TTL
- Image optimization with Next.js Image component
- Lazy loading for voucher cards

### 2. Loading States
- Skeleton screens during data fetching
- Progressive loading for large voucher lists
- Optimistic updates for better UX

### 3. Search & Filtering
- Debounced search to reduce API calls
- Client-side filtering for instant results
- Pagination for large datasets

## Security Considerations

### 1. Data Validation
- Server-side validation for all inputs
- Sanitization of user-provided data
- Rate limiting on API endpoints

### 2. Payment Security
- PCI DSS compliance for payment processing
- Secure token handling
- Fraud detection integration

### 3. Voucher Security
- Unique, non-guessable voucher codes
- Expiry date validation
- Redemption tracking to prevent double-use

## Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Deployment

### Production Checklist
- [ ] Configure environment variables
- [ ] Set up payment processor webhooks
- [ ] Configure email templates
- [ ] Set up monitoring and logging
- [ ] Test voucher purchase flow
- [ ] Verify email delivery
- [ ] Test error handling scenarios

### Monitoring
- API response times and error rates
- Voucher purchase conversion rates
- Email delivery success rates
- User engagement metrics

## Future Enhancements

### Planned Features
1. **Voucher Management Dashboard**
   - Admin interface for voucher tracking
   - Analytics and reporting
   - Bulk voucher operations

2. **Advanced Redemption**
   - QR code generation for vouchers
   - Mobile app integration
   - Partial redemption tracking

3. **Marketing Features**
   - Promotional voucher campaigns
   - Discount codes and coupons
   - Referral program integration

4. **Enhanced Analytics**
   - Voucher performance metrics
   - Customer behavior tracking
   - Revenue optimization insights

## Support

For technical support or questions about the gift voucher system:

- **Documentation**: This file and inline code comments
- **API Reference**: `/docs/api` endpoint
- **Issue Tracking**: GitHub Issues
- **Contact**: support@yourdomain.com

## License

This gift voucher system is part of the Pineapple Tours application and follows the same licensing terms. 