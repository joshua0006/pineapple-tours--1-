import Link from "next/link"
import { Facebook, Instagram, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SiteFooter() {
  return (
    <footer className="relative bg-gray-900 text-gray-100">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/footer-images/footer-bg.jpg')"
        }}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="container py-12 md:py-16">
          {/* Two column layout: Left side (logos/CTA) and Right side (footer links) */}
          <div className="grid gap-8 lg:grid-cols-4 mb-12">
            {/* Left column: Logo and CTA buttons */}
            <div className="flex flex-col gap-8 lg:col-span-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center gap-8">
                <img 
                    src="/footer-images/ausowned-certified-circular.svg" 
                    alt="Australian Owned Certified Business" 
                    className="h-32 w-auto"
                  />
                 <div className="bg-transparent">
                  <img 
                    src="/footer-images/Mask-Group-5@2x.avif" 
                    alt="Tourism Emissions Reduction Commitment" 
                    className="h-32 w-auto"
                  />
                </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <Button 
                  asChild 
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg font-semibold"
                >
                  <Link href="/booking">BOOK YOUR TOUR NOW</Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-8 py-3 text-lg font-semibold"
                >
                  <Link href="tel:0466331232">CALL US ON 0466 331 232</Link>
                </Button>
              </div>
            </div>

            {/* Right column: Main footer content */}
            <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-3 lg:col-span-3">
            {/* Quicklinks */}
            <div>
              <h3 className="text-red-500 text-lg font-semibold mb-4">Quicklinks</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/tours?category=hop-on-hop-off" className="text-gray-300 hover:text-white transition-colors">
                  Hop on Hop off
                </Link>
                <Link href="/tours" className="text-gray-300 hover:text-white transition-colors">
                  Tours
                </Link>
                <Link href="/tours?category=multiday-tours" className="text-gray-300 hover:text-white transition-colors">
                  Packages
                </Link>
                <Link href="/tours?category=bus-charter" className="text-gray-300 hover:text-white transition-colors">
                  Bus Charter
                </Link>
                <Link href="/gift-vouchers" className="text-gray-300 hover:text-white transition-colors">
                  Gift Vouchers
                </Link>
                <Link href="/tours?category=day-tours" className="text-gray-300 hover:text-white transition-colors">
                  Bus Tours
                </Link>
              </nav>
            </div>

            {/* Useful Info */}
            <div>
              <h3 className="text-red-500 text-lg font-semibold mb-4">Useful Info</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
                <Link href="/feedback" className="text-gray-300 hover:text-white transition-colors">
                  Feedback
                </Link>
                <Link href="/queensland-weather-info" className="text-gray-300 hover:text-white transition-colors">
                  Queensland Weather Info
                </Link>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
                <Link href="/work-with-us" className="text-gray-300 hover:text-white transition-colors">
                  Work With Us
                </Link>
                <Link href="/accessibility" className="text-gray-300 hover:text-white transition-colors">
                  Accessibility
                </Link>
                <Link href="/companion-card" className="text-gray-300 hover:text-white transition-colors">
                  Companion Card - Accepted Here
                </Link>
              </nav>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-red-500 text-lg font-semibold mb-4">Legal</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/terms-and-conditions" className="text-gray-300 hover:text-white transition-colors">
                  Terms and Conditions
                </Link>
                <Link href="/refund-and-exchange-policy" className="text-gray-300 hover:text-white transition-colors">
                  Refund and Exchange Policy
                </Link>
                <Link href="/allergies-and-dietary-requirements" className="text-gray-300 hover:text-white transition-colors">
                  Allergies and Dietary requirements
                </Link>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/sustainable-tourism" className="text-gray-300 hover:text-white transition-colors">
                  Sustainable Tourism
                </Link>
              </nav>
            </div>
            </div>
          </div>

          {/* Certification badges */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-wrap items-center gap-6">
              
              <div className="bg-transparent">
                <img 
                  src="/footer-images/Sustainable-Supply-Nation-1024x196.webp" 
                  alt="Supply Nation Registered" 
                  className="h-48 w-auto"
                />
              </div>
            </div>

            {/* Social media and copyright */}
            <div className="flex flex-col items-center lg:items-end gap-4">
              <div className="flex gap-4">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-6 w-6" />
                  <span className="sr-only">Instagram</span>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-6 w-6" />
                  <span className="sr-only">Facebook</span>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="h-6 w-6" />
                  <span className="sr-only">YouTube</span>
                </Link>
              </div>
              <p className="text-sm text-gray-400 text-center lg:text-right">
                Copyright © 2014 - {new Date().getFullYear()} Pineapple Tours. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
