"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggleSimple } from "@/components/theme-toggle-simple";
import { TourCategoriesDropdown } from "@/components/tour-categories-dropdown";
import { PhoneNumber } from "@/components/ui/phone-number";
import { useResponsive } from "@/hooks/use-responsive";
import { cn } from "@/lib/utils";

interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface MobileNavigationProps {
  navigationItems: NavigationItem[];
  onItemClick: () => void;
  className?: string;
}

export function MobileNavigation({
  navigationItems,
  onItemClick,
  className,
}: MobileNavigationProps) {
  const { isMobile, isTablet, width } = useResponsive();

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Mobile Header */}
      <div
        className={cn(
          "flex items-center justify-between border-b border-border/40",
          "p-4 sm:p-6", // Responsive padding
          "bg-gradient-to-r from-background to-background/95"
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 sm:gap-3 group transition-all duration-300 ease-in-out",
            "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20",
            "focus:ring-offset-2 rounded-xl p-2 -m-2 touch-manipulation"
          )}
          onClick={onItemClick}
          aria-label="Pineapple Tours - Home"
        >
          <div className="relative">
            <img
              src="/pineapple-tour-logo.png"
              alt="Pineapple Tours"
              className={cn(
                "transition-all duration-300 ease-in-out drop-shadow-sm",
                "h-10 sm:h-12" // Responsive logo size
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span
            className={cn(
              "font-bold transition-all duration-300",
              "text-lg sm:text-xl", // Responsive text size
              "bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
            )}
          >
            Pineapple Tours
          </span>
        </Link>
      </div>

      {/* Mobile Navigation */}
      <nav
        className={cn(
          "flex-1 overflow-y-auto",
          "p-4 sm:p-6", // Responsive padding
          "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
        )}
        aria-label="Mobile navigation"
      >
        <ul className="space-y-1 sm:space-y-2">
          {/* Tour Categories Dropdown */}
          <li className="mb-2 sm:mb-3">
            <TourCategoriesDropdown isMobile={true} />
          </li>

          {navigationItems.map((item, index) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl transition-all duration-200",
                  "px-3 py-3 sm:px-4 sm:py-4", // Responsive padding
                  "text-base font-medium touch-manipulation",
                  "hover:bg-accent/50 hover:text-accent-foreground hover:scale-[1.02]",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                  "focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
                  "active:scale-[0.98] active:bg-accent/80",
                  "min-h-[48px] sm:min-h-[52px]", // Ensure proper touch target size
                  // Enhanced mobile interactions
                  "hover:shadow-sm active:shadow-none",
                  "border border-transparent hover:border-border/20"
                )}
                onClick={onItemClick}
                style={{
                  animationDelay: `${(index + 1) * 75}ms`,
                  animation: "fade-in-up 0.4s ease-out forwards",
                }}
              >
                {item.icon && (
                  <span
                    className={cn(
                      "flex-shrink-0 text-primary transition-transform duration-200",
                      "w-5 h-5 group-hover:scale-110"
                    )}
                  >
                    {item.icon}
                  </span>
                )}
                <span className="flex-1 relative z-10">{item.label}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <span
                  className={cn(
                    "w-2 h-2 bg-primary/20 rounded-full transition-all duration-200",
                    "opacity-0 group-hover:opacity-100 group-hover:bg-primary/40"
                  )}
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Footer */}
      <div
        className={cn(
          "border-t border-border/40 bg-gradient-to-t from-background/95 to-background",
          "p-4 sm:p-6 space-y-3 sm:space-y-4" // Responsive padding and spacing
        )}
      >
        {/* Contact Info with Copy Functionality */}
        <PhoneNumber phoneNumber="0466 331 232" variant="mobile" />

        {/* Theme Toggle */}
        <div
          className={cn(
            "flex items-center justify-between rounded-xl border border-border/50",
            "p-3 sm:p-4", // Responsive padding
            "bg-background/50 hover:bg-accent/30 transition-colors duration-200",
            "touch-manipulation"
          )}
        >
          <span className="text-sm font-medium">Theme</span>
          <ThemeToggleSimple />
        </div>

        {/* CTA Button */}
        <Button
          className={cn(
            "w-full text-base font-semibold rounded-xl shadow-lg hover:shadow-xl",
            "h-12 sm:h-14", // Responsive height
            "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
            "active:scale-[0.98] touch-manipulation transition-all duration-200",
            "focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
            // Enhanced mobile interactions
            "hover:shadow-primary/20 active:shadow-md"
          )}
          onClick={onItemClick}
        >
          Book Your Adventure
        </Button>

        {/* Additional mobile-specific actions for very small screens */}
        {isMobile && width < 400 && (
          <div className="pt-2 border-t border-border/20">
            <p className="text-xs text-muted-foreground text-center">
              Swipe left to close menu
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced animation styles to be added to global CSS
export const mobileNavigationStyles = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Custom scrollbar for mobile navigation */
  .scrollbar-thin {
    scrollbar-width: thin;
  }
  
  .scrollbar-thumb-border {
    scrollbar-color: hsl(var(--border)) transparent;
  }
  
  /* Webkit scrollbar styles */
  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: hsl(var(--border));
    border-radius: 2px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--border) / 0.8);
  }

  /* Touch-friendly interactions */
  @media (hover: none) and (pointer: coarse) {
    .touch-manipulation {
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
  }
`;
