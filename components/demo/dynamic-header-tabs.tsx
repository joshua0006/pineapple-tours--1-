"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Users, BookOpen, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function DynamicHeaderTabsDemo() {
  const [categoryTabWidth, setCategoryTabWidth] = useState<number | null>(null);
  const [categoryText, setCategoryText] = useState("Categories");
  const categoryTabRef = useRef<HTMLLIElement>(null);

  // Measure category tab width
  useEffect(() => {
    const measureCategoryTab = () => {
      if (categoryTabRef.current) {
        const width = categoryTabRef.current.offsetWidth;
        setCategoryTabWidth((prevWidth) => {
          if (prevWidth === null || Math.abs(prevWidth - width) > 2) {
            return width;
          }
          return prevWidth;
        });
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
  }, [categoryText]);

  const navigationItems = [
    { href: "/tours", label: "Tours", icon: <MapPin className="w-4 h-4" /> },
    { href: "/blog", label: "Blog", icon: <BookOpen className="w-4 h-4" /> },
    {
      href: "/contact",
      label: "Contact Us",
      icon: <MessageCircle className="w-4 h-4" />,
    },
  ];

  const categoryOptions = [
    "Categories",
    "Tour Categories",
    "Browse Tours",
    "Explore",
    "Adventure Categories",
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Dynamic Header Tabs Demo</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          The header tabs automatically adjust their width to match the category
          dropdown tab. Try changing the category text to see how all tabs
          resize dynamically.
        </p>

        {/* Category Text Selector */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categoryOptions.map((option) => (
            <button
              key={option}
              onClick={() => setCategoryText(option)}
              className={cn(
                "px-3 py-1 text-sm rounded-md transition-colors",
                categoryText === option
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {option}
            </button>
          ))}
        </div>

        {categoryTabWidth && (
          <div className="text-sm text-muted-foreground">
            Current tab width:{" "}
            <span className="font-mono">{categoryTabWidth}px</span>
          </div>
        )}
      </div>

      {/* Demo Navigation */}
      <div className="border rounded-lg p-6 bg-background/50">
        <nav className="flex items-center justify-center">
          <ul className="flex items-center gap-2">
            {/* Category Tab (Reference) */}
            <li ref={categoryTabRef}>
              <button className="group relative px-4 py-2.5 text-base font-medium rounded-lg transition-all duration-200 hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 flex items-center justify-center gap-1 bg-primary/10 border border-primary/20">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="relative z-10">{categoryText}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
            </li>

            {/* Dynamic Width Navigation Items */}
            {navigationItems.map((item) => (
              <li key={item.href}>
                <button
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
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Feature Explanation */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">How it works:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Uses React refs to measure the category tab width</li>
            <li>• ResizeObserver monitors size changes in real-time</li>
            <li>• Other tabs adjust their minimum width to match</li>
            <li>• Smooth transitions provide visual feedback</li>
            <li>• Debounced measurements prevent performance issues</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Benefits:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Consistent visual alignment across all tabs</li>
            <li>• Responsive design that adapts to content changes</li>
            <li>• Maintains accessibility and keyboard navigation</li>
            <li>• Smooth animations enhance user experience</li>
            <li>• Works across different screen sizes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
