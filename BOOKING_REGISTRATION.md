# Rezdy Booking Registration System

This document explains how the Rezdy booking registration system works after implementing payment confirmation and automatic booking registration.

## Overview

The booking registration system integrates with Westpac payment processing and automatically registers confirmed bookings with the Rezdy API. The flow ensures that only successful payments result in confirmed bookings.

## Architecture

### 1. Payment Processing Flow

```
User Completes Booking Form → Payment Processing (Westpac) → Payment Confirmation → Rezdy Booking Registration → Confirmation Email
```

### 2. Key Components

- **BookingService** (`lib/services/booking-service.ts`): Core service handling booking registration
- **Payment Webhook** (`app/api/webhooks/payment-confirmation/route.ts`): Receives Westpac confirmations
- **Manual Registration** (`app/api/bookings/register/route.ts`): Manual booking processing
- **Enhanced Booking Experience** (`components/enhanced-booking-experience.tsx`): UI with real booking flow

## API Endpoints

### 1. Payment Confirmation Webhook

**Endpoint:** `POST /api/webhooks/payment-confirmation`

**Purpose:** Receives payment confirmations from Westpac and automatically registers bookings with Rezdy.

**Westpac Webhook Payload:**
```json
{
  "payment": {
    "transactionId": "TXN123456789",
    "amount": 330.00,
    "currency": "AUD",
    "status": "approved",
    "paymentMethod": "credit_card",
    "orderReference": "ORD-2024-001",
    "timestamp": "2024-01-15T09:30:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderNumber": "RZD123456",
  "message": "Booking successfully registered with Rezdy"
}
```

### 2. Manual Booking Registration

**Endpoint:** `POST /api/bookings/register`

**Purpose:** Manual booking registration for testing or when webhooks fail.

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
    "guests": [...],
    "contact": {...},
    "pricing": {...},
    "extras": [...]
  },
  "paymentConfirmation": {
    "transactionId": "TXN123456789",
    "amount": 330,
    "currency": "AUD",
    "status": "success",
    "paymentMethod": "credit_card",
    "timestamp": "2024-01-15T09:30:00Z"
  }
}
```

### 3. Test Data Endpoint

**Endpoint:** `GET /api/bookings/register`

**Purpose:** Returns sample data for testing the booking registration flow.

## Rezdy API Integration

### Request Format

The system creates Rezdy bookings in the exact format specified:

```json
{
  "customer": {
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john.doe@example.com",
    "phone": "+61400123456"
  },
  "items": [
    {
      "productCode": "TOUR001",
      "startTimeLocal": "2024-01-15T09:00:00",
      "participants": [
        { "type": "ADULT", "number": 2 }
      ],
      "amount": 330,
      "pickupId": "pickup1",
      "extras": [
        {
          "extraId": "photo-package",
          "quantity": 1,
          "unitPrice": 49,
          "totalPrice": 49
        }
      ]
    }
  ],
  "totalAmount": 330,
  "paymentOption": "CREDITCARD",
  "status": "CONFIRMED"
}
```

### Response Format

Rezdy returns the booking with an order number:

```json
{
  "orderNumber": "RZD123456",
  "customer": {...},
  "items": [...],
  "totalAmount": 330,
  "status": "CONFIRMED",
  "createdDate": "2024-01-15T09:30:00Z"
}
```

## Configuration

### Environment Variables

```env
# Rezdy API Configuration
REZDY_API_KEY=your_rezdy_api_key_here
REZDY_API_URL=https://api.rezdy.com/v1

# Webhook Security (implement based on Westpac requirements)
WESTPAC_WEBHOOK_SECRET=your_webhook_secret
```

### Payment Method Mapping

The system maps Westpac payment methods to Rezdy payment options:

| Westpac Method | Rezdy Option |
|---------------|--------------|
| credit_card   | CREDITCARD   |
| debit_card    | CREDITCARD   |
| visa          | CREDITCARD   |
| mastercard    | CREDITCARD   |
| amex          | CREDITCARD   |
| paypal        | PAYPAL       |
| bank_transfer | BANKTRANSFER |
| cash          | CASH         |

## Error Handling

### Payment Validation

The system validates:
- Transaction ID exists
- Amount is greater than 0
- Payment status is 'success'
- Payment timestamp is within 1 hour (security)
- Payment method is valid

### Booking Validation

The system validates:
- Product code exists
- Session ID and start time exist
- At least one guest is provided
- Contact information is complete
- Pricing total matches payment amount

### Failure Recovery

When booking registration fails:
1. Payment confirmation is stored for manual review
2. Error details are logged
3. Customer service is notified
4. Manual retry can be performed using the registration endpoint

## Usage Examples

### 1. Complete Booking Flow

```typescript
import { registerBookingWithPayment, BookingService } from '@/lib/services/booking-service'

// After successful payment
const paymentConfirmation = BookingService.createPaymentConfirmation({
  transactionId: 'TXN123456789',
  amount: 330,
  paymentMethod: 'credit_card',
  orderReference: 'ORD-2024-001'
})

const result = await registerBookingWithPayment(bookingData, paymentConfirmation)

if (result.success) {
  console.log('Booking registered:', result.orderNumber)
} else {
  console.error('Registration failed:', result.error)
}
```

### 2. Manual Registration

```bash
# Test the registration endpoint
curl -X POST /api/bookings/register \
  -H "Content-Type: application/json" \
  -d @booking-data.json
```

### 3. Get Test Data

```bash
# Get sample data for testing
curl -X GET /api/bookings/register
```

## Testing

### 1. End-to-End Test

1. Navigate to `/test-booking`
2. Fill out the booking form completely
3. Use test card number: `4111111111111111`
4. Complete the booking process
5. Verify Rezdy order number is displayed

### 2. Webhook Testing

Use a tool like ngrok to expose your local webhook endpoint:

```bash
ngrok http 3000
# Use the ngrok URL + /api/webhooks/payment-confirmation
```

### 3. Manual Testing

```bash
# Get test data
curl -X GET http://localhost:3000/api/bookings/register

# Register booking manually
curl -X POST http://localhost:3000/api/bookings/register \
  -H "Content-Type: application/json" \
  -d '{ "bookingData": {...}, "paymentConfirmation": {...} }'
```

## Security Considerations

### 1. Webhook Validation

Implement signature validation for Westpac webhooks:

```typescript
async function validateWebhookSignature(request: NextRequest, body: any): Promise<boolean> {
  const signature = request.headers.get('x-westpac-signature')
  const timestamp = request.headers.get('x-westpac-timestamp')
  
  // Implement HMAC signature verification
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WESTPAC_WEBHOOK_SECRET!)
    .update(timestamp + JSON.stringify(body))
    .digest('hex')
  
  return signature === expectedSignature
}
```

### 2. Payment Verification

- Verify payment amounts match booking totals
- Check payment timestamps are recent
- Validate transaction IDs are unique
- Ensure payment status is confirmed

### 3. Rate Limiting

Implement rate limiting on booking endpoints to prevent abuse.

## Monitoring

### 1. Logging

The system logs:
- All booking registration attempts
- Payment confirmation details
- Rezdy API responses
- Error conditions and failures

### 2. Metrics

Track:
- Booking success/failure rates
- Payment processing times
- Rezdy API response times
- Error frequencies by type

### 3. Alerts

Set up alerts for:
- High booking failure rates
- Rezdy API errors
- Webhook authentication failures
- Payment/booking amount mismatches

## Deployment

### 1. Environment Setup

Ensure all environment variables are configured in production.

### 2. Webhook Configuration

Configure Westpac to send webhooks to your production endpoint:
`https://yourdomain.com/api/webhooks/payment-confirmation`

### 3. Database Migration

If using database storage for bookings, ensure tables are created:

```sql
CREATE TABLE booking_registrations (
  id UUID PRIMARY KEY,
  order_number VARCHAR(255),
  transaction_id VARCHAR(255),
  booking_data JSONB,
  payment_confirmation JSONB,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Troubleshooting

### Common Issues

1. **Booking registration fails after payment**
   - Check Rezdy API key configuration
   - Verify booking data format
   - Check Rezdy API response logs

2. **Webhook not receiving payments**
   - Verify webhook URL configuration
   - Check signature validation
   - Confirm Westpac webhook settings

3. **Amount mismatch errors**
   - Verify pricing calculation logic
   - Check for currency conversion issues
   - Ensure fees are calculated correctly

### Debug Mode

Enable debug logging for detailed information:

```typescript
const bookingService = new BookingService()
console.log('Debug mode enabled')
// Additional logging will appear in console
``` 