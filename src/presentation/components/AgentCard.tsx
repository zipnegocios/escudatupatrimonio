import { AGENT_INFO } from "@/presentation/constants";

interface AgentCardProps {
  size?: "medium" | "large";
}

/** Tarjeta del agente reutilizada en INFO_AGENTE, PRE_4 y E5_FINAL. */
export function AgentCard({ size = "medium" }: AgentCardProps) {
  const photoSize = size === "large" ? "w-28 h-28" : "w-20 h-20";
  return (
    <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-bg-elevated border border-border-card">
      <div className={`${photoSize} rounded-full bg-bg-surface border border-border-card overflow-hidden`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={AGENT_INFO.photo} alt={AGENT_INFO.name} className="w-full h-full object-cover" />
      </div>
      <div className="text-center">
        <p className="type-label">{AGENT_INFO.name}</p>
        <p className="type-caption">Agente Certificado — {AGENT_INFO.company}</p>
        {/* NPN (National Producer Number): identificador federal del agente, verificable en NIPR.com — no es una licencia emitida por una aseguradora específica. */}
        <p className="type-caption mt-1">NPN {AGENT_INFO.license} · verificable en NIPR</p>
      </div>
    </div>
  );
}
