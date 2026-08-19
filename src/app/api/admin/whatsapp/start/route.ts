import { z } from "zod";
import { normalizePhoneToJid } from "@/core/use-cases/whatsapp/normalize-phone-to-jid";
import { currentUser } from "@/infrastructure/auth/current-user";
import { leadRepository, whatsAppRepository } from "@/infrastructure/container";
import { fetchAvatarUrlViaWorker } from "@/infrastructure/whatsapp/worker-client";

const startSchema = z.object({ leadId: z.string().min(1) });

// Crea (o encuentra, si ya existía) la conversación de WhatsApp de un lead
// para poder escribirle primero — hasta ahora una conversación solo nacía
// cuando el prospecto escribía primero. No manda ningún mensaje: eso lo
// hace el POST normal de /messages una vez que el admin elige la
// conversación y escribe.
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

  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const result = await leadRepository.findById(parsed.data.leadId);
  if (!result) {
    return Response.json({ ok: false, reason: "LEAD_NOT_FOUND" }, { status: 404 });
  }

  const { lead } = result;
  if (!lead.telefono) {
    return Response.json({ ok: false, reason: "LEAD_HAS_NO_PHONE" }, { status: 400 });
  }

  const remoteJid = normalizePhoneToJid(lead.telefono);
  if (!remoteJid) {
    return Response.json({ ok: false, reason: "INVALID_PHONE" }, { status: 400 });
  }

  const session = await whatsAppRepository.getOrCreateSession("principal");
  // Si el worker no está disponible esto devuelve null y la conversación
  // igual se crea — el avatar se completa después con el próximo mensaje.
  const avatarUrl = await fetchAvatarUrlViaWorker(remoteJid);
  const created = await whatsAppRepository.upsertConversation({
    sessionId: session.id,
    remoteJid,
    displayName: lead.nombre,
    leadId: lead.id,
    kind: "LEAD",
    avatarUrl,
  });

  // El upsert no pisa leadId/kind en una conversación ya existente (a
  // propósito, para no borrar una clasificación manual — ver el puerto).
  // Acá sí corresponde: es una acción explícita del admin confirmando que
  // esta conversación es de este lead.
  const conversation =
    (await whatsAppRepository.updateConversationClassification(created.id, "LEAD", lead.id)) ??
    created;

  return Response.json({ ok: true, conversation });
}
