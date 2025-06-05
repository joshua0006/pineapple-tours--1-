import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-100">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <img src="/pineapple-tour-logo.png" alt="Pineapple Tours Logo" className="h-10" />
              <span>Pineapple Tours</span>
            </Link>
            <p className="mt-4 text-gray-400">
              Discover paradise with Pineapple Tours. We specialize in creating unforgettable tropical vacation
              experiences with real-time booking and local expertise.
            </p>
            <div className="mt-6 flex gap-4">
              <Link href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium">Quick Links</h3>
            <nav className="mt-4 flex flex-col gap-2">
              <Link href="/tours" className="text-gray-400 hover:text-white">
                All Tours
              </Link>
              <Link href="/search?category=adventure" className="text-gray-400 hover:text-white">
                Adventure Tours
              </Link>
              <Link href="/search?category=cultural" className="text-gray-400 hover:text-white">
                Cultural Tours
              </Link>
              <Link href="/search?category=nature" className="text-gray-400 hover:text-white">
                Nature Tours
              </Link>
              <Link href="/search?category=water-activities" className="text-gray-400 hover:text-white">
                Water Activities
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-white">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white">
                Contact Us
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="text-lg font-medium">Tour Categories</h3>
            <nav className="mt-4 flex flex-col gap-2">
              <Link href="/search?category=family" className="text-gray-400 hover:text-white">
                Family Tours
              </Link>
              <Link href="/search?category=romantic" className="text-gray-400 hover:text-white">
                Romantic Tours
              </Link>
              <Link href="/search?category=luxury" className="text-gray-400 hover:text-white">
                Luxury Tours
              </Link>
              <Link href="/search?category=food-wine" className="text-gray-400 hover:text-white">
                Food & Wine
              </Link>
              <Link href="/search?category=photography" className="text-gray-400 hover:text-white">
                Photography Tours
              </Link>
              <Link href="/search?category=transfers" className="text-gray-400 hover:text-white">
                Transportation
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="text-lg font-medium">Contact & Support</h3>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-coral-500 mt-0.5" />
                <div className="text-gray-400">
                  <p className="font-medium">Pineapple Tours HQ</p>
                  <p>123 Paradise Lane</p>
                  <p>Honolulu, HI 96815</p>
                  <p>United States</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-coral-500" />
                <div className="text-gray-400">
                  <p className="font-medium">1-800-PINEAPPLE</p>
                  <p className="text-sm">24/7 Customer Support</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-coral-500" />
                <div className="text-gray-400">
                  <p className="font-medium">info@pineappletours.com</p>
                  <p className="text-sm">Booking & Inquiries</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-8 bg-gray-800" />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Pineapple Tours. All rights reserved.
            </p>
            <p className="text-xs text-gray-500">
              Powered by Rezdy • Real-time booking system
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-gray-400 hover:text-white">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/faq" className="text-sm text-gray-400 hover:text-white">
              FAQ
            </Link>
            <Link href="/support" className="text-sm text-gray-400 hover:text-white">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
