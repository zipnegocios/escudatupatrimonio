import { IconFamily, IconChart, IconHealth } from "@/presentation/components/icons";

// copy: spec de rediseño v1.0 § 2.3 Agitación del problema
const DOLORES = [
  {
    icon: IconFamily,
    text: "¿Qué pasaría con tu familia si tú faltaras mañana?",
  },
  {
    icon: IconChart,
    text: "Los planes de ahorro tradicionales dependen por completo del comportamiento del mercado.",
  },
  {
    icon: IconHealth,
    text: "Un diagnóstico médico grave llega sin aviso — y sin un respaldo claro, la carga recae en tu familia.",
  },
];

export function Problem() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow">Lo que nadie quiere enfrentar</p>
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-6">
        {DOLORES.map(({ icon: Icon, text }) => (
          <div key={text} className="p-5 lg:p-6 rounded-2xl bg-bg-surface border border-border-card flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--trust-bg)", color: "var(--trust-blue)" }}>
              <Icon />
            </div>
            <p className="type-body">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
