"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, ChevronDown, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeToggleSimple } from "@/components/theme-toggle-simple"

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
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
        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-center md:gap-6">
          <Link href="/destinations" className="text-sm font-medium">
            Destinations
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium">
                Tour Packages
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem asChild>
                <Link href="/tours/family">Family Vacations</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/tours/honeymoon">Honeymoon Packages</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/tours/adventure">Adventure Tours</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/tours/luxury">Luxury Retreats</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/tours">View All Tours</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/special-offers" className="text-sm font-medium">
            Special Offers
          </Link>
          <Link href="/blog" className="text-sm font-medium">
            Blog
          </Link>
          <Link href="/about" className="text-sm font-medium">
            About Us
          </Link>
          <Link href="/contact" className="text-sm font-medium">
            Contact
          </Link>
          <Link href="/rezdy" className="text-sm font-medium">
            Rezdy Data
          </Link>
        </nav>
        <div className="hidden md:flex md:items-center md:gap-4 md:justify-end">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">1-800-PINEAPPLE</span>
          </div>
          <ThemeToggle />
          <Button className="bg-yellow-500 text-black hover:bg-yellow-600">Book Now</Button>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col gap-6 pt-6">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl" onClick={() => setIsOpen(false)}>
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
              <nav className="flex flex-col gap-4">
                <Link href="/destinations" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                  Destinations
                </Link>
                <div className="flex flex-col gap-3 pl-4">
                  <Link href="/tours/family" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                    Family Vacations
                  </Link>
                  <Link href="/tours/honeymoon" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                    Honeymoon Packages
                  </Link>
                  <Link href="/tours/adventure" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                    Adventure Tours
                  </Link>
                  <Link href="/tours/luxury" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                    Luxury Retreats
                  </Link>
                  <Link href="/tours" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                    View All Tours
                  </Link>
                </div>
                <Link href="/special-offers" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                  Special Offers
                </Link>
                <Link href="/blog" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                  Blog
                </Link>
                <Link href="/about" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                  About Us
                </Link>
                <Link href="/contact" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                  Contact
                </Link>
                <Link href="/rezdy" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                  Rezdy Data
                </Link>
              </nav>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">1-800-PINEAPPLE</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Theme:</span>
                  <ThemeToggleSimple />
                </div>
                <Button className="bg-yellow-500 text-black hover:bg-yellow-600" onClick={() => setIsOpen(false)}>
                  Book Now
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
