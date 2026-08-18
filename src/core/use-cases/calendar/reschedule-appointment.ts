import type { AppointmentRepository, AppointmentRow } from "@/core/ports/appointment-repository";

export interface RescheduleAppointmentDeps {
  appointmentRepository: AppointmentRepository;
}

export type RescheduleAppointmentResult =
  | { ok: true; appointment: AppointmentRow }
  | { ok: false; reason: "OVERLAP" | "INVALID_RANGE" | "NOT_FOUND" };

export async function rescheduleAppointment(
  deps: RescheduleAppointmentDeps,
  id: string,
  start: Date,
  end: Date,
): Promise<RescheduleAppointmentResult> {
  if (end <= start) {
    return { ok: false, reason: "INVALID_RANGE" };
  }

  const overlapping = await deps.appointmentRepository.findOverlapping(start, end, id);
  if (overlapping.length > 0) {
    return { ok: false, reason: "OVERLAP" };
  }

  const appointment = await deps.appointmentRepository.reschedule(id, start, end);
  if (!appointment) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  return { ok: true, appointment };
}
