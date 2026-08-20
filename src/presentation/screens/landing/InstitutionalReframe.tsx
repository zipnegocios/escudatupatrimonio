import { MIB_LOGO_URL } from "@/presentation/constants";
import { IconDocument } from "@/presentation/components/icons";

/**
 * Sección 2.5 — Reencuadre institucional. Copy revisado con Luis y Gustavo
 * (reunión 2026-08-19): el MIB verifica, la aseguradora se ASIGNA (no
 * "evalúa" — eso se decide después, según estatus migratorio), el agente
 * acompaña sin nombrarlo, sin arrancar con una negación.
 */
export function InstitutionalReframe() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center [&_svg]:w-[55%] [&_svg]:h-[55%]" style={{ background: "var(--trust-bg)", color: "var(--trust-blue)" }}>
        <IconDocument />
      </div>
      <h2 className="type-title">¿Cómo se evalúa tu perfil?</h2>
      <p className="type-body max-w-md">
        Al completar tu evaluación, el MIB (Buró Médico) verifica tu
        información como parte de un <strong>proceso federal de aprobación</strong>.
        Según tu perfil, se te asigna la aseguradora que mejor se adapte a tu
        caso. Tu agente de seguro te acompaña durante todo el proceso.
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={MIB_LOGO_URL} alt="MIB — Medical Information Bureau" className="h-10 w-auto mt-2" loading="lazy" />
    </div>
  );
}
