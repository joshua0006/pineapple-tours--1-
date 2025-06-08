import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, CreditCard, Clock, AlertCircle, Phone, Mail, CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Refund and Exchange Policy | Pineapple Tours",
  description: "Understand our refund and exchange policy. Learn about cancellation timeframes, refund processes, and exchange options for your tour bookings.",
}

const refundTiers = [
  {
    timeframe: "More than 48 hours",
    refundAmount: "100%",
    description: "Full refund with no cancellation fee",
    color: "green"
  },
  {
    timeframe: "24-48 hours",
    refundAmount: "75%",
    description: "75% refund, 25% cancellation fee",
    color: "yellow"
  },
  {
    timeframe: "Less than 24 hours",
    refundAmount: "50%",
    description: "50% refund, 50% cancellation fee",
    color: "orange"
  },
  {
    timeframe: "No show / Same day",
    refundAmount: "0%",
    description: "No refund available",
    color: "red"
  }
]

const exchangeOptions = [
  {
    title: "Date Change",
    description: "Change your tour date to any available date within 12 months",
    fee: "Free (if 48+ hours notice)",
    conditions: ["Subject to availability", "Same tour type", "Price difference may apply"]
  },
  {
    title: "Tour Type Change",
    description: "Switch to a different tour of equal or greater value",
    fee: "$25 processing fee",
    conditions: ["Pay price difference if applicable", "Subject to availability", "Must be used within 12 months"]
  },
  {
    title: "Credit Voucher",
    description: "Convert your booking to a credit voucher for future use",
    fee: "Free",
    conditions: ["Valid for 12 months", "Transferable to others", "Can be used for any tour"]
  }
]

const specialCircumstances = [
  {
    title: "Weather Cancellations",
    description: "Tours cancelled by us due to severe weather receive full refund or free rescheduling",
    icon: AlertCircle
  },
  {
    title: "Medical Emergencies",
    description: "Medical certificates may qualify for full refund regardless of timing",
    icon: CheckCircle
  },
  {
    title: "Force Majeure",
    description: "Events beyond our control (natural disasters, government restrictions) receive full refund",
    icon: AlertCircle
  },
  {
    title: "Vehicle Breakdown",
    description: "Mechanical issues resulting in tour cancellation receive full refund or alternative tour",
    icon: CheckCircle
  }
]

export default function RefundExchangePolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHeader
          title="Refund and Exchange Policy"
          subtitle="Clear and fair policies for cancellations, refunds, and exchanges. We understand that plans can change and strive to be as flexible as possible."
          icon={RefreshCw}
          primaryAction={{
            label: "Request Refund",
            icon: Phone,
            href: "tel:0466331232"
          }}
          secondaryAction={{
            label: "Email Support",
            icon: Mail,
            href: "mailto:refunds@pineappletours.com.au"
          }}
        />

        {/* Policy Overview */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-primary mb-6 font-secondary">
                Our Commitment to Fair Policies
              </h2>
              <p className="text-lg text-muted-foreground font-text leading-relaxed">
                We understand that travel plans can change unexpectedly. Our refund and exchange policy is designed to be 
                fair to both our customers and our business, ensuring we can continue to provide excellent service while 
                accommodating your changing needs.
              </p>
            </div>
          </div>
        </section>

        {/* Refund Tiers */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
                Cancellation Timeframes & Refunds
              </h2>
              <p className="text-muted-foreground font-text max-w-2xl mx-auto">
                Refund amounts depend on how much notice you give us before your tour departure
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {refundTiers.map((tier, index) => (
                <Card key={index} className={`text-center hover:shadow-lg transition-shadow border-l-4 ${
                  tier.color === 'green' ? 'border-l-green-500' :
                  tier.color === 'yellow' ? 'border-l-yellow-500' :
                  tier.color === 'orange' ? 'border-l-orange-500' :
                  'border-l-red-500'
                }`}>
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-brand-primary mb-2 font-primary">
                      {tier.refundAmount}
                    </div>
                    <h3 className="font-semibold mb-2 font-secondary">{tier.timeframe}</h3>
                    <p className="text-sm text-muted-foreground font-text">{tier.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Exchange Options */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
                Exchange Options
              </h2>
              <p className="text-muted-foreground font-text max-w-2xl mx-auto">
                Sometimes changing your booking is better than cancelling. Here are your options
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {exchangeOptions.map((option, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="font-secondary">{option.title}</CardTitle>
                    <Badge variant="outline" className="w-fit">{option.fee}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground font-text">{option.description}</p>
                    <div>
                      <h4 className="font-semibold mb-2 font-secondary">Conditions:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground font-text">
                        {option.conditions.map((condition, conditionIndex) => (
                          <li key={conditionIndex} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
                            {condition}
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

        {/* Special Circumstances */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
                Special Circumstances
              </h2>
              <p className="text-muted-foreground font-text max-w-2xl mx-auto">
                Certain situations may qualify for different refund terms
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {specialCircumstances.map((circumstance, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <circumstance.icon className="h-5 w-5 text-brand-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 font-secondary">{circumstance.title}</h3>
                        <p className="text-muted-foreground font-text">{circumstance.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process Information */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="refund-process" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="refund-process">Refund Process</TabsTrigger>
                  <TabsTrigger value="exchange-process">Exchange Process</TabsTrigger>
                  <TabsTrigger value="important-notes">Important Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="refund-process" className="mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-secondary">
                        <CreditCard className="h-5 w-5 text-brand-accent" />
                        How to Request a Refund
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-brand-accent rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">1</div>
                          <h4 className="font-semibold mb-2 font-secondary">Contact Us</h4>
                          <p className="text-sm text-muted-foreground font-text">Call or email with your booking reference</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-brand-accent rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">2</div>
                          <h4 className="font-semibold mb-2 font-secondary">Provide Details</h4>
                          <p className="text-sm text-muted-foreground font-text">Give reason for cancellation and any supporting documents</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-brand-accent rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">3</div>
                          <h4 className="font-semibold mb-2 font-secondary">Processing</h4>
                          <p className="text-sm text-muted-foreground font-text">We'll process your request within 2 business days</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-brand-accent rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">4</div>
                          <h4 className="font-semibold mb-2 font-secondary">Refund Issued</h4>
                          <p className="text-sm text-muted-foreground font-text">Refund processed to original payment method in 5-10 days</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="exchange-process" className="mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-secondary">
                        <RefreshCw className="h-5 w-5 text-brand-accent" />
                        How to Exchange Your Booking
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-brand-accent text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                          <div>
                            <h4 className="font-semibold font-secondary">Contact Our Team</h4>
                            <p className="text-muted-foreground font-text">Call us at 0466 331 232 or email with your booking reference and preferred changes</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-brand-accent text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                          <div>
                            <h4 className="font-semibold font-secondary">Check Availability</h4>
                            <p className="text-muted-foreground font-text">We'll check availability for your preferred new date or tour type</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-brand-accent text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                          <div>
                            <h4 className="font-semibold font-secondary">Confirm Changes</h4>
                            <p className="text-muted-foreground font-text">Pay any price difference or processing fees, receive new confirmation</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="important-notes" className="mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-secondary">
                        <Clock className="h-5 w-5 text-brand-accent" />
                        Important Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 font-text">
                          <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                          All refund requests must be made by the person who made the original booking
                        </li>
                        <li className="flex items-start gap-3 font-text">
                          <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                          Refunds are processed to the original payment method only
                        </li>
                        <li className="flex items-start gap-3 font-text">
                          <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                          Gift vouchers are non-refundable but can be transferred to another person
                        </li>
                        <li className="flex items-start gap-3 font-text">
                          <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                          Group bookings may have different terms - please check your booking confirmation
                        </li>
                        <li className="flex items-start gap-3 font-text">
                          <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                          Credit card processing fees are non-refundable
                        </li>
                        <li className="flex items-start gap-3 font-text">
                          <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                          Refund timeframes are calculated from tour departure time, not booking time
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-brand-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 font-primary">
              Need to Cancel or Change Your Booking?
            </h2>
            <p className="text-xl mb-8 opacity-90 font-text max-w-2xl mx-auto">
              Our friendly team is here to help you with cancellations, refunds, and exchanges. 
              Contact us as soon as possible for the best options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-brand-primary hover:bg-gray-100">
                <Phone className="mr-2 h-5 w-5" />
                Call 0466 331 232
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-primary">
                <Mail className="mr-2 h-5 w-5" />
                Email Support
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
} 