# Westpac Quick Stream Payment Integration Setup

This guide will help you set up and test the Westpac Quick Stream payment integration for Pineapple Tours.

## Overview

The integration uses Westpac's hosted payment page (redirect) method, which provides:

- PCI DSS compliance (SAQ A level)
- Secure payment processing
- Support for major credit cards
- Real-time payment confirmation
- Automatic booking registration with Rezdy

## Prerequisites

1. **Westpac Quick Stream Account**: You need an active Westpac Quick Stream merchant account
2. **Merchant Credentials**: Merchant ID and Secret Key from Westpac
3. **Rezdy Integration**: Working Rezdy API connection for booking registration

## Environment Setup

### 1. Copy Environment Variables

Copy the example environment file and configure it:

```bash
cp env.example .env.local
```

### 2. Configure Westpac Settings

Add your Westpac credentials to `.env.local`:

```env
# Westpac Payment Configuration
WESTPAC_MERCHANT_ID=your_westpac_merchant_id
WESTPAC_SECRET_KEY=your_westpac_secret_key
WESTPAC_BASE_URL=https://quickstream.westpac.com.au

# For sandbox testing, use:
# WESTPAC_BASE_URL=https://quickstream-sandbox.westpac.com.au

# Application Base URL (important for callbacks)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Production vs Sandbox

**Sandbox Testing:**

- Use `https://quickstream-sandbox.westpac.com.au` as the base URL
- Use test merchant credentials provided by Westpac
- No real charges are processed

**Production:**

- Use `https://quickstream.westpac.com.au` as the base URL
- Use your live merchant credentials
- Real payments are processed

## Testing the Integration

### 1. Development Mode Testing

The integration includes a mock payment system for development:

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to a tour and start the booking process
3. Complete the booking form through all steps
4. When you click "Complete Booking", you'll be redirected to a mock Westpac payment page
5. Use test card numbers:
   - **Success**: `4111111111111111` (Visa)
   - **Success**: `5555555555554444` (Mastercard)
   - **Decline**: `4000000000000002` (Visa declined)

### 2. Sandbox Testing

1. Set up sandbox environment variables
2. Use Westpac-provided test credentials
3. Test with Westpac's test card numbers
4. Verify callback handling and booking registration

### 3. Production Testing

1. Configure production environment variables
2. Test with small amounts first
3. Verify all payment flows work correctly
4. Test error scenarios and edge cases

## Payment Flow

### 1. Booking Initiation

- User completes booking form
- System validates booking data
- Temporary booking data is stored
- Payment request is prepared with HMAC signature

### 2. Payment Processing

- User is redirected to Westpac hosted payment page
- User enters payment details on secure Westpac form
- Westpac processes payment and generates callback

### 3. Payment Confirmation

- Westpac sends callback to your application
- System verifies callback signature
- Payment result is processed
- Booking is registered with Rezdy (if payment successful)
- User is redirected to confirmation or error page

## API Endpoints

### Payment Initiation

```
POST /api/payments/westpac/initiate
```

Validates booking data and initiates payment with Westpac.

### Payment Callback

```
POST /api/payments/westpac/callback
```

Handles Westpac payment callbacks and processes results.

### Mock Payment (Development)

```
GET /api/payments/westpac/mock-payment
```

Provides mock payment page for development testing.

## Result Pages

### Success

- **URL**: `/booking/confirmation`
- **Parameters**: `orderNumber`, `transactionId`
- Shows booking confirmation details

### Payment Failed

- **URL**: `/booking/payment-failed`
- **Parameters**: `orderNumber`, `error`
- Shows payment failure details with retry options

### Booking Error

- **URL**: `/booking/error`
- **Parameters**: `orderNumber`, `error`, `transactionId`
- Handles various booking-related errors

### Cancelled

- **URL**: `/booking/cancelled`
- **Parameters**: `orderNumber`
- Shows when user cancels payment

## Security Features

### 1. HMAC Signature Verification

All payment requests and callbacks are signed with HMAC-SHA256 to ensure authenticity.

### 2. Amount Verification

Payment amounts are verified against booking totals to prevent tampering.

### 3. Temporary Data Storage

Booking data is stored temporarily and cleaned up after processing.

### 4. HTTPS Enforcement

All payment-related endpoints require HTTPS in production.

## Error Handling

### Common Error Scenarios

1. **Payment Declined**: Card declined by bank
2. **Insufficient Funds**: Not enough balance on card
3. **Expired Card**: Card has expired
4. **Invalid Card**: Invalid card details
5. **Processing Error**: Technical error during payment
6. **Booking Registration Failed**: Payment succeeded but Rezdy booking failed

### Error Recovery

- Failed payments can be retried
- Booking data is preserved for retry attempts
- Support contact information is provided
- Failed bookings are logged for manual review

## Monitoring and Logging

### Key Metrics to Monitor

1. **Payment Success Rate**: Percentage of successful payments
2. **Booking Registration Rate**: Percentage of successful Rezdy registrations
3. **Error Rates**: Frequency of different error types
4. **Response Times**: Payment processing and callback handling times

### Logging

All payment-related activities are logged with:

- Transaction IDs
- Order numbers
- Payment amounts
- Error details
- Timestamps

## Troubleshooting

### Common Issues

1. **Callback Not Received**

   - Check NEXT_PUBLIC_BASE_URL is correct
   - Verify Westpac can reach your callback URL
   - Check firewall settings

2. **Signature Verification Failed**

   - Verify WESTPAC_SECRET_KEY is correct
   - Check for extra whitespace in environment variables
   - Ensure consistent encoding (UTF-8)

3. **Booking Registration Failed**

   - Check Rezdy API credentials
   - Verify booking data format
   - Check Rezdy service availability

4. **Payment Page Not Loading**
   - Verify WESTPAC_MERCHANT_ID is correct
   - Check WESTPAC_BASE_URL setting
   - Ensure merchant account is active

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will provide detailed console output for troubleshooting.

## Support

### Westpac Support

- **Technical Support**: Contact Westpac Quick Stream technical support
- **Documentation**: Refer to Westpac Quick Stream API documentation
- **Account Issues**: Contact your Westpac account manager

### Application Support

- Check application logs for error details
- Review callback handling in `/api/payments/westpac/callback`
- Test with mock payment system first
- Verify environment variable configuration

## Security Checklist

Before going live, ensure:

- [ ] All environment variables are properly configured
- [ ] HTTPS is enforced for all payment endpoints
- [ ] Callback URL is accessible from Westpac servers
- [ ] Secret keys are kept secure and not exposed
- [ ] Error handling doesn't expose sensitive information
- [ ] Payment amounts are properly validated
- [ ] Callback signatures are verified
- [ ] Failed payments are properly logged
- [ ] PCI DSS compliance requirements are met

## Next Steps

1. **Test Integration**: Complete end-to-end testing in sandbox
2. **Security Review**: Conduct security audit of payment flow
3. **Performance Testing**: Test under expected load
4. **Monitoring Setup**: Implement payment monitoring and alerting
5. **Documentation**: Update internal documentation
6. **Go Live**: Switch to production environment
7. **Monitor**: Continuously monitor payment success rates and errors
