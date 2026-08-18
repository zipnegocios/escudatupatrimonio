import type {
  AppointmentRepository,
  AppointmentRow,
  CreateAppointmentInput,
} from "@/core/ports/appointment-repository";

export interface CreateAppointmentDeps {
  appointmentRepository: AppointmentRepository;
}

export type CreateAppointmentResult =
  | { ok: true; appointment: AppointmentRow }
  | { ok: false; reason: "OVERLAP" | "INVALID_RANGE" };

export async function createAppointment(
  deps: CreateAppointmentDeps,
  input: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  if (input.scheduledEnd <= input.scheduledStart) {
    return { ok: false, reason: "INVALID_RANGE" };
  }

  const overlapping = await deps.appointmentRepository.findOverlapping(
    input.scheduledStart,
    input.scheduledEnd,
  );
  if (overlapping.length > 0) {
    return { ok: false, reason: "OVERLAP" };
  }

  const appointment = await deps.appointmentRepository.create(input);
  return { ok: true, appointment };
}
