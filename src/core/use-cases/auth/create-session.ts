import { randomUUID } from "node:crypto";
import type { SessionRepository } from "@/core/ports/session-repository";
import type { SessionTokenService } from "@/core/ports/session-token-service";

export interface CreateSessionDeps {
  sessionRepository: SessionRepository;
  sessionTokenService: SessionTokenService;
}

export interface CreateSessionInput {
  userId: string;
  userAgent: string | null;
  ip: string | null;
  ttlSeconds: number;
}

export interface CreateSessionResult {
  token: string;
  expiresAt: Date;
}

export async function createSession(
  deps: CreateSessionDeps,
  input: CreateSessionInput,
): Promise<CreateSessionResult> {
  // El id de la fila ES el `jti` del JWT: sin esa igualdad no se puede revocar
  // una sesión concreta, solo invalidar el secreto para todos.
  const jti = randomUUID();
  const expiresAt = new Date(Date.now() + input.ttlSeconds * 1000);

  // Primero la fila y después el token: si falla el insert nunca sale a la
  // calle un JWT que no tiene sesión detrás.
  await deps.sessionRepository.create({
    id: jti,
    userId: input.userId,
    userAgent: input.userAgent,
    ip: input.ip,
    expiresAt,
  });

  const token = await deps.sessionTokenService.issue(
    { sub: input.userId, jti },
    input.ttlSeconds,
  );

  return { token, expiresAt };
}
