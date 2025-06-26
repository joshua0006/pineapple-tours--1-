import { notFound } from "next/navigation";
import { Metadata } from "next";
import { EnhancedBookingExperience } from "@/components/enhanced-booking-experience";

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
  }>;
}

async function getProduct(productCode: string) {
  try {
    console.log(
      `getProduct: Fetching products for productCode: ${productCode}`
    );

    const url = `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/api/rezdy/products/all`;

    console.log(`getProduct: API URL: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `getProduct: API response not OK: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();
    console.log(`getProduct: API response keys:`, Object.keys(data));

    const products = data.products || data.data || [];
    console.log(`getProduct: Found ${products.length} products`);

    if (products.length > 0) {
      console.log(
        `getProduct: Sample product codes:`,
        products.slice(0, 3).map((p: any) => p.productCode)
      );
    }

    // Find the product with the matching product code
    const product = products.find((p: any) => p.productCode === productCode);

    console.log(`getProduct: Product lookup result:`, {
      searchedCode: productCode,
      found: !!product,
      productName: product?.name,
    });

    return product || null;
  } catch (error) {
    console.error("getProduct: Error fetching product:", error);
    return null;
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

  const product = await getProduct(decodedProductCode);

  console.log("Product lookup result:", {
    productCode: decodedProductCode,
    productFound: !!product,
    productName: product?.name,
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
      }
    } catch (error) {
      console.warn("Failed to fetch pre-selected session:", error);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <EnhancedBookingExperience
        product={product}
        preSelectedParticipants={preSelectedParticipants}
        preSelectedExtras={preSelectedExtras}
        preSelectedSession={preSelectedSession}
      />
    </div>
  );
}
