import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/lib/services/session-service";

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("sessionId");

    if (sessionCookie?.value) {
      await SessionService.deleteSession(sessionCookie.value);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "sessionId",
      value: "",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
