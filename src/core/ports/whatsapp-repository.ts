import type {
  WhatsAppConversationRow,
  WhatsAppMessageRow,
  WhatsAppSessionRow,
} from "@/infrastructure/database/schema";

export type { WhatsAppConversationRow, WhatsAppMessageRow, WhatsAppSessionRow };

export interface UpsertConversationInput {
  sessionId: string;
  remoteJid: string;
  phoneNumber: string | null;
  displayName: string | null;
  // Solo se aplican al CREAR la conversación (ver DrizzleWhatsAppRepository)
  // — un mensaje nuevo en una conversación ya clasificada por un agente no
  // debe pisarle la clasificación.
  leadId: string | null;
  kind: string;
  avatarUrl: string | null;
}

export interface SaveMessageInput {
  conversationId: string;
  direction: "INBOUND" | "OUTBOUND";
  waMessageId: string;
  messageType: string;
  contentText: string | null;
  status: string;
  mediaKey?: string | null;
  mediaMimeType?: string | null;
}

export interface WhatsAppRepository {
  getOrCreateSession(label: string): Promise<WhatsAppSessionRow>;
  updateSessionStatus(
    id: string,
    status: string,
    phoneNumber?: string | null,
  ): Promise<void>;
  upsertConversation(input: UpsertConversationInput): Promise<WhatsAppConversationRow>;
  saveMessage(input: SaveMessageInput): Promise<WhatsAppMessageRow>;
  listConversations(sessionId: string): Promise<WhatsAppConversationRow[]>;
  listMessages(conversationId: string): Promise<WhatsAppMessageRow[]>;
  markRead(conversationId: string): Promise<void>;
  // Reclasificación manual desde el panel — "es un lead" (con leadId
  // explícito), "atender como cliente directo", o "ignorar".
  updateConversationClassification(
    id: string,
    kind: string,
    leadId: string | null,
  ): Promise<WhatsAppConversationRow | null>;
  // Borra la conversación y, en cascada (FK), todos sus mensajes.
  deleteConversation(id: string): Promise<void>;
  updateAvatarUrl(id: string, avatarUrl: string | null): Promise<void>;
  updatePhoneNumber(id: string, phoneNumber: string | null): Promise<void>;
}
