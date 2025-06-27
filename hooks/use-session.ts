"use client";

import { useCallback, useEffect, useState } from "react";

export interface SessionState {
  sessionId: string | null;
  authenticated: boolean;
  loading: boolean;
}

/**
 * Client-side convenience hook to keep track of the current session cookie and
 * provide helpers for login / logout. It does not expose the httpOnly cookie
 * value (for security) but holds a boolean authenticated flag based on the
 * presence of the cookie.
 */
export function useSession(): [
  SessionState,
  { login: typeof login; logout: typeof logout }
] {
  const [state, setState] = useState<SessionState>({
    sessionId: null,
    authenticated: false,
    loading: true,
  });

  const syncFromCookie = useCallback(() => {
    // We cannot access httpOnly cookies via JS. Instead, we rely on a helper
    // endpoint that returns the current session id if valid.
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        setState({
          sessionId: data.sessionId ?? null,
          authenticated: Boolean(data.valid),
          loading: false,
        });
      })
      .catch(() =>
        setState({ sessionId: null, authenticated: false, loading: false })
      );
  }, []);

  useEffect(() => {
    syncFromCookie();
  }, [syncFromCookie]);

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      if (!res.ok) {
        throw new Error((await res.json()).error || "Login failed");
      }
      syncFromCookie();
    },
    [syncFromCookie]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    syncFromCookie();
  }, [syncFromCookie]);

  return [state, { login, logout }];
}
