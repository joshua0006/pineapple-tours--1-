import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/lib/services/session-service";

const DEMO_EMAIL = process.env.DEMO_USER_EMAIL || "demo@example.com";
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || "password123";

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = await request.json();

    // Simple demo credential check – replace with real auth
    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create session
    const session = await SessionService.createSession(email);

    // Cookie max-age: 1h by default, 7d if rememberMe is true
    const maxAge = rememberMe ? 7 * 24 * 60 * 60 : 60 * 60; // seconds

    const response = NextResponse.json({
      success: true,
      sessionId: session.id,
    });

    response.cookies.set({
      name: "sessionId",
      value: session.id,
      httpOnly: true,
      sameSite: "strict",
      maxAge,
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to process login" },
      { status: 500 }
    );
  }
}
