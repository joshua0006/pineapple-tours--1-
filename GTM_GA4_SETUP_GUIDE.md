# Complete Google Tag Manager & Google Analytics 4 Setup Guide

## Overview
This guide will walk you through setting up Google Analytics 4 (GA4) with Google Tag Manager (GTM) for comprehensive e-commerce tracking on your Pineapple Tours website.

---

## Part 1: Google Analytics 4 Setup

### Step 1: Create Google Analytics 4 Property

1. **Go to Google Analytics**
   - Visit [analytics.google.com](https://analytics.google.com)
   - Sign in with your Google account

2. **Create New Property**
   - Click "Admin" (gear icon) in the bottom left
   - In the "Account" column, select your account or create new one
   - In the "Property" column, click "Create Property"
   - Choose "Web" as the platform

3. **Configure Property Details**
   - **Property name**: "Pineapple Tours"
   - **Reporting time zone**: Australia/Brisbane (or your preference)
   - **Currency**: Australian Dollar (AUD)
   - Click "Next"

4. **Business Information**
   - **Industry category**: Travel
   - **Business size**: Select appropriate size
   - **Business objectives**: Select "Get baseline reports" and "Measure customer engagement"
   - Click "Create"

5. **Accept Terms of Service**
   - Review and accept GA4 Terms of Service
   - Accept Data Processing Amendment if required

6. **Get Your Measurement ID**
   - After creation, you'll see your **GA4 Measurement ID** (format: G-XXXXXXXXXX)
   - **IMPORTANT**: Copy this ID - you'll need it for GTM setup
   - Example: `G-ABC123DEF4`

---

## Part 2: Google Tag Manager Configuration

### Step 1: Access Your GTM Container

1. **Go to Google Tag Manager**
   - Visit [tagmanager.google.com](https://tagmanager.google.com)
   - Sign in with your Google account

2. **Open Your Container**
   - Find container `GTM-PBTCHPXH` (your container ID)
   - Click to open the container workspace

### Step 2: Create GA4 Configuration Tag

1. **Create New Tag**
   - Click "Tags" in the left sidebar
   - Click "New" button
   - Name the tag: "GA4 Configuration"

2. **Configure Tag Type**
   - Click "Tag Configuration"
   - Select "Google Analytics: GA4 Configuration"

3. **Set Measurement ID**
   - In "Measurement ID" field, enter your GA4 ID: `G-XXXXXXXXXX`
   - Leave other settings as default for now

4. **Set Trigger**
   - Click "Triggering"
   - Select "All Pages" (built-in trigger)
   - This ensures GA4 loads on every page

5. **Save the Tag**
   - Click "Save" in the top right

### Step 3: Create E-commerce Event Tags

Now we'll create tags for the three main e-commerce events your website tracks.

#### Tag 1: Begin Checkout Event

1. **Create New Tag**
   - Click "New" in Tags section
   - Name: "GA4 - Begin Checkout"

2. **Configure Tag**
   - Tag Type: "Google Analytics: GA4 Event"
   - Configuration Tag: Select "GA4 Configuration" (created above)
   - Event Name: `begin_checkout`

3. **Add Event Parameters**
   Click "Event Parameters" and add these parameters:
   - Parameter Name: `currency` | Value: `{{Page URL}}`
   - Parameter Name: `value` | Value: `{{GA4 - Ecommerce Value}}`
   - Parameter Name: `items` | Value: `{{GA4 - Ecommerce Items}}`

   **Note**: We'll create these variables in Step 4

4. **Set Trigger** (we'll create this trigger next)
   - Click "Triggering"
   - We'll create "Begin Checkout" trigger in the next section

#### Tag 2: Add Payment Info Event

1. **Create New Tag**
   - Name: "GA4 - Add Payment Info"
   - Tag Type: "Google Analytics: GA4 Event"
   - Configuration Tag: "GA4 Configuration"
   - Event Name: `add_payment_info`

2. **Event Parameters** (same as above):
   - `currency`, `value`, `items`

#### Tag 3: Purchase Event

1. **Create New Tag**
   - Name: "GA4 - Purchase"
   - Tag Type: "Google Analytics: GA4 Event"
   - Configuration Tag: "GA4 Configuration"
   - Event Name: `purchase`

2. **Event Parameters**:
   - `transaction_id` | Value: `{{GA4 - Transaction ID}}`
   - `currency` | Value: `{{GA4 - Currency}}`
   - `value` | Value: `{{GA4 - Ecommerce Value}}`
   - `items` | Value: `{{GA4 - Ecommerce Items}}`

### Step 4: Create Data Layer Variables

These variables will capture data from your website's dataLayer.

1. **Go to Variables**
   - Click "Variables" in left sidebar
   - Scroll to "User-Defined Variables"
   - Click "New"

#### Variable 1: Transaction ID
- **Name**: "GA4 - Transaction ID"
- **Type**: "Data Layer Variable"
- **Data Layer Variable Name**: `ecommerce.transaction_id`

#### Variable 2: Currency
- **Name**: "GA4 - Currency"
- **Type**: "Data Layer Variable"
- **Data Layer Variable Name**: `ecommerce.currency`

#### Variable 3: Ecommerce Value
- **Name**: "GA4 - Ecommerce Value"
- **Type**: "Data Layer Variable"
- **Data Layer Variable Name**: `ecommerce.value`

#### Variable 4: Ecommerce Items
- **Name**: "GA4 - Ecommerce Items"
- **Type**: "Data Layer Variable"
- **Data Layer Variable Name**: `ecommerce.items`

### Step 5: Create Custom Event Triggers

Now create triggers that will fire the tags when specific events occur.

#### Trigger 1: Begin Checkout
1. **Create New Trigger**
   - Click "Triggers" → "New"
   - Name: "Begin Checkout"

2. **Configure Trigger**
   - Trigger Type: "Custom Event"
   - Event name: `begin_checkout`
   - This trigger fires when your website pushes this event to dataLayer

#### Trigger 2: Add Payment Info
1. **Create New Trigger**
   - Name: "Add Payment Info"
   - Trigger Type: "Custom Event"
   - Event name: `add_payment_info`

#### Trigger 3: Purchase
1. **Create New Trigger**
   - Name: "Purchase"
   - Trigger Type: "Custom Event"
   - Event name: `purchase`

### Step 6: Connect Triggers to Tags

Now go back to each tag and assign the appropriate trigger:

1. **GA4 - Begin Checkout** tag → **Begin Checkout** trigger
2. **GA4 - Add Payment Info** tag → **Add Payment Info** trigger  
3. **GA4 - Purchase** tag → **Purchase** trigger

---

## Part 3: Enhanced E-commerce in GA4

### Step 1: Enable Enhanced E-commerce in GA4

1. **Go to GA4 Admin**
   - In your GA4 property, click "Admin" (gear icon)

2. **Navigate to Events**
   - In the Data Display section, click "Events"

3. **Mark Events as Conversions**
   - Find `purchase` event in the list
   - Toggle "Mark as conversion" to ON
   - This tells GA4 that purchases are your key conversion goal

### Step 2: Configure E-commerce Settings

1. **Go to Configure → E-commerce Settings**
   - In GA4 Admin, under Property column
   - Click "Configure" → "E-commerce Settings"

2. **Enable E-commerce**
   - Toggle "Enable e-commerce data collection" to ON
   - This allows GA4 to collect enhanced e-commerce data

### Step 3: Set Up Enhanced Measurement

1. **Go to Data Streams**
   - In GA4 Admin → Property → Data Streams
   - Click on your web data stream

2. **Configure Enhanced Measurement**
   - Scroll to "Enhanced measurement"
   - Ensure these are enabled:
     - Page views ✓
     - Scrolls ✓
     - Outbound clicks ✓
     - Site search ✓
     - Video engagement ✓
     - File downloads ✓

---

## Part 4: Testing Your Setup

### Step 1: GTM Preview Mode

1. **Enter Preview Mode**
   - In GTM, click "Preview" in top right
   - Enter your website URL: `https://pineapple-tours-1.vercel.app`
   - Click "Connect"

2. **Test Begin Checkout**
   - Navigate to a tour booking page
   - Complete the booking form
   - Click "Complete Booking" button
   - In GTM Preview, verify "Begin Checkout" trigger fired

3. **Test Add Payment Info**
   - Continue to payment page
   - Fill in payment details and submit
   - Verify "Add Payment Info" trigger fired

4. **Test Purchase**
   - Complete a test booking (use Stripe test mode)
   - Reach confirmation page
   - Verify "Purchase" trigger fired with transaction data

### Step 2: GA4 Real-time Reports

1. **Open GA4 Real-time**
   - In GA4, go to Reports → Real-time
   - Keep this open while testing

2. **Verify Events**
   - As you test, you should see events appear:
     - `begin_checkout`
     - `add_payment_info`
     - `purchase`

3. **Check Event Parameters**
   - Click on each event to see parameters
   - Verify currency, value, and item data is captured

---

## Part 5: Publish and Go Live

### Step 1: Publish GTM Container

1. **Submit Changes**
   - In GTM, click "Submit" in top right
   - Add version name: "E-commerce Tracking Setup"
   - Add description: "Added GA4 tags for begin_checkout, add_payment_info, and purchase events"
   - Click "Publish"

### Step 2: Verify Live Site

1. **Check Live Website**
   - Visit your live site: `https://pineapple-tours-1.vercel.app`
   - Open browser Developer Tools → Network tab
   - Look for requests to `google-analytics.com` and `googletagmanager.com`

2. **Use Google Tag Assistant**
   - Install [Google Tag Assistant Chrome extension](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
   - Visit your site and click the extension
   - Verify GA4 and GTM tags are loading

---

## Part 6: Monitoring and Optimization

### Key Reports to Monitor

1. **GA4 Conversions Report**
   - Reports → Engagement → Conversions
   - Monitor purchase conversion rate

2. **E-commerce Overview**
   - Reports → Monetization → E-commerce purchases
   - Track revenue, transactions, average order value

3. **Purchase Journey Funnel**
   - Reports → Engagement → Events
   - Compare event volumes: page_view → begin_checkout → add_payment_info → purchase

### Setting Up Goals and Audiences

1. **Create Custom Audiences**
   - Configure → Audiences → New audience
   - Create audiences for:
     - Users who began checkout but didn't purchase
     - High-value customers (purchase value > $200)
     - Repeat customers

2. **Set Up Attribution**
   - Admin → Attribution Settings
   - Configure attribution models for marketing channel analysis

---

## Troubleshooting Common Issues

### Issue 1: Events Not Firing
**Symptoms**: No events showing in GTM Preview or GA4
**Solutions**:
- Check GTM Preview console for JavaScript errors
- Verify trigger event names match exactly: `begin_checkout`, `add_payment_info`, `purchase`
- Ensure dataLayer variables are being populated by your website

### Issue 2: Missing E-commerce Data
**Symptoms**: Events fire but no transaction/item data
**Solutions**:
- Verify dataLayer structure matches expected format
- Check that `ecommerce` object contains `items` array
- Ensure currency and value are numeric (not strings)

### Issue 3: GA4 Not Receiving Data
**Symptoms**: GTM shows events firing but GA4 doesn't show them
**Solutions**:
- Verify GA4 Measurement ID is correct in GTM Configuration tag
- Check GA4 real-time reports (data appears within minutes)
- Ensure "All Pages" trigger is firing for GA4 Configuration tag

### Issue 4: Duplicate Events
**Symptoms**: Same event firing multiple times
**Solutions**:
- Check if multiple triggers are configured for same event
- Verify website code isn't pushing events multiple times
- Use GTM built-in variables to deduplicate if needed

---

## Summary Checklist

**GTM Setup**:
- [ ] GA4 Configuration tag created and firing on all pages
- [ ] 3 e-commerce event tags created (begin_checkout, add_payment_info, purchase)
- [ ] 4 dataLayer variables created for e-commerce data
- [ ] 3 custom event triggers created
- [ ] All tags connected to appropriate triggers
- [ ] GTM container published

**GA4 Setup**:
- [ ] GA4 property created for Pineapple Tours
- [ ] E-commerce data collection enabled
- [ ] Purchase event marked as conversion
- [ ] Enhanced measurement configured

**Testing**:
- [ ] GTM Preview mode tested for all 3 events
- [ ] GA4 real-time reports showing events
- [ ] E-commerce parameters populated correctly
- [ ] Live site verification completed

**Monitoring**:
- [ ] Conversion reports configured
- [ ] E-commerce overview dashboard set up
- [ ] Custom audiences created for remarketing

Your GTM and GA4 setup is now complete and ready to track comprehensive e-commerce data for your Pineapple Tours business!