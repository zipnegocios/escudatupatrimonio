// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md § 2. El problema
const DOLORES = [
  "Vivir demasiado tiempo sin haber ahorrado lo suficiente",
  "Faltar y dejar a la familia sin respaldo económico",
  "Una emergencia médica que quiebre financieramente a la familia",
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
