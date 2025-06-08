"use client"

import { useState } from "react"
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Our Office",
    details: [
      "123 Paradise Lane",
      "Honolulu, HI 96815",
      "United States"
    ]
  },
  {
    icon: Phone,
    title: "Call Us",
    details: [
      "0466 331 232",
      "(1-800-746-3277)",
      "Available 24/7"
    ]
  },
  {
    icon: Mail,
    title: "Email Us",
    details: [
      "info@pineappletours.com",
      "bookings@pineappletours.com",
      "support@pineappletours.com"
    ]
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: [
      "Monday - Friday: 8AM - 8PM HST",
      "Saturday: 9AM - 6PM HST",
      "Sunday: 10AM - 4PM HST"
    ]
  }
]

const faqs = [
  {
    question: "How far in advance should I book my tour?",
    answer: "We recommend booking at least 2-4 weeks in advance, especially during peak season (December-April). However, we often have last-minute availability for spontaneous participants."
  },
  {
    question: "What's included in your tour packages?",
    answer: "Our packages typically include transportation, professional guides, entrance fees, and some meals. Specific inclusions vary by tour - check individual tour descriptions for details."
  },
  {
    question: "Do you offer group discounts?",
    answer: "Yes! We offer special rates for groups of 8 or more. Contact us for a custom quote tailored to your group's needs and preferences."
  },
  {
    question: "What's your cancellation policy?",
    answer: "We offer flexible cancellation policies. Most tours can be cancelled up to 48 hours before departure for a full refund. Some specialty tours may have different policies."
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted py-16">
          <div className="container">
            <div className="max-w-3xl">
              <Badge className="bg-coral-500 text-white hover:bg-coral-600 mb-4">Contact Us</Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Let's Plan Your Perfect Getaway
              </h1>
              <p className="mt-4 text-xl text-muted-foreground">
                Ready to explore paradise? Our travel experts are here to help you create the tropical 
                vacation of your dreams. Get in touch today!
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="container py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-brand-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                    <info.icon className="h-6 w-6 text-brand-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{info.title}</h3>
                  <div className="space-y-1">
                    {info.details.map((detail, detailIndex) => (
                      <p key={detailIndex} className="text-muted-foreground text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="container pb-16">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-brand-accent" />
                  Send Us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="How can we help?"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="Tell us about your dream vacation..."
                      rows={6}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-brand-accent text-brand-secondary hover:bg-brand-accent/90">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Map & Additional Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Find Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p>Interactive Map</p>
                      <p className="text-sm">123 Paradise Lane, Honolulu, HI</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Located in the heart of Honolulu, our office is easily accessible by car or public transportation.</p>
                    <p>Free parking is available for visitors.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Response</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-accent rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Email Inquiries</p>
                      <p className="text-sm text-muted-foreground">We respond within 2-4 hours during business hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-accent rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-muted-foreground">Immediate assistance available 24/7</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-accent rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Emergency Support</p>
                      <p className="text-sm text-muted-foreground">24/7 support for participants on active tours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-muted py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find quick answers to common questions about our tours and services.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">
                Don't see your question answered here?
              </p>
              <Button variant="outline">
                View All FAQs
              </Button>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="container py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to Start Planning?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our travel experts are standing by to help you create the perfect tropical getaway. 
              Contact us today and let's make your dream vacation a reality!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button>
                <Phone className="mr-2 h-4 w-4" />
                                    Call Now: 0466 331 232
              </Button>
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Email Us
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
} 