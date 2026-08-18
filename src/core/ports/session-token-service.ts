export interface SessionTokenPayload {
  sub: string;
  jti: string;
}

export interface SessionTokenService {
  issue(payload: SessionTokenPayload, expiresInSeconds: number): Promise<string>;
  // Devuelve null (no lanza) ante token inválido/expirado: para el caller es
  // el camino esperado, no una excepción que haya que envolver en try/catch.
  verify(token: string): Promise<SessionTokenPayload | null>;
}
