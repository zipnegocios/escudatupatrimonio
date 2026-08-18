import { SignJWT, jwtVerify } from "jose";
import type {
  SessionTokenPayload,
  SessionTokenService,
} from "@/core/ports/session-token-service";

const ALGORITHM = "HS256";

export class JoseSessionTokenService implements SessionTokenService {
  private readonly secret: Uint8Array;

  // El secreto se inyecta en vez de leerlo de `env` acá: así el adapter se
  // testea sin process.env y todo el wiring queda en el composition root.
  constructor(secret: string) {
    this.secret = new TextEncoder().encode(secret);
  }

  async issue(payload: SessionTokenPayload, expiresInSeconds: number): Promise<string> {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return new SignJWT({})
      .setProtectedHeader({ alg: ALGORITHM })
      .setSubject(payload.sub)
      .setJti(payload.jti)
      .setIssuedAt(nowInSeconds)
      .setExpirationTime(nowInSeconds + expiresInSeconds)
      .sign(this.secret);
  }

  async verify(token: string): Promise<SessionTokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        algorithms: [ALGORITHM],
      });

      // jose tipa sub/jti como opcionales: sin estos dos el token no sirve
      // para identificar ni la sesión ni al usuario.
      if (typeof payload.sub !== "string" || typeof payload.jti !== "string") {
        return null;
      }

      return { sub: payload.sub, jti: payload.jti };
    } catch {
      return null;
    }
  }
}
