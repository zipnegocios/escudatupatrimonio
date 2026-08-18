import type {
  WhatsAppConversationRow,
  WhatsAppMessageRow,
  WhatsAppSessionRow,
} from "@/infrastructure/database/schema";

export type { WhatsAppConversationRow, WhatsAppMessageRow, WhatsAppSessionRow };

export interface UpsertConversationInput {
  sessionId: string;
  remoteJid: string;
  displayName: string | null;
}

export interface SaveMessageInput {
  conversationId: string;
  direction: "INBOUND" | "OUTBOUND";
  waMessageId: string;
  messageType: string;
  contentText: string | null;
  status: string;
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
}
