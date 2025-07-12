import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 }
      );
    }

    // In a real implementation, you would fetch booking details from your database
    // For now, we'll return a basic response indicating the booking exists
    // This is just a placeholder - you should implement actual booking retrieval logic

    return NextResponse.json({
      orderNumber,
      productName: "Tour Booking",
      date: new Date().toISOString().split('T')[0],
      time: "TBD",
      guestCount: 1,
      pickupLocation: "TBD",
      totalAmount: 0,
      customerEmail: "",
      status: "CONFIRMED",
      message: "Booking details retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking details" },
      { status: 500 }
    );
  }
} 