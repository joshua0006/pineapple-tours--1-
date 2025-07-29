import { notFound } from "next/navigation";
import { Metadata } from "next";
import { EnhancedBookingExperience } from "@/components/enhanced-booking-experience";
import { RezdyPickupLocation } from "@/lib/types/rezdy";

interface BookingPageProps {
  params: Promise<{
    productCode: string;
  }>;
  searchParams: Promise<{
    sessionId?: string;
    adults?: string;
    children?: string;
    infants?: string;
    extras?: string;
    date?: string;
    checkIn?: string;
    checkOut?: string;
    location?: string;
    pickupLocation?: string;
    // Add-on booking prefill parameters
    guestDetails?: string; // Base64 encoded guest details
    prefill?: string; // 'true' to enable prefill
  }>;
}

async function getProduct(productCode: string) {
  try {
    console.log(
      `getProduct: Fetching products for productCode: ${productCode}`
    );

    const url = `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/api/tours/${productCode}`;

    console.log(`getProduct: Fetching single tour via: ${url}`);

    const response = await fetch(url, {
      // Ensure we bypass any stale cache when LIVE_PREVIEW or similar is set
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `getProduct: API response not OK: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    if (!data || !data.tour) {
      console.warn(
        `getProduct: Response did not include tour property for code ${productCode}`
      );
      return null;
    }

    console.log(`getProduct: Successfully fetched tour ${data.tour.name}`);

    return data.tour;
  } catch (error) {
    console.error("getProduct: Error fetching product:", error);
    return null;
  }
}

async function getPickupLocations(productCode: string): Promise<RezdyPickupLocation[]> {
  try {
    console.log(`getPickupLocations: Pre-loading pickup data for ${productCode}`);

    const url = `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/api/rezdy/products/${productCode}/pickups`;

    const response = await fetch(url, {
      cache: "force-cache",
      next: { revalidate: 1800 }, // 30 minutes
    });

    if (!response.ok) {
      console.warn(
        `getPickupLocations: Failed to fetch pickup locations: ${response.status}`
      );
      return [];
    }

    const data = await response.json();
    console.log(
      `getPickupLocations: Successfully fetched ${data.pickups?.length || 0} pickup locations`
    );

    return data.pickups || [];
  } catch (error) {
    console.warn("getPickupLocations: Error fetching pickup locations:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: BookingPageProps): Promise<Metadata> {
  const { productCode } = await params;
  const product = await getProduct(productCode);

  if (!product) {
    return {
      title: "Booking Not Found",
    };
  }

  return {
    title: `Book ${product.name} | Pineapple Tours`,
    description: `Book your ${product.name} tour with secure online booking. ${product.shortDescription}`,
  };
}

export default async function BookingPage({
  params,
  searchParams,
}: BookingPageProps) {
  const { productCode } = await params;
  const searchParamsData = await searchParams;

  // Decode the product code in case it's URL encoded
  const decodedProductCode = decodeURIComponent(productCode);

  console.log("Booking Page Debug:", {
    originalProductCode: productCode,
    decodedProductCode,
    searchParams: searchParamsData,
  });

  // Fetch product and pickup locations in parallel
  const [product, preloadedPickupLocations] = await Promise.all([
    getProduct(decodedProductCode),
    getPickupLocations(decodedProductCode),
  ]);

  console.log("Product lookup result:", {
    productCode: decodedProductCode,
    productFound: !!product,
    productName: product?.name,
    pickupLocationsFound: preloadedPickupLocations.length,
  });

  if (!product) {
    notFound();
  }

  // Parse search params for pre-selection
  const preSelectedParticipants = {
    adults: parseInt(searchParamsData.adults || "1"),
    children: parseInt(searchParamsData.children || "0"),
    infants: parseInt(searchParamsData.infants || "0"),
  };

  // Parse extras from search params if provided
  const preSelectedExtras = searchParamsData.extras
    ? JSON.parse(decodeURIComponent(searchParamsData.extras))
    : [];

  // Fetch session data if sessionId is provided
  let preSelectedSession = null;
  if (searchParamsData.sessionId) {
    try {
      const sessionResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/rezdy/sessions/${searchParamsData.sessionId}`,
        { cache: "no-store" }
      );
      if (sessionResponse.ok) {
        preSelectedSession = await sessionResponse.json();
        console.log("Pre-selected session loaded:", preSelectedSession);

        // Ensure the session matches the current product; if not, ignore it
        if (
          preSelectedSession &&
          preSelectedSession.productCode !== decodedProductCode
        ) {
          console.warn(
            `Session ${preSelectedSession.id} does not belong to product ${decodedProductCode}. Ignoring preSelectedSession.`
          );
          preSelectedSession = null;
        }
      }
    } catch (error) {
      console.warn("Failed to fetch pre-selected session:", error);
    }
  }

  // Parse prefill parameters
  const enablePrefill = searchParamsData.prefill === 'true';
  const encodedGuestDetails = searchParamsData.guestDetails;

  console.log('Prefill Debug:', {
    enablePrefill,
    hasEncodedGuestDetails: !!encodedGuestDetails,
    encodedGuestDetailsLength: encodedGuestDetails?.length || 0,
  });

  return (
    <div className="min-h-screen bg-background">
      <EnhancedBookingExperience
        key={product.productCode}
        product={product}
        preSelectedParticipants={preSelectedParticipants}
        preSelectedExtras={preSelectedExtras}
        preSelectedSession={preSelectedSession}
        preSelectedDate={searchParamsData.date || searchParamsData.checkIn}
        preSelectedSessionId={searchParamsData.sessionId}
        preSelectedLocation={
          searchParamsData.pickupLocation || searchParamsData.location
        }
        preloadedPickupLocations={preloadedPickupLocations}
        enablePrefill={enablePrefill}
        encodedGuestDetails={encodedGuestDetails}
      />
    </div>
  );
}
