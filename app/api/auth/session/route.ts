import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/lib/services/session-service";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("sessionId")?.value;

    if (!sessionId) {
      return NextResponse.json({ valid: false });
    }

    const session = await SessionService.getSession(sessionId);
    const valid = Boolean(session);

    return NextResponse.json({ valid, sessionId: valid ? sessionId : null });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ valid: false });
  }
}
