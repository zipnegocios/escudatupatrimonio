import type { WhatsAppGateway } from "@/core/ports/whatsapp-gateway";
import type { WhatsAppRepository } from "@/core/ports/whatsapp-repository";

export interface SendWhatsAppMessageDeps {
  whatsAppGateway: WhatsAppGateway;
  whatsAppRepository: WhatsAppRepository;
}

export async function sendWhatsAppMessage(
  deps: SendWhatsAppMessageDeps,
  conversationId: string,
  remoteJid: string,
  text: string,
): Promise<void> {
  const { waMessageId } = await deps.whatsAppGateway.sendMessage(remoteJid, text);
  await deps.whatsAppRepository.saveMessage({
    conversationId,
    direction: "OUTBOUND",
    waMessageId,
    messageType: "TEXT",
    contentText: text,
    status: "SENT",
  });
}
