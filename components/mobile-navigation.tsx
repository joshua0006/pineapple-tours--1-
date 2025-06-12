"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggleSimple } from "@/components/theme-toggle-simple";
import { TourCategoriesDropdown } from "@/components/tour-categories-dropdown";
import { PhoneNumber } from "@/components/ui/phone-number";
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
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/40">
        <Link
          href="/"
          className="flex items-center gap-3 group transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-xl p-2 -m-2"
          onClick={onItemClick}
          aria-label="Pineapple Tours - Home"
        >
          <div className="relative">
            <img
              src="/pineapple-tour-logo.png"
              alt="Pineapple Tours"
              className="h-12 transition-all duration-300 ease-in-out drop-shadow-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-bold text-xl">Pineapple Tours</span>
        </Link>
      </div>

      {/* Mobile Navigation */}
      <nav className="flex-1 p-6" aria-label="Mobile navigation">
        <ul className="space-y-2">
          {/* Tour Categories Dropdown */}
          <li>
            <TourCategoriesDropdown isMobile={true} />
          </li>

          {navigationItems.map((item, index) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-4 text-base font-medium rounded-xl transition-all duration-200",
                  "hover:bg-accent/50 hover:text-accent-foreground hover:scale-[1.02]",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
                  "active:scale-[0.98] active:bg-accent/80",
                  "min-h-[48px] touch-manipulation" // Ensure proper touch target size
                )}
                onClick={onItemClick}
                style={{
                  animationDelay: `${(index + 1) * 75}ms`, // +1 to account for tour categories
                  animation: "fade-in-up 0.4s ease-out forwards",
                }}
              >
                {item.icon && (
                  <span className="flex-shrink-0 w-5 h-5 text-primary">
                    {item.icon}
                  </span>
                )}
                <span className="flex-1 relative z-10">{item.label}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <span className="w-2 h-2 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Footer */}
      <div className="p-6 space-y-4 border-t border-border/40">
        {/* Contact Info with Copy Functionality */}
        <PhoneNumber phoneNumber="0466 331 232" variant="mobile" />

        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/50 hover:bg-accent/30 transition-colors duration-200">
          <span className="text-sm font-medium">Theme</span>
          <ThemeToggleSimple />
        </div>

        {/* CTA Button */}
        <Button
          className={cn(
            "w-full h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl",
            "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
            "active:scale-[0.98] touch-manipulation transition-all duration-200"
          )}
          onClick={onItemClick}
        >
          Book Your Adventure
        </Button>
      </div>
    </div>
  );
}

// Animation styles to be added to global CSS
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
`;
