import { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Heart,
  CheckCircle,
  Phone,
  Mail,
  CreditCard,
  MapPin,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Companion Card Accepted | Pineapple Tours",
  description:
    "We proudly accept the Companion Card. Learn how cardholders and their companions can enjoy our tours with special benefits and free companion travel.",
};

const benefits = [
  {
    icon: CreditCard,
    title: "Free Companion Travel",
    description:
      "Essential companions travel free of charge on all our tours when accompanying a Companion Card holder",
  },
  {
    icon: Users,
    title: "Full Tour Experience",
    description:
      "Both cardholder and companion receive the complete tour experience with all inclusions",
  },
  {
    icon: Heart,
    title: "Special Assistance",
    description:
      "Our staff are trained to provide additional assistance and support as needed",
  },
  {
    icon: MapPin,
    title: "Accessible Seating",
    description:
      "Priority seating arrangements to ensure comfort and accessibility for both guests",
  },
];

const eligibleDisabilities = [
  "Intellectual disability",
  "Physical disability requiring assistance",
  "Sensory disability (vision or hearing)",
  "Neurological conditions",
  "Mental health conditions requiring support",
  "Autism spectrum disorders",
  "Acquired brain injury",
  "Multiple disabilities",
];

const howToUse = [
  {
    step: 1,
    title: "Present Your Card",
    description:
      "Show your valid Companion Card when booking online, by phone, or in person",
  },
  {
    step: 2,
    title: "Book for Two",
    description:
      "Make your booking for both yourself and your companion - only pay for one ticket",
  },
  {
    step: 3,
    title: "Bring Your Card",
    description:
      "Bring your Companion Card on the day of your tour for verification",
  },
  {
    step: 4,
    title: "Enjoy Together",
    description: "Both you and your companion enjoy the full tour experience",
  },
];

const faqs = [
  {
    question: "What is the Companion Card?",
    answer:
      "The Companion Card is a national program that provides free companion tickets for people with a disability who require attendant care support to access community venues and activities.",
  },
  {
    question: "Who is eligible for a Companion Card?",
    answer:
      "People with a disability who can demonstrate that they require attendant care support to access community activities due to their disability are eligible to apply for a Companion Card.",
  },
  {
    question: "Do I need to book in advance?",
    answer:
      "While not always required, we recommend booking in advance to ensure availability and to arrange any special accessibility requirements you may have.",
  },
  {
    question: "Can I use my card for multiple tours?",
    answer:
      "Yes, your Companion Card can be used for any of our tours, as many times as you like, as long as the card remains valid.",
  },
  {
    question: "What if my companion changes?",
    answer:
      "That's perfectly fine. The Companion Card allows you to bring different companions on different occasions, as long as they are providing the necessary support.",
  },
  {
    question: "Are there any restrictions?",
    answer:
      "There are no restrictions on which tours you can book. However, some tours may have physical accessibility limitations that we'll discuss with you when booking.",
  },
];

export default function CompanionCardPage() {
  return (
    <div>
      <PageHeader
        title="Companion Card Accepted Here"
        subtitle="We're proud to support the Companion Card program, providing free companion travel for people with disabilities who require attendant care support."
        icon={Users}
        primaryAction={{
          label: "Book with Companion Card",
          icon: Phone,
          href: "tel:0466331232",
        }}
        secondaryAction={{
          label: "Learn More",
          icon: Mail,
          href: "#information",
        }}
      />

      {/* Program Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="w-20 h-20 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-brand-accent" />
            </div>
            <h2 className="text-3xl font-bold text-brand-primary mb-6 font-secondary">
              Supporting Inclusive Tourism
            </h2>
            <p className="text-lg text-muted-foreground font-text leading-relaxed">
              At Pineapple Tours, we believe everyone should have the
              opportunity to explore Queensland's beautiful attractions. That's
              why we proudly accept the Companion Card, ensuring that people
              with disabilities and their essential companions can enjoy our
              tours together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-6 w-6 text-brand-accent" />
                  </div>
                  <h3 className="font-semibold mb-3 font-secondary">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-text">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
              How to Use Your Companion Card
            </h2>
            <p className="text-muted-foreground font-text max-w-2xl mx-auto">
              Using your Companion Card with Pineapple Tours is simple and
              straightforward
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howToUse.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2 font-secondary">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground font-text">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility Information */}
      <section id="information" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
                About the Companion Card Program
              </h2>
              <p className="text-muted-foreground font-text max-w-2xl mx-auto">
                Learn more about eligibility and the purpose of this important
                accessibility program
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-secondary">
                    <CheckCircle className="h-5 w-5 text-brand-accent" />
                    Eligible Disabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 font-text">
                    The Companion Card is available for people with the
                    following types of disabilities who require attendant care
                    support:
                  </p>
                  <ul className="space-y-2">
                    {eligibleDisabilities.map((disability, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm font-text"
                      >
                        <div className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
                        {disability}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-secondary">
                    <Heart className="h-5 w-5 text-brand-accent" />
                    Program Purpose
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground font-text">
                    The Companion Card program recognizes that some people with
                    disabilities require attendant care support to access
                    community activities and venues.
                  </p>
                  <p className="text-muted-foreground font-text">
                    Rather than paying twice for what is essentially one
                    experience, the program provides free companion tickets to
                    ensure equal access to community participation.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 font-text">
                      <strong>Note:</strong> The companion must be providing
                      attendant care support and cannot simply be a friend or
                      family member.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground font-text max-w-2xl mx-auto">
              Common questions about using the Companion Card with Pineapple
              Tours
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 text-brand-primary font-secondary">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground font-text">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Getting a Companion Card */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-brand-primary mb-6 font-secondary">
              Don't Have a Companion Card Yet?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 font-text">
              If you're eligible for a Companion Card but don't have one yet,
              you can apply through your state or territory's program.
            </p>
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-brand-primary font-secondary">
                How to Apply
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div>
                  <h4 className="font-semibold mb-2 font-secondary">
                    1. Check Eligibility
                  </h4>
                  <p className="text-sm text-muted-foreground font-text">
                    Ensure you meet the criteria for requiring attendant care
                    support
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 font-secondary">
                    2. Complete Application
                  </h4>
                  <p className="text-sm text-muted-foreground font-text">
                    Fill out the application form for your state or territory
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 font-secondary">
                    3. Provide Evidence
                  </h4>
                  <p className="text-sm text-muted-foreground font-text">
                    Submit required documentation from healthcare professionals
                  </p>
                </div>
              </div>
              <Button
                className="mt-6 bg-brand-accent hover:bg-brand-accent/90 text-white"
                asChild
              >
                <a
                  href="https://companioncard.gov.au"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Companion Card Website
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brand-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-primary">
            Ready to Book Your Tour?
          </h2>
          <p className="text-xl mb-8 opacity-90 font-text max-w-2xl mx-auto">
            Use your Companion Card to enjoy Queensland's best attractions with
            your essential companion. Contact us to book your accessible tour
            experience today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-brand-primary hover:bg-gray-100"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call to Book
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-brand-primary"
            >
              <Mail className="mr-2 h-5 w-5" />
              Email Enquiry
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
