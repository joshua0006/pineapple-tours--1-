import { RezdyProduct } from "@/lib/types/rezdy"
import { hasPickupServices, getPickupServiceType, extractPickupLocations } from "./product-utils"

// Test products based on the actual Rezdy data
const testProducts: Partial<RezdyProduct>[] = [
  {
    productCode: "PBMUT0",
    name: "Candice's Rainforest experience 2Hrs - Gourmet Two Course Meal - Door to Door Pickup from the Gold Coast",
    shortDescription: "The most successful people follow their passions and not their paychecks and Candice has definitely found her passion. Let us take you on a surprising experience of the Hinterlands subtropical rainforest. Choose either Lunch or dinner tour",
    productType: "DAYTOUR"
  },
  {
    productCode: "P30VE2",
    name: "$458 Gift Voucher - Two people Full Day Wine Tour including Pickup",
    productType: "GIFT_CARD"
  },
  {
    productCode: "PNYY7C",
    name: "Hop on Hop off Day Pass + Glow Worm Tour - Brisbane Pickup",
    shortDescription: "Glow worms only exist in Australia and New Zealand so come on a fantastic journey with is to meet these small but brightly glowing creatures, Guaranteed sightings and time for morning tea and scenic lookouts throughout the National Park.",
    productType: "DAYTOUR"
  },
  {
    productCode: "PJKCEW",
    name: "Brisbane to Tamborine Mountain Shuttle Service",
    shortDescription: "Choose one way if you would like to Stay in Tamborine Mountain or Unlimited Hop on Hop off with Return Ticket",
    productType: "CUSTOM"
  },
  {
    productCode: "PT1CFA",
    name: "Currumbin Wildlife Sanctuary - Southern Gold Coast - Northern NSW - Hop on Hop off Shuttle",
    shortDescription: "Explore Southern Gold Coast and Northern NSW with our Hop on Hop off Bus! Visit Currumbin Wildlife Sanctuary, Burleigh Heads National Park, Husk Distillery, Tropical Fruit World, and more, Unlimited Hop on Hop off pass to all attractions.",
    productType: "TRANSFER"
  },
  {
    productCode: "REGULAR_TOUR",
    name: "Regular Wine Tasting Tour",
    shortDescription: "A standard wine tasting experience at local vineyards",
    productType: "DAYTOUR"
  }
]

export function testPickupServiceDetection() {
  console.log("Testing Pickup Service Detection:")
  console.log("=====================================")
  
  testProducts.forEach(product => {
    const hasPickup = hasPickupServices(product as RezdyProduct)
    const serviceType = getPickupServiceType(product as RezdyProduct)
    const locations = extractPickupLocations(product as RezdyProduct)
    
    console.log(`\nProduct: ${product.name}`)
    console.log(`Code: ${product.productCode}`)
    console.log(`Has Pickup Services: ${hasPickup}`)
    console.log(`Service Type: ${serviceType}`)
    console.log(`Pickup Locations: ${locations.join(', ') || 'None detected'}`)
    console.log(`Product Type: ${product.productType}`)
    console.log("---")
  })
}

// Expected results:
// PBMUT0 - Should detect door-to-door service, Gold Coast location
// P30VE2 - Should detect pickup service (gift voucher for pickup tour)
// PNYY7C - Should detect designated-points service, Brisbane location
// PJKCEW - Should detect shuttle service, Brisbane and Tamborine Mountain
// PT1CFA - Should detect shuttle service (TRANSFER type)
// REGULAR_TOUR - Should NOT detect pickup services 