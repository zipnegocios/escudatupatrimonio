import { IconGrowth, IconUmbrella, IconHeart } from "@/presentation/components/icons";

// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md § 3. La solución (teaser)
const PILARES = [
  {
    title: "Ahorro",
    text: "Los planes de ahorro tradicionales dependen por completo del comportamiento del mercado. El IOL, en cambio, tiene un piso garantizado: tu dinero crece con el tiempo, conectado a los mercados, sin exponerte a sus pérdidas.",
    icon: IconGrowth,
  },
  {
    title: "Protección",
    text: "Si algún día faltas, tu familia recibe un respaldo económico en cuestión de días, no de meses.",
    icon: IconUmbrella,
  },
  {
    title: "Beneficios en vida",
    text: "Si sufres una enfermedad grave, puedes acceder a gran parte de tu cobertura mientras sigues con vida.",
    icon: IconHeart,
  },
];

export function Solution() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow">Cómo te protege este programa</p>
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-6">
        {PILARES.map(({ icon: Icon, ...p }, i) => (
          <div
            key={p.title}
            className={`p-5 rounded-2xl bg-bg-elevated border border-border-card flex flex-col gap-3 ${
              i === 0 ? "lg:col-span-2 lg:row-span-2 lg:p-8 lg:justify-center" : ""
            }`}
          >
            <div
              className={`${i === 0 ? "w-14 h-14" : "w-10 h-10"} rounded-xl flex items-center justify-center [&_svg]:w-[55%] [&_svg]:h-[55%]`}
              style={{ background: "var(--gold-subtle)", color: "var(--gold-text)" }}
            >
              <Icon />
            </div>
            <p className={i === 0 ? "type-title !text-[22px]" : "type-label"}>{p.title}</p>
            <p className="type-body">{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
