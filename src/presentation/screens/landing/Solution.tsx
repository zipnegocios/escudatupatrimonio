// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md § 3. La solución (teaser)
const PILARES = [
  {
    title: "Ahorro",
    text: "Tu dinero crece con el tiempo, conectado a los mercados, sin exponerte a sus pérdidas.",
  },
  {
    title: "Protección",
    text: "Si algún día faltas, tu familia recibe un respaldo económico en cuestión de días, no de meses.",
  },
  {
    title: "Beneficios en vida",
    text: "Si sufres una enfermedad grave, puedes acceder a gran parte de tu cobertura mientras sigues con vida.",
  },
];

export function Solution() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow">Cómo te protege este programa</p>
      {PILARES.map((p) => (
        <div key={p.title} className="p-5 rounded-2xl bg-bg-elevated border border-border-card">
          <p className="type-label mb-1">{p.title}</p>
          <p className="type-body">{p.text}</p>
        </div>
      ))}
    </div>
  );
}
