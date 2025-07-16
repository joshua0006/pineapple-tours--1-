import { NextRequest, NextResponse } from "next/server";
import { bookingDataStore } from "@/lib/services/booking-data-store";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;
    
    console.log("🔍 API: Retrieving booking for order:", orderNumber);
    console.log("📋 Request details:", {
      url: request.url,
      orderNumber: orderNumber,
      orderNumberLength: orderNumber?.length,
      headers: Object.fromEntries(request.headers.entries())
    });

    if (!orderNumber) {
      console.error("❌ API: No order number provided");
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 }
      );
    }

    // Retrieve booking data from the server-side store
    console.log("🔄 API: Attempting to retrieve with fallbacks...");
    const bookingData = await bookingDataStore.retrieveWithFallbacks(orderNumber);

    if (!bookingData) {
      console.error("❌ API: Booking not found for order:", orderNumber);
      console.error("📊 Store state:", bookingDataStore.getStats());
      return NextResponse.json(
        { error: "Booking not found", orderNumber: orderNumber },
        { status: 404 }
      );
    }

    // Return the actual booking data
    console.log("✅ API: Successfully retrieved booking data:", {
      orderNumber: orderNumber,
      hasPayment: !!bookingData.payment,
      paymentType: bookingData.payment?.type,
      productName: bookingData.product?.name
    });
    
    return NextResponse.json({
      success: true,
      data: bookingData
    });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking details" },
      { status: 500 }
    );
  }
} 