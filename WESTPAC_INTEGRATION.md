# Westpac Quick Stream Payment Integration

This document explains the complete Westpac payment integration implementation for Pineapple Tours, including automatic booking registration with Rezdy.

## Overview

The payment flow follows the Westpac Quick Stream hosted payment page model:

1. **User completes booking form** → All booking data is collected and validated
2. **Payment initiation** → Booking data is stored temporarily, payment request sent to Westpac
3. **User redirected to Westpac** → Secure hosted payment page for card details
4. **Payment processing** → Westpac processes payment and sends callback
5. **Automatic booking registration** → On successful payment, booking is automatically registered with Rezdy
6. **Confirmation** → User redirected to confirmation page with booking details

## Required Environment Variables

Create a `.env.local` file with the following variables:

```env
# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Rezdy API Configuration
REZDY_API_KEY=your_rezdy_api_key_here
REZDY_API_URL=https://api.rezdy.com/v1

# Westpac Quick Stream Payment Configuration
WESTPAC_MERCHANT_ID=your_westpac_merchant_id
WESTPAC_SECRET_KEY=your_westpac_secret_key
WESTPAC_BASE_URL=https://quickstream.westpac.com.au

# For sandbox/testing, use:
# WESTPAC_BASE_URL=https://quickstream-sandbox.westpac.com.au

NODE_ENV=development
```

## API Endpoints

### 1. Payment Initiation

**Endpoint:** `POST /api/payments/westpac/initiate`

**Purpose:** Validates booking data, stores it temporarily, and initiates payment with Westpac.

**Request Body:**

```json
{
  "bookingData": {
    "product": {
      "code": "TOUR001",
      "name": "Sydney Harbour Bridge Climb",
      "description": "Climb the iconic Sydney Harbour Bridge"
    },
    "session": {
      "id": "session123",
      "startTime": "2024-01-15T09:00:00",
      "endTime": "2024-01-15T12:00:00",
      "pickupLocation": {
        "id": "pickup1",
        "name": "Circular Quay"
      }
    },
    "guests": [
      {
        "id": "1",
        "firstName": "John",
        "lastName": "Doe",
        "age": 30,
        "type": "ADULT"
      }
    ],
    "contact": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+61400123456"
    },
    "pricing": {
      "basePrice": 89,
      "sessionPrice": 89,
      "subtotal": 89,
      "taxAndFees": 8.9,
      "total": 97.9
    },
    "extras": []
  },
  "orderNumber": "ORD-1234567890-123"
}
```

**Response:**

```json
{
  "success": true,
  "redirectUrl": "https://quickstream.westpac.com.au/payment/...",
  "paymentToken": "token123",
  "orderNumber": "ORD-1234567890-123"
}
```

### 2. Payment Callback

**Endpoint:** `POST /api/payments/westpac/callback`

**Purpose:** Receives payment confirmation from Westpac and automatically registers booking with Rezdy.

**Westpac Callback Data:**

```json
{
  "orderNumber": "ORD-1234567890-123",
  "paymentStatus": "SUCCESS",
  "responseCode": "00",
  "responseText": "Transaction Approved",
  "transactionId": "TXN123456789",
  "amount": 9790,
  "currency": "AUD",
  "paymentMethod": "VISA",
  "cardLast4": "1234",
  "timestamp": "2024-01-15T09:30:00Z",
  "signature": "abc123..."
}
```

**Flow:**

1. Validates callback signature
2. Retrieves stored booking data
3. Creates payment confirmation
4. Registers booking with Rezdy
5. Redirects to appropriate result page

### 3. Mock Payment Page (Development)

**Endpoint:** `GET /api/payments/westpac/mock-payment`

**Purpose:** Provides a mock Westpac payment page for development and testing.

## Key Components

### 1. WestpacPaymentService (`lib/services/westpac-payment.ts`)

Main service class handling:

- Payment request generation with HMAC signatures
- Callback processing and validation
- Payment method mapping
- Development mode simulation

**Key Methods:**

- `initiatePayment()` - Creates payment request and returns redirect URL
- `processCallback()` - Validates and processes payment callbacks
- `createPaymentRequest()` - Static helper for creating payment requests

### 2. Enhanced Booking Experience (`components/enhanced-booking-experience.tsx`)

Updated to use real Westpac payment flow:

- Collects all required booking information
- Validates data before payment initiation
- Redirects to Westpac hosted payment page
- Removes old payment simulation code

### 3. Booking Service Integration

The existing booking service automatically handles:

- Payment confirmation validation
- Rezdy booking registration
- Error handling and recovery

## Security Features

### 1. HMAC Signature Verification

All payment requests and callbacks use HMAC-SHA256 signatures for security:

```typescript
// Request signature generation
const signature = crypto
  .createHmac("sha256", secretKey)
  .update(signatureString)
  .digest("hex");

// Callback signature verification
const isValid = crypto.timingSafeEqual(
  Buffer.from(receivedSignature, "hex"),
  Buffer.from(expectedSignature, "hex")
);
```

### 2. Data Validation

- All booking data is validated before payment initiation
- Payment amounts are verified against booking totals
- Required fields are enforced at multiple levels

### 3. Secure Storage

- Booking data is stored temporarily (1 hour TTL recommended)
- Sensitive payment data never stored locally
- All communication uses HTTPS

## Error Handling

### Payment Failures

- **Card Declined:** User redirected to retry page with specific error message
- **Processing Error:** User shown generic error with support contact info
- **Invalid Data:** Validation errors displayed before payment initiation

### Booking Registration Failures

- **Payment Success + Booking Failure:** Special handling for manual intervention
- **Data Not Found:** Error page with support contact information
- **Rezdy API Error:** Detailed logging for troubleshooting

## Development Mode

When `NODE_ENV=development` or Westpac credentials are not configured:

1. **Mock Payment Page:** Realistic simulation of Westpac hosted page
2. **Automatic Success:** 90% success rate for testing various scenarios
3. **Callback Simulation:** Generates realistic callback data
4. **No Real Charges:** All transactions are simulated

## Testing

### Test Card Numbers (Sandbox)

```
Visa: 4111 1111 1111 1111
Mastercard: 5555 5555 5555 4444
Amex: 3782 8224 6310 005
```

### Test Scenarios

1. **Successful Payment:** Complete booking flow end-to-end
2. **Card Declined:** Test error handling and retry flow
3. **Network Timeout:** Test callback retry mechanisms
4. **Invalid Data:** Test validation at each step

## Production Deployment

### 1. Environment Setup

- Set `NODE_ENV=production`
- Configure all required environment variables
- Use production Westpac URLs and credentials

### 2. Security Checklist

- [ ] HTTPS enabled for all endpoints
- [ ] Westpac webhook signatures verified
- [ ] Sensitive data properly encrypted
- [ ] Error logging configured
- [ ] Rate limiting implemented

### 3. Monitoring

- Payment success/failure rates
- Booking registration success rates
- API response times
- Error frequency and types

## Support and Troubleshooting

### Common Issues

1. **Payment Initiated but No Callback**

   - Check Westpac webhook configuration
   - Verify callback URL accessibility
   - Check firewall/security settings

2. **Signature Verification Failures**

   - Verify secret key configuration
   - Check parameter ordering
   - Ensure UTF-8 encoding

3. **Booking Registration Failures**
   - Check Rezdy API credentials
   - Verify booking data format
   - Check network connectivity

### Logging

All payment operations are logged with:

- Order numbers for tracking
- Error details for debugging
- Success metrics for monitoring
- Security events for auditing

### Manual Recovery

For failed automatic bookings:

1. Use the manual booking registration endpoint
2. Retrieve payment confirmation from logs
3. Re-submit booking data to Rezdy
4. Update customer with confirmation details

## Integration Checklist

- [ ] Westpac merchant account configured
- [ ] API credentials obtained and tested
- [ ] Webhook endpoints configured
- [ ] SSL certificates installed
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Testing completed
- [ ] Documentation updated
- [ ] Support team trained

## Contact Information

**Westpac Support:**

- Technical Support: [Westpac Developer Portal]
- Account Management: [Your Westpac Account Manager]

**Rezdy Support:**

- API Documentation: https://developers.rezdy.com
- Technical Support: support@rezdy.com

**Internal Support:**

- Development Team: dev@pineappletours.com
- Operations Team: ops@pineappletours.com
