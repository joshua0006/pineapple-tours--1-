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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-yellow-500"
              >
                <path d="M17 14c.889-.889 2.111.889 3-1s1-6-4-7c-3.5-.7-5.5.7-7 2" />
                <path d="M17 14s-1 1-2 1-2-1-2-2c0-4 4-2 4-2" />
                <path d="M14 7c.889-.889 2.111.889 3-1s1-6-4-7c-3.5-.7-5.5.7-7 2" />
                <path d="M14 7s-1 1-2 1-2-1-2-2c0-4 4-2 4-2" />
                <path d="M5 22v-3" />
                <path d="M9 22v-3" />
                <path d="M9 12v3" />
                <path d="M5 12v3" />
                <path d="M5 15h4" />
                <path d="M5 19h4" />
              </svg>
              <span>Pineapple Tours</span>
            </Link>
            <p className="mt-4 text-gray-400">
              Discover paradise with Pineapple Tours. We specialize in creating unforgettable tropical vacation
              experiences in Hawaii, the Caribbean, Fiji, and beyond.
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
              <Link href="/destinations" className="text-gray-400 hover:text-white">
                Destinations
              </Link>
              <Link href="/tours" className="text-gray-400 hover:text-white">
                Tour Packages
              </Link>
              <Link href="/special-offers" className="text-gray-400 hover:text-white">
                Special Offers
              </Link>
              <Link href="/blog" className="text-gray-400 hover:text-white">
                Travel Blog
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
            <h3 className="text-lg font-medium">Popular Destinations</h3>
            <nav className="mt-4 flex flex-col gap-2">
              <Link href="/destinations/hawaii" className="text-gray-400 hover:text-white">
                Hawaii
              </Link>
              <Link href="/destinations/caribbean" className="text-gray-400 hover:text-white">
                Caribbean
              </Link>
              <Link href="/destinations/fiji" className="text-gray-400 hover:text-white">
                Fiji
              </Link>
              <Link href="/destinations/bali" className="text-gray-400 hover:text-white">
                Bali
              </Link>
              <Link href="/destinations/maldives" className="text-gray-400 hover:text-white">
                Maldives
              </Link>
              <Link href="/destinations/tahiti" className="text-gray-400 hover:text-white">
                Tahiti
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="text-lg font-medium">Contact Us</h3>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-yellow-500" />
                <p className="text-gray-400">
                  123 Paradise Lane
                  <br />
                  Honolulu, HI 96815
                  <br />
                  United States
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-yellow-500" />
                <p className="text-gray-400">1-800-PINEAPPLE</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-yellow-500" />
                <p className="text-gray-400">info@pineappletours.com</p>
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-8 bg-gray-800" />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Pineapple Tours. All rights reserved.
          </p>
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
          </div>
        </div>
      </div>
    </footer>
  )
}
