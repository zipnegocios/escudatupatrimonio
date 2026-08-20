// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md § 4. El proceso
const PASOS = [
  "Completas una breve evaluación",
  "Un Agente Certificado revisa tu perfil",
  "El MIB (Buró Médico) verifica tu información según el proceso federal de aprobación",
  "De acuerdo a tu perfil, se te asigna la aseguradora que mejor se adapte a tu caso.",
];

export function Process() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow">Así funciona el proceso</p>
      <ol className="flex flex-col">
        {PASOS.map((text, i) => (
          <li key={text} className="relative flex gap-4 pb-6 last:pb-0">
            {i < PASOS.length - 1 && (
              <span className="absolute left-4 top-9 bottom-0 w-px bg-border-card" aria-hidden="true" />
            )}
            <span
              className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-gold-subtle border border-gold-border flex items-center justify-center type-label"
              style={{ color: "var(--gold-text)" }}
            >
              {i + 1}
            </span>
            <p className="type-body pt-1">{text}</p>
          </li>
        ))}
      </ol>
      <div className="p-5 rounded-2xl bg-trust-bg border border-border-card">
        <p className="type-caption" style={{ color: "var(--trust-blue)" }}>
          Como parte del proceso federal de aprobación, el MIB requiere
          verificación de identidad. Tu Agente Certificado te explicará
          exactamente cómo funciona este paso durante la llamada.
        </p>
      </div>
    </div>
  );
}
