# Pineapple Tours - Rezdy Integration

A modern travel booking website built with Next.js 14, TypeScript, and Tailwind CSS, featuring real-time integration with the Rezdy booking platform.

## Features

### 🌟 Core Features
- **Real-time Tour Data**: Dynamic tour listings fetched from Rezdy API
- **Live Availability**: Real-time availability checking and booking
- **Responsive Design**: Mobile-first design that works on all devices
- **Search & Filtering**: Advanced search and filtering capabilities
- **Booking System**: Complete booking flow with Rezdy integration
- **Error Handling**: Graceful error handling with retry mechanisms

### 🎯 Rezdy Integration
- **Product Management**: Fetch and display tours from Rezdy
- **Availability Checking**: Real-time session availability
- **Booking Creation**: Direct booking through Rezdy API
- **Price Display**: Dynamic pricing with real-time updates
- **Image Management**: Automatic image handling from Rezdy

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Rezdy API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pineapple-tours
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   REZDY_API_KEY=your_rezdy_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   └── rezdy/         # Rezdy API endpoints
│   ├── tours/             # Tour pages
│   │   ├── [slug]/        # Dynamic tour detail pages
│   │   └── page.tsx       # Tours listing page
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── dynamic-tour-card.tsx
│   ├── booking-form.tsx
│   ├── error-state.tsx
│   └── tour-grid-skeleton.tsx
├── hooks/                # Custom React hooks
│   └── use-rezdy.ts      # Rezdy API hooks
├── lib/                  # Utilities and types
│   ├── types/
│   │   └── rezdy.ts      # Rezdy TypeScript types
│   └── utils/
│       └── product-utils.ts # Product utility functions
└── styles/               # Global styles
```

## Rezdy Integration Details

### API Endpoints

The application includes the following Rezdy API endpoints:

- **`/api/rezdy/products`** - Fetch all tour products
- **`/api/rezdy/availability`** - Check availability for specific products
- **`/api/rezdy/sessions/[id]`** - Get detailed session information
- **`/api/rezdy/bookings`** - Create and manage bookings

### React Hooks

#### `useRezdyProducts(limit, offset)`
Fetches tour products from Rezdy with pagination support.

```typescript
const { data: products, loading, error } = useRezdyProducts(12, 0)
```

#### `useRezdyAvailability(productCode, startDate, endDate, participants)`
Checks availability for a specific product and date range.

```typescript
const { data: availability, loading } = useRezdyAvailability(
  'TOUR001',
  '2024-01-15',
  '2024-01-20',
  'ADULT:2'
)
```

### Components

#### `DynamicTourCard`
Displays tour information using real Rezdy product data:
- Product images with fallback handling
- Dynamic pricing and availability status
- Automatic slug generation for URLs
- Responsive design with hover effects

#### `BookingForm`
Complete booking interface with:
- Real-time availability checking
- Session selection
- Customer information collection
- Payment processing integration
- Error handling and validation

#### `ErrorState`
Graceful error handling component with:
- User-friendly error messages
- Retry functionality
- Consistent styling

## Key Features

### Dynamic Tour Display
- **Real-time Data**: All tour information is fetched from Rezdy
- **Image Handling**: Automatic primary image detection with fallbacks
- **Price Display**: Dynamic pricing with proper formatting
- **Status Indicators**: Live availability status badges

### Search and Filtering
- **Text Search**: Search across tour names and descriptions
- **Category Filtering**: Filter by tour types (family, adventure, etc.)
- **Price Filtering**: Filter by price ranges
- **Sorting Options**: Sort by name, price, or date

### Booking Flow
1. **Tour Selection**: Browse and select tours
2. **Date Selection**: Choose from available dates
3. **Session Selection**: Pick specific time slots
4. **Customer Details**: Enter booking information
5. **Payment**: Secure payment processing
6. **Confirmation**: Booking confirmation and email

### Error Handling
- **API Failures**: Graceful handling of API errors
- **Network Issues**: Retry mechanisms for network problems
- **Loading States**: Skeleton loaders during data fetching
- **User Feedback**: Clear error messages and recovery options

## Customization

### Styling
The project uses Tailwind CSS with a custom design system:
- **Primary Color**: Yellow (#EAB308)
- **Typography**: Inter font family
- **Components**: Shadcn/ui component library

### Adding New Features
1. **New API Endpoints**: Add to `app/api/rezdy/`
2. **Custom Hooks**: Extend `hooks/use-rezdy.ts`
3. **Components**: Add to `components/`
4. **Types**: Update `lib/types/rezdy.ts`

## Deployment

### Environment Variables
Ensure these environment variables are set in production:
```env
REZDY_API_KEY=your_production_rezdy_api_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Build and Deploy
```bash
npm run build
npm start
```

## API Rate Limiting

The application implements caching to respect Rezdy API rate limits:
- **Products**: Cached for 5 minutes
- **Availability**: Cached for 1 minute
- **Sessions**: Cached for 5 minutes

## Security

- **API Key Protection**: Rezdy API key is server-side only
- **Input Validation**: All user inputs are validated
- **Error Sanitization**: Error messages don't expose sensitive data
- **HTTPS**: All API calls use HTTPS

## Support

For issues with the Rezdy integration:
1. Check the API key configuration
2. Verify network connectivity
3. Review error messages in browser console
4. Check Rezdy API documentation for changes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 