"use client"

import Link from "next/link"
import { Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggleSimple } from "@/components/theme-toggle-simple"
import { TourCategoriesDropdown } from "@/components/tour-categories-dropdown"
import { cn } from "@/lib/utils"

interface NavigationItem {
  href: string
  label: string
  icon?: React.ReactNode
}

interface MobileNavigationProps {
  navigationItems: NavigationItem[]
  onItemClick: () => void
  className?: string
}

export function MobileNavigation({ 
  navigationItems, 
  onItemClick, 
  className 
}: MobileNavigationProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <Link 
          href="/" 
          className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 rounded-md" 
          onClick={onItemClick}
          aria-label="Pineapple Tours - Home"
        >
          <img src="/pineapple-tour-logo.png" alt="Pineapple Tours" className="h-10" />
          <span>Pineapple Tours</span>
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
                  "flex items-center gap-3 px-4 py-4 text-base font-medium rounded-xl transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground hover:scale-[1.02]",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2",
                  "active:scale-[0.98] active:bg-accent/80",
                  "min-h-[48px] touch-manipulation" // Ensure proper touch target size
                )}
                onClick={onItemClick}
                style={{ 
                  animationDelay: `${(index + 1) * 75}ms`, // +1 to account for tour categories
                  animation: "fade-in-up 0.4s ease-out forwards"
                }}
              >
                {item.icon && (
                  <span className="flex-shrink-0 w-5 h-5 text-brand-accent">
                    {item.icon}
                  </span>
                )}
                <span className="flex-1">{item.label}</span>
                <span className="w-2 h-2 bg-brand-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Footer */}
      <div className="p-6 space-y-4 border-t">
        {/* Contact Info */}
        <div className="flex items-center gap-3 p-4 bg-background/50 rounded-xl border">
          <div className="flex-shrink-0 w-10 h-10 bg-brand-green-accent/10 rounded-full flex items-center justify-center">
            <Phone className="h-5 w-5 text-brand-green-accent" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Call us anytime</p>
            <p className="text-sm text-muted-foreground truncate">1-800-PINEAPPLE</p>
          </div>
        </div>
        
        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border">
          <span className="text-sm font-medium">Theme</span>
          <ThemeToggleSimple />
        </div>
        
        {/* CTA Button */}
        <Button 
          className={cn(
            "w-full h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl",
            "active:scale-[0.98] touch-manipulation"
          )}
          onClick={onItemClick}
        >
          Book Your Adventure
        </Button>
      </div>
    </div>
  )
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
` 