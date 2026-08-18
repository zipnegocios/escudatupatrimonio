import { boolean, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
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
