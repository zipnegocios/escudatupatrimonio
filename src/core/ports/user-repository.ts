import type { User } from "@/infrastructure/database/schema";

// Se reexporta para que las use-cases dependan del puerto y no tengan que
// importar tipos desde infrastructure.
export type { User };

export interface UpdateUserProfileInput {
  username: string;
  email: string;
  displayName: string | null;
}

export interface UserRepository {
  findByUsernameOrEmail(identifier: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateLastLogin(id: string, when: Date): Promise<void>;
  updateProfile(id: string, input: UpdateUserProfileInput): Promise<User>;
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
}
