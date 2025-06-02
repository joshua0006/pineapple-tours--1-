# Scroll Lock Implementation

This document explains the scroll lock implementation used to prevent background scrolling when modals/popups are open, particularly on touch devices.

## Problem

On touch devices (especially mobile), when a modal or popup is open, users can still scroll the background content by swiping. This creates a poor user experience where:

1. The background scrolls instead of the modal content
2. Users can accidentally dismiss the modal by scrolling
3. The interface feels unresponsive and confusing

## Solution

We've implemented a comprehensive scroll lock system that:

1. **Prevents body scrolling** when modals are open
2. **Allows scrolling within modal content** 
3. **Handles touch events** properly on mobile devices
4. **Preserves scroll position** when modal closes
5. **Prevents layout shift** by accounting for scrollbar width

## Implementation

### 1. Custom Hook: `useScrollLock`

Located in `hooks/use-scroll-lock.ts`, this hook provides:

```typescript
useScrollLock({
  enabled: true,
  allowScrollInside: ['.modal-content', '[data-radix-popover-content]']
})
```

**Features:**
- Locks body scroll when enabled
- Allows scrolling in specified elements
- Handles touch events and wheel events
- Restores scroll position on cleanup
- Prevents layout shift by accounting for scrollbar width

### 2. CSS Classes

Added to `app/globals.css`:

```css
.scroll-lock {
  overflow: hidden !important;
  position: fixed !important;
  width: 100% !important;
  height: 100% !important;
}

.modal-backdrop {
  touch-action: none;
  -webkit-overflow-scrolling: touch;
}

.modal-content {
  touch-action: auto;
  -webkit-overflow-scrolling: touch;
}

.no-touch-scroll {
  touch-action: none;
  overscroll-behavior: none;
}
```

### 3. Modal Structure

The modal structure in `app/tours/[slug]/page.tsx`:

```jsx
<div className="modal-backdrop no-touch-scroll" onTouchMove={preventBackgroundScroll}>
  <div className="modal-content">
    <div className="h-full overflow-y-auto">
      <EnhancedBookingExperience />
    </div>
  </div>
</div>
```

## Mobile-Specific Handling

### iOS Safari Fixes

Special handling for iOS Safari using CSS feature detection:

```css
@supports (-webkit-touch-callout: none) {
  body.scroll-lock {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    overscroll-behavior: none !important;
  }
}
```

### Touch Event Handling

The hook prevents touch scrolling while allowing it within modal content:

```typescript
const preventTouchMove = (e: TouchEvent) => {
  let target = e.target as Element
  while (target && target !== document.body) {
    // Allow scrolling within specified elements
    for (const selector of allowScrollInside) {
      if (target.matches?.(selector) || target.closest?.(selector)) {
        return
      }
    }
    target = target.parentElement as Element
  }
  e.preventDefault()
}
```

## Usage

### In Components

```typescript
import { useScrollLock } from '@/hooks/use-scroll-lock'

export function MyModal() {
  useScrollLock({
    enabled: true,
    allowScrollInside: ['.modal-content', '.scrollable-area']
  })
  
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        {/* Modal content that can scroll */}
      </div>
    </div>
  )
}
```

### In Modal Containers

```jsx
<div 
  className="modal-backdrop no-touch-scroll"
  onTouchMove={(e) => {
    if (e.target === e.currentTarget) {
      e.preventDefault()
    }
  }}
>
  <div className="modal-content">
    {/* Scrollable content */}
  </div>
</div>
```

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support  
- **Safari (desktop)**: Full support
- **iOS Safari**: Full support with specific fixes
- **Android Chrome**: Full support
- **Samsung Internet**: Full support

## Testing

To test the scroll lock:

1. Open a modal on a touch device
2. Try to scroll the background - it should not move
3. Scroll within the modal content - it should work normally
4. Close the modal - scroll position should be restored

## Troubleshooting

### Background still scrolls on mobile
- Ensure `touch-action: none` is applied to backdrop
- Check that `overscroll-behavior: none` is set
- Verify touch event listeners are properly attached

### Modal content doesn't scroll
- Ensure modal content has `touch-action: auto`
- Check that the element is in the `allowScrollInside` array
- Verify the element has proper overflow settings

### Layout shift when modal opens
- Ensure scrollbar width calculation is working
- Check that padding-right is applied to body
- Verify the scroll lock is applied before modal renders

## Future Improvements

1. **Focus management**: Trap focus within modal
2. **Escape key handling**: Close modal on escape
3. **Animation support**: Smooth transitions
4. **Multiple modals**: Handle nested modals
5. **Performance**: Optimize for large pages 