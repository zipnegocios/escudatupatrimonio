// Módulo plano (sin "use client") — se llama desde Server Components
// (page.tsx) y desde FunnelSessionsTable.tsx (client). Si viviera dentro de
// un archivo "use client", todos sus exports quedan del lado del límite de
// cliente y no se pueden invocar directamente desde el servidor.
export function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}
