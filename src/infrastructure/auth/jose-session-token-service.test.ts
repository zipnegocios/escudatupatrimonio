import { describe, expect, it } from "vitest";
import { JoseSessionTokenService } from "@/infrastructure/auth/jose-session-token-service";

const SECRET = "secreto-de-prueba-de-mas-de-16-chars";

describe("JoseSessionTokenService", () => {
  const service = new JoseSessionTokenService(SECRET);

  it("hace round-trip del payload emitido", async () => {
    const token = await service.issue({ sub: "user-1", jti: "sess-1" }, 3600);
    expect(await service.verify(token)).toEqual({ sub: "user-1", jti: "sess-1" });
  });

  it("devuelve null ante un string que no es un JWT", async () => {
    expect(await service.verify("basura")).toBeNull();
  });

  it("devuelve null ante un JWT manipulado", async () => {
    const token = await service.issue({ sub: "user-1", jti: "sess-1" }, 3600);
    expect(await service.verify(`${token}x`)).toBeNull();
  });

  it("devuelve null ante un token expirado", async () => {
    const token = await service.issue({ sub: "user-1", jti: "sess-1" }, -60);
    expect(await service.verify(token)).toBeNull();
  });

  it("devuelve null ante un token firmado con otro secreto", async () => {
    const otro = new JoseSessionTokenService("otro-secreto-distinto-1234567890");
    const token = await otro.issue({ sub: "user-1", jti: "sess-1" }, 3600);
    expect(await service.verify(token)).toBeNull();
  });
});
