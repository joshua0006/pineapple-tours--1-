import { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Utensils,
  AlertTriangle,
  Heart,
  Shield,
  Phone,
  Mail,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Allergies and Dietary Requirements | Pineapple Tours",
  description:
    "Learn about our allergy management and dietary accommodation policies. We're committed to ensuring safe and enjoyable tours for guests with special dietary needs.",
};

const commonAllergies = [
  { name: "Nuts & Tree Nuts", severity: "High Risk", color: "red" },
  { name: "Shellfish", severity: "High Risk", color: "red" },
  { name: "Dairy/Lactose", severity: "Moderate", color: "yellow" },
  { name: "Gluten/Wheat", severity: "Moderate", color: "yellow" },
  { name: "Eggs", severity: "Moderate", color: "yellow" },
  { name: "Soy", severity: "Low Risk", color: "green" },
  { name: "Fish", severity: "Moderate", color: "yellow" },
  { name: "Sesame", severity: "Moderate", color: "yellow" },
];

const dietaryOptions = [
  {
    title: "Vegetarian",
    description: "Plant-based meals with dairy and eggs",
    availability: "Widely Available",
    icon: "🥗",
  },
  {
    title: "Vegan",
    description: "Completely plant-based with no animal products",
    availability: "Available with Notice",
    icon: "🌱",
  },
  {
    title: "Gluten-Free",
    description: "Meals free from wheat, barley, rye, and oats",
    availability: "Available with Notice",
    icon: "🌾",
  },
  {
    title: "Halal",
    description: "Meals prepared according to Islamic dietary laws",
    availability: "Available at Select Venues",
    icon: "🕌",
  },
  {
    title: "Kosher",
    description: "Meals prepared according to Jewish dietary laws",
    availability: "Limited Availability",
    icon: "✡️",
  },
  {
    title: "Low Sodium",
    description: "Reduced salt content for health requirements",
    availability: "Available with Notice",
    icon: "🧂",
  },
];

const safetyMeasures = [
  {
    title: "Pre-Tour Communication",
    description:
      "We discuss all dietary requirements and allergies during booking confirmation",
    icon: Phone,
  },
  {
    title: "Venue Coordination",
    description:
      "We work directly with restaurants and venues to ensure proper meal preparation",
    icon: Utensils,
  },
  {
    title: "Staff Training",
    description:
      "Our guides are trained in allergy awareness and emergency procedures",
    icon: Shield,
  },
  {
    title: "Emergency Preparedness",
    description:
      "Guides carry emergency contact information and know nearest medical facilities",
    icon: Heart,
  },
];

export default function AllergiesDietaryPage() {
  return (
    <>
      <PageHeader
        title="Allergies & Dietary Requirements"
        subtitle="Your safety and comfort are our top priorities. We work hard to accommodate dietary requirements and manage allergies to ensure everyone can enjoy our tours safely."
        icon={Utensils}
        primaryAction={{
          label: "Discuss Requirements",
          icon: Phone,
          href: "tel:0466331232",
        }}
        secondaryAction={{
          label: "Email Details",
          icon: Mail,
          href: "mailto:dietary@pineappletours.com.au",
        }}
      />

      {/* Important Notice */}
      <section className="py-8 bg-red-50">
        <div className="container mx-auto px-4">
          <Alert className="max-w-4xl mx-auto border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-text">
              <strong>Important:</strong> Please inform us of all allergies and
              dietary requirements at the time of booking. While we make every
              effort to accommodate special needs, we cannot guarantee a
              completely allergen-free environment. Guests with severe allergies
              should carry appropriate medication and inform our guide before
              the tour begins.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-primary mb-6 font-secondary">
              Our Commitment to Safe Dining
            </h2>
            <p className="text-lg text-muted-foreground font-text leading-relaxed">
              We understand that food allergies and dietary requirements are
              serious matters that can significantly impact your tour
              experience. Our team is committed to working with you and our
              venue partners to ensure safe, enjoyable meals throughout your
              journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {safetyMeasures.map((measure, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <measure.icon className="h-6 w-6 text-brand-accent" />
                  </div>
                  <h3 className="font-semibold mb-3 font-secondary">
                    {measure.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-text">
                    {measure.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Common Allergies */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
              Common Allergies We Accommodate
            </h2>
            <p className="text-muted-foreground font-text max-w-2xl mx-auto">
              We have experience managing these common food allergies and work
              with venues to ensure safe meal options
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {commonAllergies.map((allergy, index) => (
              <Card
                key={index}
                className={`text-center border-l-4 ${
                  allergy.color === "red"
                    ? "border-l-red-500"
                    : allergy.color === "yellow"
                    ? "border-l-yellow-500"
                    : "border-l-green-500"
                }`}
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 font-secondary">
                    {allergy.name}
                  </h3>
                  <Badge
                    variant={
                      allergy.color === "red"
                        ? "destructive"
                        : allergy.color === "yellow"
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {allergy.severity}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dietary Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
              Dietary Requirements We Support
            </h2>
            <p className="text-muted-foreground font-text max-w-2xl mx-auto">
              We work with venues to provide appropriate meal options for
              various dietary preferences and requirements
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {dietaryOptions.map((option, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-secondary">
                    <span className="text-2xl">{option.icon}</span>
                    {option.title}
                  </CardTitle>
                  <Badge variant="outline" className="w-fit">
                    {option.availability}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-text">
                    {option.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Process */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
              How to Inform Us of Your Requirements
            </h2>
            <p className="text-muted-foreground font-text max-w-2xl mx-auto">
              Follow these steps to ensure your dietary needs are properly
              accommodated
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2 font-secondary">
                At Booking
              </h3>
              <p className="text-sm text-muted-foreground font-text">
                Mention all allergies and dietary requirements when making your
                reservation
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2 font-secondary">
                Provide Details
              </h3>
              <p className="text-sm text-muted-foreground font-text">
                Give specific information about severity, cross-contamination
                concerns, and safe alternatives
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2 font-secondary">
                Confirmation Call
              </h3>
              <p className="text-sm text-muted-foreground font-text">
                We'll call to confirm arrangements and discuss any venue
                limitations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2 font-secondary">
                Tour Day
              </h3>
              <p className="text-sm text-muted-foreground font-text">
                Remind your guide of requirements and carry any necessary
                medication
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Important Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-primary mb-8 font-secondary">
              Important Information
            </h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-secondary">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    What We Can Do
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 font-text">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                      Work with venues to provide suitable meal alternatives
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                      Arrange for meals to be prepared separately when possible
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                      Provide detailed ingredient information from venues
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                      Identify alternative dining options if needed
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                      Carry emergency contact information for medical facilities
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-secondary">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Limitations & Responsibilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 font-text">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                      We cannot guarantee completely allergen-free environments
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                      Cross-contamination may occur in commercial kitchens
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                      Some venues may have limited dietary options available
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                      Guests must carry their own emergency medication (EpiPens,
                      etc.)
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                      Final responsibility for food safety decisions rests with
                      the guest
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-brand-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-primary">
            Have Specific Dietary Requirements?
          </h2>
          <p className="text-xl mb-8 opacity-90 font-text max-w-2xl mx-auto">
            Contact our team to discuss your specific needs. We're here to help
            ensure you have a safe and enjoyable tour experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-brand-primary hover:bg-gray-100"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call 0466 331 232
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-brand-primary"
            >
              <Mail className="mr-2 h-5 w-5" />
              Email Dietary Team
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
