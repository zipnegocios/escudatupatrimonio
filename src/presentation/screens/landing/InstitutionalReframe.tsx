import { MIB_LOGO_URL } from "@/presentation/constants";
import { IconDocument } from "@/presentation/components/icons";

/**
 * Sección 2.5 — Reencuadre institucional. Copy ORIGINAL (no viene verbatim
 * de ningún documento fuente, a diferencia del resto de secciones) —
 * refuerza el mecanismo de rol invertido: el prospecto aplica, el MIB y la
 * aseguradora deciden, Luis acompaña. Revisar con Gustavo antes de
 * publicar.
 */
export function InstitutionalReframe() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center [&_svg]:w-[55%] [&_svg]:h-[55%]" style={{ background: "var(--trust-bg)", color: "var(--trust-blue)" }}>
        <IconDocument />
      </div>
      <p className="type-eyebrow">Cómo se evalúa tu perfil</p>
      <h2 className="type-title">Tú aplicas. Ellos deciden.</h2>
      <p className="type-body max-w-md">
        Ni Luis ni esta plataforma deciden si calificas. El MIB (Buró
        Médico) verifica tu información como parte del proceso federal de
        aprobación, y la aseguradora que mejor se adapte a tu caso evalúa tu
        perfil. Luis te acompaña durante todo el proceso, pero la decisión
        no depende de él.
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={MIB_LOGO_URL} alt="MIB — Medical Information Bureau" className="h-10 w-auto mt-2" loading="lazy" />
    </div>
  );
}
