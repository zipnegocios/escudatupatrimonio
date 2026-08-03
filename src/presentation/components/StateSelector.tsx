"use client";

import { useMemo, useState } from "react";
import { US_STATES } from "@/core/entities/us-states";

interface StateSelectorProps {
  onSelect: (code: string) => void;
}

/**
 * Lista alfabética scrollable de los 50 estados + DC + PR, con buscador de
 * filtro. El usuario siempre selecciona tocando una fila de la lista — el
 * campo de búsqueda solo filtra, no cuenta como el texto libre prohibido
 * (ver nota (DEV) en Q_ESTADO del documento fuente).
 */
export function StateSelector({ onSelect }: StateSelectorProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return US_STATES;
    return US_STATES.filter(
      (s) => s.name.toLowerCase().startsWith(q) || s.code.toLowerCase().startsWith(q)
    );
  }, [query]);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      <input
        type="text"
        inputMode="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar estado..."
        className="w-full h-12 px-4 rounded-xl bg-bg-input border border-border-card text-text-primary type-body focus:outline-none focus:ring-2 focus:ring-border-focus"
      />
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1.5 pb-4">
        {filtered.map((s) => (
          <button
            key={s.code}
            type="button"
            onClick={() => onSelect(s.code)}
            className="w-full min-h-[48px] px-4 rounded-xl bg-bg-surface border border-border-card text-left type-label active:brightness-90"
          >
            {s.name}
          </button>
        ))}
        {filtered.length === 0 && <p className="type-caption text-center py-6">Sin resultados</p>}
      </div>
    </div>
  );
}
