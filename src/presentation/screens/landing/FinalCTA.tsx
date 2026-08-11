import { AgentCard } from "@/presentation/components/AgentCard";
import { CTAButton } from "@/presentation/components/CTAButton";
import { AGENT_INFO, INSURANCE_PARTNERS } from "@/presentation/constants";

interface FinalCTAProps {
  onContinue: () => void;
}

// copy: spec de rediseño v1.0 § 2.9 CTA final + footer de confianza. Fondo claro, consistente con el resto del wizard.
export function FinalCTA({ onContinue }: FinalCTAProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <AgentCard size="large" />
      <div className="w-full">
        <p className="type-eyebrow mb-3">Respaldado por aseguradoras líderes</p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
          {INSURANCE_PARTNERS.map((partner) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={partner.name} src={partner.logoUrl} alt={partner.name} className="h-12 w-auto" loading="lazy" />
          ))}
        </div>
      </div>
      <CTAButton label="Verificar mi elegibilidad ahora →" onClick={onContinue} />
      <p className="type-caption">Evaluación gratuita y sin compromiso</p>
      <a
        href="https://nipr.com"
        target="_blank"
        rel="noopener noreferrer"
        className="type-caption"
        style={{ color: "var(--trust-blue)" }}
      >
        Verificar licencia {AGENT_INFO.license} en nipr.com →
      </a>
    </div>
  );
}
