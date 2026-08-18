import { and, eq, isNull } from "drizzle-orm";
import type { NewSessionRecord, SessionRepository } from "@/core/ports/session-repository";
import { db } from "@/infrastructure/database/db";
import { sessions, type Session } from "@/infrastructure/database/schema";

export class DrizzleSessionRepository implements SessionRepository {
  async create(session: NewSessionRecord): Promise<void> {
    await db.insert(sessions).values(session);
  }

  async findById(id: string): Promise<Session | null> {
    const rows = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    return rows[0] ?? null;
  }

  // El `isNull(revokedAt)` hace la revocación idempotente: un doble logout o
  // un retry de red no debe pisar el timestamp original ni fallar.
  async revoke(id: string): Promise<void> {
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.id, id), isNull(sessions.revokedAt)));
  }
}
