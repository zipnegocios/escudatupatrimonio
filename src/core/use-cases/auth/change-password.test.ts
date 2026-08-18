import { describe, expect, it } from "vitest";
import { changePassword } from "@/core/use-cases/auth/change-password";
import {
  FakePasswordHasher,
  InMemorySessionRepository,
  InMemoryUserRepository,
  buildUser,
} from "@/core/use-cases/auth/__fakes__/in-memory-adapters";

describe("changePassword", () => {
  it("devuelve INVALID_CURRENT_PASSWORD si la contraseña actual no coincide", async () => {
    const userRepository = new InMemoryUserRepository([buildUser()]);
    const sessionRepository = new InMemorySessionRepository();
    const result = await changePassword(
      { userRepository, passwordHasher: new FakePasswordHasher(), sessionRepository },
      { userId: "user-1", currentSessionId: "sess-1", currentPassword: "incorrecta", newPassword: "nueva-clave-larga" },
    );
    expect(result).toEqual({ ok: false, reason: "INVALID_CURRENT_PASSWORD" });
  });

  it("actualiza el hash y revoca las demás sesiones, dejando viva la actual", async () => {
    const userRepository = new InMemoryUserRepository([buildUser()]);
    const sessionRepository = new InMemorySessionRepository();
    await sessionRepository.create({
      id: "sess-actual",
      userId: "user-1",
      userAgent: null,
      ip: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    await sessionRepository.create({
      id: "sess-otra",
      userId: "user-1",
      userAgent: null,
      ip: null,
      expiresAt: new Date(Date.now() + 60_000),
    });

    const result = await changePassword(
      { userRepository, passwordHasher: new FakePasswordHasher(), sessionRepository },
      {
        userId: "user-1",
        currentSessionId: "sess-actual",
        currentPassword: "secreta",
        newPassword: "nueva-clave-larga",
      },
    );

    expect(result).toEqual({ ok: true });
    expect((await userRepository.findById("user-1"))?.passwordHash).toBe(
      "hash:nueva-clave-larga",
    );
    expect((await sessionRepository.findById("sess-actual"))?.revokedAt).toBeNull();
    expect((await sessionRepository.findById("sess-otra"))?.revokedAt).not.toBeNull();
  });

  it("devuelve USER_NOT_FOUND si el usuario no existe", async () => {
    const userRepository = new InMemoryUserRepository([]);
    const sessionRepository = new InMemorySessionRepository();
    const result = await changePassword(
      { userRepository, passwordHasher: new FakePasswordHasher(), sessionRepository },
      { userId: "no-existe", currentSessionId: "sess-1", currentPassword: "secreta", newPassword: "nueva-clave-larga" },
    );
    expect(result).toEqual({ ok: false, reason: "USER_NOT_FOUND" });
  });
});
