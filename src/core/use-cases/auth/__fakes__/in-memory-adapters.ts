import type { PasswordHasher } from "@/core/ports/password-hasher";
import type { NewSessionRecord, SessionRepository } from "@/core/ports/session-repository";
import type {
  SessionTokenPayload,
  SessionTokenService,
} from "@/core/ports/session-token-service";
import type {
  UpdateUserProfileInput,
  User,
  UserRepository,
} from "@/core/ports/user-repository";
import type { Session } from "@/infrastructure/database/schema";

export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    username: "admin",
    email: "admin@example.com",
    passwordHash: "hash:secreta",
    role: "admin",
    displayName: "Luis Moreno",
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

export class InMemoryUserRepository implements UserRepository {
  readonly users: User[];
  readonly lastLoginCalls: Array<{ id: string; when: Date }> = [];

  constructor(users: User[] = []) {
    this.users = [...users];
  }

  async findByUsernameOrEmail(identifier: string): Promise<User | null> {
    return (
      this.users.find((user) => user.username === identifier || user.email === identifier) ?? null
    );
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async updateLastLogin(id: string, when: Date): Promise<void> {
    this.lastLoginCalls.push({ id, when });
  }

  async updateProfile(id: string, input: UpdateUserProfileInput): Promise<User> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new Error(`usuario ${id} no encontrado`);
    }
    const updated: User = {
      ...this.users[index],
      username: input.username,
      email: input.email,
      displayName: input.displayName,
      updatedAt: new Date(),
    };
    this.users[index] = updated;
    return updated;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return;
    this.users[index] = { ...this.users[index], passwordHash, updatedAt: new Date() };
  }
}

// Hash de juguete `hash:<plain>`. Ejercita las ramas de las use-cases sin
// pagar los ~100ms de argon2 en cada assertion.
export class FakePasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hash:${plain}`;
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    return hash === `hash:${plain}`;
  }
}

export class InMemorySessionRepository implements SessionRepository {
  readonly rows = new Map<string, Session>();
  readonly revokeCalls: string[] = [];

  async create(session: NewSessionRecord): Promise<void> {
    this.rows.set(session.id, {
      id: session.id,
      userId: session.userId,
      userAgent: session.userAgent ?? null,
      ip: session.ip ?? null,
      createdAt: new Date(),
      expiresAt: session.expiresAt,
      revokedAt: null,
    });
  }

  async findById(id: string): Promise<Session | null> {
    return this.rows.get(id) ?? null;
  }

  async revoke(id: string): Promise<void> {
    this.revokeCalls.push(id);
    const existing = this.rows.get(id);
    if (existing !== undefined && existing.revokedAt === null) {
      this.rows.set(id, { ...existing, revokedAt: new Date() });
    }
  }

  async revokeAllForUser(userId: string, exceptSessionId?: string): Promise<void> {
    for (const [id, session] of this.rows) {
      if (session.userId !== userId || session.revokedAt !== null) continue;
      if (exceptSessionId !== undefined && id === exceptSessionId) continue;
      this.revokeCalls.push(id);
      this.rows.set(id, { ...session, revokedAt: new Date() });
    }
  }
}

// Token de juguete `<sub>.<jti>.<expEnMs>`: no cifra nada, solo permite
// verificar el round-trip y la expiración desde las use-cases.
export class FakeSessionTokenService implements SessionTokenService {
  async issue(payload: SessionTokenPayload, expiresInSeconds: number): Promise<string> {
    return `${payload.sub}.${payload.jti}.${Date.now() + expiresInSeconds * 1000}`;
  }

  async verify(token: string): Promise<SessionTokenPayload | null> {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [sub, jti, expiresAtMs] = parts;
    const expiry = Number(expiresAtMs);
    if (!Number.isFinite(expiry) || expiry <= Date.now()) {
      return null;
    }

    return { sub, jti };
  }
}
