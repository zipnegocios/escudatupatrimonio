import { describe, expect, it } from "vitest";
import { createSession } from "@/core/use-cases/auth/create-session";
import {
  FakeSessionTokenService,
  InMemorySessionRepository,
} from "@/core/use-cases/auth/__fakes__/in-memory-adapters";

describe("createSession", () => {
  it("persiste la fila y emite un token cuyo jti apunta a esa misma fila", async () => {
    const sessionRepository = new InMemorySessionRepository();
    const sessionTokenService = new FakeSessionTokenService();

    const result = await createSession(
      { sessionRepository, sessionTokenService },
      { userId: "user-1", userAgent: "vitest", ip: "127.0.0.1", ttlSeconds: 3600 },
    );

    const payload = await sessionTokenService.verify(result.token);
    if (payload === null) {
      throw new Error("el token recién emitido debería verificar");
    }

    expect(payload.sub).toBe("user-1");

    const stored = await sessionRepository.findById(payload.jti);
    if (stored === null) {
      throw new Error("la sesión debería estar persistida bajo el jti del token");
    }

    expect(stored.userId).toBe("user-1");
    expect(stored.userAgent).toBe("vitest");
    expect(stored.ip).toBe("127.0.0.1");
    expect(stored.revokedAt).toBeNull();
  });

  it("devuelve un expiresAt coherente con el ttl y lo persiste igual", async () => {
    const sessionRepository = new InMemorySessionRepository();
    const sessionTokenService = new FakeSessionTokenService();
    const before = Date.now();

    const result = await createSession(
      { sessionRepository, sessionTokenService },
      { userId: "user-1", userAgent: null, ip: null, ttlSeconds: 60 },
    );

    const after = Date.now();
    expect(result.expiresAt.getTime()).toBeGreaterThanOrEqual(before + 60_000);
    expect(result.expiresAt.getTime()).toBeLessThanOrEqual(after + 60_000);

    const [stored] = [...sessionRepository.rows.values()];
    expect(stored.expiresAt.getTime()).toBe(result.expiresAt.getTime());
    expect(stored.userAgent).toBeNull();
    expect(stored.ip).toBeNull();
  });

  it("genera un jti distinto en cada llamada", async () => {
    const sessionRepository = new InMemorySessionRepository();
    const sessionTokenService = new FakeSessionTokenService();
    const input = { userId: "user-1", userAgent: null, ip: null, ttlSeconds: 3600 };

    await createSession({ sessionRepository, sessionTokenService }, input);
    await createSession({ sessionRepository, sessionTokenService }, input);

    expect(sessionRepository.rows.size).toBe(2);
  });
});
