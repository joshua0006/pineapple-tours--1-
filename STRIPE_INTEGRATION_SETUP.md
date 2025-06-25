# Stripe Payment Integration Setup Guide

This guide provides comprehensive instructions for integrating Stripe self-hosted payment processing into the Pineapple Tours booking system.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Installation](#installation)
4. [Stripe Dashboard Configuration](#stripe-dashboard-configuration)
5. [Testing](#testing)
6. [Security Considerations](#security-considerations)
7. [Troubleshooting](#troubleshooting)
8. [API Reference](#api-reference)

## Prerequisites

- Stripe account (create at [stripe.com](https://stripe.com))
- Node.js 18+ and npm/yarn/pnpm
- Next.js 13+ application
- Valid SSL certificate for production

## Environment Variables Setup

Create or update your `.env.local` file with the following Stripe-specific environment variables:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key (test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key (test mode)
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook endpoint secret (optional but recommended)

# Production keys (use these in production)
# STRIPE_SECRET_KEY=sk_live_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000 # Your application base URL
```

### Getting Your Stripe Keys

1. **Log in to Stripe Dashboard**

   - Go to [dashboard.stripe.com](https://dashboard.stripe.com)
   - Sign in to your Stripe account

2. **Get API Keys**

   - Navigate to "Developers" → "API keys"
   - Copy the "Publishable key" (starts with `pk_test_` or `pk_live_`)
   - Reveal and copy the "Secret key" (starts with `sk_test_` or `sk_live_`)

3. **Set up Webhooks (Recommended)**
   - Navigate to "Developers" → "Webhooks"
   - Click "Add endpoint"
   - Set endpoint URL to: `https://yourdomain.com/api/payments/stripe/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
   - Copy the "Signing secret" (starts with `whsec_`)

## Installation

### 1. Install Dependencies

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
# or
yarn add stripe @stripe/stripe-js @stripe/react-stripe-js
# or
pnpm add stripe @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Update package.json

The following dependencies should be added to your `package.json`:

```json
{
  "dependencies": {
    "@stripe/react-stripe-js": "^2.8.0",
    "@stripe/stripe-js": "^4.8.0",
    "stripe": "^17.3.1"
  }
}
```

### 3. Install Dependencies

Run the installation command:

```bash
npm install
# or
yarn install
# or
pnpm install
```

## Stripe Dashboard Configuration

### 1. Business Settings

1. **Business Information**

   - Complete your business profile
   - Add business address and contact information
   - Upload required documents for verification

2. **Payment Methods**

   - Enable desired payment methods (cards, Apple Pay, Google Pay)
   - Configure currency settings (AUD for Australian business)

3. **Checkout Settings**
   - Set up your branding
   - Configure receipt emails
   - Set up customer portal (optional)

### 2. Tax Configuration

1. **Tax Settings**
   - Configure tax rates for your jurisdiction
   - Enable automatic tax calculation if needed
   - Set up tax reporting

### 3. Security Settings

1. **Radar (Fraud Protection)**

   - Review and configure fraud protection rules
   - Set up custom rules if needed

2. **API Security**
   - Restrict API key usage to specific IPs (production)
   - Enable webhook signature verification

## Testing

### 1. Test Cards

Use these test card numbers in test mode:

```
# Successful payments
4242424242424242 (Visa)
4000056655665556 (Visa - debit)
5555555555554444 (Mastercard)
2223003122003222 (Mastercard)

# Declined payments
4000000000000002 (Generic decline)
4000000000009995 (Insufficient funds)
4000000000009987 (Lost card)

# 3D Secure authentication
4000002760003184 (Requires authentication)
4000002500003155 (Authentication fails)

# Use any future expiry date (e.g., 12/34)
# Use any 3-digit CVC (e.g., 123)
# Use any postal code (e.g., 12345)
```

### 2. Testing Workflow

1. **Start Development Server**

   ```bash
   npm run dev
   ```

2. **Test Booking Flow**

   - Navigate to a tour booking page
   - Complete the booking form
   - Use test card numbers for payment
   - Verify booking confirmation

3. **Test Webhooks (Optional)**
   - Use Stripe CLI for local webhook testing
   - Install Stripe CLI: `npm install -g stripe`
   - Login: `stripe login`
   - Forward webhooks: `stripe listen --forward-to localhost:3000/api/payments/stripe/webhook`

### 3. Monitoring

- Check Stripe Dashboard → "Payments" for payment attempts
- Review logs in your application console
- Monitor webhook delivery in Stripe Dashboard → "Developers" → "Webhooks"

## Security Considerations

### 1. API Key Security

- **Never expose secret keys in client-side code**
- Store secret keys in environment variables only
- Use different keys for test and production
- Rotate keys regularly

### 2. Webhook Security

- Always verify webhook signatures
- Use HTTPS for webhook endpoints
- Implement idempotency for webhook handlers

### 3. PCI Compliance

- Never store card data on your servers
- Use Stripe Elements for card input
- Implement proper error handling
- Log security events

### 4. Production Checklist

- [ ] Switch to live API keys
- [ ] Enable webhook signature verification
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and alerting
- [ ] Test with real payment methods
- [ ] Complete Stripe account verification

## Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**

   - Verify environment variables are set correctly
   - Check if using test vs live keys appropriately
   - Ensure no extra spaces in keys

2. **Payment Form Not Loading**

   - Check publishable key configuration
   - Verify Stripe Elements initialization
   - Check browser console for errors

3. **Webhook Signature Verification Failed**

   - Verify webhook secret is correct
   - Check endpoint URL matches Stripe configuration
   - Ensure raw request body is used for verification

4. **Payment Intent Creation Failed**
   - Check amount is in cents (multiply by 100)
   - Verify currency code is supported
   - Check customer information format

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=stripe:*
```

### Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Stripe Status Page](https://status.stripe.com)

## API Reference

### Endpoints

#### Create Payment Intent

```
POST /api/payments/stripe/create-payment-intent
```

**Request Body:**

```json
{
  "bookingData": {
    "product": { "code": "...", "name": "..." },
    "contact": { "firstName": "...", "email": "..." },
    "pricing": { "total": 100.0 }
  },
  "orderNumber": "ORD-123456789"
}
```

**Response:**

```json
{
  "success": true,
  "clientSecret": "pi_...._secret_...",
  "paymentIntentId": "pi_...",
  "orderNumber": "ORD-123456789"
}
```

#### Confirm Payment

```
POST /api/payments/stripe/confirm-payment
```

**Request Body:**

```json
{
  "paymentIntentId": "pi_...",
  "orderNumber": "ORD-123456789"
}
```

**Response:**

```json
{
  "success": true,
  "orderNumber": "ORD-123456789",
  "transactionId": "pi_...",
  "rezdyBooking": { ... }
}
```

#### Webhook Handler

```
POST /api/payments/stripe/webhook
```

Handles Stripe webhook events for payment status updates.

### Error Codes

| Code                    | Description        | Action                       |
| ----------------------- | ------------------ | ---------------------------- |
| `invalid_request_error` | Invalid parameters | Check request format         |
| `authentication_error`  | Invalid API key    | Verify environment variables |
| `card_error`            | Card declined      | Show user-friendly error     |
| `rate_limit_error`      | Too many requests  | Implement retry logic        |

## Data Flow

```
1. User completes booking form
2. Frontend calls /api/payments/stripe/create-payment-intent
3. Backend creates Stripe PaymentIntent
4. Frontend receives clientSecret
5. User completes payment with Stripe Elements
6. Frontend calls /api/payments/stripe/confirm-payment
7. Backend confirms payment with Stripe
8. Backend registers booking with Rezdy
9. User redirected to confirmation page
```

## Production Deployment

### 1. Environment Variables

Set production environment variables:

```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 2. SSL Certificate

Ensure your domain has a valid SSL certificate:

- Use Let's Encrypt for free certificates
- Configure HTTPS redirects
- Test SSL configuration

### 3. Monitoring

Set up monitoring for:

- Payment success/failure rates
- API response times
- Error rates
- Webhook delivery status

### 4. Backup Plan

- Implement graceful error handling
- Set up alternative payment methods
- Create manual booking process for emergencies
- Monitor Stripe status page

## Support

For technical support with this integration:

1. Check this documentation first
2. Review Stripe documentation
3. Check application logs
4. Contact development team

For Stripe-specific issues:

- Visit [Stripe Support](https://support.stripe.com)
- Check [Stripe Status](https://status.stripe.com)
- Review [Stripe Documentation](https://stripe.com/docs)
