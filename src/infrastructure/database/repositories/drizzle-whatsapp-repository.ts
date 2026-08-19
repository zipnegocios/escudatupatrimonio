import { and, desc, eq } from "drizzle-orm";
import type {
  SaveMessageInput,
  UpsertConversationInput,
  WhatsAppRepository,
} from "@/core/ports/whatsapp-repository";
import { db } from "@/infrastructure/database/db";
import {
  whatsappConversations,
  whatsappMessages,
  whatsappSessions,
  type WhatsAppConversationRow,
  type WhatsAppMessageRow,
  type WhatsAppSessionRow,
} from "@/infrastructure/database/schema";

export class DrizzleWhatsAppRepository implements WhatsAppRepository {
  async getOrCreateSession(label: string): Promise<WhatsAppSessionRow> {
    const [existing] = await db
      .select()
      .from(whatsappSessions)
      .where(eq(whatsappSessions.label, label))
      .limit(1);
    if (existing) return existing;

    const [created] = await db.insert(whatsappSessions).values({ label }).returning();
    return created;
  }

  async updateSessionStatus(
    id: string,
    status: string,
    phoneNumber?: string | null,
  ): Promise<void> {
    await db
      .update(whatsappSessions)
      .set({
        status,
        updatedAt: new Date(),
        ...(phoneNumber !== undefined ? { phoneNumber } : {}),
        ...(status === "CONNECTED" ? { connectedAt: new Date() } : {}),
      })
      .where(eq(whatsappSessions.id, id));
  }

  async upsertConversation(input: UpsertConversationInput): Promise<WhatsAppConversationRow> {
    const [conversation] = await db
      .insert(whatsappConversations)
      .values({
        sessionId: input.sessionId,
        remoteJid: input.remoteJid,
        displayName: input.displayName,
        leadId: input.leadId,
        kind: input.kind,
        avatarUrl: input.avatarUrl,
      })
      // A propósito NO se pisan leadId/kind en el conflicto: si un agente ya
      // clasificó esta conversación a mano, un mensaje nuevo no debe
      // reclasificarla — ver comentario en el puerto.
      .onConflictDoUpdate({
        target: [whatsappConversations.sessionId, whatsappConversations.remoteJid],
        set: {
          displayName: input.displayName,
        },
      })
      .returning();
    return conversation;
  }

  async saveMessage(input: SaveMessageInput): Promise<WhatsAppMessageRow> {
    const [message] = await db
      .insert(whatsappMessages)
      .values({
        conversationId: input.conversationId,
        direction: input.direction,
        waMessageId: input.waMessageId,
        messageType: input.messageType,
        contentText: input.contentText,
        status: input.status,
        mediaKey: input.mediaKey ?? null,
        mediaMimeType: input.mediaMimeType ?? null,
      })
      // Baileys reentrega eventos (at-least-once): un mismo waMessageId
      // dentro de la misma conversación no debe duplicar la fila.
      .onConflictDoNothing({
        target: [whatsappMessages.conversationId, whatsappMessages.waMessageId],
      })
      .returning();

    if (message) {
      await db
        .update(whatsappConversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(whatsappConversations.id, input.conversationId));
      return message;
    }

    const [existing] = await db
      .select()
      .from(whatsappMessages)
      .where(
        and(
          eq(whatsappMessages.conversationId, input.conversationId),
          eq(whatsappMessages.waMessageId, input.waMessageId),
        ),
      )
      .limit(1);
    return existing;
  }

  async listConversations(sessionId: string): Promise<WhatsAppConversationRow[]> {
    return db
      .select()
      .from(whatsappConversations)
      .where(eq(whatsappConversations.sessionId, sessionId))
      .orderBy(desc(whatsappConversations.lastMessageAt));
  }

  async listMessages(conversationId: string): Promise<WhatsAppMessageRow[]> {
    return db
      .select()
      .from(whatsappMessages)
      .where(eq(whatsappMessages.conversationId, conversationId))
      .orderBy(whatsappMessages.createdAt);
  }

  async markRead(conversationId: string): Promise<void> {
    await db
      .update(whatsappConversations)
      .set({ unreadCount: 0 })
      .where(eq(whatsappConversations.id, conversationId));
  }

  async updateConversationClassification(
    id: string,
    kind: string,
    leadId: string | null,
  ): Promise<WhatsAppConversationRow | null> {
    const [row] = await db
      .update(whatsappConversations)
      .set({ kind, leadId })
      .where(eq(whatsappConversations.id, id))
      .returning();
    return row ?? null;
  }

  async deleteConversation(id: string): Promise<void> {
    await db.delete(whatsappConversations).where(eq(whatsappConversations.id, id));
  }

  async updateAvatarUrl(id: string, avatarUrl: string | null): Promise<void> {
    await db.update(whatsappConversations).set({ avatarUrl }).where(eq(whatsappConversations.id, id));
  }
}
