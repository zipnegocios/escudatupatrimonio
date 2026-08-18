import { describe, expect, it } from "vitest";
import { revokeSession } from "@/core/use-cases/auth/revoke-session";
import { InMemorySessionRepository } from "@/core/use-cases/auth/__fakes__/in-memory-adapters";

describe("revokeSession", () => {
  it("delega la revocación al repositorio con el jti recibido", async () => {
    const sessionRepository = new InMemorySessionRepository();
    await revokeSession({ sessionRepository }, "sesion-1");
    expect(sessionRepository.revokeCalls).toEqual(["sesion-1"]);
  });

  it("no falla al revocar una sesión inexistente", async () => {
    const sessionRepository = new InMemorySessionRepository();
    await expect(revokeSession({ sessionRepository }, "no-existe")).resolves.toBeUndefined();
  });

  it("marca revokedAt en la fila cuando la sesión existe", async () => {
    const sessionRepository = new InMemorySessionRepository();
    await sessionRepository.create({
      id: "sesion-1",
      userId: "user-1",
      userAgent: null,
      ip: null,
      expiresAt: new Date(Date.now() + 60_000),
    });

    await revokeSession({ sessionRepository }, "sesion-1");

    expect((await sessionRepository.findById("sesion-1"))?.revokedAt).toBeInstanceOf(Date);
  });
});
