import type { UpdateUserProfileInput, User, UserRepository } from "@/core/ports/user-repository";

export interface UpdateAccountProfileDeps {
  userRepository: UserRepository;
}

export type UpdateAccountProfileResult =
  | { ok: true; user: User }
  | { ok: false; reason: "USERNAME_TAKEN" | "EMAIL_TAKEN" };

export async function updateAccountProfile(
  deps: UpdateAccountProfileDeps,
  userId: string,
  input: UpdateUserProfileInput,
): Promise<UpdateAccountProfileResult> {
  try {
    const user = await deps.userRepository.updateProfile(userId, input);
    return { ok: true, user };
  } catch (error) {
    // Postgres 23505 = unique_violation. Se traduce acá para que la ruta no
    // tenga que conocer códigos de error de Postgres.
    const pgError = error as { code?: string; constraint?: string };
    if (pgError.code === "23505") {
      if (pgError.constraint === "users_username_unique") {
        return { ok: false, reason: "USERNAME_TAKEN" };
      }
      if (pgError.constraint === "users_email_unique") {
        return { ok: false, reason: "EMAIL_TAKEN" };
      }
    }
    throw error;
  }
}
