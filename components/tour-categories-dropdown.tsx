"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  MapPin,
  Heart,
  Sparkles,
  Calendar,
  Wine,
  Beer,
  Bus,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  href: string;
  featured?: boolean;
}

// Updated categories based on user requirements
const tourCategories: Category[] = [
  {
    id: "winery-tours",
    name: "Winery Tours",
    icon: <Wine className="w-4 h-4" />,
    href: "/tours/category/winery-tours",
    featured: true,
  },
  {
    id: "brewery-tours",
    name: "Brewery Tours",
    icon: <Beer className="w-4 h-4" />,
    href: "/tours/category/brewery-tours",
    featured: true,
  },
  {
    id: "hop-on-hop-off",
    name: "Hop-On Hop-Off",
    icon: <Bus className="w-4 h-4" />,
    href: "/tours/category/hop-on-hop-off",
    featured: true,
  },
  {
    id: "bus-charter",
    name: "Bus Charter",
    icon: <Bus className="w-4 h-4" />,
    href: "/tours/category/bus-charter",
  },
  {
    id: "day-tours",
    name: "Day Tours",
    icon: <Calendar className="w-4 h-4" />,
    href: "/tours/category/day-tours",
    featured: true,
  },
  {
    id: "corporate-tours",
    name: "Corporate Tours",
    icon: <Building className="w-4 h-4" />,
    href: "/tours/category/corporate-tours",
  },
  {
    id: "hens-party",
    name: "Hens Party",
    icon: <Heart className="w-4 h-4" />,
    href: "/tours/category/hens-party",
    featured: true,
  },
  {
    id: "barefoot-luxury",
    name: "Barefoot Luxury",
    icon: <Sparkles className="w-4 h-4" />,
    href: "/tours/category/barefoot-luxury",
    featured: true,
  },
];

interface TourCategoriesDropdownProps {
  className?: string;
  isMobile?: boolean;
}

export function TourCategoriesDropdown({
  className,
  isMobile = false,
}: TourCategoriesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleCategoryClick = (category: Category) => {
    router.push(category.href);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <div className={cn("w-full", className)}>
        <div className="space-y-1">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full px-4 py-3 text-left text-base font-medium rounded-xl transition-all duration-200 hover:bg-coral-50 hover:text-coral-700 dark:hover:bg-coral-500/10 dark:hover:text-coral-300 focus:bg-coral-50 focus:text-coral-700 dark:focus:bg-coral-500/10 dark:focus:text-coral-300 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-coral-500" />
              <span>Categories</span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </button>

          {isOpen && (
            <div className="mt-2 space-y-1">
              {tourCategories.map((category) => (
                <div
                  key={category.id}
                  className="border-l-2 border-coral-500/20 ml-4"
                >
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm font-medium rounded-lg transition-colors hover:bg-coral-50 hover:text-coral-700 dark:hover:bg-coral-500/10 dark:hover:text-coral-300 focus:bg-coral-50 focus:text-coral-700 dark:focus:bg-coral-500/10 dark:focus:text-coral-300 focus:outline-none"
                  >
                    <span className="text-coral-500 group-hover:text-coral-600 dark:group-hover:text-coral-400 transition-colors">
                      {category.icon}
                    </span>
                    <span>{category.name}</span>
                    {category.featured && (
                      <span className="px-1.5 py-0.5 text-xs bg-coral-500/20 text-coral-700 dark:text-coral-300 rounded">
                        Popular
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop/Tablet version
  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 flex items-center justify-center gap-1"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MapPin className="w-4 h-4 text-primary" />
        <span className="relative z-10 hidden lg:inline">Categories</span>
        <span className="relative z-10 lg:hidden">Tours</span>
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform duration-200 relative z-10",
            isOpen && "rotate-180"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[400px] bg-popover border rounded-lg shadow-lg z-50 overflow-hidden animate-dropdown-in">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Browse Categories
            </h3>
            <div className="space-y-1">
              {tourCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md transition-colors text-left group hover:bg-coral-50 hover:text-coral-700 dark:hover:bg-coral-500/10 dark:hover:text-coral-300"
                >
                  <span className="text-coral-500 group-hover:text-coral-600 dark:group-hover:text-coral-400 transition-colors">
                    {category.icon}
                  </span>
                  <span className="flex-1">{category.name}</span>
                  {category.featured && (
                    <span className="px-1.5 py-0.5 text-xs bg-coral-500/20 text-coral-700 dark:text-coral-300 rounded">
                      Popular
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
