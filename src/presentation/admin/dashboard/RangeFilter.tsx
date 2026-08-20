import Link from "next/link";
import type { DateRangePreset } from "@/core/use-cases/dashboard/date-range";

const OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
];

// Server Component: son solo links a ?range=..., sin estado — la página
// vuelve a renderizar server-side con el nuevo rango, mismo patrón que el
// resto del admin (sin fetch client-side).
export function RangeFilter({ active }: { active: DateRangePreset }) {
  return (
    <div className="flex w-fit gap-1 rounded-lg border border-border-card bg-bg-surface p-1">
      {OPTIONS.map((option) => (
        <Link
          key={option.value}
          href={`/admin?range=${option.value}`}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            option.value === active
              ? "bg-trust text-white"
              : "text-text-secondary hover:bg-bg-elevated"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
