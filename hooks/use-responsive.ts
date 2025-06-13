import { useState, useEffect } from "react";

type BreakpointKey = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface Breakpoints {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  "2xl": boolean;
}

const breakpoints = {
  xs: 475, // Extra small devices
  sm: 640, // Small devices
  md: 768, // Medium devices (tablets)
  lg: 1024, // Large devices (desktops)
  xl: 1280, // Extra large devices
  "2xl": 1536, // 2X large devices
};

export function useResponsive() {
  const [screenSize, setScreenSize] = useState<Breakpoints>({
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    "2xl": false,
  });

  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateScreenSize = () => {
      const currentWidth = window.innerWidth;
      setWidth(currentWidth);

      setScreenSize({
        xs: currentWidth >= breakpoints.xs,
        sm: currentWidth >= breakpoints.sm,
        md: currentWidth >= breakpoints.md,
        lg: currentWidth >= breakpoints.lg,
        xl: currentWidth >= breakpoints.xl,
        "2xl": currentWidth >= breakpoints["2xl"],
      });
    };

    // Set initial values
    updateScreenSize();

    // Add event listener with debouncing for better performance
    let timeoutId: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScreenSize, 100);
    };

    window.addEventListener("resize", debouncedUpdate);

    // Cleanup
    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, []);

  // Mobile-first approach: define device types based on breakpoints
  const isMobile = width < breakpoints.md; // < 768px
  const isTablet = width >= breakpoints.md && width < breakpoints.lg; // 768px - 1023px
  const isDesktop = width >= breakpoints.lg; // >= 1024px
  const isLargeDesktop = width >= breakpoints.xl; // >= 1280px
  const isExtraLargeDesktop = width >= breakpoints["2xl"]; // >= 1536px

  return {
    ...screenSize,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isExtraLargeDesktop,
    width,
    // Utility functions for common responsive patterns
    isSmallScreen: width < breakpoints.sm,
    isMediumScreen: width >= breakpoints.sm && width < breakpoints.lg,
    isLargeScreen: width >= breakpoints.lg,
    // Navigation-specific utilities
    isCompactNavigation: width >= breakpoints.lg && width < breakpoints.xl, // 1024px - 1279px
    isStandardNavigation: width >= breakpoints.xl && width < breakpoints["2xl"], // 1280px - 1535px
    isSpaciousNavigation: width >= breakpoints["2xl"], // >= 1536px
    // Breakpoint values for custom logic
    breakpoints,
  };
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Custom hook for specific responsive behaviors
export function useResponsiveValue<T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}): T {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile && values.mobile !== undefined) return values.mobile;
  if (isTablet && values.tablet !== undefined) return values.tablet;
  if (isDesktop && values.desktop !== undefined) return values.desktop;

  return values.default;
}
