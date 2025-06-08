import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accessibility, Car, Eye, Ear, Heart, Phone, Mail, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Accessibility Services | Pineapple Tours",
  description: "Discover our commitment to accessible tourism. Learn about our wheelchair-accessible vehicles, assistance services, and inclusive tour experiences.",
}

const accessibilityFeatures = [
  {
    icon: Car,
    title: "Wheelchair Accessible Vehicles",
    description: "Our fleet includes wheelchair-accessible buses with hydraulic lifts and secure wheelchair spaces",
    details: [
      "Hydraulic wheelchair lifts on select vehicles",
      "Designated wheelchair spaces with safety restraints",
      "Wide aisles and accessible seating areas",
      "Accessible restroom facilities on longer tours"
    ]
  },
  {
    icon: Eye,
    title: "Visual Accessibility",
    description: "Services and accommodations for guests with visual impairments",
    details: [
      "Audio commentary and detailed verbal descriptions",
      "Large print tour materials available",
      "Guide dog accommodation",
      "Tactile experiences where possible"
    ]
  },
  {
    icon: Ear,
    title: "Hearing Accessibility",
    description: "Support for guests with hearing impairments",
    details: [
      "Hearing loop systems on equipped vehicles",
      "Written tour information and maps",
      "Sign language interpreters (advance booking required)",
      "Visual alerts and information displays"
    ]
  },
  {
    icon: Heart,
    title: "Cognitive & Learning Support",
    description: "Accommodations for various cognitive and learning needs",
    details: [
      "Simplified tour information available",
      "Flexible pacing and rest stops",
      "Quiet spaces on vehicles when possible",
      "Patient and understanding staff training"
    ]
  }
]

const tourAccessibility = [
  {
    category: "Hop-On Hop-Off Tours",
    accessibility: "High",
    features: [
      "Wheelchair accessible buses available",
      "Audio commentary in multiple languages",
      "Flexible boarding at accessible stops",
      "Companion seating arrangements"
    ],
    notes: "Most stops are wheelchair accessible. Some heritage locations may have limited access."
  },
  {
    category: "Day Tours",
    accessibility: "Moderate to High",
    features: [
      "Accessible vehicle options",
      "Modified itineraries available",
      "Assistance with boarding/alighting",
      "Accessible attraction selections"
    ],
    notes: "Accessibility varies by destination. We work to modify tours to meet individual needs."
  },
  {
    category: "Wine Tours",
    accessibility: "Moderate",
    features: [
      "Accessible cellar door selections",
      "Ground-level tasting areas",
      "Assistance with wine tasting",
      "Accessible restroom facilities"
    ],
    notes: "Some wineries have limited accessibility. We select venues with best access options."
  },
  {
    category: "Multi-Day Tours",
    accessibility: "Variable",
    features: [
      "Accessible accommodation options",
      "Modified activity selections",
      "Extended time allowances",
      "Personal assistance coordination"
    ],
    notes: "Requires advance planning. We work closely with guests to ensure suitable arrangements."
  }
]

const bookingProcess = [
  {
    step: 1,
    title: "Contact Us Early",
    description: "Reach out at least 48 hours before your tour to discuss your specific needs"
  },
  {
    step: 2,
    title: "Needs Assessment",
    description: "Our team will discuss your requirements and available accommodations"
  },
  {
    step: 3,
    title: "Tour Customization",
    description: "We'll modify the tour itinerary and arrangements to meet your needs"
  },
  {
    step: 4,
    title: "Confirmation",
    description: "Receive detailed confirmation of all accessibility arrangements"
  }
]

const companionCard = {
  title: "Companion Card Accepted",
  description: "We proudly accept the Companion Card, providing free travel for essential companions of people with disabilities.",
  benefits: [
    "Free companion travel on all tours",
    "No additional booking fees for companions",
    "Assistance with boarding and tour activities",
    "Dedicated seating arrangements"
  ],
  howToUse: [
    "Present your valid Companion Card when booking",
    "Companion travels free of charge",
    "Both cardholder and companion receive full tour experience",
    "Special assistance available upon request"
  ]
}

export default function AccessibilityPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHeader
          title="Accessible Tourism"
          subtitle="We're committed to providing inclusive tour experiences for all guests. Discover our accessibility services and accommodations designed to ensure everyone can enjoy Queensland's beauty."
          icon={Accessibility}
          primaryAction={{
            label: "Book Accessible Tour",
            icon: Phone,
            href: "tel:0466331232"
          }}
          secondaryAction={{
            label: "Accessibility Enquiry",
            icon: Mail,
            href: "mailto:accessibility@pineappletours.com.au"
          }}
        />

        {/* Our Commitment */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-primary mb-6 font-secondary">
                Our Accessibility Commitment
              </h2>
              <p className="text-lg text-muted-foreground font-text leading-relaxed">
                At Pineapple Tours, we believe that everyone deserves to experience the wonder of Queensland's attractions. 
                We're committed to providing accessible tourism experiences that accommodate diverse needs and ensure 
                all our guests can create lasting memories.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {accessibilityFeatures.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-brand-accent" />
                    </div>
                    <h3 className="font-semibold mb-3 font-secondary">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 font-text">{feature.description}</p>
                    <ul className="text-xs text-muted-foreground space-y-1 font-text">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tour Accessibility */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
                Tour Accessibility Guide
              </h2>
              <p className="text-muted-foreground font-text max-w-2xl mx-auto">
                Learn about accessibility features for each type of tour we offer
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {tourAccessibility.map((tour, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="font-secondary">{tour.category}</CardTitle>
                      <Badge 
                        variant={tour.accessibility === "High" ? "default" : tour.accessibility === "Moderate to High" ? "secondary" : "outline"}
                        className={tour.accessibility === "High" ? "bg-green-100 text-green-800" : ""}
                      >
                        {tour.accessibility}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 font-secondary">Accessibility Features:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground font-text">
                        {tour.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800 font-text">
                        <strong>Note:</strong> {tour.notes}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Companion Card */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-brand-accent/20">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-brand-accent" />
                  </div>
                  <CardTitle className="text-2xl font-secondary">{companionCard.title}</CardTitle>
                  <p className="text-muted-foreground font-text">{companionCard.description}</p>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="benefits" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="benefits">Benefits</TabsTrigger>
                      <TabsTrigger value="how-to-use">How to Use</TabsTrigger>
                    </TabsList>
                    <TabsContent value="benefits" className="mt-6">
                      <ul className="space-y-3">
                        {companionCard.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-3 font-text">
                            <div className="w-2 h-2 bg-brand-accent rounded-full" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="how-to-use" className="mt-6">
                      <div className="space-y-4">
                        {companionCard.howToUse.map((step, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-brand-accent text-white rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <p className="text-muted-foreground font-text">{step}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Booking Process */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
                How to Book Accessible Tours
              </h2>
              <p className="text-muted-foreground font-text max-w-2xl mx-auto">
                Follow these simple steps to ensure your accessibility needs are met
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {bookingProcess.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-secondary">{step.title}</h3>
                  <p className="text-sm text-muted-foreground font-text">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-brand-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 font-primary">
              Need Accessibility Assistance?
            </h2>
            <p className="text-xl mb-8 opacity-90 font-text max-w-2xl mx-auto">
              Our accessibility team is here to help you plan the perfect tour experience. 
              Contact us to discuss your specific needs and requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-brand-primary hover:bg-gray-100">
                <Phone className="mr-2 h-5 w-5" />
                Call 0466 331 232
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-primary">
                <Mail className="mr-2 h-5 w-5" />
                Email Accessibility Team
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
} 