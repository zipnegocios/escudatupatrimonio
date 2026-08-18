import { z } from "zod";
import { cancelAppointment } from "@/core/use-cases/calendar/cancel-appointment";
import { rescheduleAppointment } from "@/core/use-cases/calendar/reschedule-appointment";
import { currentUser } from "@/infrastructure/auth/current-user";
import { appointmentRepository } from "@/infrastructure/container";

const patchSchema = z.union([
  z.object({
    action: z.literal("reschedule"),
    scheduledStart: z.string().min(1),
    scheduledEnd: z.string().min(1),
  }),
  z.object({
    action: z.literal("update_status"),
    status: z.enum(["CONFIRMED", "COMPLETED", "NO_SHOW"]),
  }),
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  if (parsed.data.action === "reschedule") {
    const result = await rescheduleAppointment(
      { appointmentRepository },
      id,
      new Date(parsed.data.scheduledStart),
      new Date(parsed.data.scheduledEnd),
    );
    if (!result.ok) {
      const status =
        result.reason === "NOT_FOUND" ? 404 : result.reason === "INVALID_RANGE" ? 400 : 409;
      return Response.json({ ok: false, reason: result.reason }, { status });
    }
    return Response.json({ ok: true, appointment: result.appointment });
  }

  const appointment = await appointmentRepository.updateStatus(id, parsed.data.status);
  if (!appointment) {
    return Response.json({ ok: false, reason: "NOT_FOUND" }, { status: 404 });
  }
  return Response.json({ ok: true, appointment });
}

const deleteSchema = z.object({ reason: z.string().nullable() });

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    // sin body es válido — cancelar sin razón explícita
  }

  const parsed = deleteSchema.safeParse(body);
  await cancelAppointment(
    { appointmentRepository },
    id,
    parsed.success ? parsed.data.reason : null,
  );

  return Response.json({ ok: true });
}
