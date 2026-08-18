import { and, eq, gt, lt, ne, or } from "drizzle-orm";
import type {
  AppointmentRepository,
  CreateAppointmentInput,
} from "@/core/ports/appointment-repository";
import { db } from "@/infrastructure/database/db";
import { appointments, type AppointmentRow } from "@/infrastructure/database/schema";

export class DrizzleAppointmentRepository implements AppointmentRepository {
  async create(input: CreateAppointmentInput): Promise<AppointmentRow> {
    const [row] = await db
      .insert(appointments)
      .values({
        leadId: input.leadId,
        scheduledStart: input.scheduledStart,
        scheduledEnd: input.scheduledEnd,
        timezone: input.timezone,
        source: input.source,
        notes: input.notes,
        createdByUserId: input.createdByUserId,
      })
      .returning();
    return row;
  }

  async findById(id: string): Promise<AppointmentRow | null> {
    const [row] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    return row ?? null;
  }

  async findOverlapping(start: Date, end: Date, excludeId?: string): Promise<AppointmentRow[]> {
    // Dos rangos [start1,end1) y [start2,end2) se traslapan si
    // start1 < end2 AND start2 < end1. CANCELLED no cuenta como ocupado.
    const conditions = [
      lt(appointments.scheduledStart, end),
      gt(appointments.scheduledEnd, start),
      ne(appointments.status, "CANCELLED"),
    ];
    if (excludeId) {
      conditions.push(ne(appointments.id, excludeId));
    }
    return db
      .select()
      .from(appointments)
      .where(and(...conditions));
  }

  async listByRange(start: Date, end: Date): Promise<AppointmentRow[]> {
    return db
      .select()
      .from(appointments)
      .where(
        or(
          and(gt(appointments.scheduledStart, start), lt(appointments.scheduledStart, end)),
          and(gt(appointments.scheduledEnd, start), lt(appointments.scheduledEnd, end)),
        ),
      )
      .orderBy(appointments.scheduledStart);
  }

  async reschedule(id: string, start: Date, end: Date): Promise<AppointmentRow | null> {
    const [row] = await db
      .update(appointments)
      .set({
        scheduledStart: start,
        scheduledEnd: end,
        status: "RESCHEDULED",
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();
    return row ?? null;
  }

  async updateStatus(
    id: string,
    status: string,
    cancelReason?: string | null,
  ): Promise<AppointmentRow | null> {
    const [row] = await db
      .update(appointments)
      .set({
        status,
        updatedAt: new Date(),
        ...(status === "CANCELLED"
          ? { cancelReason: cancelReason ?? null, cancelledAt: new Date() }
          : {}),
      })
      .where(eq(appointments.id, id))
      .returning();
    return row ?? null;
  }
}
