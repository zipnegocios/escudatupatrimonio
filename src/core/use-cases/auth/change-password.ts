import type { PasswordHasher } from "@/core/ports/password-hasher";
import type { SessionRepository } from "@/core/ports/session-repository";
import type { UserRepository } from "@/core/ports/user-repository";

export interface ChangePasswordDeps {
  userRepository: UserRepository;
  passwordHasher: PasswordHasher;
  sessionRepository: SessionRepository;
}

export interface ChangePasswordInput {
  userId: string;
  // La sesión que hizo el cambio queda viva; todas las demás se revocan.
  currentSessionId: string;
  currentPassword: string;
  newPassword: string;
}

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; reason: "USER_NOT_FOUND" | "INVALID_CURRENT_PASSWORD" };

export async function changePassword(
  deps: ChangePasswordDeps,
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  const user = await deps.userRepository.findById(input.userId);
  if (!user) {
    return { ok: false, reason: "USER_NOT_FOUND" };
  }

  const matches = await deps.passwordHasher.verify(input.currentPassword, user.passwordHash);
  if (!matches) {
    return { ok: false, reason: "INVALID_CURRENT_PASSWORD" };
  }

  const newHash = await deps.passwordHasher.hash(input.newPassword);
  await deps.userRepository.updatePasswordHash(user.id, newHash);
  // Hardening: si alguien más (o un atacante) tenía una sesión abierta con
  // la contraseña vieja, queda afuera de inmediato.
  await deps.sessionRepository.revokeAllForUser(user.id, input.currentSessionId);

  return { ok: true };
}
