import type { AppointmentRepository, AppointmentRow } from "@/core/ports/appointment-repository";

export interface ListAppointmentsDeps {
  appointmentRepository: AppointmentRepository;
}

export async function listAppointments(
  deps: ListAppointmentsDeps,
  start: Date,
  end: Date,
): Promise<AppointmentRow[]> {
  return deps.appointmentRepository.listByRange(start, end);
}
