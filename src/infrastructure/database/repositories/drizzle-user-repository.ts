import { eq, or } from "drizzle-orm";
import type { UserRepository } from "@/core/ports/user-repository";
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
}
