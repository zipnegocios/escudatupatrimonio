import { and, asc, count, gte, inArray, lte, min } from "drizzle-orm";
import type {
  FunnelEventRepository,
  FunnelScreenCount,
  RecordScreenReachedInput,
} from "@/core/ports/funnel-event-repository";
import { db } from "@/infrastructure/database/db";
import { type FunnelEventRow, funnelEvents } from "@/infrastructure/database/schema";

export class DrizzleFunnelEventRepository implements FunnelEventRepository {
  async recordScreenReached(input: RecordScreenReachedInput): Promise<void> {
    await db
      .insert(funnelEvents)
      .values({
        sessionId: input.sessionId,
        screenId: input.screenId,
        utmCampaign: input.utmCampaign,
      })
      .onConflictDoNothing();
  }

  // "sesión en el rango" = su primer evento (normalmente LANDING) cayó ahí —
  // no "algún evento suyo cayó ahí", que daría números inconsistentes entre
  // este método y listSessionsInRange (una sesión iniciada ayer que hoy
  // avanza una pantalla más no debería contarse como "sesión de hoy").
  private sessionIdsStartedInRange(range: { from: Date; to: Date }) {
    return db
      .select({ sessionId: funnelEvents.sessionId })
      .from(funnelEvents)
      .groupBy(funnelEvents.sessionId)
      .having(
        and(gte(min(funnelEvents.occurredAt), range.from), lte(min(funnelEvents.occurredAt), range.to)),
      );
  }

  async countByScreen(range?: { from: Date; to: Date }): Promise<FunnelScreenCount[]> {
    const rows = await db
      .select({ screenId: funnelEvents.screenId, sessionCount: count() })
      .from(funnelEvents)
      .where(range ? inArray(funnelEvents.sessionId, this.sessionIdsStartedInRange(range)) : undefined)
      .groupBy(funnelEvents.screenId);

    return rows.map((row) => ({ screenId: row.screenId, sessionCount: Number(row.sessionCount) }));
  }

  async listSessionsInRange(range: { from: Date; to: Date }): Promise<FunnelEventRow[]> {
    return db
      .select()
      .from(funnelEvents)
      .where(inArray(funnelEvents.sessionId, this.sessionIdsStartedInRange(range)))
      .orderBy(asc(funnelEvents.sessionId), asc(funnelEvents.occurredAt));
  }
}
