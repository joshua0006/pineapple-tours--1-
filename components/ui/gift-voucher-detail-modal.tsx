"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Gift, 
  Calendar, 
  Star, 
  CreditCard, 
  Clock, 
  Users, 
  MapPin, 
  Check, 
  X, 
  Heart,
  Mail,
  Download,
  Shield,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Globe
} from "lucide-react"
import { RezdyProduct, GiftVoucherTerms, GiftVoucherPurchaseData } from "@/lib/types/rezdy"
import Image from "next/image"

interface GiftVoucherDetailModalProps {
  product: RezdyProduct
  isOpen: boolean
  onClose: () => void
  terms: GiftVoucherTerms
  onPurchase?: (purchaseData: GiftVoucherPurchaseData) => void
  isPopular?: boolean
}

export function GiftVoucherDetailModal({ 
  product, 
  isOpen, 
  onClose, 
  terms, 
  onPurchase,
  isPopular = false 
}: GiftVoucherDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [showPurchaseForm, setShowPurchaseForm] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [purchaseData, setPurchaseData] = useState<Partial<GiftVoucherPurchaseData>>({
    voucherType: 'fixed',
    amount: product.advertisedPrice || 100
  })

  const formatPrice = (price?: number) => {
    if (!price) return "Custom Amount"
    return `$${price.toFixed(0)}`
  }

  const getValidImages = () => {
    if (!product.images || product.images.length === 0) {
      return [{ 
        id: 0, 
        itemUrl: "/api/placeholder/600/400", 
        thumbnailUrl: "/api/placeholder/150/100",
        mediumSizeUrl: "/api/placeholder/300/200",
        largeSizeUrl: "/api/placeholder/600/400",
        caption: product.name 
      }]
    }
    return product.images
  }

  const images = getValidImages()

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const getVoucherFeatures = () => {
    const features = [
      { icon: <Calendar className="h-4 w-4" />, text: "Valid for 12 months from purchase", highlight: true },
      { icon: <Gift className="h-4 w-4" />, text: "Instant digital delivery via email", highlight: true },
      { icon: <Star className="h-4 w-4" />, text: "Transferable to friends and family", highlight: false },
      { icon: <CreditCard className="h-4 w-4" />, text: "Flexible redemption options", highlight: false },
      { icon: <Shield className="h-4 w-4" />, text: "Secure purchase and storage", highlight: false },
      { icon: <Heart className="h-4 w-4" />, text: "Perfect for any occasion", highlight: false }
    ]

    if (product.quantityRequiredMin && product.quantityRequiredMax) {
      features.push({ 
        icon: <Users className="h-4 w-4" />, 
        text: `Suitable for ${product.quantityRequiredMin}-${product.quantityRequiredMax} people`,
        highlight: false
      })
    }

    return features
  }

  const getVoucherHighlights = () => {
    return [
      {
        icon: <Sparkles className="h-5 w-5" />,
        title: "Unforgettable Experiences",
        description: "Create lasting memories with our curated selection of tours and activities"
      },
      {
        icon: <Globe className="h-5 w-5" />,
        title: "Multiple Destinations",
        description: "Choose from hundreds of experiences across various locations"
      },
      {
        icon: <Calendar className="h-5 w-5" />,
        title: "Flexible Booking",
        description: "Book at your convenience with 12 months validity"
      },
      {
        icon: <Heart className="h-5 w-5" />,
        title: "Perfect Gift",
        description: "Ideal for birthdays, anniversaries, holidays, or any special occasion"
      }
    ]
  }

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onPurchase && purchaseData.recipientName && purchaseData.recipientEmail && 
        purchaseData.senderName && purchaseData.senderEmail && purchaseData.amount) {
      onPurchase(purchaseData as GiftVoucherPurchaseData)
      onClose()
    }
  }

  const location = typeof product.locationAddress === 'string' 
    ? product.locationAddress 
    : product.locationAddress?.city || 'Multiple Locations'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] w-[95vw] p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[95vh]">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <DialogTitle className="text-2xl font-bold text-brand-text font-barlow line-clamp-2">
                  {product.name}
                </DialogTitle>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-brand-accent" />
                    <span className="text-sm text-muted-foreground">{location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-brand-accent text-brand-accent" />
                    <span className="text-sm text-muted-foreground">4.8 (Reviews)</span>
                  </div>
                  {isPopular && (
                    <Badge className="bg-brand-accent text-brand-secondary">
                      Most Popular
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm text-muted-foreground">Starting from</div>
                <div className="text-3xl font-bold text-brand-text">{formatPrice(product.advertisedPrice)}</div>
                <div className="text-sm text-muted-foreground">gift voucher</div>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="grid lg:grid-cols-3 gap-6 p-4 sm:p-6 min-h-0">
              {/* Left Column - Images and Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Image Gallery */}
                <div className="relative">
                  <div className="aspect-[16/10] rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={images[currentImageIndex]?.largeSizeUrl || images[currentImageIndex]?.itemUrl}
                      alt={images[currentImageIndex]?.caption || product.name}
                      fill
                      className="object-cover transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 66vw"
                    />
                    {images.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {/* Image Thumbnails */}
                  {images.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto">
                      {images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                            index === currentImageIndex 
                              ? 'border-brand-accent' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={image.thumbnailUrl || image.itemUrl}
                            alt={image.caption || `Image ${index + 1}`}
                            width={80}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tabs Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-50">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="terms">Terms</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6 mt-6 overflow-y-auto">
                    {/* Description */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-barlow">About This Gift Voucher</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed font-work-sans">
                          {product.shortDescription || product.description || 
                           "Give the perfect gift of adventure and discovery. Our gift vouchers provide the ultimate flexibility, allowing recipients to choose from our extensive collection of tours and experiences. Whether it's a romantic getaway, family adventure, or solo exploration, this voucher opens doors to unforgettable memories."}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Highlights */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-barlow">Why Choose Our Gift Vouchers?</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          {getVoucherHighlights().map((highlight, index) => (
                            <div key={index} className="flex gap-3">
                              <div className="w-10 h-10 bg-brand-accent/10 rounded-lg flex items-center justify-center text-brand-accent flex-shrink-0">
                                {highlight.icon}
                              </div>
                              <div>
                                <h4 className="font-semibold text-brand-text mb-1">{highlight.title}</h4>
                                <p className="text-sm text-muted-foreground">{highlight.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-6 mt-6 overflow-y-auto">
                    {/* Features */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-barlow">Voucher Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {getVoucherFeatures().map((feature, index) => (
                            <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                              feature.highlight ? 'bg-brand-accent/5 border border-brand-accent/20' : 'bg-gray-50'
                            }`}>
                              <div className={`text-brand-accent ${feature.highlight ? 'text-brand-accent' : 'text-muted-foreground'}`}>
                                {feature.icon}
                              </div>
                              <span className={`text-sm ${feature.highlight ? 'font-medium text-brand-text' : 'text-muted-foreground'}`}>
                                {feature.text}
                              </span>
                              {feature.highlight && <Check className="h-4 w-4 text-brand-accent ml-auto" />}
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
                        <div className="space-y-4">
                          {[
                            { step: 1, title: "Purchase", description: "Complete your purchase and receive instant confirmation" },
                            { step: 2, title: "Delivery", description: "Voucher is delivered instantly via email with beautiful presentation" },
                            { step: 3, title: "Redeem", description: "Recipient browses and books their preferred experience" },
                            { step: 4, title: "Enjoy", description: "Create unforgettable memories with our expert guides" }
                          ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                              <div className="w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {item.step}
                              </div>
                              <div>
                                <h4 className="font-semibold text-brand-text">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="terms" className="space-y-6 mt-6 overflow-y-auto">
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-barlow">Terms & Conditions</CardTitle>
                        <CardDescription>Important information about your gift voucher</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { icon: <Clock className="h-4 w-4" />, title: "Validity Period", content: terms.validity },
                          { icon: <Gift className="h-4 w-4" />, title: "Redemption", content: terms.redemption },
                          { icon: <Users className="h-4 w-4" />, title: "Transferability", content: terms.transferable },
                          { icon: <CreditCard className="h-4 w-4" />, title: "Refund Policy", content: terms.refund },
                          { icon: <Star className="h-4 w-4" />, title: "Partial Use", content: terms.partial_use },
                          { icon: <Calendar className="h-4 w-4" />, title: "Booking Process", content: terms.booking_process },
                          { icon: <Info className="h-4 w-4" />, title: "Contact Information", content: terms.contact_info }
                        ].map((term, index) => (
                          <div key={index} className="border-l-4 border-brand-accent/20 pl-4">
                            <h4 className="font-semibold text-brand-text mb-2 flex items-center gap-2">
                              <span className="text-brand-accent">{term.icon}</span>
                              {term.title}
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{term.content}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Column - Purchase Section */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-6 space-y-4">
                  {!showPurchaseForm ? (
                    <Card className="border-2 border-brand-accent/20">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-brand-text">
                          {formatPrice(product.advertisedPrice)}
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
                    <Card className="border-2 border-brand-accent/20">
                      <CardHeader>
                        <CardTitle className="font-barlow">Purchase Details</CardTitle>
                        <CardDescription>Complete your gift voucher purchase</CardDescription>
                      </CardHeader>
                      <CardContent className="max-h-[60vh] overflow-y-auto">
                        <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
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
                          </div>

                          <div className="grid grid-cols-2 gap-3">
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
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
} 