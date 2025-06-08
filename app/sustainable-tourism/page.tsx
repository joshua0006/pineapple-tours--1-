import { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Leaf, 
  Recycle, 
  Users, 
  Heart, 
  TreePine, 
  Droplets, 
  Car, 
  Building, 
  Globe,
  Award,
  Target,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Sustainable Tourism | Pineapple Tours",
  description: "Learn about Pineapple Tours' commitment to sustainable tourism practices, environmental conservation, and supporting local communities across Queensland.",
  keywords: "sustainable tourism, eco-friendly tours, environmental conservation, responsible travel, Queensland tourism, carbon neutral, local communities",
}

export default function SustainableTourismPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Sustainable Tourism"
        subtitle="Our commitment to protecting Queensland's natural beauty for future generations"
        icon={Leaf}
        primaryAction={{
          label: "Explore Eco-Friendly Tours",
          href: "/tours"
        }}
      />

      <div className="container py-12 space-y-12">
        {/* Our Commitment */}
        <section>
          <div className="text-center mb-8">
            <h2 className="font-primary text-3xl font-bold text-brand-primary mb-4">
              Our Sustainability Commitment
            </h2>
            <p className="font-text text-lg text-gray-600 max-w-3xl mx-auto">
              At Pineapple Tours, we believe in responsible tourism that preserves Queensland's 
              natural wonders while supporting local communities and creating meaningful experiences 
              for our guests.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <TreePine className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="font-secondary text-xl">Environmental Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-text text-gray-600">
                  Minimizing our environmental impact through eco-friendly practices and 
                  supporting conservation efforts across Queensland.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="font-secondary text-xl">Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-text text-gray-600">
                  Partnering with local businesses and communities to ensure tourism 
                  benefits everyone and preserves cultural heritage.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="font-secondary text-xl">Responsible Travel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-text text-gray-600">
                  Educating travelers about sustainable practices and encouraging 
                  respectful interaction with nature and local cultures.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Sustainability Initiatives */}
        <section>
          <h2 className="font-primary text-3xl font-bold text-brand-primary mb-8 text-center">
            Our Sustainability Initiatives
          </h2>

          <Tabs defaultValue="environmental" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="environmental">Environmental</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="economic">Economic</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
            </TabsList>

            <TabsContent value="environmental" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Car className="h-6 w-6 text-green-600" />
                      <CardTitle className="font-secondary">Carbon Reduction</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Modern, fuel-efficient vehicle fleet</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Route optimization to reduce emissions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Carbon offset programs for tours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Encouraging group travel to reduce individual impact</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Droplets className="h-6 w-6 text-blue-600" />
                      <CardTitle className="font-secondary">Waste Reduction</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Reusable water bottles for guests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Digital ticketing and documentation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Recycling programs on all tours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Partnering with eco-friendly suppliers</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <TreePine className="h-6 w-6 text-green-600" />
                      <CardTitle className="font-secondary">Conservation Support</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Supporting local conservation projects</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Wildlife protection education</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Habitat restoration contributions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Marine conservation partnerships</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Globe className="h-6 w-6 text-blue-600" />
                      <CardTitle className="font-secondary">Sustainable Destinations</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Eco-certified accommodation partners</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Low-impact activity selection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Visitor impact management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Protected area guidelines compliance</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-secondary">Indigenous Culture Respect</CardTitle>
                    <CardDescription>
                      Honoring and supporting Aboriginal and Torres Strait Islander communities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Cultural awareness training for guides</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Supporting Indigenous-owned businesses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Authentic cultural experiences</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Respectful storytelling and education</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-secondary">Community Engagement</CardTitle>
                    <CardDescription>
                      Building positive relationships with local communities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Local guide employment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Community consultation processes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Local charity partnerships</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Educational program support</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="economic" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-secondary">Local Economic Support</CardTitle>
                    <CardDescription>
                      Contributing to Queensland's local economies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Sourcing from local suppliers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Supporting local restaurants and cafes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Promoting local artisans and crafts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Fair wage employment practices</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-secondary">Sustainable Growth</CardTitle>
                    <CardDescription>
                      Balancing business growth with environmental responsibility
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Capacity management to prevent overtourism</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Seasonal distribution of tours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Investment in sustainable infrastructure</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Long-term partnership development</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="operations" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-secondary">Green Operations</CardTitle>
                    <CardDescription>
                      Sustainable practices in our daily operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Renewable energy in offices</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Paperless booking systems</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Sustainable office supplies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Water conservation measures</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-secondary">Staff Training</CardTitle>
                    <CardDescription>
                      Educating our team on sustainable practices
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Sustainability awareness programs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Environmental impact education</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Cultural sensitivity training</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-text text-sm">Continuous improvement workshops</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Certifications and Partnerships */}
        <section>
          <h2 className="font-primary text-3xl font-bold text-brand-primary mb-8 text-center">
            Certifications & Partnerships
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="font-secondary">EarthCheck Certified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-text text-gray-600 text-sm">
                  Recognized for our commitment to sustainable tourism practices and 
                  environmental management.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="font-secondary">Tourism Industry Council</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-text text-gray-600 text-sm">
                  Active member working towards sustainable tourism development 
                  across Queensland.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Recycle className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="font-secondary">Carbon Neutral Certified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-text text-gray-600 text-sm">
                  Offsetting our carbon emissions through verified environmental 
                  projects and renewable energy initiatives.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="font-text text-gray-600 mb-6">
              We're proud to work with leading environmental and community organizations 
              to ensure our tourism practices benefit everyone.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2">
                Queensland Parks & Wildlife
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                Great Barrier Reef Foundation
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                Indigenous Tourism Australia
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                Reef & Rainforest Research Centre
              </Badge>
            </div>
          </div>
        </section>

        {/* Sustainability Goals */}
        <section>
          <h2 className="font-primary text-3xl font-bold text-brand-primary mb-8 text-center">
            Our 2030 Sustainability Goals
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="font-secondary text-lg">Carbon Neutral</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-text text-gray-600 text-sm">
                  Achieve net-zero carbon emissions across all operations by 2030.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Droplets className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="font-secondary text-lg">Zero Waste</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-text text-gray-600 text-sm">
                  Eliminate single-use plastics and achieve zero waste to landfill.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="font-secondary text-lg">Community Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-text text-gray-600 text-sm">
                  Support 100+ local businesses and create 50 new jobs in regional areas.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <TreePine className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="font-secondary text-lg">Conservation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-text text-gray-600 text-sm">
                  Contribute $1M to conservation projects protecting Queensland's ecosystems.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-brand-primary text-white rounded-lg p-8 text-center">
          <h2 className="font-primary text-3xl font-bold mb-4">
            Join Us in Sustainable Tourism
          </h2>
          <p className="font-text text-lg mb-6 max-w-2xl mx-auto">
            Choose Pineapple Tours for your Queensland adventure and be part of our mission 
            to protect and preserve this beautiful state for future generations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-brand-primary hover:bg-gray-100">
              <Link href="/tours">Book Sustainable Tours</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-primary">
              <Link href="/contact">Learn More</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
} 