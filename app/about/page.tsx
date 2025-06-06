"use client"

import Image from "next/image"
import { MapPin, Users, Award, Heart, Globe, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "Founder & CEO",
    image: "/placeholder-user.jpg",
    bio: "With over 15 years in the travel industry, Sarah founded Pineapple Tours to share her passion for tropical tours."
  },
  {
    name: "Marcus Rodriguez",
    role: "Head of Operations",
    image: "/placeholder-user.jpg",
    bio: "Marcus ensures every tour runs smoothly with his expertise in logistics and customer service excellence."
  },
  {
    name: "Emily Chen",
    role: "Travel Experience Designer",
    image: "/placeholder-user.jpg",
    bio: "Emily crafts unique itineraries that showcase the best of each tour while respecting local cultures."
  },
  {
    name: "David Thompson",
    role: "Local Partnerships Manager",
    image: "/placeholder-user.jpg",
    bio: "David builds relationships with local communities to ensure authentic and sustainable travel experiences."
  }
]

const values = [
  {
    icon: Heart,
    title: "Passion",
    description: "We're genuinely passionate about tropical tours and sharing their beauty with our guests."
  },
  {
    icon: Users,
    title: "Community Focus",
    description: "We work closely with local communities to ensure our tours benefit everyone involved."
  },
  {
    icon: Globe,
    title: "Sustainability",
    description: "We're committed to responsible tourism that preserves the natural beauty of our tours."
  },
  {
    icon: Star,
    title: "Exceptional Service",
    description: "Every detail is carefully planned to exceed your expectations and create lasting memories."
  }
]

const stats = [
          { number: "50,000+", label: "Happy Participants" },
  { number: "15+", label: "Years Experience" },
  { number: "25+", label: "Tours" },
  { number: "98%", label: "Customer Satisfaction" }
]

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted py-16">
          <div className="container">
            <div className="max-w-3xl">
              <Badge className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90 mb-4">About Us</Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Your Gateway to Paradise
              </h1>
              <p className="mt-4 text-xl text-muted-foreground">
                For over 15 years, Pineapple Tours has been creating unforgettable tropical vacation experiences, 
                connecting participants with the world's most beautiful tours.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="container py-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Pineapple Tours was born from a simple dream: to share the magic of tropical paradises with fellow 
                  participants. Founded in 2009 by Sarah Johnson after her life-changing trip to Hawaii, our company 
                  started as a small operation focused on authentic, personalized experiences.
                </p>
                <p>
                  What began as weekend tours for friends and family has grown into a trusted travel partner for 
                  thousands of adventurers seeking genuine connections with tropical tours. We've expanded 
                  our reach across the Pacific and Caribbean while maintaining our commitment to quality, 
                  sustainability, and authentic cultural experiences.
                </p>
                <p>
                  Today, we're proud to work with local communities, support conservation efforts, and create 
                  memories that last a lifetime. Every tour we offer reflects our passion for these incredible 
                  tours and our dedication to responsible travel.
                </p>
              </div>
            </div>
            <div className="relative aspect-square lg:aspect-[4/3]">
              <Image
                src="/placeholder.jpg"
                alt="Pineapple Tours team on a tropical beach"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-muted py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Our Impact</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These numbers represent more than statistics—they represent dreams fulfilled, 
                connections made, and memories created.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-brand-accent mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do, from planning your itinerary to 
              supporting local communities.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-brand-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-brand-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="bg-muted py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Meet Our Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our passionate team of travel experts is dedicated to creating extraordinary 
                experiences for every guest.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                    <p className="text-brand-accent font-medium text-sm mb-3">{member.role}</p>
                    <p className="text-muted-foreground text-sm">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="container py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-6">Our Mission</h2>
            <blockquote className="text-xl text-muted-foreground italic mb-8">
              "To create transformative travel experiences that connect people with the natural beauty 
              and rich cultures of tropical tours, while supporting local communities and 
              preserving these paradises for future generations."
            </blockquote>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button>
                Start Your Journey
              </Button>
              <Button variant="outline">
                View Our Tours
              </Button>
            </div>
          </div>
        </section>

        {/* Awards & Recognition */}
        <section className="bg-muted py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Awards & Recognition</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're honored to be recognized for our commitment to excellence and sustainable tourism.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Award className="h-12 w-12 text-brand-accent mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Best Tour Operator 2023</h3>
                  <p className="text-muted-foreground text-sm">Travel Excellence Awards</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Award className="h-12 w-12 text-brand-accent mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sustainable Tourism Leader</h3>
                  <p className="text-muted-foreground text-sm">Green Travel Association</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Award className="h-12 w-12 text-brand-accent mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Customer Choice Award</h3>
                  <p className="text-muted-foreground text-sm">TripAdvisor Participants' Choice</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
} 