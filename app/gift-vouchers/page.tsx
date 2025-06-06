"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Gift, Heart, Calendar, Star, CreditCard, Mail, Download, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRezdyProducts } from "@/hooks/use-rezdy"
import { RezdyProduct } from "@/lib/types/rezdy"

export default function GiftVouchersPage() {
  const { data: allProducts, loading, error } = useRezdyProducts()
  const [featuredProducts, setFeaturedProducts] = useState<RezdyProduct[]>([])

  // Get featured products for gift vouchers
  useEffect(() => {
    if (allProducts) {
      // Sort by price and get a variety of products for gift vouchers
      const sorted = [...allProducts]
        .filter(product => product.advertisedPrice && product.advertisedPrice > 0)
        .sort((a, b) => (a.advertisedPrice || 0) - (b.advertisedPrice || 0))
      
      // Get products from different price ranges
      const budget = sorted.filter(p => (p.advertisedPrice || 0) < 100)
      const mid = sorted.filter(p => (p.advertisedPrice || 0) >= 100 && (p.advertisedPrice || 0) < 200)
      const premium = sorted.filter(p => (p.advertisedPrice || 0) >= 200)
      
      const featured = [
        budget[0],
        mid[0] || sorted[Math.floor(sorted.length / 2)],
        premium[0] || sorted[sorted.length - 1]
      ].filter(Boolean)
      
      setFeaturedProducts(featured)
    }
  }, [allProducts])
  const voucherTypes = [
    {
      id: 1,
      name: "Adventure Explorer",
      description: "Perfect for thrill-seekers and adventure enthusiasts",
      value: "$100",
      image: "/api/placeholder/300/200",
      features: ["Valid for 12 months", "Redeemable for any tour", "Transferable", "Digital delivery"]
    },
    {
      id: 2,
      name: "Romantic Getaway",
      description: "Ideal for couples looking for romantic experiences",
      value: "$200",
      image: "/api/placeholder/300/200",
      features: ["Valid for 12 months", "Couple-friendly tours", "Sunset experiences", "Digital delivery"],
      popular: true
    },
    {
      id: 3,
      name: "Family Fun Package",
      description: "Great for families with children of all ages",
      value: "$150",
      image: "/api/placeholder/300/200",
      features: ["Valid for 12 months", "Family-friendly tours", "Group discounts", "Digital delivery"]
    },
    {
      id: 4,
      name: "Custom Amount",
      description: "Choose your own amount for maximum flexibility",
      value: "Custom",
      image: "/api/placeholder/300/200",
      features: ["Valid for 12 months", "Any amount $25+", "Complete flexibility", "Digital delivery"]
    }
  ]

  const benefits = [
    {
      icon: <Gift className="h-8 w-8" />,
      title: "Perfect Gift",
      description: "Give the gift of unforgettable experiences and memories that last a lifetime"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Flexible Booking",
      description: "Recipients can book their preferred tour dates up to 12 months from purchase"
    },
    {
      icon: <Mail className="h-8 w-8" />,
      title: "Instant Delivery",
      description: "Digital vouchers delivered instantly via email with beautiful presentation"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Memorable Experiences",
      description: "Choose from hundreds of tours and experiences across multiple destinations"
    }
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <PageHeader
          title="Gift Vouchers"
          subtitle="Give the gift of adventure with our flexible travel vouchers"
         
          primaryAction={{
            label: "Buy Gift Voucher",
            icon: CreditCard,
            onClick: () => console.log("Buy gift voucher clicked")
          }}
          secondaryAction={{
            label: "Learn More",
            onClick: () => console.log("Learn more clicked")
          }}
        />

        {/* Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4 font-barlow">
                Why Choose Our Gift Vouchers?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-work-sans">
                Our gift vouchers offer the perfect way to share amazing experiences with your loved ones
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent mb-4">
                      {benefit.icon}
                    </div>
                    <CardTitle className="font-barlow text-brand-text">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="font-work-sans">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Voucher Types Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4 font-barlow">
                Choose Your Gift Voucher
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-work-sans">
                {loading ? 'Loading available gift voucher options...' : 
                 'Select from our curated voucher packages or create a custom amount'}
              </p>
            </div>

            {error && (
              <Alert className="mb-8">
                <AlertDescription className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Unable to load featured products. Showing default voucher options.
                </AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Featured Products from Rezdy */}
                {featuredProducts.map((product, index) => (
                  <Card key={product.productCode} className="overflow-hidden hover:shadow-xl transition-shadow relative">
                    {index === 1 && (
                      <Badge className="absolute top-4 right-4 bg-brand-accent text-brand-secondary z-10">
                        Most Popular
                      </Badge>
                    )}
                    <div className="relative h-48">
                      <img 
                        src={product.images?.[0]?.itemUrl || "/api/placeholder/300/200"} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="text-2xl font-bold font-barlow">${product.advertisedPrice}</div>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="font-barlow text-brand-text">{product.name}</CardTitle>
                      <CardDescription className="font-work-sans">
                        {product.shortDescription || 'Perfect for creating unforgettable memories'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 text-brand-accent" />
                          Valid for 12 months
                        </li>
                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 text-brand-accent" />
                          Redeemable for this experience
                        </li>
                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 text-brand-accent" />
                          Digital delivery
                        </li>
                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 text-brand-accent" />
                          Transferable
                        </li>
                      </ul>
                      <Link href={`/tours/${product.productCode}`}>
                        <Button className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-secondary">
                          Purchase Voucher
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Custom Amount Voucher */}
                <Card className="overflow-hidden hover:shadow-xl transition-shadow relative">
                  <div className="relative h-48">
                    <img 
                      src="/api/placeholder/300/200" 
                      alt="Custom Amount Gift Voucher"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="text-2xl font-bold font-barlow">Custom</div>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="font-barlow text-brand-text">Custom Amount</CardTitle>
                    <CardDescription className="font-work-sans">
                      Choose your own amount for maximum flexibility
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 text-brand-accent" />
                        Valid for 12 months
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 text-brand-accent" />
                        Any amount $25+
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 text-brand-accent" />
                        Complete flexibility
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 text-brand-accent" />
                        Digital delivery
                      </li>
                    </ul>
                    <Button className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-secondary">
                      Customize Amount
                    </Button>
                  </CardContent>
                </Card>

                {/* Default voucher types if no featured products */}
                {featuredProducts.length === 0 && voucherTypes.map((voucher) => (
                  <Card key={voucher.id} className="overflow-hidden hover:shadow-xl transition-shadow relative">
                    {voucher.popular && (
                      <Badge className="absolute top-4 right-4 bg-brand-accent text-brand-secondary z-10">
                        Most Popular
                      </Badge>
                    )}
                    <div className="relative h-48">
                      <img 
                        src={voucher.image} 
                        alt={voucher.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="text-2xl font-bold font-barlow">{voucher.value}</div>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="font-barlow text-brand-text">{voucher.name}</CardTitle>
                      <CardDescription className="font-work-sans">
                        {voucher.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        {voucher.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 text-brand-accent" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-secondary">
                        {voucher.value === "Custom" ? "Customize Amount" : "Purchase Voucher"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4 font-['Barlow']">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-['Work_Sans']">
                Purchasing and redeeming gift vouchers is simple and straightforward
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2 font-['Barlow']">Choose Voucher</h3>
                <p className="text-gray-600 font-['Work_Sans']">
                  Select the perfect voucher type and amount for your recipient
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2 font-['Barlow']">Personalize</h3>
                <p className="text-gray-600 font-['Work_Sans']">
                  Add a personal message and choose delivery date for the voucher
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2 font-['Barlow']">Instant Delivery</h3>
                <p className="text-gray-600 font-['Work_Sans']">
                  Voucher is delivered instantly via email with beautiful presentation
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-xl font-semibold mb-2 font-['Barlow']">Book & Enjoy</h3>
                <p className="text-gray-600 font-['Work_Sans']">
                  Recipient books their preferred tour and creates unforgettable memories
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Purchase Form Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4 font-['Barlow']">
                  Purchase Gift Voucher
                </h2>
                <p className="text-lg text-gray-600 font-['Work_Sans']">
                  Fill out the form below to purchase your gift voucher
                </p>
              </div>
              
              <Card className="p-6">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipient-name">Recipient Name</Label>
                      <Input id="recipient-name" placeholder="Enter recipient's name" />
                    </div>
                    <div>
                      <Label htmlFor="recipient-email">Recipient Email</Label>
                      <Input id="recipient-email" type="email" placeholder="Enter recipient's email" />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sender-name">Your Name</Label>
                      <Input id="sender-name" placeholder="Enter your name" />
                    </div>
                    <div>
                      <Label htmlFor="sender-email">Your Email</Label>
                      <Input id="sender-email" type="email" placeholder="Enter your email" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="voucher-amount">Voucher Amount</Label>
                    <Input id="voucher-amount" placeholder="$100" />
                  </div>
                  
                  <div>
                    <Label htmlFor="personal-message">Personal Message (Optional)</Label>
                    <Textarea 
                      id="personal-message" 
                      placeholder="Add a personal message for the recipient..."
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="delivery-date">Delivery Date</Label>
                    <Input id="delivery-date" type="date" />
                  </div>
                  
                  <Button className="w-full" size="lg">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Purchase Gift Voucher
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4 font-['Barlow']">
                Frequently Asked Questions
              </h2>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-['Barlow']">How long are gift vouchers valid?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 font-['Work_Sans']">
                    All gift vouchers are valid for 12 months from the date of purchase, giving recipients plenty of time to plan their perfect adventure.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="font-['Barlow']">Can gift vouchers be used for any tour?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 font-['Work_Sans']">
                    Yes! Our gift vouchers can be redeemed for any tour or experience in our catalog, giving recipients complete flexibility in their choice.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="font-['Barlow']">What if the tour costs more than the voucher amount?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 font-['Work_Sans']">
                    Recipients can pay the difference when booking. If the tour costs less, the remaining balance stays on the voucher for future use.
                  </p>
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