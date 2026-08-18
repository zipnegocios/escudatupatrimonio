import type { IncomingWhatsAppMessage } from "@/core/ports/whatsapp-gateway";
import type { WhatsAppRepository } from "@/core/ports/whatsapp-repository";

export interface ReceiveWhatsAppMessageDeps {
  whatsAppRepository: WhatsAppRepository;
}

export async function receiveWhatsAppMessage(
  deps: ReceiveWhatsAppMessageDeps,
  sessionId: string,
  message: IncomingWhatsAppMessage,
): Promise<void> {
  const conversation = await deps.whatsAppRepository.upsertConversation({
    sessionId,
    remoteJid: message.remoteJid,
    displayName: message.displayName,
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
