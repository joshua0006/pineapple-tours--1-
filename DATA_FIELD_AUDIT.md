# Data Field Usage Audit - Booking System

## Executive Summary

This document audits all user input fields collected during the booking process versus what is actually sent to the Rezdy API. The exact Rezdy structure remains unchanged as specified.

## Rezdy API Structure (Unchanged)

The following data structure is sent to Rezdy exactly as provided:

```json
{
  "resellerReference": "ORDER12345",
  "resellerComments": "This comment is visible to both supplier and reseller", 
  "customer": {
    "firstName": "Rick",
    "lastName": "Sanchez",
    "phone": "+61484123456",
    "email": "ricksanchez@test.com"
  },
  "items": [
    {
      "productCode": "PWQF1Y",
      "startTimeLocal": "2025-10-01 09:00:00",
      "quantities": [{"optionLabel": "Adult", "value": 2}],
      "extras": [{"name": "Underwater camera rental", "quantity": 1}],
      "participants": [
        {
          "fields": [
            {"label": "First Name", "value": "Rick"},
            {"label": "Last Name", "value": "Sanchez"},
            {"label": "Certification level", "value": "Open Water"},
            {"label": "Certification number", "value": "123456798"},
            {"label": "Certification agency", "value": "PADI"}
          ]
        }
      ]
    },
    {"pickupLocation": {"locationName": "Divers hotel"}}
  ],
  "fields": [{"label": "Special Requirements", "value": "Gluten free lunch for Morty"}],
  "payments": [{"amount": 515, "type": "CASH", "label": "Paid in cash to API specification demo"}]
}
```

## User Input Fields Collected But NOT Used in Rezdy

### 1. Session Data Not Transmitted
**Location**: `lib/utils/booking-transform.ts:19-25`
```typescript
session: {
  endTime: string;              // ❌ Not sent - Rezdy only uses startTimeLocal
  bookingOption?: any;          // ❌ Not sent - Internal metadata only
}
```
**Purpose**: Internal session management, not required by Rezdy API.

### 2. Emergency Contact Information
**Location**: `lib/utils/booking-transform.ts:43-44`
```typescript
contact: {
  emergencyContact?: string;    // ❌ Not sent - Could be added to fields array
  emergencyPhone?: string;      // ❌ Not sent - Could be added to fields array
}
```
**Purpose**: Safety information that could be included in Rezdy `fields` array but currently isn't.

### 3. Detailed Pricing Breakdown
**Location**: `lib/utils/booking-transform.ts:49-54`
```typescript
pricing: {
  basePrice: number;            // ❌ Not sent - Only total sent to Rezdy
  sessionPrice: number;         // ❌ Not sent - Only total sent to Rezdy  
  subtotal: number;             // ❌ Not sent - Only total sent to Rezdy
  taxAndFees: number;           // ❌ Not sent - Only total sent to Rezdy
  total: number;                // ✅ Sent as payment amount
}
```
**Purpose**: Internal pricing calculations, detailed breakdown kept for business records.

### 4. Individual Extra Item Pricing
**Location**: `lib/utils/booking-transform.ts:56-62`
```typescript
extras?: Array<{
  price: number;                // ❌ Not sent - Only name/quantity sent
  totalPrice: number;           // ❌ Not sent - Only name/quantity sent
  name: string;                 // ✅ Sent to Rezdy
  quantity: number;             // ✅ Sent to Rezdy
}>
```
**Purpose**: Internal pricing tracking, Rezdy only needs name and quantity.

### 5. Payment Security Information  
**Location**: `lib/utils/booking-transform.ts:63-68`
```typescript
payment?: {
  cardNumber?: string;          // ❌ NEVER sent - Security sensitive
  [key: string]: any;           // ❌ Not sent - Additional payment metadata
  method?: string;              // ✅ Used for type mapping
  type?: "CASH" | "CREDITCARD"; // ✅ Sent to Rezdy
}
```
**Purpose**: Security-sensitive data and internal payment processing metadata.

### 6. Guest Age Information
**Location**: `components/ui/guest-manager.tsx:20`
```typescript
interface GuestInfo {
  age: number;                  // ❌ Not sent - Collected but not transmitted
  type: "ADULT" | "CHILD" | "INFANT"; // ✅ Used for quantities mapping
}
```
**Purpose**: Used internally for guest type classification but individual ages not sent to Rezdy.

### 7. Guest Special Requests (Per-Guest)
**Location**: `components/ui/guest-manager.tsx:22`
```typescript
interface GuestInfo {
  specialRequests?: string;     // ❌ Not collected - Interface exists but form doesn't use
}
```
**Purpose**: Intended for per-guest special requests but currently not implemented in form.

### 8. Certification Fields (Available but Not Collected)
**Location**: `lib/utils/booking-transform.ts:32-35`
```typescript
guests: Array<{
  certificationLevel?: string;  // ❌ Available in Rezdy but not collected in form
  certificationNumber?: string; // ❌ Available in Rezdy but not collected in form  
  certificationAgency?: string; // ❌ Available in Rezdy but not collected in form
  barcode?: string;             // ❌ Available in Rezdy but not collected in form
}>
```
**Purpose**: Could be sent to Rezdy participants but current guest form doesn't collect this data.

## Fields Successfully Mapped to Rezdy

### ✅ Customer Information
- `contact.firstName` → `customer.firstName`
- `contact.lastName` → `customer.lastName`  
- `contact.email` → `customer.email`
- `contact.phone` → `customer.phone`

### ✅ Guest Information
- `guests[].firstName` → `participants[].fields[]`
- `guests[].lastName` → `participants[].fields[]`
- `guestCounts` → `quantities[]`

### ✅ Product & Session
- `product.code` → `items[].productCode`
- `session.startTime` → `items[].startTimeLocal`

### ✅ Special Requirements (Combined)
- `contact.specialRequests` + `contact.dietaryRequirements` + `contact.accessibilityNeeds` → `fields[].value`

### ✅ Payment Information
- `pricing.total` → `payments[].amount`
- `payment.type` → `payments[].type`

## Recommendations

### Optimize Data Collection
1. **Remove unused fields**: Consider removing `age` collection if not needed
2. **Add certification fields**: Implement diving certification collection for relevant tours  
3. **Simplify emergency contact**: Combine emergency contact into single field or add to Rezdy fields

### Enhance Data Utilization
1. **Emergency contacts**: Map to Rezdy `fields` array
2. **Detailed special requests**: Separate dietary/accessibility/special into distinct fields
3. **Per-guest requests**: Implement the existing `specialRequests` interface

### Data Retention Review
1. **Pricing breakdown**: Confirm business need for detailed pricing storage
2. **Session metadata**: Review if `endTime` and `bookingOption` serve legitimate purposes
3. **Payment metadata**: Ensure additional payment fields are necessary for business operations

## Summary

The current system collects **8 categories** of user data that are not transmitted to Rezdy. Most serve legitimate internal purposes (security, pricing calculations, session management), but some opportunities exist to optimize data collection and better utilize existing Rezdy API capabilities.

The exact Rezdy data structure remains unchanged as specified.