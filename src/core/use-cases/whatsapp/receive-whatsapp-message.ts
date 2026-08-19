import { randomUUID } from "node:crypto";
import type { IncomingWhatsAppMessage, WhatsAppGateway } from "@/core/ports/whatsapp-gateway";
import type { LeadRepository } from "@/core/ports/lead-repository";
import type { MediaStorage } from "@/core/ports/media-storage";
import type { WhatsAppRepository } from "@/core/ports/whatsapp-repository";
import { matchLeadByPhone } from "@/core/use-cases/whatsapp/match-lead-by-phone";

export interface ReceiveWhatsAppMessageDeps {
  whatsAppRepository: WhatsAppRepository;
  leadRepository: LeadRepository;
  mediaStorage: MediaStorage;
  whatsAppGateway: Pick<WhatsAppGateway, "getProfilePictureUrl">;
}

export async function receiveWhatsAppMessage(
  deps: ReceiveWhatsAppMessageDeps,
  sessionId: string,
  message: IncomingWhatsAppMessage,
): Promise<void> {
  // Solo importa en conversaciones nuevas — el adapter nunca pisa
  // leadId/kind de una conversación ya existente (ver
  // DrizzleWhatsAppRepository.upsertConversation).
  const leadId = await matchLeadByPhone({ leadRepository: deps.leadRepository }, message.remoteJid);

  const conversation = await deps.whatsAppRepository.upsertConversation({
    sessionId,
    remoteJid: message.remoteJid,
    displayName: message.displayName,
    leadId,
    kind: leadId ? "LEAD" : "UNCLASSIFIED",
    avatarUrl: null,
  });

  // `lastMessageAt` solo es null en la conversación recién creada — evita
  // pedirle la foto al socket en cada mensaje de un contacto que nunca tuvo
  // una (no es un error, simplemente no hace falta reintentar).
  if (conversation.lastMessageAt === null) {
    const avatarUrl = await deps.whatsAppGateway.getProfilePictureUrl(message.remoteJid);
    if (avatarUrl) {
      await deps.whatsAppRepository.updateAvatarUrl(conversation.id, avatarUrl);
    }
  }

  // Una conversación marcada IGNORED queda totalmente excluida: ni el
  // mensaje se guarda ni el contador de no-leídos se toca. El upsert de
  // arriba nunca pisa un kind ya guardado (ver el adapter), así que esto
  // refleja la clasificación real, no la recién calculada.
  if (conversation.kind === "IGNORED") {
    return;
  }

  let mediaKey: string | null = null;
  let mediaMimeType: string | null = null;

  if (message.media) {
    // Si R2 no está configurado o falla, el mensaje igual se guarda (sin
    // adjunto) — un problema de almacenamiento no debe perder el mensaje.
    try {
      mediaKey = `whatsapp/${conversation.id}/${randomUUID()}`;
      await deps.mediaStorage.upload(mediaKey, message.media.buffer, message.media.mimeType);
      mediaMimeType = message.media.mimeType;
    } catch {
      mediaKey = null;
      mediaMimeType = null;
    }
  }

  await deps.whatsAppRepository.saveMessage({
    conversationId: conversation.id,
    direction: "INBOUND",
    waMessageId: message.waMessageId,
    messageType: message.messageType,
    contentText: message.contentText,
    status: "RECEIVED",
    mediaKey,
    mediaMimeType,
  });
}
