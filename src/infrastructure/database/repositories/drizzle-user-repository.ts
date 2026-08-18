import { eq, or } from "drizzle-orm";
import type { UpdateUserProfileInput, UserRepository } from "@/core/ports/user-repository";
import { db } from "@/infrastructure/database/db";
import { users, type User } from "@/infrastructure/database/schema";

export class DrizzleUserRepository implements UserRepository {
  async findByUsernameOrEmail(identifier: string): Promise<User | null> {
    const rows = await db
      .select()
      .from(users)
      .where(or(eq(users.username, identifier), eq(users.email, identifier)))
      .limit(1);

    return rows[0] ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async updateLastLogin(id: string, when: Date): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: when, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  // Puede lanzar un error de Postgres con code "23505" (unique_violation) si
  // el username o email ya lo tiene otra fila — lo traduce la use-case
  // (updateAccountProfile), acá se deja propagar tal cual.
  async updateProfile(id: string, input: UpdateUserProfileInput): Promise<User> {
    const [row] = await db
      .update(users)
      .set({
        username: input.username,
        email: input.email,
        displayName: input.displayName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return row;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, id));
  }
}
