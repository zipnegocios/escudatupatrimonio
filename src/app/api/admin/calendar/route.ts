import { z } from "zod";
import { createAppointment } from "@/core/use-cases/calendar/create-appointment";
import { listAppointments } from "@/core/use-cases/calendar/list-appointments";
import { currentUser } from "@/infrastructure/auth/current-user";
import { appointmentRepository } from "@/infrastructure/container";

export async function GET(request: Request): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  const url = new URL(request.url);
  const startParam = url.searchParams.get("start");
  const endParam = url.searchParams.get("end");

  // Sin rango explícito, se muestran los próximos 30 días — suficiente para
  // la vista de calendario del panel sin tener que pedirlo siempre.
  const start = startParam ? new Date(startParam) : new Date();
  const end = endParam ? new Date(endParam) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const appointments = await listAppointments({ appointmentRepository }, start, end);
  return Response.json({ ok: true, appointments });
}

const createAppointmentSchema = z.object({
  leadId: z.string().min(1),
  scheduledStart: z.string().min(1),
  scheduledEnd: z.string().min(1),
  timezone: z.string().min(1),
  notes: z.string().nullable(),
});

export async function POST(request: Request): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = createAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const result = await createAppointment(
    { appointmentRepository },
    {
      leadId: parsed.data.leadId,
      scheduledStart: new Date(parsed.data.scheduledStart),
      scheduledEnd: new Date(parsed.data.scheduledEnd),
      timezone: parsed.data.timezone,
      source: "ADMIN_MANUAL",
      notes: parsed.data.notes,
      createdByUserId: user.id,
    },
  );

  if (!result.ok) {
    const status = result.reason === "INVALID_RANGE" ? 400 : 409;
    return Response.json({ ok: false, reason: result.reason }, { status });
  }

  return Response.json({ ok: true, appointment: result.appointment });
}
