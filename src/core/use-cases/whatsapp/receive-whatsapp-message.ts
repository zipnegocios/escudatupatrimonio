import type { IncomingWhatsAppMessage } from "@/core/ports/whatsapp-gateway";
import type { LeadRepository } from "@/core/ports/lead-repository";
import type { WhatsAppRepository } from "@/core/ports/whatsapp-repository";
import { matchLeadByPhone } from "@/core/use-cases/whatsapp/match-lead-by-phone";

export interface ReceiveWhatsAppMessageDeps {
  whatsAppRepository: WhatsAppRepository;
  leadRepository: LeadRepository;
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
  });

  await deps.whatsAppRepository.saveMessage({
    conversationId: conversation.id,
    direction: "INBOUND",
    waMessageId: message.waMessageId,
    messageType: message.messageType,
    contentText: message.contentText,
    status: "RECEIVED",
  });
}
