"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/use-responsive";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  // Layout variants
  variant?: "default" | "centered" | "wide" | "narrow";
  // Responsive padding
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  // Max width constraints
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "none";
  // Mobile-specific props
  mobileFullWidth?: boolean;
  mobileNoPadding?: boolean;
}

const paddingVariants = {
  none: "",
  sm: "px-2 sm:px-4 md:px-6",
  md: "px-3 sm:px-6 md:px-8 lg:px-12",
  lg: "px-4 sm:px-8 md:px-12 lg:px-16",
  xl: "px-6 sm:px-12 md:px-16 lg:px-20",
};

const maxWidthVariants = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full",
  none: "",
};

const variantStyles = {
  default: "mx-auto",
  centered: "mx-auto text-center",
  wide: "mx-auto max-w-7xl",
  narrow: "mx-auto max-w-3xl",
};

export function ResponsiveContainer({
  children,
  className,
  variant = "default",
  padding = "md",
  maxWidth = "none",
  mobileFullWidth = false,
  mobileNoPadding = false,
}: ResponsiveContainerProps) {
  const { isMobile } = useResponsive();

  return (
    <div
      className={cn(
        // Base styles
        "w-full",
        // Variant styles
        variantStyles[variant],
        // Max width
        maxWidth !== "none" && maxWidthVariants[maxWidth],
        // Padding (responsive by default, can be overridden for mobile)
        !mobileNoPadding && paddingVariants[padding],
        mobileNoPadding && isMobile && "px-0",
        mobileNoPadding && !isMobile && paddingVariants[padding],
        // Mobile full width override
        mobileFullWidth && isMobile && "max-w-full",
        // Custom className
        className
      )}
    >
      {children}
    </div>
  );
}

// Responsive grid component
interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  // Grid columns for different breakpoints
  cols?: {
    mobile?: 1 | 2;
    tablet?: 1 | 2 | 3 | 4;
    desktop?: 1 | 2 | 3 | 4 | 5 | 6;
  };
  // Gap between items
  gap?: "sm" | "md" | "lg" | "xl";
}

const gapVariants = {
  sm: "gap-2 sm:gap-3",
  md: "gap-3 sm:gap-4 md:gap-6",
  lg: "gap-4 sm:gap-6 md:gap-8",
  xl: "gap-6 sm:gap-8 md:gap-10",
};

export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "md",
}: ResponsiveGridProps) {
  const getGridCols = () => {
    const { mobile = 1, tablet = 2, desktop = 3 } = cols;

    const mobileClass = `grid-cols-${mobile}`;
    const tabletClass = `md:grid-cols-${tablet}`;
    const desktopClass = `lg:grid-cols-${desktop}`;

    return `${mobileClass} ${tabletClass} ${desktopClass}`;
  };

  return (
    <div className={cn("grid", getGridCols(), gapVariants[gap], className)}>
      {children}
    </div>
  );
}

// Responsive flex component
interface ResponsiveFlexProps {
  children: ReactNode;
  className?: string;
  // Direction for different breakpoints
  direction?: {
    mobile?: "row" | "col";
    tablet?: "row" | "col";
    desktop?: "row" | "col";
  };
  // Alignment
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  // Gap
  gap?: "sm" | "md" | "lg" | "xl";
  // Wrap
  wrap?: boolean;
}

export function ResponsiveFlex({
  children,
  className,
  direction = { mobile: "col", tablet: "row", desktop: "row" },
  align = "start",
  justify = "start",
  gap = "md",
  wrap = false,
}: ResponsiveFlexProps) {
  const getFlexDirection = () => {
    const { mobile = "col", tablet = "row", desktop = "row" } = direction;

    const mobileClass = mobile === "row" ? "flex-row" : "flex-col";
    const tabletClass = tablet === "row" ? "md:flex-row" : "md:flex-col";
    const desktopClass = desktop === "row" ? "lg:flex-row" : "lg:flex-col";

    return `${mobileClass} ${tabletClass} ${desktopClass}`;
  };

  const alignClass = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  }[align];

  const justifyClass = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  }[justify];

  return (
    <div
      className={cn(
        "flex",
        getFlexDirection(),
        alignClass,
        justifyClass,
        gapVariants[gap],
        wrap && "flex-wrap",
        className
      )}
    >
      {children}
    </div>
  );
}

// Responsive text component
interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  // Text size for different breakpoints
  size?: {
    mobile?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
    tablet?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
    desktop?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  };
  // Text alignment
  align?: {
    mobile?: "left" | "center" | "right";
    tablet?: "left" | "center" | "right";
    desktop?: "left" | "center" | "right";
  };
  as?: "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function ResponsiveText({
  children,
  className,
  size = { mobile: "base", tablet: "base", desktop: "base" },
  align = { mobile: "left", tablet: "left", desktop: "left" },
  as: Component = "p",
}: ResponsiveTextProps) {
  const getTextSize = () => {
    const { mobile = "base", tablet = "base", desktop = "base" } = size;

    const mobileClass = `text-${mobile}`;
    const tabletClass = `md:text-${tablet}`;
    const desktopClass = `lg:text-${desktop}`;

    return `${mobileClass} ${tabletClass} ${desktopClass}`;
  };

  const getTextAlign = () => {
    const { mobile = "left", tablet = "left", desktop = "left" } = align;

    const mobileClass = `text-${mobile}`;
    const tabletClass = `md:text-${tablet}`;
    const desktopClass = `lg:text-${desktop}`;

    return `${mobileClass} ${tabletClass} ${desktopClass}`;
  };

  return (
    <Component className={cn(getTextSize(), getTextAlign(), className)}>
      {children}
    </Component>
  );
}
