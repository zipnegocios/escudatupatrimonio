export interface WebhookSignatureVerifier {
  // Devuelve el payload ya parseado si la firma es válida, o null si no lo
  // es — igual que SessionTokenService.verify, una firma inválida es el
  // camino esperado (reintento/ataque), no una excepción de programa.
  verify(rawBody: string, headers: Record<string, string>): unknown | null;
}
