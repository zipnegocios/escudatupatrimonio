import { desc, eq } from "drizzle-orm";
import type { EmailLogRepository, RecordEmailInput } from "@/core/ports/email-log-repository";
import { db } from "@/infrastructure/database/db";
import { emailEvents, emailLog, type EmailLogRow } from "@/infrastructure/database/schema";

export class DrizzleEmailLogRepository implements EmailLogRepository {
  async record(input: RecordEmailInput): Promise<EmailLogRow> {
    const [row] = await db
      .insert(emailLog)
      .values({
        direction: input.direction,
        resendEmailId: input.resendEmailId,
        fromAddress: input.fromAddress,
        toAddress: input.toAddress,
        subject: input.subject,
        status: input.status,
        bodyText: input.bodyText,
        bodyHtml: input.bodyHtml,
      })
      .returning();
    return row;
  }

  async appendEvent(emailLogId: string, eventType: string, payload: unknown): Promise<void> {
    await db.insert(emailEvents).values({ emailLogId, eventType, payload });
  }

  async updateStatusByProviderId(
    resendEmailId: string,
    status: string,
  ): Promise<EmailLogRow | null> {
    const [row] = await db
      .update(emailLog)
      .set({ status })
      .where(eq(emailLog.resendEmailId, resendEmailId))
      .returning();
    return row ?? null;
  }

  async findByProviderId(resendEmailId: string): Promise<EmailLogRow | null> {
    const [row] = await db
      .select()
      .from(emailLog)
      .where(eq(emailLog.resendEmailId, resendEmailId))
      .limit(1);
    return row ?? null;
  }

  async list(): Promise<EmailLogRow[]> {
    return db.select().from(emailLog).orderBy(desc(emailLog.occurredAt));
  }
}
