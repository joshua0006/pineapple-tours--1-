import { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Phone, Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Pineapple Tours",
  description:
    "Find answers to common questions about our tours, bookings, policies, and services. Get the information you need for your perfect tour experience.",
};

const faqCategories = [
  {
    title: "Booking & Reservations",
    icon: "📅",
    faqs: [
      {
        question: "How do I book a tour?",
        answer:
          "You can book a tour online through our website, call us at 0466 331 232, or visit our office. Online booking is available 24/7 and you'll receive instant confirmation.",
      },
      {
        question: "Can I modify or cancel my booking?",
        answer:
          "Yes, you can modify or cancel your booking up to 24 hours before the tour departure time. Please refer to our refund and exchange policy for specific terms and conditions.",
      },
      {
        question: "Do I need to print my ticket?",
        answer:
          "No, you can show your digital ticket on your smartphone. However, we recommend having a backup copy or screenshot in case of connectivity issues.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. Payment is processed securely through our encrypted booking system.",
      },
    ],
  },
  {
    title: "Tour Information",
    icon: "🚌",
    faqs: [
      {
        question: "What should I bring on the tour?",
        answer:
          "Bring comfortable walking shoes, weather-appropriate clothing, sunscreen, a hat, water bottle, and your camera. Specific requirements vary by tour - check your booking confirmation for details.",
      },
      {
        question: "Are tours suitable for children?",
        answer:
          "Most of our tours are family-friendly. Children under 4 travel free when not occupying a seat. Some tours have age restrictions - please check the tour description or contact us for specific requirements.",
      },
      {
        question: "What happens if it rains?",
        answer:
          "Our tours operate rain or shine. We provide weather updates and recommendations. Some indoor alternatives may be available depending on the tour. Refunds are not provided for weather conditions.",
      },
      {
        question: "Are your buses wheelchair accessible?",
        answer:
          "Yes, we have wheelchair accessible vehicles available. Please inform us of accessibility requirements when booking so we can ensure appropriate arrangements are made.",
      },
    ],
  },
  {
    title: "Hop-On Hop-Off",
    icon: "🎫",
    faqs: [
      {
        question: "How long is my hop-on hop-off ticket valid?",
        answer:
          "Your ticket is valid for 24 or 48 hours from first use, depending on the ticket type purchased. You can hop on and off as many times as you like during this period.",
      },
      {
        question: "How often do buses run?",
        answer:
          "Buses run every 15-30 minutes depending on the route and time of day. During peak season, frequency increases to ensure minimal waiting times.",
      },
      {
        question: "Can I start from any stop?",
        answer:
          "Yes, you can board at any designated stop along the route. Your ticket becomes active from the first time you board, regardless of which stop you start from.",
      },
    ],
  },
  {
    title: "Gift Vouchers",
    icon: "🎁",
    faqs: [
      {
        question: "How long are gift vouchers valid?",
        answer:
          "Gift vouchers are valid for 12 months from the date of purchase. They can be used for any tour or experience of equal or lesser value.",
      },
      {
        question: "Can gift vouchers be refunded?",
        answer:
          "Gift vouchers are non-refundable but can be transferred to another person. If the tour costs less than the voucher value, the remaining balance stays on the voucher for future use.",
      },
      {
        question: "How do I redeem a gift voucher?",
        answer:
          "Enter your voucher code during the online booking process or mention it when booking by phone. The voucher value will be deducted from your total booking cost.",
      },
    ],
  },
  {
    title: "Policies & Safety",
    icon: "🛡️",
    faqs: [
      {
        question: "What is your COVID-19 policy?",
        answer:
          "We follow all current health guidelines and maintain enhanced cleaning protocols. Please check our website for the latest health and safety measures before your tour.",
      },
      {
        question: "Do you provide insurance?",
        answer:
          "We carry comprehensive public liability insurance. We recommend travelers have their own travel insurance to cover personal belongings and medical expenses.",
      },
      {
        question: "What if I have dietary requirements?",
        answer:
          "Please inform us of any dietary requirements or allergies when booking. We'll do our best to accommodate your needs, though options may be limited on some tours.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about our tours, bookings, and services. Can't find what you're looking for? Contact our friendly team for personalized assistance."
        icon={HelpCircle}
        primaryAction={{
          label: "Contact Support",
          icon: Phone,
          href: "/contact",
        }}
        secondaryAction={{
          label: "Live Chat",
          icon: MessageCircle,
          href: "#",
        }}
      />

      {/* Quick Contact Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 font-secondary">
              Still Need Help?
            </h2>
            <p className="text-muted-foreground font-text">
              Our support team is here to help you with any questions
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Phone className="h-8 w-8 text-brand-accent mx-auto mb-4" />
                <h3 className="font-semibold mb-2 font-secondary">Call Us</h3>
                <p className="text-sm text-muted-foreground mb-3 font-text">
                  Mon-Fri 8AM-6PM
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="tel:0466331232">0466 331 232</a>
                </Button>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Mail className="h-8 w-8 text-brand-accent mx-auto mb-4" />
                <h3 className="font-semibold mb-2 font-secondary">Email Us</h3>
                <p className="text-sm text-muted-foreground mb-3 font-text">
                  Response within 24hrs
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="mailto:info@pineappletours.com.au">Send Email</a>
                </Button>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <MessageCircle className="h-8 w-8 text-brand-accent mx-auto mb-4" />
                <h3 className="font-semibold mb-2 font-secondary">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-3 font-text">
                  Available 9AM-5PM
                </p>
                <Button variant="outline" size="sm">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{category.icon}</span>
                  <h2 className="text-2xl font-bold text-brand-primary font-secondary">
                    {category.title}
                  </h2>
                </div>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`${categoryIndex}-${faqIndex}`}
                      className="border border-gray-200 rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-left font-medium hover:no-underline font-secondary text-md">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pt-2 font-text">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brand-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-primary">
            Ready to Book Your Adventure?
          </h2>
          <p className="text-xl mb-8 opacity-90 font-text max-w-2xl mx-auto">
            Don't let questions hold you back from experiencing the best tours.
            Our team is here to help you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-brand-primary hover:bg-gray-100"
            >
              Browse Tours
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-brand-primary"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
