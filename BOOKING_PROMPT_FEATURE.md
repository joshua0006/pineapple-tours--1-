# Booking Prompt Pop-up Feature

## Overview

The Booking Prompt Pop-up is an intelligent user engagement feature that appears after 30 seconds of user inactivity on the Pineapple Tours website. It's designed to capture user intent and streamline the booking process by collecting essential information (group size and travel dates) and guiding users to relevant tours.

## Features

### Core Functionality
- **30-Second Trigger**: Appears after 30 seconds of user inactivity
- **Group Size Selection**: Dropdown to select number of travelers (1-10)
- **Date Selection**: Intuitive date picker for travel dates
- **Smart Navigation**: Redirects to search page with pre-filled data
- **Session Persistence**: Remembers user interaction to prevent repeated popups

### User Experience
- **Non-intrusive Design**: Appears only when user is inactive
- **Easily Dismissible**: Multiple ways to close (X button, ESC key, backdrop click)
- **Smooth Animations**: Subtle fade-in/fade-out transitions
- **Visual Appeal**: Modern design with tropical theme colors
- **Trust Indicators**: Security and cancellation badges

### Accessibility
- **ARIA Compliance**: Proper labels, roles, and descriptions
- **Focus Management**: Automatic focus on first interactive element
- **Focus Trapping**: Tab navigation contained within popup
- **Keyboard Support**: Full keyboard navigation and ESC key support
- **Screen Reader Compatible**: Semantic HTML and proper announcements

### Responsive Design
- **Mobile Optimized**: Touch-friendly interface with proper sizing
- **Cross-Device**: Consistent experience across desktop, tablet, and mobile
- **Viewport Aware**: Proper positioning and sizing on all screen sizes
- **Safe Areas**: Respects device safe areas and notches

## Technical Implementation

### Components

#### 1. BookingPromptPopup (`components/booking-prompt-popup.tsx`)
Main popup component with:
- Activity tracking and timer management
- Form state management
- Animation handling
- Accessibility features

#### 2. BookingPromptWrapper (`components/booking-prompt-wrapper.tsx`)
Navigation wrapper that:
- Handles routing to search page
- Manages booking data storage
- Integrates with Next.js navigation

#### 3. useBookingPrompt Hook (`hooks/use-booking-prompt.ts`)
Custom hook for:
- Session storage management
- Booking data persistence
- State synchronization

### Activity Tracking

The popup monitors the following user interaction events:
- `mousedown` - Mouse button presses
- `mousemove` - Mouse movement
- `keypress` - Keyboard input
- `scroll` - Page scrolling
- `touchstart` - Touch interactions
- `click` - Click events

### Data Flow

1. **Inactivity Detection**: Timer starts when page loads
2. **User Activity**: Any interaction resets the timer
3. **Popup Trigger**: After 30 seconds of inactivity, popup appears
4. **Data Collection**: User inputs group size and travel date
5. **Navigation**: "Start Booking" redirects to search with pre-filled data
6. **Persistence**: User interaction stored in sessionStorage

### Storage Schema

```typescript
interface BookingPromptData {
  groupSize: number
  bookingDate: Date | undefined
  hasInteracted: boolean
}
```

Stored in `sessionStorage` with key: `pineapple-tours-booking-prompt`

## Integration

### Search Form Integration

The search form (`components/search-form.tsx`) automatically:
- Reads URL parameters from booking prompt navigation
- Pre-fills form fields with user selections
- Highlights pre-populated fields with visual indicators
- Shows confirmation message when data is pre-filled

### Layout Integration

Added to root layout (`app/layout.tsx`) to ensure:
- Global availability across all pages
- Consistent behavior throughout the site
- Proper theme integration

## Usage

### For Users

1. **Natural Browsing**: Browse the website normally
2. **Inactivity Trigger**: After 30 seconds of no interaction, popup appears
3. **Quick Setup**: Select group size and travel date
4. **Start Booking**: Click "Start Booking" to proceed with pre-filled search
5. **Continue Browsing**: Click "Continue browsing" to dismiss

### For Developers

#### Basic Implementation
```tsx
import { BookingPromptWrapper } from '@/components/booking-prompt-wrapper'

// Add to layout or page
<BookingPromptWrapper />
```

#### Custom Implementation
```tsx
import { BookingPromptPopup } from '@/components/booking-prompt-popup'

function MyComponent() {
  const handleStartBooking = (data) => {
    // Handle booking data
    console.log('Group size:', data.groupSize)
    console.log('Date:', data.bookingDate)
  }

  return (
    <BookingPromptPopup 
      onStartBooking={handleStartBooking}
      onDismiss={() => console.log('Dismissed')}
    />
  )
}
```

#### Using the Hook
```tsx
import { useBookingPrompt } from '@/hooks/use-booking-prompt'

function SearchForm() {
  const { promptData, hasPromptData } = useBookingPrompt()
  
  // Pre-fill form with prompt data
  useEffect(() => {
    if (promptData) {
      setGroupSize(promptData.groupSize)
      setDate(promptData.bookingDate)
    }
  }, [promptData])
}
```

## Configuration

### Timing
```typescript
const INACTIVITY_TIMEOUT = 30000 // 30 seconds (configurable)
```

### Storage Key
```typescript
const STORAGE_KEY = 'pineapple-tours-booking-prompt'
```

### Group Size Range
- Minimum: 1 traveler
- Maximum: 10 travelers
- Default: 2 travelers

### Date Range
- Minimum: Today
- Maximum: 1 year from today

## Styling

### CSS Classes
- `.booking-prompt-enter` - Entry animation
- `.booking-prompt-exit` - Exit animation
- `.booking-prompt-backdrop-enter` - Backdrop fade in
- `.booking-prompt-backdrop-exit` - Backdrop fade out

### Theme Integration
- Uses design system colors and spacing
- Supports light/dark theme switching
- Consistent with existing UI components

## Testing

### Demo Page
Visit `/demo/booking-prompt` to:
- Test the 30-second trigger
- See all features in action
- Understand the user flow
- Test on different devices

### Manual Testing
1. Open website in incognito/private window
2. Wait 30 seconds without interaction
3. Verify popup appears with smooth animation
4. Test form functionality
5. Verify navigation and data persistence

### Accessibility Testing
- Test with screen readers
- Verify keyboard navigation
- Check focus management
- Test with high contrast mode

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Features Used**: 
  - sessionStorage
  - addEventListener with passive option
  - CSS transforms and transitions
  - Intersection Observer (for future enhancements)

## Performance Considerations

- **Lightweight**: Minimal impact on page load
- **Lazy Loading**: Components only render when needed
- **Event Optimization**: Uses passive event listeners
- **Memory Management**: Proper cleanup of timers and listeners

## Future Enhancements

### Planned Features
- **A/B Testing**: Different trigger timings and designs
- **Personalization**: Location-based location suggestions
- **Analytics**: Detailed interaction tracking
- **Smart Timing**: ML-based optimal trigger timing
- **Exit Intent**: Additional trigger on mouse leave

### Potential Improvements
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Offline Support**: Service worker integration
- **Multi-language**: Internationalization support
- **Advanced Animations**: More sophisticated transitions

## Troubleshooting

### Common Issues

#### Popup Not Appearing
- Check if user has already interacted in current session
- Verify 30 seconds of complete inactivity
- Clear sessionStorage: `sessionStorage.removeItem('pineapple-tours-booking-prompt')`

#### Data Not Persisting
- Check sessionStorage support in browser
- Verify storage quota not exceeded
- Check for JavaScript errors in console

#### Mobile Issues
- Ensure touch events are properly handled
- Check viewport meta tag configuration
- Verify responsive breakpoints

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('booking-prompt-debug', 'true')
```

## Security Considerations

- **XSS Protection**: All user inputs are sanitized
- **Storage Limits**: sessionStorage has built-in size limits
- **No Sensitive Data**: Only stores non-sensitive booking preferences
- **Client-Side Only**: No server-side data transmission

## Compliance

- **GDPR**: No personal data collection without consent
- **WCAG 2.1**: AA level accessibility compliance
- **Privacy**: Uses sessionStorage (cleared on browser close)
- **Performance**: Meets Core Web Vitals standards

---

## Quick Start

1. **Install**: Already integrated in the project
2. **Test**: Visit any page and wait 30 seconds
3. **Demo**: Go to `/demo/booking-prompt` for guided experience
4. **Customize**: Modify components in `components/` directory

For questions or issues, please refer to the project documentation or create an issue in the repository. 