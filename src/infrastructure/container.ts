import "server-only";

import type { EmailLogRepository } from "@/core/ports/email-log-repository";
import type { EmailReceivingClient } from "@/core/ports/email-receiving-client";
import type { EmailSender } from "@/core/ports/email-sender";
import type { LeadRepository } from "@/core/ports/lead-repository";
import type { PasswordHasher } from "@/core/ports/password-hasher";
import type { SessionRepository } from "@/core/ports/session-repository";
import type { SessionTokenService } from "@/core/ports/session-token-service";
import type { UserRepository } from "@/core/ports/user-repository";
import type { WhatsAppRepository } from "@/core/ports/whatsapp-repository";
import { Argon2PasswordHasher } from "@/infrastructure/auth/argon2-password-hasher";
import { JoseSessionTokenService } from "@/infrastructure/auth/jose-session-token-service";
import { env } from "@/infrastructure/config/env";
import { DrizzleEmailLogRepository } from "@/infrastructure/database/repositories/drizzle-email-log-repository";
import { DrizzleLeadRepository } from "@/infrastructure/database/repositories/drizzle-lead-repository";
import { DrizzleSessionRepository } from "@/infrastructure/database/repositories/drizzle-session-repository";
import { DrizzleUserRepository } from "@/infrastructure/database/repositories/drizzle-user-repository";
import { DrizzleWhatsAppRepository } from "@/infrastructure/database/repositories/drizzle-whatsapp-repository";
import { ResendEmailSender } from "@/infrastructure/email/resend-email-sender";
import { ResendReceivingClient } from "@/infrastructure/email/resend-receiving-client";

/**
 * Composition root: el único lugar donde el core se ata a los adapters
 * concretos. Los milestones siguientes (leads, WhatsApp, citas) extienden
 * este mismo archivo en vez de instanciar adapters sueltos por ahí.
 */
export const userRepository: UserRepository = new DrizzleUserRepository();
export const sessionRepository: SessionRepository = new DrizzleSessionRepository();
export const passwordHasher: PasswordHasher = new Argon2PasswordHasher();
export const sessionTokenService: SessionTokenService = new JoseSessionTokenService(
  env.SESSION_SECRET,
);
export const leadRepository: LeadRepository = new DrizzleLeadRepository();
export const whatsAppRepository: WhatsAppRepository = new DrizzleWhatsAppRepository();
export const emailLogRepository: EmailLogRepository = new DrizzleEmailLogRepository();
export const emailSender: EmailSender = new ResendEmailSender();
export const emailReceivingClient: EmailReceivingClient = new ResendReceivingClient();
