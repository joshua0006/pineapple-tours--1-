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
  X,
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
import {
  useResponsiveSpacing,
  responsiveSpacing,
} from "@/lib/utils/responsive-spacing";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categoryTabWidth, setCategoryTabWidth] = useState<number | null>(null);
  const categoryTabRef = useRef<HTMLLIElement>(null);
  const { isMobile, isTablet, isDesktop, md, lg } = useResponsive();
  const { calculateOptimalTabWidth, tabSpacing, actionSpacing } =
    useResponsiveSpacing();

  // Handle scroll effect for header styling
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Measure category tab width and update other tabs (desktop only)
  useEffect(() => {
    const measureCategoryTab = () => {
      if (categoryTabRef.current && isDesktop) {
        const width = categoryTabRef.current.offsetWidth;
        const optimalWidth = calculateOptimalTabWidth(width);
        setCategoryTabWidth((prevWidth) => {
          if (prevWidth === null || Math.abs(prevWidth - optimalWidth) > 2) {
            return optimalWidth;
          }
          return prevWidth;
        });
      } else if (!isDesktop) {
        setCategoryTabWidth(null);
      }
    };

    const timeoutId = setTimeout(measureCategoryTab, 100);

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(measureCategoryTab, 150);
    };

    window.addEventListener("resize", handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (categoryTabRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
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
  }, [isDesktop, calculateOptimalTabWidth]);

  // Enhanced mobile menu handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      // Prevent background scrolling on mobile
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isOpen]);

  const navigationItems = [
    { href: "/tours", label: "Tours", icon: <MapPin className="w-5 h-5" /> },
    // {
    //   href: "/custom-tours",
    //   label: "Custom Tours",
    //   icon: <Bus className="w-5 h-5" />,
    // },
    { href: "/blog", label: "Blog", icon: <BookOpen className="w-5 h-5" /> },
    {
      href: "/contact",
      label: "Contact Us",
      icon: <MessageCircle className="w-5 h-5" />,
    },
  ];

  return (
    <header
      className={cn(
        // Mobile-first base styles
        "sticky top-0 z-50 w-full border-b transition-all duration-300 ease-in-out",
        responsiveSpacing.navHeight, // Progressive height increase
        // Background with enhanced blur and transparency
        isScrolled
          ? "border-border/60 bg-background/95 backdrop-blur-xl shadow-sm"
          : "border-border/40 bg-background/90 backdrop-blur-md",
        "supports-[backdrop-filter]:bg-background/80"
      )}
    >
      <div
        className={cn(
          "container flex items-center justify-between h-full",
          responsiveSpacing.containerPadding
        )}
      >
        {/* Logo Section - Mobile First */}
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 sm:gap-3 group transition-all duration-300 ease-in-out",
            "hover:scale-105 rounded-xl p-1.5 sm:p-2 -m-1.5 sm:-m-2",
            responsiveSpacing.focusRing
          )}
          aria-label="Pineapple Tours - Home"
        >
          <div className="relative">
            <img
              src="/pineapple-tour-logo.png"
              alt="Pineapple Tours"
              className={cn(
                "transition-all duration-300 ease-in-out drop-shadow-sm",
                responsiveSpacing.logoSize // Progressive sizing
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {/* Hide text on very small screens, show on sm+ */}
          <div className="hidden xs:block sm:block"></div>
        </Link>

        {/* Desktop Navigation - Hidden on mobile/tablet */}
        <nav
          className={cn(
            "hidden lg:flex flex-1 items-center justify-center",
            tabSpacing.margin // Responsive margin adjustments
          )}
          aria-label="Main navigation"
        >
          <ul
            className={cn(
              "flex items-center",
              tabSpacing.gap // Responsive gap adjustments
            )}
          >
            <li ref={categoryTabRef}>
              <TourCategoriesDropdown />
            </li>
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative py-2.5 font-medium rounded-lg transition-all duration-200",
                    "flex items-center justify-center",
                    tabSpacing.padding, // Responsive padding
                    tabSpacing.textSize, // Responsive text size
                    // Interactive states
                    "hover:bg-accent/50 hover:text-accent-foreground hover:scale-105",
                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                    responsiveSpacing.focusRing,
                    "active:scale-95"
                  )}
                  style={{
                    // Dynamic width based on category tab, with responsive constraints
                    minWidth: categoryTabWidth
                      ? `${categoryTabWidth}px`
                      : "auto",
                    // Enhanced transitions
                    transition:
                      "min-width 0.3s ease-in-out, background-color 0.2s ease-in-out, transform 0.2s ease-in-out, padding 0.2s ease-in-out",
                  }}
                >
                  <span className="relative z-10 whitespace-nowrap">
                    {item.label}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Actions - Hidden on mobile/tablet */}
        <div
          className={cn(
            "hidden lg:flex items-center",
            actionSpacing.gap // Responsive gap adjustments for actions
          )}
        >
          <PhoneNumber phoneNumber="0466 331 232" variant="desktop" />
          <CartIcon />
          <Link href="/tours">
            <Button
              size="sm"
              className={cn(
                "bg-gradient-to-r from-primary to-primary/90",
                "hover:from-primary/90 hover:to-primary hover:scale-105",
                "shadow-md hover:shadow-lg transition-all duration-200",
                "font-semibold active:scale-95",
                actionSpacing.padding // Responsive button padding
              )}
            >
              <span className="hidden xl:inline">Book Now</span>
              <span className="xl:hidden">Book</span>
            </Button>
          </Link>
        </div>

        {/* Mobile/Tablet Actions */}
        <div className={cn("flex lg:hidden items-center gap-2 sm:gap-3")}>
          {/* Show cart on tablet+ */}
          <div className="hidden sm:block">
            <CartIcon />
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 sm:h-11 sm:w-11 rounded-xl transition-all duration-200",
                  "hover:bg-accent/50 active:scale-95",
                  responsiveSpacing.focusRing
                )}
                aria-label={
                  isOpen ? "Close navigation menu" : "Open navigation menu"
                }
              >
                {isOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
                <VisuallyHidden>
                  {isOpen ? "Close" : "Open"} navigation menu
                </VisuallyHidden>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className={cn(
                "w-full sm:w-[380px] md:w-[420px] p-0 overflow-y-auto",
                "border-r border-border/50 bg-background/95 backdrop-blur-xl"
              )}
            >
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
      </div>
    </header>
  );
}
