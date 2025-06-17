import { NextResponse } from "next/server";
import WordPressAPIService, {
  CategorizedWordPressData,
} from "@/lib/services/wordpress-api";

export async function GET() {
  try {
    const wordpressData: CategorizedWordPressData =
      await WordPressAPIService.fetchAllCategorizedData();

    return NextResponse.json({
      success: true,
      data: wordpressData,
      message: "WordPress data fetched successfully",
    });
  } catch (error) {
    console.error("Error in WordPress API route:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch WordPress data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
