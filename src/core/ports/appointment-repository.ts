import type { AppointmentRow } from "@/infrastructure/database/schema";

export type { AppointmentRow };

export interface CreateAppointmentInput {
  leadId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  timezone: string;
  source: string;
  notes: string | null;
  createdByUserId: string | null;
}

export interface AppointmentRepository {
  create(input: CreateAppointmentInput): Promise<AppointmentRow>;
  findById(id: string): Promise<AppointmentRow | null>;
  // Traslape con citas activas (no canceladas) del mismo rango — para evitar
  // doble-booking al crear o reagendar.
  findOverlapping(start: Date, end: Date, excludeId?: string): Promise<AppointmentRow[]>;
  listByRange(start: Date, end: Date): Promise<AppointmentRow[]>;
  reschedule(id: string, start: Date, end: Date): Promise<AppointmentRow | null>;
  updateStatus(id: string, status: string, cancelReason?: string | null): Promise<AppointmentRow | null>;
}
