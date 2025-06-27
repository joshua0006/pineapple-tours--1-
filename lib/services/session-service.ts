import Redis from "ioredis";
import { randomUUID } from "crypto";

// Single Redis connection reused across imports
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export interface Session {
  id: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

const DEFAULT_TTL_SECONDS = parseInt(process.env.SESSION_TTL || "3600", 10); // 1 hour by default

export class SessionService {
  /**
   * Create a new session for a user. Returns the generated session object.
   */
  static async createSession(
    userId: string,
    ttlSeconds: number = DEFAULT_TTL_SECONDS
  ): Promise<Session> {
    const id = randomUUID();
    const now = Date.now();
    const expiresAt = now + ttlSeconds * 1000;

    const session: Session = { id, userId, createdAt: now, expiresAt };

    await redis.set(`session:${id}`, JSON.stringify(session), "EX", ttlSeconds);

    return session;
  }

  /**
   * Fetch a session by ID. Returns null if not found or expired.
   */
  static async getSession(id: string): Promise<Session | null> {
    if (!id) return null;
    const data = await redis.get(`session:${id}`);
    if (!data) return null;
    try {
      const session: Session = JSON.parse(data);
      return session;
    } catch {
      return null;
    }
  }

  /**
   * Refresh (extend) a session TTL. Useful for sliding expiration.
   */
  static async refreshSession(
    id: string,
    ttlSeconds: number = DEFAULT_TTL_SECONDS
  ): Promise<void> {
    const session = await this.getSession(id);
    if (!session) return;

    session.expiresAt = Date.now() + ttlSeconds * 1000;
    await redis.set(`session:${id}`, JSON.stringify(session), "EX", ttlSeconds);
  }

  /**
   * Invalidate a session explicitly.
   */
  static async deleteSession(id: string): Promise<void> {
    await redis.del(`session:${id}`);
  }
}
