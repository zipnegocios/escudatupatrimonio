import { z } from "zod";
import { currentUser } from "@/infrastructure/auth/current-user";
import { whatsAppRepository } from "@/infrastructure/container";
import { resolvePhoneNumberViaWorker } from "@/infrastructure/whatsapp/worker-client";

const resolvePhoneSchema = z.object({ remoteJid: z.string().min(1) });

// Botón manual del panel: para un contacto @lid que aún no tiene phoneNumber
// guardado (llegó antes de este fix, o WhatsApp no lo incluyó en ningún
// mensaje suyo todavía), pide el mapeo al worker sin esperar un mensaje nuevo.
export async function POST(
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

  const parsed = resolvePhoneSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const phoneNumber = await resolvePhoneNumberViaWorker(parsed.data.remoteJid);
  if (phoneNumber) {
    await whatsAppRepository.updatePhoneNumber(id, phoneNumber);
  }

  return Response.json({ ok: true, phoneNumber });
}
