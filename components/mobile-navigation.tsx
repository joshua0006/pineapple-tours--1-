"use client"

import Link from "next/link"
import { Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggleSimple } from "@/components/theme-toggle-simple"
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
          className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-md" 
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
          {navigationItems.map((item, index) => (
            <li key={item.href}>
              <Link 
                href={item.href} 
                className={cn(
                  "flex items-center gap-3 px-4 py-4 text-base font-medium rounded-xl transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground hover:scale-[1.02]",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2",
                  "active:scale-[0.98] active:bg-accent/80",
                  "min-h-[48px] touch-manipulation" // Ensure proper touch target size
                )}
                onClick={onItemClick}
                style={{ 
                  animationDelay: `${index * 75}ms`,
                  animation: "fade-in-up 0.4s ease-out forwards"
                }}
              >
                {item.icon && (
                  <span className="flex-shrink-0 w-5 h-5 text-yellow-500">
                    {item.icon}
                  </span>
                )}
                <span className="flex-1">{item.label}</span>
                <span className="w-2 h-2 bg-yellow-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Footer */}
      <div className="p-6 border-t space-y-4 bg-accent/20">
        {/* Contact Info */}
        <div className="flex items-center gap-3 p-4 bg-background/50 rounded-xl border">
          <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
            <Phone className="h-5 w-5 text-yellow-500" aria-hidden="true" />
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
            "w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-600 hover:to-yellow-700",
            "focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200",
            "h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl",
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