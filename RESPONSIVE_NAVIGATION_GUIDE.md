# Responsive Navigation System Guide

## Overview

This guide documents the comprehensive responsive navigation system implemented for Pineapple Tours. The system follows a mobile-first approach, ensuring optimal user experience across all devices from smartphones to large desktop displays.

## Key Features

### 🎯 Mobile-First Design

- Progressive enhancement from mobile to desktop
- Touch-optimized interactions
- Proper touch target sizes (minimum 44px)
- Swipe gestures and mobile-specific behaviors

### 📱 Responsive Breakpoints

- **xs**: 475px+ (Extra small devices)
- **sm**: 640px+ (Small devices)
- **md**: 768px+ (Medium devices - tablets)
- **lg**: 1024px+ (Large devices - desktops)
- **xl**: 1280px+ (Extra large devices)
- **2xl**: 1536px+ (2X large devices)

### 🎨 Adaptive UI Elements

- Dynamic header height: 64px (mobile) → 72px (tablet) → 80px (desktop)
- Responsive logo sizing
- Progressive spacing and padding
- Contextual navigation patterns

### ⚡ Enhanced Tab Spacing System

- **Compact Navigation** (1024px - 1279px): Optimized for standard desktops
  - Reduced gaps and padding for efficient space usage
  - Maximum tab width: 120px
  - Text size: small (14px)
- **Standard Navigation** (1280px - 1535px): Balanced spacing for large screens
  - Moderate gaps and padding for comfortable interaction
  - Maximum tab width: 140px
  - Text size: small to base (14px → 16px)
- **Spacious Navigation** (1536px+): Generous spacing for ultra-wide displays
  - Larger gaps and padding for premium experience
  - Maximum tab width: 160px
  - Text size: base (16px)

## Components

### 1. SiteHeader (`components/site-header.tsx`)

The main navigation component that adapts across all screen sizes.

#### Key Features:

- **Scroll-aware styling**: Header appearance changes on scroll
- **Progressive disclosure**: Different navigation patterns for different screen sizes
- **Enhanced accessibility**: Proper ARIA labels and keyboard navigation
- **Performance optimized**: Debounced resize handlers and efficient re-renders

#### Responsive Behavior:

```typescript
// Mobile (< 768px)
- Hamburger menu with slide-out navigation
- Compact header with essential elements only
- Full-width mobile menu overlay

// Tablet (768px - 1023px)
- Hamburger menu with larger touch targets
- Cart icon visible
- Improved spacing

// Desktop (1024px+)
- Full horizontal navigation
- All actions visible
- Hover effects and animations
```

### 2. MobileNavigation (`components/mobile-navigation.tsx`)

Dedicated mobile navigation component with enhanced mobile experience.

#### Features:

- **Animated menu items**: Staggered fade-in animations
- **Touch-optimized**: Proper touch targets and feedback
- **Scrollable content**: Custom scrollbar styling
- **Progressive enhancement**: Different layouts for different mobile sizes

### 3. ResponsiveContainer (`components/ui/responsive-container.tsx`)

Utility components for consistent responsive layouts.

#### Components:

- `ResponsiveContainer`: Adaptive container with responsive padding
- `ResponsiveGrid`: Mobile-first grid system
- `ResponsiveFlex`: Flexible layouts with breakpoint-specific directions
- `ResponsiveText`: Typography that scales across devices

## Hooks

### useResponsive (`hooks/use-responsive.ts`)

Enhanced responsive hook providing comprehensive device detection.

```typescript
const {
  isMobile, // < 768px
  isTablet, // 768px - 1023px
  isDesktop, // >= 1024px
  isLargeDesktop, // >= 1280px
  width, // Current viewport width
  breakpoints, // Breakpoint values
  // Utility functions
  isSmallScreen, // < 640px
  isMediumScreen, // 640px - 1023px
  isLargeScreen, // >= 1024px
} = useResponsive();
```

### useResponsiveValue

Utility hook for responsive values:

```typescript
const padding = useResponsiveValue({
  mobile: "1rem",
  tablet: "1.5rem",
  desktop: "2rem",
  default: "1rem",
});
```

## CSS Utilities

### Mobile-First Utilities

```css
/* Touch-friendly interactions */
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Responsive padding */
.responsive-padding-x {
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .responsive-padding-x {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

/* Custom scrollbars for mobile */
.scrollbar-thin {
  scrollbar-width: thin;
}
```

### Responsive Text Utilities

```css
.text-responsive-sm {
  font-size: 0.875rem;
}
.text-responsive-base {
  font-size: 1rem;
}
.text-responsive-lg {
  font-size: 1.125rem;
}

@media (min-width: 768px) {
  .text-responsive-sm {
    font-size: 1rem;
  }
  .text-responsive-base {
    font-size: 1.125rem;
  }
  .text-responsive-lg {
    font-size: 1.25rem;
  }
}
```

## Responsive Spacing Utilities

### useResponsiveSpacing Hook

A comprehensive hook for managing responsive spacing across the navigation system:

```typescript
import { useResponsiveSpacing } from "@/lib/utils/responsive-spacing";

const {
  tabSpacing, // Current tab spacing configuration
  actionSpacing, // Current action spacing configuration
  calculateOptimalTabWidth, // Function to calculate optimal tab width
  getTabSpacing, // Get spacing config for current breakpoint
  getActionSpacing, // Get action spacing config
} = useResponsiveSpacing();
```

### Static Spacing Classes

Pre-defined responsive spacing classes for consistent usage:

```typescript
import { responsiveSpacing } from "@/lib/utils/responsive-spacing";

// Tab spacing
responsiveSpacing.tabGap; // 'gap-0.5 lg:gap-1 xl:gap-1.5 2xl:gap-2'
responsiveSpacing.tabPadding; // 'px-2 lg:px-2.5 xl:px-3 2xl:px-4'
responsiveSpacing.tabMargin; // 'mx-2 lg:mx-4 xl:mx-6 2xl:mx-8'
responsiveSpacing.tabTextSize; // 'text-sm lg:text-sm xl:text-base 2xl:text-base'

// Action spacing
responsiveSpacing.actionGap; // 'gap-2 lg:gap-2.5 xl:gap-3 2xl:gap-4'
responsiveSpacing.actionPadding; // 'px-3 lg:px-4 xl:px-5 2xl:px-6'

// Navigation elements
responsiveSpacing.navHeight; // 'h-16 sm:h-18 lg:h-20'
responsiveSpacing.logoSize; // 'h-10 sm:h-12 lg:h-16'
responsiveSpacing.focusRing; // 'focus:ring-2 focus:ring-primary/20 focus:ring-offset-2'
```

### Breakpoint-Specific Configurations

The system automatically adjusts spacing based on screen width:

```typescript
// Compact Navigation (1024px - 1279px)
{
  gap: 'gap-0.5 lg:gap-1',
  padding: 'px-2 lg:px-2.5',
  margin: 'mx-2 lg:mx-4',
  textSize: 'text-sm lg:text-sm',
  maxWidth: 120
}

// Standard Navigation (1280px - 1535px)
{
  gap: 'gap-1 xl:gap-1.5',
  padding: 'px-2.5 xl:px-3',
  margin: 'mx-4 xl:mx-6',
  textSize: 'text-sm xl:text-base',
  maxWidth: 140
}

// Spacious Navigation (1536px+)
{
  gap: 'gap-1.5 2xl:gap-2',
  padding: 'px-3 2xl:px-4',
  margin: 'mx-6 2xl:mx-8',
  textSize: 'text-base 2xl:text-base',
  maxWidth: 160
}
```

## Implementation Examples

### Basic Responsive Layout

```tsx
import {
  ResponsiveContainer,
  ResponsiveGrid,
} from "@/components/ui/responsive-container";

function MyComponent() {
  return (
    <ResponsiveContainer padding="md" variant="wide">
      <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="lg">
        {/* Content */}
      </ResponsiveGrid>
    </ResponsiveContainer>
  );
}
```

### Conditional Rendering

```tsx
import { useResponsive } from "@/hooks/use-responsive";

function AdaptiveComponent() {
  const { isMobile, isDesktop } = useResponsive();

  return (
    <div>
      {isMobile && <MobileSpecificComponent />}
      {isDesktop && <DesktopSpecificComponent />}
    </div>
  );
}
```

### Responsive Styling

```tsx
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/use-responsive";

function StyledComponent() {
  const { isMobile } = useResponsive();

  return (
    <div
      className={cn(
        "p-4 sm:p-6 lg:p-8", // Progressive padding
        "text-sm sm:text-base lg:text-lg", // Progressive text size
        "flex-col sm:flex-row", // Layout direction
        isMobile && "touch-manipulation" // Conditional classes
      )}
    >
      {/* Content */}
    </div>
  );
}
```

## Performance Considerations

### 1. Debounced Resize Handlers

All resize event listeners use debouncing to prevent excessive re-renders:

```typescript
let timeoutId: NodeJS.Timeout;
const debouncedUpdate = () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(updateScreenSize, 100);
};
```

### 2. Efficient Re-renders

Components only re-render when breakpoints actually change, not on every resize event.

### 3. CSS-First Approach

Most responsive behavior is handled through CSS classes rather than JavaScript, improving performance.

## Accessibility Features

### 1. Keyboard Navigation

- Full keyboard support for all interactive elements
- Proper focus management in mobile menu
- Escape key closes mobile menu

### 2. Screen Reader Support

- Proper ARIA labels and roles
- Hidden elements for screen readers where appropriate
- Semantic HTML structure

### 3. Touch Accessibility

- Minimum 44px touch targets
- Proper touch feedback
- Swipe gesture hints for mobile users

## Browser Support

### Modern Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Browsers

- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

### Fallbacks

- Graceful degradation for older browsers
- CSS feature detection using `@supports`
- Progressive enhancement approach

## Testing Guidelines

### 1. Device Testing

Test on actual devices when possible:

- iPhone SE (375px width)
- iPhone 12/13 (390px width)
- iPad (768px width)
- Desktop (1024px+ width)

### 2. Browser DevTools

Use responsive design mode to test:

- Various viewport sizes
- Touch simulation
- Network throttling

### 3. Accessibility Testing

- Screen reader testing
- Keyboard-only navigation
- High contrast mode
- Reduced motion preferences

## Common Patterns

### 1. Progressive Disclosure

```tsx
// Show more content as screen size increases
<div>
  <div className="block sm:hidden">Mobile content</div>
  <div className="hidden sm:block lg:hidden">Tablet content</div>
  <div className="hidden lg:block">Desktop content</div>
</div>
```

### 2. Responsive Spacing

```tsx
// Use consistent spacing patterns
<div className="p-3 sm:p-6 lg:p-8">
  <div className="space-y-2 sm:space-y-4 lg:space-y-6">
    {/* Content with responsive spacing */}
  </div>
</div>
```

### 3. Adaptive Components

```tsx
// Components that change behavior based on screen size
function AdaptiveButton() {
  const { isMobile } = useResponsive();

  return (
    <Button
      size={isMobile ? "sm" : "md"}
      variant={isMobile ? "outline" : "default"}
    >
      {isMobile ? "Book" : "Book Your Adventure"}
    </Button>
  );
}
```

## Troubleshooting

### Common Issues

1. **Hydration Mismatches**

   - Use `useEffect` for client-side only responsive logic
   - Provide fallback values for SSR

2. **Performance Issues**

   - Ensure resize handlers are debounced
   - Use CSS for responsive behavior when possible
   - Avoid excessive re-renders

3. **Touch Issues on Mobile**
   - Ensure proper touch targets (44px minimum)
   - Use `touch-action: manipulation`
   - Test on actual devices

### Debug Tips

```typescript
// Add debug logging to responsive hook
const responsive = useResponsive();
console.log("Current breakpoint:", {
  width: responsive.width,
  isMobile: responsive.isMobile,
  isTablet: responsive.isTablet,
  isDesktop: responsive.isDesktop,
});
```

## Future Enhancements

### Planned Features

- Container queries support
- Enhanced gesture recognition
- Improved animation performance
- Better offline experience

### Experimental Features

- CSS Grid subgrid support
- Advanced scroll behaviors
- Enhanced touch interactions

---

This responsive navigation system provides a solid foundation for creating adaptive, accessible, and performant user interfaces across all device types. The mobile-first approach ensures that the experience is optimized for the most constrained environments while progressively enhancing for larger screens.
