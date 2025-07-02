# Product Card Component

A comprehensive product card component designed for displaying tour and activity products with image, details, pricing, and action buttons.

## Features

- **Responsive Design**: Adapts to different screen sizes with optimal layout
- **Product Image**: High-quality image display with hover effects and overlay badges
- **Product Details**: Title, description, location, duration, and guest capacity
- **Pricing Display**: Current price with optional original price for discounts
- **Rating System**: Star rating with review count display
- **Status Badges**: Featured, Popular, Category, and Discount badges
- **Action Buttons**: "View Details" and "Book Now" buttons with customizable behavior
- **Hover Effects**: Smooth animations and visual feedback on user interaction

## Component Structure

```
ProductCard
├── Image Section
│   ├── Product Image (4:3 aspect ratio)
│   ├── Overlay Badges (Featured, Popular, Category)
│   ├── Discount Badge (top-right)
│   └── Rating Badge (bottom-left)
├── Content Section
│   ├── Product Title
│   ├── Product Description
│   ├── Details Row (Location, Duration, Max Guests)
│   └── Price Section
└── Action Buttons
    ├── View Details Button
    └── Book Now Button
```

## Usage

### Basic Usage

```tsx
import { ProductCard } from "@/components/product-card";

<ProductCard
  id="tour-1"
  title="Mount Tamborine Wine Tour"
  description="Experience premium wineries with guided tastings"
  image="/wine-tour.jpg"
  price={159}
  location="Mount Tamborine, QLD"
  duration={6}
  slug="mount-tamborine-wine-tour"
/>;
```

### Advanced Usage with All Props

```tsx
<ProductCard
  id="premium-tour"
  title="Premium Wine Tour Experience"
  description="Exclusive wine tasting with gourmet lunch and scenic views"
  image="/premium-wine-tour.jpg"
  price={159}
  originalPrice={199}
  location="Mount Tamborine, QLD"
  duration={6}
  maxGuests={12}
  rating={4.8}
  reviewCount={124}
  category="Wine Tour"
  isPopular={true}
  isFeatured={true}
  slug="premium-wine-tour"
  onBookNow={() => handleCustomBooking()}
/>
```

## Props Reference

### Required Props

| Prop          | Type     | Description                                |
| ------------- | -------- | ------------------------------------------ |
| `id`          | `string` | Unique identifier for the product          |
| `title`       | `string` | Product title (displayed as main heading)  |
| `description` | `string` | Product description (truncated to 2 lines) |
| `image`       | `string` | Product image URL                          |
| `price`       | `number` | Current price in dollars                   |
| `location`    | `string` | Product location (e.g., "Gold Coast, QLD") |
| `duration`    | `number` | Duration in hours                          |
| `slug`        | `string` | URL slug for routing to product details    |

### Optional Props

| Prop            | Type         | Default | Description                             |
| --------------- | ------------ | ------- | --------------------------------------- |
| `originalPrice` | `number`     | -       | Original price for discount calculation |
| `maxGuests`     | `number`     | -       | Maximum number of guests                |
| `rating`        | `number`     | `4.5`   | Product rating (1-5 scale)              |
| `reviewCount`   | `number`     | `0`     | Number of reviews                       |
| `category`      | `string`     | -       | Product category for badge display      |
| `isPopular`     | `boolean`    | `false` | Show popular badge                      |
| `isFeatured`    | `boolean`    | `false` | Show featured badge                     |
| `onBookNow`     | `() => void` | -       | Custom booking handler                  |

## Styling and Theming

The component uses Tailwind CSS classes and follows the project's design system:

- **Brand Colors**: Uses `brand-accent` and `brand-secondary` for primary actions
- **Responsive Grid**: Designed to work in grid layouts (sm:grid-cols-2 lg:grid-cols-3)
- **Hover Effects**: Subtle animations with `group-hover` utilities
- **Typography**: Consistent font sizes and weights throughout

### Color Scheme

- **Primary Button**: `bg-brand-accent text-brand-secondary hover:bg-coral-600`
- **Secondary Button**: `variant="outline"`
- **Badges**: Various colors for different states (green for popular, red for discounts)

## Behavior

### View Details Button

- **Default**: Links to `/tours/{slug}` using Next.js `Link` component
- **Styling**: Outline variant button, takes up 50% width

### Book Now Button

- **Default**: Redirects to `/booking/{slug}` via `window.location.href`
- **Custom**: Use `onBookNow` prop for custom booking logic
- **Styling**: Primary brand button with calendar icon, takes up 50% width

### Duration Formatting

The component automatically formats duration based on hours:

- `< 1 hour`: "30 min"
- `1 hour`: "1 hour"
- `< 24 hours`: "6 hours"
- `≥ 24 hours`: "2d 4h"

### Discount Calculation

When `originalPrice` is provided:

- Calculates discount percentage: `((originalPrice - price) / originalPrice) * 100`
- Displays discount badge in top-right corner
- Shows strikethrough original price

## Accessibility

- **Alt Text**: Product images include descriptive alt text
- **Semantic HTML**: Uses proper heading hierarchy and semantic elements
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Readers**: Proper labeling and structure for assistive technologies

## Responsive Behavior

- **Mobile**: Single column layout with full-width cards
- **Tablet**: Two-column grid layout
- **Desktop**: Three-column grid layout
- **Image**: Maintains 4:3 aspect ratio across all screen sizes

## Integration Examples

### With Custom Booking Logic

```tsx
const handleBooking = (productId: string) => {
  // Custom booking logic
  trackEvent("booking_initiated", { product_id: productId });
  openBookingModal(productId);
};

<ProductCard {...productData} onBookNow={() => handleBooking(product.id)} />;
```

### In a Product Grid

```tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ))}
</div>
```

### With Loading State

```tsx
{
  isLoading ? <ProductCardSkeleton /> : <ProductCard {...productData} />;
}
```

## Performance Considerations

- **Image Optimization**: Uses Next.js `Image` component with proper sizing
- **Lazy Loading**: Images are loaded as needed
- **Responsive Images**: Different sizes served based on viewport
- **Hover Effects**: CSS-only animations for smooth performance

## Related Components

- `TourCard`: Simpler card for basic tour display
- `ActivityCard`: Card specifically for activity products
- `RezdyProductCard`: Integration with Rezdy booking system

## File Location

- **Component**: `components/product-card.tsx`
- **Demo Page**: `app/demo/product-card/page.tsx`
- **Documentation**: `docs/product-card.md`
