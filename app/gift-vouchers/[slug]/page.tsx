"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Gift, 
  Calendar, 
  Star, 
  CreditCard, 
  Clock, 
  Users, 
  MapPin, 
  Check, 
  Heart,
  Mail,
  Download,
  Shield,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Globe,
  ArrowLeft,
  Share2,
  Bookmark
} from "lucide-react"
import { useRezdyGiftVouchers, useGiftVoucherTerms } from "@/hooks/use-rezdy"
import { RezdyProduct, GiftVoucherPurchaseData } from "@/lib/types/rezdy"
import { ImageGallery } from "@/components/ui/responsive-image"
import { DescriptionDisplay } from "@/components/ui/description-display"
import Link from "next/link"
import Image from "next/image"

export default function GiftVoucherDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  
  const { data: giftVouchers, loading, error } = useRezdyGiftVouchers()
  const terms = useGiftVoucherTerms()
  
  const [selectedVoucher, setSelectedVoucher] = useState<RezdyProduct | null>(null)
  const [showPurchaseForm, setShowPurchaseForm] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [purchaseData, setPurchaseData] = useState<Partial<GiftVoucherPurchaseData>>({
    voucherType: 'fixed',
    amount: 100
  })

  // Find the specific voucher when data is loaded
  useEffect(() => {
    if (giftVouchers && slug) {
      const voucher = giftVouchers.find(v => 
        v.productCode === slug || 
        v.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
      )
      if (voucher) {
        setSelectedVoucher(voucher)
        setPurchaseData(prev => ({ ...prev, amount: voucher.advertisedPrice || 100 }))
      }
    }
  }, [giftVouchers, slug])

  const formatPrice = (price?: number) => {
    if (!price) return "Custom Amount"
    return `$${price.toFixed(0)}`
  }

  const getValidImages = (product: RezdyProduct) => {
    if (!product.images || product.images.length === 0) {
      return [{ 
        id: 0, 
        itemUrl: "/api/placeholder/800/600", 
        thumbnailUrl: "/api/placeholder/150/100",
        mediumSizeUrl: "/api/placeholder/400/300",
        largeSizeUrl: "/api/placeholder/800/600",
        caption: product.name 
      }]
    }
    return product.images
  }

  const getVoucherFeatures = (product: RezdyProduct) => {
    const features = [
      { icon: <Calendar className="h-5 w-5" />, text: "Valid for 12 months from purchase", highlight: true },
      { icon: <Gift className="h-5 w-5" />, text: "Instant digital delivery via email", highlight: true },
      { icon: <Star className="h-5 w-5" />, text: "Transferable to friends and family", highlight: false },
      { icon: <CreditCard className="h-5 w-5" />, text: "Flexible redemption options", highlight: false },
      { icon: <Shield className="h-5 w-5" />, text: "Secure purchase and storage", highlight: false },
      { icon: <Heart className="h-5 w-5" />, text: "Perfect for any occasion", highlight: false }
    ]

    if (product.quantityRequiredMin && product.quantityRequiredMax) {
      features.push({ 
        icon: <Users className="h-5 w-5" />, 
        text: `Suitable for ${product.quantityRequiredMin}-${product.quantityRequiredMax} people`,
        highlight: false
      })
    }

    return features
  }

  const getVoucherHighlights = () => {
    return [
      {
        icon: <Sparkles className="h-6 w-6" />,
        title: "Unforgettable Experiences",
        description: "Create lasting memories with our curated selection of tours and activities across multiple destinations"
      },
      {
        icon: <Globe className="h-6 w-6" />,
        title: "Multiple Destinations",
        description: "Choose from hundreds of experiences across various locations including cities, nature reserves, and cultural sites"
      },
      {
        icon: <Calendar className="h-6 w-6" />,
        title: "Flexible Booking",
        description: "Book at your convenience with 12 months validity and easy online booking system"
      },
      {
        icon: <Heart className="h-6 w-6" />,
        title: "Perfect Gift",
        description: "Ideal for birthdays, anniversaries, holidays, graduations, or any special occasion that deserves celebration"
      }
    ]
  }

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (purchaseData.recipientName && purchaseData.recipientEmail && 
        purchaseData.senderName && purchaseData.senderEmail && purchaseData.amount) {
      
      console.log('Gift voucher purchase:', purchaseData)
      // Here you would typically:
      // 1. Send to payment processor
      // 2. Create voucher in system
      // 3. Send confirmation emails
      // 4. Redirect to success page
      
      alert(`Gift voucher purchased successfully for ${purchaseData.recipientName}!`)
      setShowPurchaseForm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container py-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="h-64 bg-gray-200 rounded" />
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-6 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="space-y-4">
                  <div className="h-32 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (error || !selectedVoucher) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container py-8">
            <Alert className="border-destructive">
              <Info className="h-4 w-4" />
              <AlertDescription>
                {error || "Gift voucher not found. The voucher you're looking for doesn't exist or has been removed."}
              </AlertDescription>
            </Alert>
            <div className="mt-8">
              <Link href="/gift-vouchers">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Gift Vouchers
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const images = getValidImages(selectedVoucher)
  const location = typeof selectedVoucher.locationAddress === 'string' 
    ? selectedVoucher.locationAddress 
    : selectedVoucher.locationAddress?.city || 'Multiple Locations'

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <nav className="container py-4" aria-label="Breadcrumb">
          <ol className="flex items-center text-sm text-muted-foreground overflow-x-auto">
            <li className="flex-shrink-0">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li className="flex-shrink-0">
              <ChevronLeft className="mx-1 h-4 w-4 rotate-180" aria-hidden="true" />
            </li>
            <li className="flex-shrink-0">
              <Link href="/gift-vouchers" className="hover:text-foreground transition-colors">
                Gift Vouchers
              </Link>
            </li>
            <li className="flex-shrink-0">
              <ChevronLeft className="mx-1 h-4 w-4 rotate-180" aria-hidden="true" />
            </li>
            <li className="min-w-0">
              <span className="text-foreground truncate block" aria-current="page">
                {selectedVoucher.name}
              </span>
            </li>
          </ol>
        </nav>

        {/* Voucher Header */}
        <section className="container py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1 max-w-4xl">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl font-barlow text-brand-text">
                {selectedVoucher.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4 text-brand-accent" />
                  <span className="text-base">{location}</span>
                </div>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 fill-brand-accent text-brand-accent" />
                  <span className="text-base">4.8 (Reviews)</span>
                </div>
                <Badge className="bg-brand-accent text-brand-secondary">
                  Gift Voucher
                </Badge>
              </div>
            </div>
            <div className="text-left md:text-right flex-shrink-0">
              <div className="text-sm text-muted-foreground">Starting from</div>
              <div className="text-3xl font-bold text-brand-text">{formatPrice(selectedVoucher.advertisedPrice)}</div>
              <div className="text-sm text-muted-foreground">gift voucher</div>
            </div>
          </div>
        </section>

        {/* Image Gallery */}
        <section className="container py-6">
          <div className="max-w-6xl mx-auto">
            <ImageGallery
              images={images}
              alt={selectedVoucher.name}
              layout="grid"
              maxImages={4}
              enableModal={true}
              tourName={selectedVoucher.name}
            />
          </div>
        </section>

        {/* Main Content */}
        <section className="container py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-8 xl:grid-cols-4 xl:items-start">
              {/* Mobile Booking Bar */}
              <div className="xl:hidden order-first">
                <Card className="sticky top-16 z-10 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-brand-text">
                          {formatPrice(selectedVoucher.advertisedPrice)}
                        </div>
                        <div className="text-sm text-muted-foreground">gift voucher</div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-brand-accent/20 text-brand-accent hover:bg-brand-accent/10"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90"
                          onClick={() => setShowPurchaseForm(true)}
                        >
                          Purchase Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="xl:col-span-3">
                <div className="max-w-4xl mx-auto xl:mx-0 space-y-8">
                  {/* Essential Information */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                            <Gift className="h-6 w-6 text-brand-accent" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Voucher Type</div>
                            <div className="font-semibold text-brand-text">Digital Gift Voucher</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-brand-accent" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Validity</div>
                            <div className="font-semibold text-brand-text">12 months from purchase</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                            <Mail className="h-6 w-6 text-brand-accent" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Delivery</div>
                            <div className="font-semibold text-brand-text">Instant email delivery</div>
                          </div>
                        </div>
                      </div>

                      {/* What's Included */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-brand-text mb-4 font-barlow">What's Included</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {getVoucherFeatures(selectedVoucher).slice(0, 4).map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-emerald-600" />
                              <span className="text-sm text-muted-foreground">{feature.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tabs */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-50">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="terms">Terms</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-6 mt-6">
                      {/* Description */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="font-barlow">About This Gift Voucher</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <DescriptionDisplay
                            description={selectedVoucher.description || selectedVoucher.shortDescription || 
                              "Give the perfect gift of adventure and discovery. Our gift vouchers provide the ultimate flexibility, allowing recipients to choose from our extensive collection of tours and experiences. Whether it's a romantic getaway, family adventure, or solo exploration, this voucher opens doors to unforgettable memories."}
                            shortDescription={selectedVoucher.shortDescription}
                            maxLength={undefined}
                            allowExpansion={false}
                            className="text-muted-foreground leading-relaxed font-work-sans"
                          />
                        </CardContent>
                      </Card>

                      {/* Highlights */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="font-barlow">Why Choose Our Gift Vouchers?</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-6">
                            {getVoucherHighlights().map((highlight, index) => (
                              <div key={index} className="flex gap-4">
                                <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center text-brand-accent flex-shrink-0">
                                  {highlight.icon}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-brand-text mb-2 font-barlow">{highlight.title}</h4>
                                  <p className="text-sm text-muted-foreground font-work-sans">{highlight.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Purchase */}
                      <Card className="border-2 border-brand-accent/20">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-brand-text mb-2 font-barlow">Ready to Purchase?</h3>
                              <p className="text-muted-foreground font-work-sans">Give the gift of unforgettable experiences</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button 
                                variant="outline"
                                className="border-brand-accent/30 text-brand-accent hover:bg-brand-accent/10"
                              >
                                <Bookmark className="mr-2 h-4 w-4" />
                                Save for Later
                              </Button>
                              <Button 
                                className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90"
                                onClick={() => setShowPurchaseForm(true)}
                              >
                                Purchase Now - {formatPrice(selectedVoucher.advertisedPrice)}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="details" className="space-y-6 mt-6">
                      {/* Features */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="font-barlow">Voucher Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4">
                            {getVoucherFeatures(selectedVoucher).map((feature, index) => (
                              <div key={index} className={`flex items-center gap-4 p-4 rounded-lg ${
                                feature.highlight ? 'bg-brand-accent/5 border border-brand-accent/20' : 'bg-gray-50'
                              }`}>
                                <div className={`text-brand-accent ${feature.highlight ? 'text-brand-accent' : 'text-muted-foreground'}`}>
                                  {feature.icon}
                                </div>
                                <span className={`${feature.highlight ? 'font-medium text-brand-text' : 'text-muted-foreground'}`}>
                                  {feature.text}
                                </span>
                                {feature.highlight && <Check className="h-5 w-5 text-brand-accent ml-auto" />}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* How It Works */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="font-barlow">How It Works</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            {[
                              { step: 1, title: "Purchase", description: "Complete your purchase and receive instant confirmation via email" },
                              { step: 2, title: "Delivery", description: "Voucher is delivered instantly via email with beautiful presentation and instructions" },
                              { step: 3, title: "Redeem", description: "Recipient browses our website and books their preferred experience using the voucher code" },
                              { step: 4, title: "Enjoy", description: "Create unforgettable memories with our expert guides and premium experiences" }
                            ].map((item) => (
                              <div key={item.step} className="flex gap-4">
                                <div className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                  {item.step}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-brand-text mb-1 font-barlow">{item.title}</h4>
                                  <p className="text-sm text-muted-foreground font-work-sans">{item.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="terms" className="space-y-6 mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="font-barlow">Terms & Conditions</CardTitle>
                          <CardDescription>Important information about your gift voucher</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {[
                            { icon: <Clock className="h-5 w-5" />, title: "Validity Period", content: terms.validity },
                            { icon: <Gift className="h-5 w-5" />, title: "Redemption", content: terms.redemption },
                            { icon: <Users className="h-5 w-5" />, title: "Transferability", content: terms.transferable },
                            { icon: <CreditCard className="h-5 w-5" />, title: "Refund Policy", content: terms.refund },
                            { icon: <Star className="h-5 w-5" />, title: "Partial Use", content: terms.partial_use },
                            { icon: <Calendar className="h-5 w-5" />, title: "Booking Process", content: terms.booking_process },
                            { icon: <Info className="h-5 w-5" />, title: "Contact Information", content: terms.contact_info }
                          ].map((term, index) => (
                            <div key={index} className="border-l-4 border-brand-accent/20 pl-6">
                              <h4 className="font-semibold text-brand-text mb-3 flex items-center gap-3 font-barlow">
                                <span className="text-brand-accent">{term.icon}</span>
                                {term.title}
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed font-work-sans">{term.content}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Desktop Sidebar */}
              <div className="hidden xl:block xl:col-span-1 sticky top-20">
                <div className="max-w-sm mx-auto space-y-4">
                  {!showPurchaseForm ? (
                    <Card className="border-2 border-brand-accent/20 shadow-lg">
                      <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold text-brand-text">
                          {formatPrice(selectedVoucher.advertisedPrice)}
                        </CardTitle>
                        <CardDescription>Gift Voucher</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 text-emerald-600" />
                            <span>Instant digital delivery</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 text-emerald-600" />
                            <span>12 months validity</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 text-emerald-600" />
                            <span>Fully transferable</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 text-emerald-600" />
                            <span>No booking fees</span>
                          </div>
                        </div>

                        <Separator />

                        <Button 
                          className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-secondary font-semibold"
                          size="lg"
                          onClick={() => setShowPurchaseForm(true)}
                        >
                          <CreditCard className="mr-2 h-5 w-5" />
                          Purchase Gift Voucher
                        </Button>

                        <div className="text-center text-xs text-muted-foreground">
                          Secure payment • Instant delivery • 100% satisfaction guarantee
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-2 border-brand-accent/20 shadow-lg">
                      <CardHeader>
                        <CardTitle className="font-barlow">Purchase Details</CardTitle>
                        <CardDescription>Complete your gift voucher purchase</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="recipient-name" className="text-sm">Recipient Name</Label>
                              <Input 
                                id="recipient-name"
                                placeholder="Recipient's name"
                                value={purchaseData.recipientName || ''}
                                onChange={(e) => setPurchaseData(prev => ({ ...prev, recipientName: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="recipient-email" className="text-sm">Recipient Email</Label>
                              <Input 
                                id="recipient-email"
                                type="email"
                                placeholder="Recipient's email"
                                value={purchaseData.recipientEmail || ''}
                                onChange={(e) => setPurchaseData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="sender-name" className="text-sm">Your Name</Label>
                              <Input 
                                id="sender-name"
                                placeholder="Your name"
                                value={purchaseData.senderName || ''}
                                onChange={(e) => setPurchaseData(prev => ({ ...prev, senderName: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="sender-email" className="text-sm">Your Email</Label>
                              <Input 
                                id="sender-email"
                                type="email"
                                placeholder="Your email"
                                value={purchaseData.senderEmail || ''}
                                onChange={(e) => setPurchaseData(prev => ({ ...prev, senderEmail: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="amount" className="text-sm">Voucher Amount</Label>
                              <Input 
                                id="amount"
                                type="number"
                                min="25"
                                placeholder="Amount"
                                value={purchaseData.amount || ''}
                                onChange={(e) => setPurchaseData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="message" className="text-sm">Personal Message (Optional)</Label>
                              <Textarea 
                                id="message"
                                placeholder="Add a personal message..."
                                rows={3}
                                value={purchaseData.personalMessage || ''}
                                onChange={(e) => setPurchaseData(prev => ({ ...prev, personalMessage: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="delivery-date" className="text-sm">Delivery Date</Label>
                              <Input 
                                id="delivery-date"
                                type="date"
                                value={purchaseData.deliveryDate || ''}
                                onChange={(e) => setPurchaseData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => setShowPurchaseForm(false)}
                            >
                              Back
                            </Button>
                            <Button 
                              type="submit"
                              className="flex-1 bg-brand-accent hover:bg-brand-accent/90 text-brand-secondary"
                            >
                              Complete Purchase
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {/* Support Card */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                          <Info className="h-4 w-4 text-brand-accent" />
                        </div>
                        <h3 className="font-semibold text-brand-text">Need Help?</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Our team is here to help you choose the perfect gift voucher.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Contact Support
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Sticky Bottom Bar */}
        <div className="xl:hidden">
          <Card className="sticky bottom-4 z-10 mx-4 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-left">
                  <div className="text-xl font-bold text-brand-text">
                    {formatPrice(selectedVoucher.advertisedPrice)}
                  </div>
                  <div className="text-sm text-muted-foreground">gift voucher</div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-brand-accent/20 text-brand-accent hover:bg-brand-accent/10"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  
                  <Button 
                    size="sm"
                    className="bg-brand-accent text-brand-secondary hover:bg-brand-accent/90"
                    onClick={() => setShowPurchaseForm(true)}
                  >
                    Purchase Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  )
} 