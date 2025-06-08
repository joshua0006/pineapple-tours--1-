import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Scale, Shield, AlertTriangle, Phone, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms and Conditions | Pineapple Tours",
  description: "Read our terms and conditions for booking and participating in Pineapple Tours. Important information about bookings, cancellations, and tour policies.",
}

const sections = [
  {
    id: "booking",
    title: "Booking and Payment",
    icon: FileText,
    content: [
      "All bookings must be confirmed with full payment or deposit as specified at time of booking.",
      "Prices are subject to change without notice until booking is confirmed and payment received.",
      "We accept major credit cards, PayPal, and bank transfers for payment.",
      "Group bookings may require special terms and deposit arrangements.",
      "Booking confirmation will be sent via email within 24 hours of payment.",
      "It is the customer's responsibility to ensure all booking details are correct."
    ]
  },
  {
    id: "cancellation",
    title: "Cancellation and Refunds",
    icon: AlertTriangle,
    content: [
      "Cancellations must be made at least 24 hours before tour departure for full refund.",
      "Cancellations within 24 hours of departure will incur a 50% cancellation fee.",
      "No-shows or cancellations on the day of departure are non-refundable.",
      "Weather-related cancellations by Pineapple Tours will receive full refund or rescheduling.",
      "Refunds will be processed within 5-10 business days to the original payment method.",
      "Gift vouchers are non-refundable but may be transferred to another person."
    ]
  },
  {
    id: "conduct",
    title: "Passenger Conduct",
    icon: Shield,
    content: [
      "Passengers must follow all safety instructions provided by tour guides and drivers.",
      "Disruptive, dangerous, or inappropriate behavior may result in removal from tour without refund.",
      "Consumption of alcohol is prohibited on vehicles unless specifically included in tour package.",
      "Smoking is prohibited on all vehicles and in designated non-smoking areas.",
      "Passengers are responsible for their personal belongings at all times.",
      "Children must be supervised by accompanying adults at all times."
    ]
  },
  {
    id: "liability",
    title: "Liability and Insurance",
    icon: Scale,
    content: [
      "Pineapple Tours carries comprehensive public liability insurance as required by law.",
      "Passengers participate in tours at their own risk and should have appropriate travel insurance.",
      "We are not liable for loss, damage, or theft of personal belongings.",
      "Medical conditions that may affect tour participation must be disclosed at booking.",
      "Passengers with mobility issues must inform us at booking to ensure appropriate arrangements.",
      "We reserve the right to refuse service to passengers who pose safety risks."
    ]
  }
]

const importantNotes = [
  {
    title: "Age Requirements",
    description: "Children under 4 travel free when not occupying a seat. Some tours have minimum age restrictions."
  },
  {
    title: "Health & Safety",
    description: "Passengers with medical conditions must inform us at booking. First aid is available on tours."
  },
  {
    title: "Weather Policy",
    description: "Tours operate rain or shine. We provide weather updates and may modify itineraries for safety."
  },
  {
    title: "Photography",
    description: "Photos may be taken during tours for promotional purposes. Please inform us if you prefer not to be photographed."
  }
]

export default function TermsAndConditionsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHeader
          title="Terms and Conditions"
          subtitle="Please read these terms and conditions carefully before booking your tour. By making a booking, you agree to be bound by these terms."
          icon={FileText}
          primaryAction={{
            label: "Contact Us",
            icon: Phone,
            href: "tel:0466331232"
          }}
          secondaryAction={{
            label: "Email Questions",
            icon: Mail,
            href: "mailto:info@pineappletours.com.au"
          }}
        />

        {/* Last Updated */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline" className="mb-4">
                Last Updated: January 2024
              </Badge>
              <p className="text-muted-foreground font-text">
                These terms and conditions apply to all bookings made with Pineapple Tours. 
                We reserve the right to update these terms at any time.
              </p>
            </div>
          </div>
        </section>

        {/* Terms Sections */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              {sections.map((section, index) => (
                <Card key={index} id={section.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-secondary">
                      <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center">
                        <section.icon className="h-5 w-5 text-brand-accent" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3 font-text">
                          <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
                  Important Information
                </h2>
                <p className="text-muted-foreground font-text">
                  Additional important details about our tours and policies
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {importantNotes.map((note, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2 text-brand-primary font-secondary">{note.title}</h3>
                      <p className="text-muted-foreground font-text">{note.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Terms */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-brand-primary mb-8 font-secondary">
                Detailed Terms and Conditions
              </h2>
              
              <div className="prose prose-lg max-w-none font-text">
                <h3 className="font-secondary">1. Definitions</h3>
                <p>
                  In these terms and conditions, "Company" refers to Pineapple Tours, "Customer" refers to the person making the booking, 
                  and "Tour" refers to any service provided by the Company including but not limited to sightseeing tours, 
                  hop-on hop-off services, and charter services.
                </p>

                <h3 className="font-secondary">2. Booking Confirmation</h3>
                <p>
                  A booking is only confirmed when payment has been received and a confirmation email has been sent. 
                  The Company reserves the right to decline any booking at its discretion. All bookings are subject to availability.
                </p>

                <h3 className="font-secondary">3. Tour Modifications</h3>
                <p>
                  The Company reserves the right to modify tour itineraries, departure times, or routes due to weather conditions, 
                  road closures, mechanical issues, or other circumstances beyond our control. Where possible, alternative arrangements 
                  will be made or a full refund provided.
                </p>

                <h3 className="font-secondary">4. Force Majeure</h3>
                <p>
                  The Company shall not be liable for any failure to perform its obligations due to circumstances beyond its reasonable control, 
                  including but not limited to natural disasters, government actions, strikes, or other force majeure events.
                </p>

                <h3 className="font-secondary">5. Privacy Policy</h3>
                <p>
                  Personal information collected during booking is used solely for tour administration and customer service. 
                  We do not share personal information with third parties except as required by law or for tour operation purposes.
                </p>

                <h3 className="font-secondary">6. Governing Law</h3>
                <p>
                  These terms and conditions are governed by the laws of Queensland, Australia. Any disputes will be resolved 
                  in the courts of Queensland.
                </p>

                <h3 className="font-secondary">7. Contact Information</h3>
                <p>
                  For questions about these terms and conditions, please contact us at:
                  <br />
                  Phone: 0466 331 232
                  <br />
                  Email: info@pineappletours.com.au
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Agreement Section */}
        <section className="py-16 bg-brand-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 font-primary">
              Agreement to Terms
            </h2>
            <p className="text-xl mb-8 opacity-90 font-text max-w-2xl mx-auto">
              By booking a tour with Pineapple Tours, you acknowledge that you have read, understood, 
              and agree to be bound by these terms and conditions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-brand-primary hover:bg-gray-100">
                Book Your Tour
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-primary">
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
} 