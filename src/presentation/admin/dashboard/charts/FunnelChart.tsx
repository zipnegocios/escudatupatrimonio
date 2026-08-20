import type {
  FunnelDisqualificationSummary,
  FunnelStageSummary,
} from "@/core/use-cases/dashboard/get-funnel-summary";

// Server Component puro: barras horizontales, ancho proporcional a
// sessionCount/sessionsStarted. SVG propio, cero dependencias.
function FunnelRow({
  label,
  sessionCount,
  total,
  color,
}: {
  label: string;
  sessionCount: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((sessionCount / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate text-xs text-text-secondary">{label}</span>
      <svg
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        className="h-2.5 flex-1"
        role="img"
        aria-label={`${label}: ${sessionCount} sesiones (${pct}%)`}
      >
        <rect x="0" y="0" width="100" height="10" fill="var(--color-bg-elevated)" />
        <rect x="0" y="0" width={pct} height="10" fill={color}>
          <title>{`${label}: ${sessionCount} (${pct}%)`}</title>
        </rect>
      </svg>
      <span className="w-10 shrink-0 text-right text-xs text-text-muted">{sessionCount}</span>
    </div>
  );
}

export function FunnelChart({
  stages,
  sessionsStarted,
  disqualified,
}: {
  stages: FunnelStageSummary[];
  sessionsStarted: number;
  disqualified: FunnelDisqualificationSummary[];
}) {
  const hasDisqualified = disqualified.some((d) => d.sessionCount > 0);

  return (
    <div className="flex flex-col gap-2">
      {stages.map((stage) => (
        <FunnelRow
          key={stage.key}
          label={stage.label}
          sessionCount={stage.sessionCount}
          total={sessionsStarted}
          color="var(--color-trust)"
        />
      ))}

      {hasDisqualified && (
        <div className="mt-3 border-t border-border-card pt-3">
          <p className="mb-2 text-xs font-medium text-text-secondary">Descalificados</p>
          <div className="flex flex-col gap-2">
            {disqualified.map((d) => (
              <FunnelRow
                key={d.screenId}
                label={d.label}
                sessionCount={d.sessionCount}
                total={sessionsStarted}
                color="var(--color-caution)"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
