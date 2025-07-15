# Rezdy API Structure Notes

## Key Findings

After implementing and testing the 1:1 structure compliance with Rezdy API, here are the key findings:

### 1. Pickup Location Handling

The documentation example shows `pickupLocation` as a separate item in the `items` array:
```json
"items": [
  {
    "productCode": "PWQF1Y",
    "startTimeLocal": "2025-10-01 09:00:00",
    // ... other booking fields
  },
  {
    "pickupLocation": {
      "locationName": "Divers hotel"
    }
  }
]
```

However, the Rezdy API returns error 406 "Invalid booking items, missing product code" when this structure is used.

**Conclusion**: The API requires all items in the `items` array to have a `productCode`. The pickup location might need to be handled differently:
- As a field in the booking item itself
- In the `fields` array at the root level
- Or possibly not supported in the direct booking creation endpoint

### 2. Required Fields

The following fields are absolutely required for successful booking creation:

**Root Level:**
- `resellerReference` - Unique reference for the booking
- `customer` - Customer object with firstName, lastName, email, phone
- `items` - Array of booking items
- `payments` - Array of payment entries

**Each Item:**
- `productCode` - Valid product code
- `startTimeLocal` - Format: "YYYY-MM-DD HH:mm:ss"
- `quantities` - Array with optionLabel and value
- `participants` - Array (can be empty)

**Each Payment:**
- `amount` - Payment amount
- `type` - Either "CASH" or "CREDITCARD"
- `recipient` - Must be "SUPPLIER"
- `label` - Description of payment

### 3. Type Definitions

We've updated the type definitions to support the exact structure:
- `RezdyDirectBookingRequest` - For direct API submission
- `RezdyPickupLocationItem` - For pickup location items (though API doesn't accept them)
- `RezdyBooking` - For transformed bookings from our form data

### 4. Validation

Created separate validation for direct bookings (`validateDirectRezdyBooking`) that validates:
- All required fields are present
- Payment types are valid ("CASH" or "CREDITCARD")
- Quantities have valid values
- All items have productCode

### 5. Test Scripts

Created multiple test scripts to verify the structure:
- `test-direct-booking.js` - Original structure with pickupLocation as item
- `test-direct-booking-alt.js` - Alternative with pickup in fields
- `test-rezdy-minimal.js` - Minimal required fields only

## Recommendations

1. **Pickup Location**: Further investigation needed to determine the correct way to handle pickup locations in direct bookings. Options:
   - Contact Rezdy support for clarification
   - Check if pickup location should be part of the booking item
   - Test with actual API credentials to see accepted formats

2. **Product Codes**: Ensure all product codes used in testing exist in the Rezdy system.

3. **Error Handling**: The current implementation provides good error messages that help identify structure issues.

## Current Status

✅ Type definitions updated for 1:1 structure
✅ Removed transformation logic for direct bookings  
✅ Added proper validation for direct format
✅ Created comprehensive test scripts
⚠️  Pickup location handling needs clarification from Rezdy