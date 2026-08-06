import { AgentCard } from "@/presentation/components/AgentCard";
import { AGENT_INFO, INSURANCE_PARTNERS } from "@/presentation/constants";

// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md § 6. Credenciales
export function Credentials() {
  return (
    <div className="flex flex-col gap-6 items-center">
      <AgentCard size="large" />
      <div className="w-full">
        <p className="type-eyebrow text-center mb-3">Respaldado por aseguradoras líderes</p>
        <div className="grid grid-cols-2 gap-2">
          {INSURANCE_PARTNERS.map((name) => (
            <div key={name} className="p-3 rounded-xl bg-bg-surface border border-border-card text-center">
              <p className="type-caption">{name}</p>
            </div>
          ))}
        </div>
      </div>
      <a
        href="https://nipr.com"
        target="_blank"
        rel="noopener noreferrer"
        className="type-caption text-trust"
      >
        Verificar licencia {AGENT_INFO.license} en nipr.com →
      </a>
    </div>
  );
}
