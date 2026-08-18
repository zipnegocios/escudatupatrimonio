import "server-only";

import type { PasswordHasher } from "@/core/ports/password-hasher";
import type { SessionRepository } from "@/core/ports/session-repository";
import type { SessionTokenService } from "@/core/ports/session-token-service";
import type { UserRepository } from "@/core/ports/user-repository";
import { Argon2PasswordHasher } from "@/infrastructure/auth/argon2-password-hasher";
import { JoseSessionTokenService } from "@/infrastructure/auth/jose-session-token-service";
import { env } from "@/infrastructure/config/env";
import { DrizzleSessionRepository } from "@/infrastructure/database/repositories/drizzle-session-repository";
import { DrizzleUserRepository } from "@/infrastructure/database/repositories/drizzle-user-repository";

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
