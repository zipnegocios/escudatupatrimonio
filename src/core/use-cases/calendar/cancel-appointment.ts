import type { AppointmentRepository } from "@/core/ports/appointment-repository";

export interface CancelAppointmentDeps {
  appointmentRepository: AppointmentRepository;
}

export async function cancelAppointment(
  deps: CancelAppointmentDeps,
  id: string,
  reason: string | null,
): Promise<void> {
  await deps.appointmentRepository.updateStatus(id, "CANCELLED", reason);
}
