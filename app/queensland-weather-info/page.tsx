import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cloud, Sun, CloudRain, Thermometer, Umbrella, Shirt, Camera, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Queensland Weather Information | Pineapple Tours",
  description: "Complete guide to Queensland weather patterns, seasonal information, and packing tips to help you plan the perfect tour experience year-round.",
}

const seasons = [
  {
    name: "Summer",
    months: "December - February",
    icon: Sun,
    temperature: "20°C - 30°C",
    rainfall: "High",
    humidity: "High",
    description: "Hot and humid with afternoon thunderstorms. Perfect for beach activities and water tours.",
    highlights: [
      "Beach and water activities at their best",
      "Long daylight hours (6am-7pm)",
      "Tropical fruit season",
      "Festival season on the Gold Coast"
    ],
    packingTips: [
      "Light, breathable clothing",
      "Strong sunscreen (SPF 50+)",
      "Hat and sunglasses",
      "Light rain jacket",
      "Swimwear",
      "Insect repellent"
    ],
    bestTours: [
      "Beach and coastal tours",
      "Island hopping",
      "Water sports activities",
      "Early morning tours"
    ]
  },
  {
    name: "Autumn",
    months: "March - May",
    icon: Cloud,
    temperature: "15°C - 25°C",
    rainfall: "Moderate",
    humidity: "Moderate",
    description: "Mild temperatures with less humidity. Ideal weather for most outdoor activities.",
    highlights: [
      "Perfect touring weather",
      "Clear skies and comfortable temperatures",
      "Harvest season in wine regions",
      "Fewer crowds at popular attractions"
    ],
    packingTips: [
      "Layered clothing",
      "Light jacket for evenings",
      "Comfortable walking shoes",
      "Sunscreen",
      "Light scarf"
    ],
    bestTours: [
      "Wine tours",
      "Hiking and nature walks",
      "City sightseeing",
      "Photography tours"
    ]
  },
  {
    name: "Winter",
    months: "June - August",
    icon: CloudRain,
    temperature: "10°C - 20°C",
    rainfall: "Low",
    humidity: "Low",
    description: "Mild and dry with clear skies. Perfect weather for outdoor exploration.",
    highlights: [
      "Dry season with minimal rainfall",
      "Crystal clear skies",
      "Whale watching season",
      "Comfortable temperatures for walking"
    ],
    packingTips: [
      "Warm layers",
      "Light jacket or sweater",
      "Long pants",
      "Closed-toe shoes",
      "Light scarf",
      "Sunscreen (still important!)"
    ],
    bestTours: [
      "Whale watching tours",
      "Hiking and bushwalking",
      "City tours",
      "Wine country visits"
    ]
  },
  {
    name: "Spring",
    months: "September - November",
    icon: Sun,
    temperature: "15°C - 25°C",
    rainfall: "Moderate",
    humidity: "Moderate",
    description: "Warming up with occasional showers. Beautiful wildflowers and perfect touring conditions.",
    highlights: [
      "Wildflower blooming season",
      "Comfortable temperatures",
      "Less crowded attractions",
      "Perfect for outdoor activities"
    ],
    packingTips: [
      "Light layers",
      "Light rain jacket",
      "Comfortable walking shoes",
      "Sunscreen and hat",
      "Camera for wildflowers"
    ],
    bestTours: [
      "Nature and wildlife tours",
      "Garden and botanical tours",
      "Scenic drives",
      "Photography expeditions"
    ]
  }
]

const regions = [
  {
    name: "Gold Coast",
    climate: "Subtropical",
    bestTime: "April - October",
    features: ["Beach weather year-round", "Theme parks", "Surfing conditions"],
    averageTemp: "21°C"
  },
  {
    name: "Brisbane",
    climate: "Subtropical",
    bestTime: "March - May, September - November",
    features: ["River city climate", "Cultural attractions", "Urban exploring"],
    averageTemp: "20°C"
  },
  {
    name: "Sunshine Coast",
    climate: "Subtropical",
    bestTime: "April - October",
    features: ["Coastal breezes", "Hinterland coolness", "Beach and mountains"],
    averageTemp: "22°C"
  },
  {
    name: "Byron Bay",
    climate: "Subtropical",
    bestTime: "March - May, September - November",
    features: ["Bohemian coastal town", "Lighthouse walks", "Whale watching"],
    averageTemp: "21°C"
  }
]

const weatherTips = [
  {
    icon: Sun,
    title: "Sun Protection",
    description: "Queensland sun is strong year-round. Always wear SPF 50+ sunscreen, hat, and sunglasses."
  },
  {
    icon: CloudRain,
    title: "Rain Preparedness",
    description: "Summer storms can be sudden. Pack a light rain jacket or umbrella for afternoon tours."
  },
  {
    icon: Thermometer,
    title: "Temperature Variations",
    description: "Coastal areas are milder than inland. Mountain regions can be 5-10°C cooler."
  },
  {
    icon: Umbrella,
    title: "Humidity Awareness",
    description: "Summer humidity can be high. Choose breathable fabrics and stay hydrated."
  }
]

export default function QueenslandWeatherPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHeader
          title="Queensland Weather Guide"
          subtitle="Everything you need to know about Queensland's climate to plan your perfect tour experience. From seasonal highlights to packing essentials."
          icon={Sun}
          primaryAction={{
            label: "Plan Your Tour",
            icon: MapPin,
            href: "/tours"
          }}
          secondaryAction={{
            label: "Contact for Advice",
            icon: Cloud,
            href: "/contact"
          }}
        />

        {/* Quick Weather Tips */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-brand-primary mb-4 font-secondary">
                Essential Weather Tips
              </h2>
              <p className="text-muted-foreground font-text">
                Key things to know about Queensland's climate
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {weatherTips.map((tip, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <tip.icon className="h-6 w-6 text-brand-accent" />
                    </div>
                    <h3 className="font-semibold mb-2 font-secondary">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground font-text">{tip.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Seasonal Information */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
                Seasonal Guide
              </h2>
              <p className="text-muted-foreground font-text max-w-2xl mx-auto">
                Discover what each season offers and plan your visit accordingly
              </p>
            </div>

            <Tabs defaultValue="summer" className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                {seasons.map((season) => (
                  <TabsTrigger key={season.name.toLowerCase()} value={season.name.toLowerCase()}>
                    <season.icon className="h-4 w-4 mr-2" />
                    {season.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {seasons.map((season) => (
                <TabsContent key={season.name.toLowerCase()} value={season.name.toLowerCase()}>
                  <div className="grid lg:grid-cols-2 gap-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-secondary">
                          <season.icon className="h-5 w-5 text-brand-accent" />
                          {season.name} ({season.months})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground font-text">{season.description}</p>
                        
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="font-semibold text-brand-primary font-secondary">Temperature</div>
                            <div className="text-sm text-muted-foreground font-text">{season.temperature}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-brand-primary font-secondary">Rainfall</div>
                            <div className="text-sm text-muted-foreground font-text">{season.rainfall}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-brand-primary font-secondary">Humidity</div>
                            <div className="text-sm text-muted-foreground font-text">{season.humidity}</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 font-secondary">Season Highlights</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground font-text">
                            {season.highlights.map((highlight, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 font-secondary">
                            <Shirt className="h-5 w-5 text-brand-accent" />
                            What to Pack
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2">
                            {season.packingTips.map((tip, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tip}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 font-secondary">
                            <Camera className="h-5 w-5 text-brand-accent" />
                            Best Tours This Season
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm text-muted-foreground font-text">
                            {season.bestTours.map((tour, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
                                {tour}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Regional Climate */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
                Regional Climate Guide
              </h2>
              <p className="text-muted-foreground font-text max-w-2xl mx-auto">
                Different regions have unique climate characteristics
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {regions.map((region, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="font-secondary">{region.name}</CardTitle>
                    <Badge variant="outline">{region.climate}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm font-semibold text-brand-primary font-secondary">Best Time to Visit</div>
                      <div className="text-sm text-muted-foreground font-text">{region.bestTime}</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-brand-primary font-secondary">Average Temperature</div>
                      <div className="text-sm text-muted-foreground font-text">{region.averageTemp}</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-brand-primary font-secondary">Features</div>
                      <ul className="text-xs text-muted-foreground space-y-1 font-text">
                        {region.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-brand-accent rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-brand-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 font-primary">
              Ready to Experience Queensland?
            </h2>
            <p className="text-xl mb-8 opacity-90 font-text max-w-2xl mx-auto">
              Now that you know what to expect, it's time to book your perfect Queensland adventure. 
              Our tours operate year-round with weather-appropriate itineraries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-brand-primary hover:bg-gray-100">
                Browse Tours
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-primary">
                Get Weather Updates
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
} 