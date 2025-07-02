"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  Phone,
  ChevronDown,
  MapPin,
  Users,
  MessageCircle,
  Database,
  Bus,
  Gift,
  BookOpen,
  X,
  Clock,
  Crown,
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
  const { isMobile, isTablet, isDesktop, md, lg, xl, width } = useResponsive();
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
    {
      href: "/tours",
      label: "All Tours",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      href: "/daily-tours",
      label: "Daily Tours",
      icon: <Clock className="w-5 h-5" />,
    },
    {
      href: "/private-tours",
      label: "Private Tours",
      icon: <Crown className="w-5 h-5" />,
    },
    { href: "/blog", label: "Blog", icon: <BookOpen className="w-5 h-5" /> },
    {
      href: "/contact",
      label: "Contact Us",
      icon: <MessageCircle className="w-5 h-5" />,
    },
  ];

  // Calculate responsive tab distribution
  const getTabStyles = () => {
    const totalTabs = navigationItems.length + 1; // +1 for categories dropdown

    if (width >= 1536) {
      // 2xl and above - can accommodate larger tabs
      return {
        containerWidth: "w-full",
        tabWidth: "flex-1 max-w-[160px]",
        gap: "gap-2",
        padding: "px-3.5 py-3",
        textSize: "text-base",
      };
    } else if (width >= 1280) {
      // xl - reduce tab size slightly for more tabs
      return {
        containerWidth: "w-full",
        tabWidth: "flex-1 max-w-[140px]",
        gap: "gap-1.5",
        padding: "px-3 py-2.5",
        textSize: "text-sm",
      };
    } else if (width >= 1024) {
      // lg - more compact for 6 total tabs
      return {
        containerWidth: "w-full",
        tabWidth: "flex-1 max-w-[120px]",
        gap: "gap-1",
        padding: "px-2.5 py-2.5",
        textSize: "text-sm",
      };
    }

    return {
      containerWidth: "w-full",
      tabWidth: "flex-1",
      gap: "gap-1",
      padding: "px-2 py-2",
      textSize: "text-xs",
    };
  };

  const tabStyles = getTabStyles();

  return (
    <header
      className={cn(
        // Full width base styles
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
          // Full width container with edge-to-edge content
          "w-full flex items-center justify-between h-full",
          "px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16"
        )}
      >
        {/* Logo Section - Flexible width */}
        <div className="flex-shrink-0">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 sm:gap-3 group transition-transform duration-300 ease-in-out",
              "hover:scale-105 rounded-xl p-1.5 sm:p-2 -m-1.5 sm:-m-2"
            )}
            aria-label="Pineapple Tours - Home"
          >
            <div className="relative">
              <img
                src="/pineapple-tour-logo.png"
                alt="Pineapple Tours"
                className={cn(
                  "drop-shadow-sm",
                  responsiveSpacing.logoSize // Progressive sizing
                )}
              />
            </div>
            {/* Hide text on very small screens, show on sm+ */}
            <div className="hidden xs:block sm:block"></div>
          </Link>
        </div>

        {/* Desktop Navigation - Full width distribution */}
        <nav
          className={cn(
            "hidden lg:flex flex-1 items-center justify-center",
            "px-4 xl:px-8 2xl:px-12" // Additional spacing for better distribution
          )}
          aria-label="Main navigation"
        >
          <ul
            className={cn(
              "flex items-center justify-center w-full max-w-5xl",
              tabStyles.gap
            )}
          >
            <li ref={categoryTabRef} className={tabStyles.tabWidth}>
              <div className="flex justify-center">
                <TourCategoriesDropdown />
              </div>
            </li>
            {navigationItems.map((item) => (
              <li key={item.href} className={tabStyles.tabWidth}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative font-medium rounded-lg transition-all duration-200",
                    "flex items-center justify-center w-full",
                    tabStyles.padding,
                    tabStyles.textSize,
                    // Interactive states
                    "hover:scale-105 hover:bg-primary/5",
                    "focus:outline-none",
                    responsiveSpacing.focusRing,
                    "active:scale-95"
                  )}
                >
                  <span className="relative z-10 whitespace-nowrap text-center">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Actions - Flexible width */}
        <div
          className={cn(
            "hidden lg:flex items-center flex-shrink-0",
            actionSpacing.gap
          )}
        >
          <PhoneNumber phoneNumber="0466 331 232" variant="desktop" />
          <Link href="/tours">
            <Button
              size="sm"
              className={cn(
                "bg-gradient-to-r from-primary to-primary/90",
                "hover:scale-105",
                "shadow-md transition-transform duration-200",
                "font-semibold active:scale-95",
                actionSpacing.padding
              )}
            >
              <span className="hidden xl:inline">Book Now</span>
              <span className="xl:hidden">Book</span>
            </Button>
          </Link>
        </div>

        {/* Mobile/Tablet Actions */}
        <div
          className={cn(
            "flex lg:hidden items-center gap-2 sm:gap-3 flex-shrink-0"
          )}
        >
          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 sm:h-11 sm:w-11 transition-transform duration-200 active:scale-95"
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
