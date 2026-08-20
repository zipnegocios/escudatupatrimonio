import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  displayName: text("display_name"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * `id` es el `jti` del JWT de sesión, generado por la capa de aplicación
 * (`createSession`) — por eso NO lleva `defaultRandom()`: el token y la fila
 * tienen que compartir el mismo identificador para poder revocar una sesión
 * concreta sin invalidar las demás del mismo usuario.
 */
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userAgent: text("user_agent"),
  ip: text("ip"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

// Se guarda el hash del token, nunca el token en claro: si se filtra la tabla,
// los links de reset siguen sin ser utilizables.
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// `sessionId` es el id de sesión del Smart Form (zustand, en el navegador),
// no un uuid nuestro: permite el upsert idempotente — reenviar el mismo
// formulario (retry de red, doble submit) actualiza la misma fila en vez de
// duplicarla.
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: text("session_id").notNull().unique(),
  nombre: text("nombre"),
  telefono: text("telefono"),
  canal: text("canal"),
  priority: text("priority"),
  status: text("status").notNull().default("NEW"),
  utmCampaign: text("utm_campaign"),
  source: text("source").notNull().default("smart-form"),
  ghlContactId: text("ghl_contact_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const qualificationProfiles = pgTable("qualification_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .unique()
    .references(() => leads.id, { onDelete: "cascade" }),
  intencionP: text("intencion_p"),
  intencionS: text("intencion_s"),
  horizonte: text("horizonte"),
  planRetiro: text("plan_retiro"),
  familiaTipo: text("familia_tipo"),
  preocFamilia: text("preoc_familia"),
  cobActual: text("cob_actual"),
  preocSalud: text("preoc_salud"),
  edadRango: text("edad_rango"),
  edadCond: boolean("edad_cond").notNull().default(false),
  salud: text("salud"),
  saludFlag: text("salud_flag"),
  estatus: text("estatus"),
  estatusFlag: text("estatus_flag"),
  estado: text("estado"),
  timezone: text("timezone"),
  referido: boolean("referido").notNull().default(false),
  ventanaDisp: text("ventana_disp"),
  // Snapshot de computeTags() al momento del submit — no se recalcula después,
  // así el historial de un lead no cambia si la lógica de tags evoluciona.
  tags: text("tags").array().notNull().default([]),
  // Perfil completo tal cual se envió, por si el entity gana campos antes de
  // que se actualice el schema — no se pierde información nueva.
  rawProfile: jsonb("raw_profile").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const leadsRelations = relations(leads, ({ one }) => ({
  profile: one(qualificationProfiles, {
    fields: [leads.id],
    references: [qualificationProfiles.leadId],
  }),
}));

// Hoy siempre hay una sola fila (label "principal"): un número vinculado.
// Se modela como tabla para poder extender a varios números más adelante
// sin migrar de cero.
export const whatsappSessions = pgTable("whatsapp_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull(),
  phoneNumber: text("phone_number"),
  // DISCONNECTED | PAIRING_QR | CONNECTED | LOGGED_OUT
  status: text("status").notNull().default("DISCONNECTED"),
  connectedAt: timestamp("connected_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Reemplazo de `useMultiFileAuthState` de Baileys (que guarda un archivo por
 * clave) usando Postgres en vez del filesystem — necesario porque el proceso
 * de WhatsApp corre en un contenedor aparte que puede reiniciarse sin volumen
 * persistente. `storageKey` es 'creds' o '{categoria}-{id}' (mismo esquema de
 * nombres que Baileys usa para sus archivos, ver postgres-auth-state.ts).
 * `payload` es el JSON ya serializado con BufferJSON.replacer — se guarda
 * como texto, no jsonb, para poder pasarlo directo a JSON.parse(text,
 * BufferJSON.reviver) sin una vuelta extra de (de)serialización.
 */
export const whatsappAuthState = pgTable(
  "whatsapp_auth_state",
  {
    sessionId: uuid("session_id")
      .notNull()
      .references(() => whatsappSessions.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    payload: text("payload").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.sessionId, table.storageKey] })],
);

export const whatsappConversations = pgTable(
  "whatsapp_conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => whatsappSessions.id, { onDelete: "cascade" }),
    remoteJid: text("remote_jid").notNull(),
    // Vínculo best-effort por teléfono, nunca automático desde WhatsApp
    // mismo — QualificationProfile no tiene email pero sí teléfono.
    leadId: uuid("lead_id").references(() => leads.id),
    // LEAD (matcheada por teléfono) | DIRECT_CLIENT (cliente que escribe
    // directo, marcado a mano) | IGNORED (no es un cliente) | UNCLASSIFIED
    // (recién llegada, sin clasificar). Se calcula una vez al crear la
    // conversación y después solo cambia si un agente la reclasifica a mano.
    kind: text("kind").notNull().default("UNCLASSIFIED"),
    displayName: text("display_name"),
    // Número real del contacto. remoteJid identifica la conversación pero,
    // con el JID nuevo de WhatsApp (@lid), no contiene el teléfono real —
    // es un identificador opaco. Se resuelve aparte (ver
    // BaileysGateway.resolvePhoneNumber) y se usa para el match con leads
    // y para mostrarlo en la UI en vez del LID.
    phoneNumber: text("phone_number"),
    // URL directa del CDN de WhatsApp, cacheada al crear la conversación —
    // no se re-consulta en cada mensaje, la foto de perfil no cambia tan
    // seguido como para justificar el viaje al worker en cada poll.
    avatarUrl: text("avatar_url"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    unreadCount: integer("unread_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.sessionId, table.remoteJid)],
);

export const whatsappMessages = pgTable(
  "whatsapp_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => whatsappConversations.id, { onDelete: "cascade" }),
    direction: text("direction").notNull(), // INBOUND | OUTBOUND
    // Idempotencia: Baileys puede reentregar el mismo evento (at-least-once).
    waMessageId: text("wa_message_id").notNull(),
    // TEXT|IMAGE|AUDIO|VOICE_NOTE|VIDEO|DOCUMENT|OTHER
    messageType: text("message_type").notNull().default("TEXT"),
    contentText: text("content_text"),
    // Key del objeto en el bucket R2 — el mensaje en sí nunca guarda el
    // binario, solo la referencia. Se firma una URL de descarga al pedirla.
    mediaKey: text("media_key"),
    mediaMimeType: text("media_mime_type"),
    status: text("status").notNull().default("PENDING"),
    rawPayload: jsonb("raw_payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.conversationId, table.waMessageId)],
);

export const emailLog = pgTable("email_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  direction: text("direction").notNull(), // OUTBOUND | INBOUND
  // Único cuando existe, pero nulo hasta que Resend confirma el envío — no
  // puede ser la PK.
  resendEmailId: text("resend_email_id").unique(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  subject: text("subject"),
  // QUEUED|SENT|DELIVERED|OPENED|CLICKED|BOUNCED|COMPLAINED|FAILED|RECEIVED
  status: text("status").notNull().default("QUEUED"),
  // Vínculo best-effort — QualificationProfile no tiene email, así que nunca
  // se completa automáticamente, solo si un agente lo asocia a mano.
  relatedLeadId: uuid("related_lead_id").references(() => leads.id),
  bodyText: text("body_text"),
  bodyHtml: text("body_html"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Bitácora de auditoría de los webhooks — append-only. email_log.status
// guarda el estado actual (para listar rápido); esta tabla guarda cada
// evento crudo tal como llegó, por si hace falta reconstruir el historial.
export const emailEvents = pgTable("email_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  emailLogId: uuid("email_log_id")
    .notNull()
    .references(() => emailLog.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id),
  scheduledStart: timestamp("scheduled_start", { withTimezone: true }).notNull(),
  scheduledEnd: timestamp("scheduled_end", { withTimezone: true }).notNull(),
  // IANA, copiada del perfil del lead — para mostrar la cita en la hora
  // local del prospecto, no solo en UTC.
  timezone: text("timezone").notNull(),
  // SCHEDULED|CONFIRMED|RESCHEDULED|CANCELLED|COMPLETED|NO_SHOW
  status: text("status").notNull().default("SCHEDULED"),
  // SMART_FORM_INMEDIATO|SMART_FORM_PROGRAMADO|ADMIN_MANUAL
  source: text("source").notNull().default("ADMIN_MANUAL"),
  notes: text("notes"),
  createdByUserId: uuid("created_by_user_id").references(() => users.id),
  cancelReason: text("cancel_reason"),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Instrumentación del embudo del Smart Form — una fila por (sesión, pantalla
// alcanzada). El unique constraint + onConflictDoNothing (ver el adaptador)
// da idempotencia gratis: reintentos de red o el usuario yendo atrás/adelante
// sobre la misma pantalla nunca duplican la fila.
export const funnelEvents = pgTable(
  "funnel_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: text("session_id").notNull(),
    screenId: text("screen_id").notNull(),
    utmCampaign: text("utm_campaign"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.sessionId, table.screenId),
    index("funnel_events_occurred_at_idx").on(table.occurredAt),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

export type QualificationProfileRow = typeof qualificationProfiles.$inferSelect;
export type NewQualificationProfileRow = typeof qualificationProfiles.$inferInsert;

export type WhatsAppSessionRow = typeof whatsappSessions.$inferSelect;
export type NewWhatsAppSessionRow = typeof whatsappSessions.$inferInsert;

export type WhatsAppConversationRow = typeof whatsappConversations.$inferSelect;
export type NewWhatsAppConversationRow = typeof whatsappConversations.$inferInsert;

export type WhatsAppMessageRow = typeof whatsappMessages.$inferSelect;
export type NewWhatsAppMessageRow = typeof whatsappMessages.$inferInsert;

export type EmailLogRow = typeof emailLog.$inferSelect;
export type NewEmailLogRow = typeof emailLog.$inferInsert;

export type EmailEventRow = typeof emailEvents.$inferSelect;
export type NewEmailEventRow = typeof emailEvents.$inferInsert;

export type AppointmentRow = typeof appointments.$inferSelect;
export type NewAppointmentRow = typeof appointments.$inferInsert;

export type FunnelEventRow = typeof funnelEvents.$inferSelect;
export type NewFunnelEventRow = typeof funnelEvents.$inferInsert;
