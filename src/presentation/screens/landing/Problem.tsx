// copy: spec de rediseño v1.0 § 2.3 Agitación del problema
const DOLORES = [
  "¿Qué pasaría con tu familia si tú faltaras mañana?",
  "Los planes de ahorro tradicionales dependen por completo del comportamiento del mercado.",
  "Un diagnóstico médico grave llega sin aviso — y sin un respaldo claro, la carga recae en tu familia.",
];

export function Problem() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow">Lo que nadie quiere enfrentar</p>
      {DOLORES.map((text) => (
        <div key={text} className="p-5 rounded-2xl bg-bg-surface border border-border-card">
          <p className="type-body">{text}</p>
        </div>
      ))}
    </div>
  );
}
