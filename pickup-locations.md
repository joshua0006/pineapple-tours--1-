# Pickup Locations Data

## Brisbane Pickups

| Time | Location | Address | PickupId | Status | Products |
|------|----------|---------|----------|--------|----------|
| 8:45am | Brisbane Marriott | 1 Howard St Brisbane City | 2114 | ✅ API Verified | 12+ tours |
| 9:00am | Royal on the Park | 152 Alice St, Brisbane City QLD 4000 | 2114 | ✅ API Verified | 12+ tours |
| 9:10am | Emporium Southbank | 267 Grey St, South Brisbane QLD 4101 | 2114 | ✅ API Verified | 12+ tours |
| Door-to-Door | Brisbane Hotels | Various Brisbane locations | 24417 | ✅ API Verified | 20+ tours |

### Potential Addition
- **Star Grand Casino Brisbane** - Under consideration

## Gold Coast Pickups

| Time | Location | Address | PickupId | Status | Products |
|------|----------|---------|----------|--------|----------|
| 8:45am | The Star Casino | 1 Casino Dr, Broadbeach QLD 4218 | 7980 | ✅ API Verified | 8+ tours |
| 9:00am | Voco Gold Coast | 31 Hamilton Ave, Surfers Paradise QLD 4217 | 16529 | ✅ API Verified | 6+ tours |
| 9:10am | JW Marriott | Gold Coast Location | 7959 | ✅ API Verified | 5+ tours |
| 9:15am | Sheraton Grand Mirage | 71 Seaworld Dr, Main Beach QLD 4217 | 7959 | ✅ API Verified | 5+ tours |
| Door-to-Door | Gold Coast Hotels | Various Gold Coast locations | 24418 | ✅ API Verified | 18+ tours |
| Hotel Pickups | Cavill Avenue Area | 63 Cavill Avenue, Surfers Paradise | 5885/5884/5886 | ✅ API Verified | 8+ tours |

## Brisbane City Loop

| Time | Location | Address | PickupId | Status | Products |
|------|----------|---------|----------|--------|----------|
| 8:00am | Southbank | 267 Grey St, South Brisbane | 2114 | ✅ API Verified | 12+ tours |
| 8:10am | Petrie Terrace | Cnr Sexton st and Roma St (Petrie Tce at Windmill Cafe, stop 3) | 2114 | ✅ API Verified | 12+ tours |
| 8:20am | No1 Anzac Square | 295 Ann St, Brisbane City | 2114 | ✅ API Verified | 12+ tours |
| 8:25am | Howard Smith Wharves | 7 Boundary St, Brisbane City | 2114 | ✅ API Verified | 12+ tours |
| 8:30am | Kangaroo Point Cliffs | 66 River Terrace, Kangaroo Point QLD 4169 | 2114 | ✅ API Verified | 12+ tours |

## Special Connections

| Time | Route | Destination | PickupId | Status | Products |
|------|-------|-------------|----------|--------|----------|
| 9:00am | Brisbane Connection | Tamborine Mountain | 11475 | ✅ API Verified | 15+ tours |
| Various | Tamborine Mountain | 139 Long Rd, Tamborine Mountain | 2114/26037 | ✅ API Verified | 6+ tours |

## Filter Categories

### By PickupId
- **2114**: Brisbane Door-to-Door & City Loop (12+ products)
- **24417**: Brisbane Door-to-Door Services (20+ products)
- **24418**: Gold Coast Door-to-Door Services (18+ products)
- **16529**: Voco Gold Coast Area (6+ products)
- **11475**: Tamborine Mountain Services (15+ products)
- **7959**: Gold Coast Best Hotels (5+ products)
- **7980**: Gold Coast Central Hotels (8+ products)
- **5885/5884/5886**: Cavill Avenue Hotels (8+ products)

### By Region
- **BRISBANE** (PickupIds: 2114, 24417): Brisbane Marriott, Royal on the Park, Emporium Southbank, Brisbane City Loop locations
- **GOLD_COAST** (PickupIds: 24418, 16529, 7959, 7980, 5885/5884/5886): The Star Casino, Voco Gold Coast, JW Marriott, Sheraton Grand Mirage
- **TAMBORINE** (PickupIds: 11475, 2114, 26037): Brisbane Connection to Tamborine Mountain

### By Time Slots
- **EARLY** (8:00am - 8:30am): Brisbane City Loop (PickupId 2114)
- **STANDARD** (8:45am - 9:15am): Hotel pickups (Multiple PickupIds)
- **DOOR_TO_DOOR**: Flexible pickup times (PickupIds 24417, 24418)

### Location Types
- **HOTELS**: Brisbane Marriott, Royal on the Park, Voco Gold Coast, JW Marriott, Sheraton Grand Mirage
- **ATTRACTIONS**: The Star Casino, Star Grand Casino Brisbane
- **SHOPPING**: Emporium Southbank
- **CITY_POINTS**: Brisbane City Loop locations
- **TRANSPORT_HUBS**: Howard Smith Wharves, Tamborine Mountain connection

## PickupId Summary

| PickupId | Description | Location Type | Product Count | Primary Use |
|----------|-------------|---------------|---------------|-------------|
| 2114 | Brisbane Door-to-Door & City Loop | Mixed | 12+ | City tours, transfers |
| 24417 | Brisbane Door-to-Door Services | Hotel | 20+ | Major tours |
| 24418 | Gold Coast Door-to-Door Services | Hotel | 18+ | Major tours |
| 16529 | Voco Gold Coast Area | Hotel | 6+ | Premium tours |
| 11475 | Tamborine Mountain Services | Mixed | 15+ | Mountain tours |
| 7959 | Gold Coast Best Hotels | Hotel | 5+ | Premium packages |
| 7980 | Gold Coast Central Hotels | Hotel | 8+ | Standard tours |
| 5885/5884/5886 | Cavill Avenue Hotels | Hotel | 8+ | Beach tours |
| 26037 | Tamborine Mountain Alt | Mountain | 6+ | Alternative routes |
| 29261 | Specialty Services | Various | 4+ | Custom tours |

## API Validation Status
- ✅ **Verified Locations**: All primary pickup locations have been verified against Rezdy API data
- 📍 **Coordinates Available**: GPS coordinates available in API for precise location mapping
- ⏰ **Timing Confirmed**: Pickup times align with operational schedules
- 📞 **Contact Details**: WhatsApp and contact information available in API data
- 🔍 **Product Integration**: PickupIds cross-referenced with 90+ products

## Usage Notes
- **Product Filtering**: Use PickupId values to filter tours by pickup location
- **Total Products**: 90+ products use these pickup locations
- **Peak Usage**: PickupIds 24417 and 24418 serve the most products
- **Arrive 15 minutes early** at all pickup locations
- **WhatsApp confirmation** recommended for all bookings
- **Door-to-door service** available for Brisbane and Gold Coast hotels
- **City Loop** provides comprehensive Brisbane CBD coverage