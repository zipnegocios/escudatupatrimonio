import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  // La primera columna marcada `primary` (o la primera de la lista si
  // ninguna lo está) se usa como título de cada card apilada en móvil —
  // el resto se muestra como pares label/valor debajo.
  primary?: boolean;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
}) {
  const primaryCol = columns.find((c) => c.primary) ?? columns[0];
  const restCols = columns.filter((c) => c !== primaryCol);

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-border-card md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg-elevated text-text-secondary">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-2.5 font-medium">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border-card">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-2.5 text-text-primary">
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-2 md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="rounded-xl border border-border-card bg-bg-surface p-3">
            <div className="text-sm font-medium text-text-primary">{primaryCol.render(row)}</div>
            <dl className="mt-2 flex flex-col gap-1">
              {restCols.map((c) => (
                <div key={c.key} className="flex items-center justify-between gap-2 text-xs">
                  <dt className="text-text-muted">{c.label}</dt>
                  <dd className="text-text-secondary">{c.render(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
