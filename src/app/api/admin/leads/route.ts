import { z } from "zod";
import { createManualLead } from "@/core/use-cases/leads/create-manual-lead";
import { currentUser } from "@/infrastructure/auth/current-user";
import { leadRepository } from "@/infrastructure/container";

export async function GET(): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  const leads = await leadRepository.list();
  return Response.json({ ok: true, leads });
}

const createManualLeadSchema = z.object({
  nombre: z.string().trim().min(1),
  telefono: z.string().trim().min(7),
  canal: z.enum(["WHATSAPP", "LLAMADA", "WA_PRIMERO"]).default("WHATSAPP"),
});

// Lead creado a mano desde el panel — p.ej. alguien que escribió directo
// por WhatsApp sin pasar por el Smart Form.
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

  const parsed = createManualLeadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const lead = await createManualLead({ leadRepository }, parsed.data);
  return Response.json({ ok: true, lead });
}
