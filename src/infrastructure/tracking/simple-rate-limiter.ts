// Salvaguarda operativa, no una regla de negocio intercambiable — por eso
// vive acá como utilidad simple y no como puerto/adaptador hexagonal.
// Limitación aceptada: Map en memoria de proceso, no sobrevive reinicios ni
// escala horizontal (el deploy actual es single-instance).
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;

const hits = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now >= entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}
