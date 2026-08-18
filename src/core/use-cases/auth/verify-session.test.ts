import { describe, expect, it } from "vitest";
import { createSession } from "@/core/use-cases/auth/create-session";
import { verifySession } from "@/core/use-cases/auth/verify-session";
import {
  FakeSessionTokenService,
  InMemorySessionRepository,
  InMemoryUserRepository,
  buildUser,
} from "@/core/use-cases/auth/__fakes__/in-memory-adapters";

function buildDeps(users = [buildUser()]) {
  return {
    sessionRepository: new InMemorySessionRepository(),
    sessionTokenService: new FakeSessionTokenService(),
    userRepository: new InMemoryUserRepository(users),
  };
}

describe("verifySession", () => {
  it("devuelve el usuario y el jti para una sesión válida", async () => {
    const deps = buildDeps();
    const { token } = await createSession(deps, {
      userId: "user-1",
      userAgent: null,
      ip: null,
      ttlSeconds: 3600,
    });

    const result = await verifySession(deps, token);
    if (result === null) {
      throw new Error("la sesión recién creada debería verificar");
    }

    expect(result.user.id).toBe("user-1");
    expect(deps.sessionRepository.rows.has(result.jti)).toBe(true);
  });

  it("devuelve null si el token no es verificable", async () => {
    expect(await verifySession(buildDeps(), "basura")).toBeNull();
  });

  it("devuelve null si el token es válido pero no existe la fila de sesión", async () => {
    const deps = buildDeps();
    const token = await deps.sessionTokenService.issue(
      { sub: "user-1", jti: "sesion-fantasma" },
      3600,
    );
    expect(await verifySession(deps, token)).toBeNull();
  });

  it("devuelve null si la sesión fue revocada", async () => {
    const deps = buildDeps();
    const { token } = await createSession(deps, {
      userId: "user-1",
      userAgent: null,
      ip: null,
      ttlSeconds: 3600,
    });
    const [jti] = [...deps.sessionRepository.rows.keys()];
    await deps.sessionRepository.revoke(jti);

    expect(await verifySession(deps, token)).toBeNull();
  });

  it("devuelve null si la fila de sesión ya expiró aunque el token siga vivo", async () => {
    const deps = buildDeps();
    const token = await deps.sessionTokenService.issue({ sub: "user-1", jti: "sesion-1" }, 3600);
    await deps.sessionRepository.create({
      id: "sesion-1",
      userId: "user-1",
      userAgent: null,
      ip: null,
      expiresAt: new Date(Date.now() - 1000),
    });

    expect(await verifySession(deps, token)).toBeNull();
  });

  it("devuelve null si el usuario de la sesión ya no existe", async () => {
    const deps = buildDeps([]);
    const { token } = await createSession(deps, {
      userId: "user-borrado",
      userAgent: null,
      ip: null,
      ttlSeconds: 3600,
    });

    expect(await verifySession(deps, token)).toBeNull();
  });

  it("devuelve null si el usuario fue desactivado después de iniciar sesión", async () => {
    const deps = buildDeps([buildUser({ isActive: false })]);
    const { token } = await createSession(deps, {
      userId: "user-1",
      userAgent: null,
      ip: null,
      ttlSeconds: 3600,
    });

    expect(await verifySession(deps, token)).toBeNull();
  });
});
