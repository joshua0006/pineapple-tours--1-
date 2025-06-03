"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, Phone, ChevronDown, MapPin, Calendar, Users, MessageCircle, Database } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNavigation } from "@/components/mobile-navigation"
import { TourCategoriesDropdown } from "@/components/tour-categories-dropdown"
import { CartIcon } from "@/components/ui/cart-icon"
import { useResponsive } from "@/hooks/use-responsive"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { isMobile, isTablet, isDesktop } = useResponsive()

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const navigationItems = [
    { href: "/tours", label: "Tours", icon: <MapPin className="w-5 h-5" /> },
    { href: "/about", label: "About Us", icon: <Users className="w-5 h-5" /> },
    { href: "/contact", label: "Contact", icon: <MessageCircle className="w-5 h-5" /> }
  ]

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        isScrolled 
          ? "bg-background/98 backdrop-blur-md shadow-sm supports-[backdrop-filter]:bg-background/80" 
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 font-bold text-lg sm:text-xl hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-md"
          aria-label="Pineapple Tours - Home"
        >
         <img src="/pineapple-tour-logo.png" alt="Pineapple Tours" className="h-8 sm:h-10" />
          <span className="hidden sm:inline">
            Pineapple Tours
          </span>
          <span className="sm:hidden text-sm">
            Pineapple Tours
          </span>
        </Link>

        {/* Desktop Navigation */}
        {isDesktop && (
          <nav className="flex flex-1 items-center justify-center" aria-label="Main navigation">
            <ul className="flex items-center gap-1">
              <li>
                <TourCategoriesDropdown />
              </li>
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Tablet Navigation */}
        {isTablet && (
          <nav className="flex flex-1 items-center justify-center" aria-label="Main navigation">
            <ul className="flex items-center gap-1">
              <li>
                <TourCategoriesDropdown />
              </li>
              {navigationItems.slice(0, 2).map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="px-2 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {/* More menu for remaining items on tablet */}
              <li className="relative group">
                <button 
                  className="flex items-center gap-1 px-2 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  More
                  <ChevronDown className="h-3 w-3" />
                  <VisuallyHidden>navigation options</VisuallyHidden>
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-popover border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-50">
                  <ul className="py-1" role="menu">
                    {navigationItems.slice(2).map((item) => (
                      <li key={item.href} role="none">
                        <Link 
                          href={item.href} 
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                          role="menuitem"
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            </ul>
          </nav>
        )}

        {/* Desktop Actions */}
        {isDesktop && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-yellow-500" aria-hidden="true" />
              <span className="font-medium">1-800-PINEAPPLE</span>
            </div>
            <CartIcon />
            <ThemeToggle />
            <Button 
              className="bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all"
              size="sm"
            >
              Book Now
            </Button>
          </div>
        )}

        {/* Tablet Actions */}
        {isTablet && (
          <div className="flex items-center gap-2">
            <CartIcon />
            <ThemeToggle />
            <Button 
              className="bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all"
              size="sm"
            >
              Book
            </Button>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobile && (
          <div className="flex items-center gap-2">
            <CartIcon />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                  aria-label="Toggle navigation menu"
                >
                  <Menu className="h-6 w-6" />
                  <VisuallyHidden>Open navigation menu</VisuallyHidden>
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="left" 
                className="w-[320px] sm:w-[380px] p-0 overflow-y-auto"
              >
                {/* Required for accessibility */}
                <SheetTitle>
                  <VisuallyHidden>Navigation Menu</VisuallyHidden>
                </SheetTitle>
                <MobileNavigation 
                  navigationItems={navigationItems}
                  onItemClick={() => setIsOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  )
}
