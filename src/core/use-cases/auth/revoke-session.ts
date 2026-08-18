import type { SessionRepository } from "@/core/ports/session-repository";

export interface RevokeSessionDeps {
  sessionRepository: SessionRepository;
}

export async function revokeSession(deps: RevokeSessionDeps, jti: string): Promise<void> {
  await deps.sessionRepository.revoke(jti);
}
