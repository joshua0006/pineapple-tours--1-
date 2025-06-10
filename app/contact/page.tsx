"use client"

import { useState } from "react"
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Facebook, Instagram, Youtube } from "lucide-react"

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
    icon: Phone,
    title: "Call Us",
    details: [
      "0466 331 232",
      "Available 24/7"
    ]
  },
  {
    icon: Mail,
    title: "Email Us",
    details: [
      "bookings@pineappletours.com.au"
    ]
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: [
      "Monday - Friday: 8AM - 8PM",
      "Saturday: 9AM - 6PM",
      "Sunday: 10AM - 4PM"
    ]
  }
]

const socialLinks = [
  {
    icon: Facebook,
    name: "Facebook",
    url: "https://www.facebook.com/pineappletoursAU/?_rdc=1&_rdr#",
    ariaLabel: "Visit our Facebook page"
  },
  {
    icon: Instagram,
    name: "Instagram", 
    url: "https://www.instagram.com/pineappletours.com.au/",
    ariaLabel: "Visit our Instagram page"
  },
  {
    icon: Youtube,
    name: "YouTube",
    url: "https://www.youtube.com/channel/UCAvl12VYyJ06rru5nQc0QbQ/featured",
    ariaLabel: "Visit our YouTube channel"
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
      subject: "",
      message: ""
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white py-20">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center">
              <h1 
                className="text-[58px] leading-tight font-semibold mb-6"
                style={{ 
                  fontFamily: 'Barlow, sans-serif', 
                  fontWeight: 600,
                  color: '#0B2000'
                }}
              >
                Contact Us
              </h1>
              <p 
                className="text-lg max-w-2xl mx-auto"
                style={{ 
                  fontFamily: 'Work Sans, sans-serif', 
                  fontWeight: 400,
                  fontSize: '18px',
                  color: '#0B2000'
                }}
              >
                Ready to explore paradise? Our travel experts are here to help you create the tropical 
                vacation of your dreams. Get in touch today!
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="bg-white py-16">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3 mb-12">
              {contactInfo.map((info, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: '#FF585D' }}
                  >
                    <info.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 
                    className="text-xl font-semibold mb-3"
                    style={{ 
                      fontFamily: 'Open Sans, sans-serif', 
                      fontWeight: 400,
                      color: '#0B2000'
                    }}
                  >
                    {info.title}
                  </h3>
                  <div className="space-y-1">
                    {info.details.map((detail, detailIndex) => (
                      <p 
                        key={detailIndex} 
                        style={{ 
                          fontFamily: 'Work Sans, sans-serif', 
                          fontWeight: 400,
                          fontSize: '18px',
                          color: '#0B2000'
                        }}
                      >
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Social Media Links */}
            <div className="text-center">
              <h3 
                className="text-xl font-semibold mb-6"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif', 
                  fontWeight: 400,
                  color: '#0B2000'
                }}
              >
                Follow Us
              </h3>
              <div className="flex justify-center gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.ariaLabel}
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                    style={{ backgroundColor: '#404040' }}
                  >
                    <social.icon className="h-6 w-6 text-white" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section 
          className="py-20"
          style={{ backgroundColor: '#141312' }}
        >
          <div className="container max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 
                className="text-4xl font-bold mb-4"
                style={{ 
                  fontFamily: 'Barlow, sans-serif', 
                  fontWeight: 600,
                  color: '#FFFFFF'
                }}
              >
                Send Us a Message
              </h2>
              <p 
                style={{ 
                  fontFamily: 'Work Sans, sans-serif', 
                  fontWeight: 400,
                  fontSize: '18px',
                  color: '#FFFFFF'
                }}
              >
                Have questions about our tours? We'd love to hear from you!
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label 
                      htmlFor="name"
                      style={{ 
                        fontFamily: 'Work Sans, sans-serif', 
                        fontWeight: 400,
                        fontSize: '18px',
                        color: '#FFFFFF'
                      }}
                    >
                      Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Your full name"
                      className="bg-white border-0 text-[#0B2000] placeholder:text-gray-500 focus:ring-2 focus:ring-[#FF585D] focus:border-transparent"
                      style={{ 
                        fontFamily: 'Work Sans, sans-serif', 
                        fontWeight: 400,
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label 
                      htmlFor="email"
                      style={{ 
                        fontFamily: 'Work Sans, sans-serif', 
                        fontWeight: 400,
                        fontSize: '18px',
                        color: '#FFFFFF'
                      }}
                    >
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your@email.com"
                      className="bg-white border-0 text-[#0B2000] placeholder:text-gray-500 focus:ring-2 focus:ring-[#FF585D] focus:border-transparent"
                      style={{ 
                        fontFamily: 'Work Sans, sans-serif', 
                        fontWeight: 400,
                        fontSize: '16px'
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label 
                    htmlFor="subject"
                    style={{ 
                      fontFamily: 'Work Sans, sans-serif', 
                      fontWeight: 400,
                      fontSize: '18px',
                      color: '#FFFFFF'
                    }}
                  >
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="How can we help?"
                    className="bg-white border-0 text-[#0B2000] placeholder:text-gray-500 focus:ring-2 focus:ring-[#FF585D] focus:border-transparent"
                    style={{ 
                      fontFamily: 'Work Sans, sans-serif', 
                      fontWeight: 400,
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label 
                    htmlFor="message"
                    style={{ 
                      fontFamily: 'Work Sans, sans-serif', 
                      fontWeight: 400,
                      fontSize: '18px',
                      color: '#FFFFFF'
                    }}
                  >
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="Tell us about your dream vacation..."
                    rows={6}
                    className="bg-white border-0 text-[#0B2000] placeholder:text-gray-500 focus:ring-2 focus:ring-[#FF585D] focus:border-transparent resize-none"
                    style={{ 
                      fontFamily: 'Work Sans, sans-serif', 
                      fontWeight: 400,
                      fontSize: '16px'
                    }}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-4 text-white font-semibold text-lg transition-colors hover:opacity-90 focus:ring-2 focus:ring-[#FF585D] focus:ring-offset-2 focus:ring-offset-[#141312]"
                  style={{ 
                    backgroundColor: '#FF585D',
                    fontFamily: 'Work Sans, sans-serif', 
                    fontWeight: 400,
                    fontSize: '18px'
                  }}
                >
                  <Send className="mr-2 h-5 w-5" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-white py-20">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 
              className="text-4xl font-bold mb-4"
              style={{ 
                fontFamily: 'Barlow, sans-serif', 
                fontWeight: 600,
                color: '#0B2000'
              }}
            >
              Ready to Start Planning?
            </h2>
            <p 
              className="mb-8 max-w-2xl mx-auto"
              style={{ 
                fontFamily: 'Work Sans, sans-serif', 
                fontWeight: 400,
                fontSize: '18px',
                color: '#0B2000'
              }}
            >
              Our travel experts are standing by to help you create the perfect tropical getaway. 
              Contact us today and let's make your dream vacation a reality!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="text-white font-semibold transition-colors hover:opacity-90"
                style={{ 
                  backgroundColor: '#FF585D',
                  fontFamily: 'Work Sans, sans-serif', 
                  fontWeight: 400,
                  fontSize: '18px'
                }}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call Now: 0466 331 232
              </Button>
              <Button 
                variant="outline" 
                className="border-2 font-semibold transition-colors hover:bg-[#FF585D] hover:text-white hover:border-[#FF585D]"
                style={{ 
                  borderColor: '#FF585D',
                  color: '#FF585D',
                  fontFamily: 'Work Sans, sans-serif', 
                  fontWeight: 400,
                  fontSize: '18px'
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Us
              </Button>
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
      </main>
      <SiteFooter />
    </div>
  )
} 