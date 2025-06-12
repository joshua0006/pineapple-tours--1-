"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  Phone,
  ChevronDown,
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  Database,
  Bus,
  Gift,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { MobileNavigation } from "@/components/mobile-navigation";
import { TourCategoriesDropdown } from "@/components/tour-categories-dropdown";
import { CartIcon } from "@/components/ui/cart-icon";
import { PhoneNumber } from "@/components/ui/phone-number";
import { useResponsive } from "@/hooks/use-responsive";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryTabWidth, setCategoryTabWidth] = useState<number | null>(null);
  const categoryTabRef = useRef<HTMLLIElement>(null);
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Measure category tab width and update other tabs
  useEffect(() => {
    const measureCategoryTab = () => {
      if (categoryTabRef.current && isDesktop) {
        const width = categoryTabRef.current.offsetWidth;
        // Only update if the width has changed significantly (avoid unnecessary re-renders)
        setCategoryTabWidth((prevWidth) => {
          if (prevWidth === null || Math.abs(prevWidth - width) > 2) {
            return width;
          }
          return prevWidth;
        });
      } else if (!isDesktop) {
        // Reset width when not on desktop
        setCategoryTabWidth(null);
      }
    };

    // Use a small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(measureCategoryTab, 100);

    // Re-measure on window resize with debouncing
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(measureCategoryTab, 150);
    };

    window.addEventListener("resize", handleResize);

    // Use ResizeObserver for more accurate measurements if available
    let resizeObserver: ResizeObserver | null = null;
    if (categoryTabRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        // Debounce ResizeObserver calls
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(measureCategoryTab, 50);
      });
      resizeObserver.observe(categoryTabRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [isDesktop]);

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navigationItems = [
    { href: "/tours", label: "Tours", icon: <MapPin className="w-5 h-5" /> },
    {
      href: "/private-tours",
      label: "Private Tours",
      icon: <Users className="w-5 h-5" />,
    },
    { href: "/blog", label: "Blog", icon: <BookOpen className="w-5 h-5" /> },
    {
      href: "/contact",
      label: "Contact Us",
      icon: <MessageCircle className="w-5 h-5" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 h-20">
      <div className="container flex items-center justify-between px-4 sm:px-6 lg:px-8 h-full">
        {/* Logo Section */}
        <Link
          href="/"
          className="flex items-center gap-3 group transition-all duration-300 ease-in-out hover:scale-105 rounded-xl p-2 -m-2"
          aria-label="Pineapple Tours - Home"
        >
          <div className="relative">
            <img
              src="/pineapple-tour-logo.png"
              alt="Pineapple Tours"
              className="h-12 sm:h-16 transition-all duration-300 ease-in-out drop-shadow-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="hidden sm:block"></div>
        </Link>

        {/* Desktop Navigation */}
        {isDesktop && (
          <nav
            className="flex flex-1 items-center justify-center mx-8"
            aria-label="Main navigation"
          >
            <ul className="flex items-center gap-2">
              <li ref={categoryTabRef}>
                <TourCategoriesDropdown />
              </li>
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group relative px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 flex items-center justify-center"
                    style={{
                      minWidth: categoryTabWidth
                        ? `${categoryTabWidth}px`
                        : "auto",
                      transition:
                        "min-width 0.3s ease-in-out, background-color 0.2s ease-in-out",
                    }}
                  >
                    <span className="relative z-10">{item.label}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Desktop Actions */}
        {isDesktop && (
          <div className="flex items-center gap-4">
            <PhoneNumber phoneNumber="0466 331 232" variant="desktop" />
            <CartIcon />
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200 font-semibold px-6"
            >
              Book Now
            </Button>
          </div>
        )}

        {/* Mobile and Tablet Menu */}
        {(isMobile || isTablet) && (
          <div className="flex items-center gap-3">
            <CartIcon />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-xl hover:bg-accent/50 focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 transition-all duration-200"
                  aria-label="Toggle navigation menu"
                >
                  <Menu className="h-6 w-6" />
                  <VisuallyHidden>Open navigation menu</VisuallyHidden>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[320px] sm:w-[380px] p-0 overflow-y-auto border-r border-border/50"
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
  );
}
