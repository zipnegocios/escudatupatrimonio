import type { SessionRepository } from "@/core/ports/session-repository";
import type { SessionTokenService } from "@/core/ports/session-token-service";
import type { User, UserRepository } from "@/core/ports/user-repository";

export interface VerifySessionDeps {
  sessionRepository: SessionRepository;
  sessionTokenService: SessionTokenService;
  userRepository: UserRepository;
}

/**
 * Se devuelve el `jti` junto al usuario porque el logout necesita revocar esa
 * sesión puntual: la alternativa sería decodificar el JWT sin verificarlo solo
 * para leer el jti, o sea actuar sobre un claim no verificado.
 */
export interface VerifiedSession {
  user: User;
  jti: string;
}

export async function verifySession(
  deps: VerifySessionDeps,
  token: string,
): Promise<VerifiedSession | null> {
  const payload = await deps.sessionTokenService.verify(token);
  if (payload === null) {
    return null;
  }

  // El JWT ser válido no alcanza: la fila es la que manda, para que un logout
  // invalide el token de verdad en vez de esperar a que expire.
  const session = await deps.sessionRepository.findById(payload.jti);
  if (session === null) {
    return null;
  }

  if (session.revokedAt !== null) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  const user = await deps.userRepository.findById(session.userId);
  if (user === null) {
    return null;
  }

  if (!user.isActive) {
    return null;
  }

  return { user, jti: payload.jti };
}
