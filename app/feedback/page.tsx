import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Star, Heart, ThumbsUp, Users, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "Customer Feedback | Pineapple Tours",
  description: "Share your tour experience with us. Your feedback helps us improve our services and helps other travelers choose the perfect tour.",
}

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "Brisbane, QLD",
    tour: "Gold Coast Hop-On Hop-Off",
    rating: 5,
    comment: "Absolutely fantastic experience! The buses were comfortable, the commentary was informative, and we could explore at our own pace. Highly recommend!",
    date: "2 weeks ago"
  },
  {
    name: "Michael Chen",
    location: "Sydney, NSW",
    tour: "Byron Bay Day Tour",
    rating: 5,
    comment: "Perfect day out! The guide was knowledgeable and friendly, and the scenery was breathtaking. Great value for money.",
    date: "1 month ago"
  },
  {
    name: "Emma Wilson",
    location: "Melbourne, VIC",
    tour: "Sunshine Coast Wine Tour",
    rating: 5,
    comment: "Amazing wine tour with beautiful vineyards and excellent tastings. The small group size made it feel very personal and special.",
    date: "3 weeks ago"
  }
]

const stats = [
  { number: "4.8/5", label: "Average Rating", icon: Star },
  { number: "2,500+", label: "Happy Customers", icon: Users },
  { number: "98%", label: "Recommend Us", icon: ThumbsUp },
  { number: "50+", label: "Awards Won", icon: Award }
]

export default function FeedbackPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHeader
          title="Share Your Experience"
          subtitle="Your feedback is invaluable to us. Help us improve our services and assist other travelers in choosing their perfect tour experience."
          icon={MessageSquare}
          primaryAction={{
            label: "Leave Review",
            icon: Star,
            href: "#feedback-form"
          }}
          secondaryAction={{
            label: "View All Reviews",
            icon: MessageSquare,
            href: "#testimonials"
          }}
        />

        {/* Stats Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-brand-primary mb-4 font-secondary">
                What Our Customers Say
              </h2>
              <p className="text-muted-foreground font-text">
                Join thousands of satisfied customers who have shared their experiences
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="h-6 w-6 text-brand-accent" />
                  </div>
                  <div className="text-2xl font-bold text-brand-primary mb-1 font-primary">{stat.number}</div>
                  <div className="text-sm text-muted-foreground font-text">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feedback Form */}
        <section id="feedback-form" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
                  Leave Your Feedback
                </h2>
                <p className="text-muted-foreground font-text">
                  We'd love to hear about your experience with Pineapple Tours
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-secondary">
                    <Heart className="h-5 w-5 text-brand-accent" />
                    Tell Us About Your Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-secondary">Your Name *</Label>
                      <Input id="name" placeholder="Enter your full name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-secondary">Email Address *</Label>
                      <Input id="email" type="email" placeholder="your@email.com" required />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="font-secondary">Your Location</Label>
                      <Input id="location" placeholder="City, State" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tour" className="font-secondary">Tour Taken</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your tour" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hop-on-hop-off">Hop-On Hop-Off Tours</SelectItem>
                          <SelectItem value="day-tours">Day Tours</SelectItem>
                          <SelectItem value="wine-tours">Wine Tours</SelectItem>
                          <SelectItem value="multiday">Multi-Day Packages</SelectItem>
                          <SelectItem value="charter">Bus Charter</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-secondary">Overall Rating *</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star className="h-8 w-8 text-gray-300 hover:text-yellow-400 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback" className="font-secondary">Your Feedback *</Label>
                    <Textarea 
                      id="feedback" 
                      placeholder="Tell us about your experience - what did you love? What could we improve?"
                      rows={5}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="improvements" className="font-secondary">Suggestions for Improvement</Label>
                    <Textarea 
                      id="improvements" 
                      placeholder="Any suggestions on how we can make your next experience even better?"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-secondary">Would you recommend us to friends?</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your answer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="definitely">Definitely Yes</SelectItem>
                        <SelectItem value="probably">Probably Yes</SelectItem>
                        <SelectItem value="maybe">Maybe</SelectItem>
                        <SelectItem value="probably-not">Probably Not</SelectItem>
                        <SelectItem value="definitely-not">Definitely Not</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="consent" className="rounded" />
                    <Label htmlFor="consent" className="text-sm font-text">
                      I consent to Pineapple Tours using my feedback for marketing purposes and testimonials
                    </Label>
                  </div>

                  <Button className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white">
                    Submit Feedback
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Recent Testimonials */}
        <section id="testimonials" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
                Recent Customer Reviews
              </h2>
              <p className="text-muted-foreground font-text max-w-2xl mx-auto">
                See what our recent customers have to say about their tour experiences
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 font-text italic">
                      "{testimonial.comment}"
                    </p>
                    <div className="border-t pt-4">
                      <div className="font-semibold text-brand-primary font-secondary">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground font-text">
                        {testimonial.location}
                      </div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {testimonial.tour}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {testimonial.date}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button variant="outline" className="border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white">
                View All Reviews
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-brand-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 font-primary">
              Haven't Taken a Tour Yet?
            </h2>
            <p className="text-xl mb-8 opacity-90 font-text max-w-2xl mx-auto">
              Join thousands of satisfied customers and create your own unforgettable memories with Pineapple Tours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-brand-primary hover:bg-gray-100">
                Browse Tours
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-primary">
                Gift Vouchers
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
} 