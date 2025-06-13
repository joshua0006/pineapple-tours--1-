import { useResponsive } from "@/hooks/use-responsive";

/**
 * Responsive spacing utility for navigation tabs and UI elements
 */
export function useResponsiveSpacing() {
  const {
    isCompactNavigation,
    isStandardNavigation,
    isSpaciousNavigation,
    width,
  } = useResponsive();

  /**
   * Get responsive tab spacing configuration
   */
  const getTabSpacing = () => {
    if (isCompactNavigation) {
      return {
        gap: "gap-0.5 lg:gap-1",
        padding: "px-2 lg:px-2.5",
        margin: "mx-2 lg:mx-4",
        textSize: "text-sm lg:text-sm",
        maxWidth: 120, // Compact max width
      };
    }

    if (isStandardNavigation) {
      return {
        gap: "gap-1 xl:gap-1.5",
        padding: "px-2.5 xl:px-3",
        margin: "mx-4 xl:mx-6",
        textSize: "text-sm xl:text-base",
        maxWidth: 140, // Standard max width
      };
    }

    if (isSpaciousNavigation) {
      return {
        gap: "gap-1.5 2xl:gap-2",
        padding: "px-3 2xl:px-4",
        margin: "mx-6 2xl:mx-8",
        textSize: "text-base 2xl:text-base",
        maxWidth: 160, // Spacious max width
      };
    }

    // Default fallback
    return {
      gap: "gap-1",
      padding: "px-2.5",
      margin: "mx-4",
      textSize: "text-sm",
      maxWidth: 120,
    };
  };

  /**
   * Get responsive action spacing configuration
   */
  const getActionSpacing = () => {
    if (isCompactNavigation) {
      return {
        gap: "gap-2 lg:gap-2.5",
        padding: "px-3 lg:px-4",
      };
    }

    if (isStandardNavigation) {
      return {
        gap: "gap-2.5 xl:gap-3",
        padding: "px-4 xl:px-5",
      };
    }

    if (isSpaciousNavigation) {
      return {
        gap: "gap-3 2xl:gap-4",
        padding: "px-5 2xl:px-6",
      };
    }

    return {
      gap: "gap-2.5",
      padding: "px-4",
    };
  };

  /**
   * Calculate optimal tab width based on content and screen size
   */
  const calculateOptimalTabWidth = (baseWidth: number): number => {
    const spacing = getTabSpacing();
    return Math.min(baseWidth, spacing.maxWidth);
  };

  /**
   * Get responsive container spacing
   */
  const getContainerSpacing = () => {
    return {
      padding: "px-3 sm:px-4 md:px-6 lg:px-8",
      margin: "mx-auto",
      maxWidth: "max-w-7xl",
    };
  };

  return {
    getTabSpacing,
    getActionSpacing,
    calculateOptimalTabWidth,
    getContainerSpacing,
    // Direct access to spacing configurations
    tabSpacing: getTabSpacing(),
    actionSpacing: getActionSpacing(),
    containerSpacing: getContainerSpacing(),
  };
}

/**
 * Static responsive spacing classes for use in className strings
 */
export const responsiveSpacing = {
  // Tab spacing classes
  tabGap: "gap-0.5 lg:gap-1 xl:gap-1.5 2xl:gap-2",
  tabPadding: "px-2 lg:px-2.5 xl:px-3 2xl:px-4",
  tabMargin: "mx-2 lg:mx-4 xl:mx-6 2xl:mx-8",
  tabTextSize: "text-sm lg:text-sm xl:text-base 2xl:text-base",

  // Action spacing classes
  actionGap: "gap-2 lg:gap-2.5 xl:gap-3 2xl:gap-4",
  actionPadding: "px-3 lg:px-4 xl:px-5 2xl:px-6",

  // Container spacing classes
  containerPadding: "px-3 sm:px-4 md:px-6 lg:px-8",
  containerMargin: "mx-auto",
  containerMaxWidth: "max-w-7xl",

  // Navigation specific
  navHeight: "h-16 sm:h-18 lg:h-20",
  logoSize: "h-12 sm:h-16 lg:h-20",

  // Interactive elements
  touchTarget: "min-h-[44px] min-w-[44px]",
  focusRing: "focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
} as const;

/**
 * Responsive breakpoint utilities
 */
export const breakpointUtils = {
  // Media query strings for use with CSS-in-JS or styled-components
  mobile: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
  largeDesktop: "(min-width: 1280px)",
  extraLargeDesktop: "(min-width: 1536px)",

  // Compact navigation range
  compactNav: "(min-width: 1024px) and (max-width: 1279px)",
  standardNav: "(min-width: 1280px) and (max-width: 1535px)",
  spaciousNav: "(min-width: 1536px)",
} as const;
