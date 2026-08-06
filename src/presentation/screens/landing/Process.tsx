// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md § 4. El proceso
const PASOS = [
  "Completas una breve evaluación (4 minutos)",
  "Un Agente Certificado revisa tu perfil",
  "El MIB (Buró Médico) verifica tu información según el proceso federal de aprobación",
  "De acuerdo a tu perfil, se te asigna la aseguradora que mejor se adapte a tu caso.",
];

export function Process() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow">Así funciona el proceso</p>
      <ol className="flex flex-col gap-3">
        {PASOS.map((text, i) => (
          <li key={text} className="flex gap-3 items-start p-4 rounded-2xl bg-bg-surface border border-border-card">
            <span className="type-label text-gold-primary">{i + 1}</span>
            <p className="type-body">{text}</p>
          </li>
        ))}
      </ol>
      <div className="p-5 rounded-2xl bg-trust-bg border border-border-card">
        <p className="type-caption text-trust">
          Como parte del proceso federal de aprobación, el MIB requiere
          verificación de identidad. Tu Agente Certificado te explicará
          exactamente cómo funciona este paso durante la llamada.
        </p>
      </div>
    </div>
  );
}
