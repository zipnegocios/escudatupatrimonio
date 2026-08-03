import { AGENT_INFO } from "@/presentation/constants";

interface AgentCardProps {
  size?: "medium" | "large";
}

/** Tarjeta del agente reutilizada en INFO_AGENTE, PRE_4 y E5_FINAL. */
export function AgentCard({ size = "medium" }: AgentCardProps) {
  const photoSize = size === "large" ? "w-28 h-28" : "w-20 h-20";
  return (
    <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-bg-elevated border border-border-card">
      <div className={`${photoSize} rounded-full bg-bg-surface border border-border-card flex items-center justify-center overflow-hidden`}>
        <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
        </svg>
      </div>
      <div className="text-center">
        <p className="type-label">{AGENT_INFO.name}</p>
        <p className="type-caption">Agente Certificado — {AGENT_INFO.company}</p>
        <p className="type-caption mt-1">Licencia: {AGENT_INFO.license}</p>
      </div>
    </div>
  );
}
