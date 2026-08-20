import { and, count, gte, lte } from "drizzle-orm";
import type {
  FunnelEventRepository,
  FunnelScreenCount,
  RecordScreenReachedInput,
} from "@/core/ports/funnel-event-repository";
import { db } from "@/infrastructure/database/db";
import { funnelEvents } from "@/infrastructure/database/schema";

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

  async countByScreen(range?: { from: Date; to: Date }): Promise<FunnelScreenCount[]> {
    const rows = await db
      .select({ screenId: funnelEvents.screenId, sessionCount: count() })
      .from(funnelEvents)
      .where(
        range
          ? and(gte(funnelEvents.occurredAt, range.from), lte(funnelEvents.occurredAt, range.to))
          : undefined,
      )
      .groupBy(funnelEvents.screenId);

    return rows.map((row) => ({ screenId: row.screenId, sessionCount: Number(row.sessionCount) }));
  }
}
