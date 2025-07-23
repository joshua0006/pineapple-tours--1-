"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  MapPin,
  Heart,
  Sparkles,
  Calendar,
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
  subcategories?: Category[];
}

// Updated categories based on user requirements
const tourCategories: Category[] = [
  {
    id: "daily-winery-tours",
    name: "Daily Winery Tours",
    icon: <Calendar className="w-4 h-4" />,
    href: "/tours/category/daily-winery-tours",
    featured: true,
  },
  {
    id: "private-winery-tours",
    name: "Private Winery Tours",
    icon: <Sparkles className="w-4 h-4" />,
    href: "/tours/category/private-winery-tours",
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
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
    if (category.subcategories && category.subcategories.length > 0) {
      // Toggle expanded state for categories with subcategories
      const newExpanded = new Set(expandedCategories);
      if (newExpanded.has(category.id)) {
        newExpanded.delete(category.id);
      } else {
        newExpanded.add(category.id);
      }
      setExpandedCategories(newExpanded);
    } else {
      // Navigate for categories without subcategories
      router.push(category.href);
      setIsOpen(false);
    }
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
                    <span className="flex-1">{category.name}</span>
                    {category.featured && (
                      <span className="px-1.5 py-0.5 text-xs bg-coral-500/20 text-coral-700 dark:text-coral-300 rounded">
                        Popular
                      </span>
                    )}
                    {category.subcategories && (
                      <ChevronDown className={cn(
                        "w-4 h-4 text-coral-500 transition-transform duration-200",
                        expandedCategories.has(category.id) && "rotate-180"
                      )} />
                    )}
                  </button>
                  {category.subcategories && expandedCategories.has(category.id) && (
                    <div className="ml-6 mt-1 space-y-1 animate-dropdown-in">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            router.push(sub.href);
                            setIsOpen(false);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-left text-sm rounded-md transition-colors hover:bg-coral-50 hover:text-coral-700 dark:hover:bg-coral-500/10 dark:hover:text-coral-300"
                        >
                          <span className="text-coral-400">
                            {sub.icon}
                          </span>
                          <span className="text-gray-600 dark:text-gray-300">
                            {sub.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
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
        <div className="absolute top-full left-0 mt-2 w-[450px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden animate-dropdown-in">
          <div className="p-2">
            <div className="px-3 py-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Browse Categories
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Explore our tour collections
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {tourCategories.map((category) => (
                <div key={category.id}>
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 text-left group hover:bg-gradient-to-r hover:from-coral-50 hover:to-orange-50 dark:hover:from-coral-900/20 dark:hover:to-orange-900/20 hover:shadow-sm relative overflow-hidden"
                  >
                    <div className="relative z-10 p-2 bg-coral-100 dark:bg-coral-900/30 rounded-lg group-hover:bg-coral-200 dark:group-hover:bg-coral-800/40 transition-colors">
                      <span className="text-coral-600 dark:text-coral-400">
                        {category.icon}
                      </span>
                    </div>
                    <div className="flex-1 relative z-10">
                      <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white block">
                        {category.name}
                      </span>
                      {category.featured && (
                        <span className="text-xs text-coral-600 dark:text-coral-400 mt-0.5 inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Popular
                        </span>
                      )}
                    </div>
                    {category.subcategories && (
                      <ChevronDown className={cn(
                        "w-4 h-4 text-gray-400 dark:text-gray-500 relative z-10 transition-transform duration-200",
                        expandedCategories.has(category.id) && "rotate-180"
                      )} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-coral-100/0 via-coral-100/50 to-coral-100/0 dark:from-coral-500/0 dark:via-coral-500/10 dark:to-coral-500/0 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  </button>
                  {category.subcategories && expandedCategories.has(category.id) && (
                    <div className="mt-1 ml-4 space-y-1 animate-dropdown-in">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            router.push(sub.href);
                            setIsOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-all duration-200 text-left group hover:bg-coral-50 dark:hover:bg-coral-900/20 hover:shadow-sm"
                        >
                          <div className="p-1.5 bg-coral-50 dark:bg-coral-900/20 rounded-md group-hover:bg-coral-100 dark:group-hover:bg-coral-800/30 transition-colors">
                            <span className="text-coral-500 dark:text-coral-400">
                              {sub.icon}
                            </span>
                          </div>
                          <span className="text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            {sub.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 px-3 pb-1">
              <button
                onClick={() => {
                  router.push("/tours");
                  setIsOpen(false);
                }}
                className="w-full text-center py-2 text-sm font-medium text-coral-600 hover:text-coral-700 dark:text-coral-400 dark:hover:text-coral-300 hover:bg-coral-50 dark:hover:bg-coral-900/20 rounded-lg transition-colors"
              >
                View All Tours →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
