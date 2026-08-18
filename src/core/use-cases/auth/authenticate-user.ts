import type { PasswordHasher } from "@/core/ports/password-hasher";
import type { User, UserRepository } from "@/core/ports/user-repository";

export type AuthenticateUserFailureReason = "NOT_FOUND" | "INVALID_PASSWORD" | "INACTIVE";

export type AuthenticateUserResult =
  | { ok: true; user: User }
  | { ok: false; reason: AuthenticateUserFailureReason };

export interface AuthenticateUserDeps {
  userRepository: UserRepository;
  passwordHasher: PasswordHasher;
}

export interface AuthenticateUserInput {
  identifier: string;
  password: string;
}

export async function authenticateUser(
  deps: AuthenticateUserDeps,
  input: AuthenticateUserInput,
): Promise<AuthenticateUserResult> {
  const user = await deps.userRepository.findByUsernameOrEmail(input.identifier);

  if (user === null) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  // Se corta antes de verificar el hash: una cuenta desactivada no debe poder
  // entrar ni con la contraseña correcta.
  if (!user.isActive) {
    return { ok: false, reason: "INACTIVE" };
  }

  const matches = await deps.passwordHasher.verify(input.password, user.passwordHash);
  if (!matches) {
    return { ok: false, reason: "INVALID_PASSWORD" };
  }

  return { ok: true, user };
}
