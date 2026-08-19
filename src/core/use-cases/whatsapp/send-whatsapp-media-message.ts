import type { WhatsAppGateway, WhatsAppMediaType } from "@/core/ports/whatsapp-gateway";
import type { WhatsAppRepository } from "@/core/ports/whatsapp-repository";

export interface SendWhatsAppMediaMessageDeps {
  whatsAppGateway: WhatsAppGateway;
  whatsAppRepository: WhatsAppRepository;
}

export interface SendWhatsAppMediaInput {
  conversationId: string;
  remoteJid: string;
  // URL firmada de R2 — Baileys la descarga él mismo para reenviarla.
  mediaUrl: string;
  mediaKey: string;
  mediaMimeType: string;
  mediaType: WhatsAppMediaType;
  caption: string | null;
}

export async function sendWhatsAppMediaMessage(
  deps: SendWhatsAppMediaMessageDeps,
  input: SendWhatsAppMediaInput,
): Promise<void> {
  const { waMessageId } = await deps.whatsAppGateway.sendMedia(
    input.remoteJid,
    input.mediaUrl,
    input.mediaType,
    input.mediaMimeType,
    input.caption,
  );
  await deps.whatsAppRepository.saveMessage({
    conversationId: input.conversationId,
    direction: "OUTBOUND",
    waMessageId,
    messageType: input.mediaType,
    contentText: input.caption,
    status: "SENT",
    mediaKey: input.mediaKey,
    mediaMimeType: input.mediaMimeType,
  });
}
