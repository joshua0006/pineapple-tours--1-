import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Eye, Lock, UserCheck, Phone, Mail, FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy | Pineapple Tours",
  description: "Learn how we collect, use, and protect your personal information. Our commitment to privacy and data security for all tour bookings and interactions.",
}

const dataTypes = [
  {
    category: "Personal Information",
    icon: UserCheck,
    data: [
      "Name and contact details",
      "Email address and phone number",
      "Billing and payment information",
      "Emergency contact information",
      "Dietary requirements and accessibility needs"
    ]
  },
  {
    category: "Booking Information",
    icon: FileText,
    data: [
      "Tour preferences and selections",
      "Booking dates and times",
      "Group size and composition",
      "Special requests and requirements",
      "Payment history and transaction details"
    ]
  },
  {
    category: "Technical Information",
    icon: Eye,
    data: [
      "IP address and browser type",
      "Website usage and navigation patterns",
      "Device information and operating system",
      "Cookies and tracking preferences",
      "Location data (when permitted)"
    ]
  }
]

const dataUse = [
  {
    purpose: "Tour Operations",
    description: "To provide and manage your tour bookings, communicate important information, and ensure safety",
    legal: "Contract Performance"
  },
  {
    purpose: "Customer Service",
    description: "To respond to inquiries, provide support, and resolve any issues with your booking or experience",
    legal: "Legitimate Interest"
  },
  {
    purpose: "Marketing Communications",
    description: "To send promotional materials, newsletters, and special offers (with your consent)",
    legal: "Consent"
  },
  {
    purpose: "Safety & Security",
    description: "To ensure passenger safety, emergency contact, and comply with legal requirements",
    legal: "Legal Obligation"
  },
  {
    purpose: "Service Improvement",
    description: "To analyze usage patterns, improve our services, and develop new tour offerings",
    legal: "Legitimate Interest"
  }
]

const rights = [
  {
    right: "Access",
    description: "Request a copy of the personal information we hold about you"
  },
  {
    right: "Correction",
    description: "Request correction of inaccurate or incomplete personal information"
  },
  {
    right: "Deletion",
    description: "Request deletion of your personal information (subject to legal requirements)"
  },
  {
    right: "Portability",
    description: "Request transfer of your data to another service provider"
  },
  {
    right: "Restriction",
    description: "Request limitation on how we process your personal information"
  },
  {
    right: "Objection",
    description: "Object to processing based on legitimate interests or for marketing purposes"
  }
]

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHeader
          title="Privacy Policy"
          subtitle="We are committed to protecting your privacy and personal information. This policy explains how we collect, use, and safeguard your data when you use our services."
          icon={Shield}
          primaryAction={{
            label: "Contact Privacy Team",
            icon: Phone,
            href: "tel:0466331232"
          }}
          secondaryAction={{
            label: "Email Privacy Questions",
            icon: Mail,
            href: "mailto:privacy@pineappletours.com.au"
          }}
        />

        {/* Policy Overview */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline" className="mb-4">
                Effective Date: January 1, 2024
              </Badge>
              <p className="text-muted-foreground font-text">
                This privacy policy applies to all personal information collected by Pineapple Tours through our website, 
                booking systems, and tour services. We are committed to transparency and protecting your privacy rights.
              </p>
            </div>
          </div>
        </section>

        {/* Information We Collect */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
                Information We Collect
              </h2>
              <p className="text-muted-foreground font-text max-w-2xl mx-auto">
                We collect different types of information to provide and improve our tour services
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {dataTypes.map((type, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-secondary">
                      <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center">
                        <type.icon className="h-5 w-5 text-brand-accent" />
                      </div>
                      {type.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {type.data.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm font-text">
                          <div className="w-1.5 h-1.5 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
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

        {/* How We Use Information */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
                How We Use Your Information
              </h2>
              <p className="text-muted-foreground font-text max-w-2xl mx-auto">
                We use your personal information for specific purposes with appropriate legal basis
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-6">
              {dataUse.map((use, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-brand-primary font-secondary">{use.purpose}</h3>
                      <Badge variant="outline" className="text-xs">{use.legal}</Badge>
                    </div>
                    <p className="text-muted-foreground font-text">{use.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Data Protection */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
                  How We Protect Your Information
                </h2>
                <p className="text-muted-foreground font-text max-w-2xl mx-auto">
                  We implement comprehensive security measures to protect your personal information
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-secondary">
                      <Lock className="h-5 w-5 text-brand-accent" />
                      Technical Safeguards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 font-text">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                        SSL encryption for all data transmission
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                        Secure payment processing systems
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                        Regular security audits and updates
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                        Firewall and intrusion detection systems
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                        Data backup and recovery procedures
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-secondary">
                      <Shield className="h-5 w-5 text-brand-accent" />
                      Operational Safeguards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 font-text">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                        Staff training on privacy and security
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                        Access controls and user authentication
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                        Regular privacy impact assessments
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                        Incident response procedures
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
                        Third-party vendor security requirements
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-primary mb-4 font-secondary">
                Your Privacy Rights
              </h2>
              <p className="text-muted-foreground font-text max-w-2xl mx-auto">
                You have important rights regarding your personal information
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {rights.map((right, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2 text-brand-primary font-secondary">{right.right}</h3>
                    <p className="text-sm text-muted-foreground font-text">{right.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Policy */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-brand-primary mb-8 font-secondary">
                Detailed Privacy Information
              </h2>
              
              <div className="prose prose-lg max-w-none font-text space-y-8">
                <div>
                  <h3 className="font-secondary">Data Retention</h3>
                  <p>
                    We retain your personal information only as long as necessary for the purposes outlined in this policy. 
                    Booking information is typically retained for 7 years for tax and legal compliance. Marketing preferences 
                    are retained until you withdraw consent.
                  </p>
                </div>

                <div>
                  <h3 className="font-secondary">Third-Party Sharing</h3>
                  <p>
                    We do not sell your personal information. We may share information with trusted service providers who 
                    assist with tour operations, payment processing, and customer service. All third parties are bound by 
                    confidentiality agreements and data protection requirements.
                  </p>
                </div>

                <div>
                  <h3 className="font-secondary">Cookies and Tracking</h3>
                  <p>
                    Our website uses cookies to improve functionality and user experience. You can control cookie preferences 
                    through your browser settings. Essential cookies are necessary for booking functionality and cannot be disabled.
                  </p>
                </div>

                <div>
                  <h3 className="font-secondary">International Transfers</h3>
                  <p>
                    Your information may be processed in countries outside Australia where our service providers operate. 
                    We ensure appropriate safeguards are in place to protect your information during international transfers.
                  </p>
                </div>

                <div>
                  <h3 className="font-secondary">Children's Privacy</h3>
                  <p>
                    We do not knowingly collect personal information from children under 13 without parental consent. 
                    If you believe we have collected information from a child, please contact us immediately.
                  </p>
                </div>

                <div>
                  <h3 className="font-secondary">Policy Updates</h3>
                  <p>
                    We may update this privacy policy periodically. Significant changes will be communicated via email 
                    or website notification. Continued use of our services constitutes acceptance of the updated policy.
                  </p>
                </div>

                <div>
                  <h3 className="font-secondary">Contact Information</h3>
                  <p>
                    For privacy-related questions or to exercise your rights, contact our Privacy Officer:
                    <br />
                    Email: privacy@pineappletours.com.au
                    <br />
                    Phone: 0466 331 232
                    <br />
                    Mail: Privacy Officer, Pineapple Tours, Queensland, Australia
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-brand-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 font-primary">
              Questions About Your Privacy?
            </h2>
            <p className="text-xl mb-8 opacity-90 font-text max-w-2xl mx-auto">
              We're committed to transparency and protecting your privacy rights. 
              Contact us if you have any questions or concerns about how we handle your information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-brand-primary hover:bg-gray-100">
                <Phone className="mr-2 h-5 w-5" />
                Call Privacy Team
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-primary">
                <Mail className="mr-2 h-5 w-5" />
                Email Privacy Officer
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
} 