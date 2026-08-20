"use client";

import { getStateByCode } from "@/core/entities/us-states";

interface GridTile {
  x: number;
  y: number;
  code: string;
}

// Layout de grilla (no geográfico) — cada estado ocupa una celda del mismo
// tamaño, con su posición relativa real preservada (oeste→este,
// norte→sur; AK/HI/PR aparte, como en cualquier mapa de EE.UU.). Mismo
// patrón que usan NPR/Census Bureau para mapas táctiles: resuelve que en un
// mapa geográfico real, estados chicos (RI, DE, CT, DC) sean casi
// imposibles de tocar en un teléfono. Coordenadas basadas en el dataset
// público kristw/gridmap-layout-usa (a su vez basado en el grid map del
// NYT), + PR agregado junto a FL.
const GRID: readonly GridTile[] = [
  { x: 0, y: 0, code: "AK" },
  { x: 11, y: 0, code: "ME" },
  { x: 9, y: 1, code: "VT" },
  { x: 10, y: 1, code: "NH" },
  { x: 11, y: 1, code: "MA" },
  { x: 1, y: 2, code: "WA" },
  { x: 2, y: 2, code: "MT" },
  { x: 3, y: 2, code: "ND" },
  { x: 4, y: 2, code: "SD" },
  { x: 5, y: 2, code: "MN" },
  { x: 6, y: 2, code: "WI" },
  { x: 7, y: 2, code: "MI" },
  { x: 9, y: 2, code: "NY" },
  { x: 10, y: 2, code: "CT" },
  { x: 11, y: 2, code: "RI" },
  { x: 1, y: 3, code: "OR" },
  { x: 2, y: 3, code: "ID" },
  { x: 3, y: 3, code: "WY" },
  { x: 4, y: 3, code: "NE" },
  { x: 5, y: 3, code: "IA" },
  { x: 6, y: 3, code: "IL" },
  { x: 7, y: 3, code: "IN" },
  { x: 8, y: 3, code: "OH" },
  { x: 9, y: 3, code: "PA" },
  { x: 10, y: 3, code: "NJ" },
  { x: 0, y: 4, code: "CA" },
  { x: 1, y: 4, code: "NV" },
  { x: 2, y: 4, code: "UT" },
  { x: 3, y: 4, code: "CO" },
  { x: 4, y: 4, code: "KS" },
  { x: 5, y: 4, code: "MO" },
  { x: 6, y: 4, code: "KY" },
  { x: 7, y: 4, code: "WV" },
  { x: 8, y: 4, code: "DC" },
  { x: 9, y: 4, code: "MD" },
  { x: 10, y: 4, code: "DE" },
  { x: 2, y: 5, code: "AZ" },
  { x: 3, y: 5, code: "NM" },
  { x: 4, y: 5, code: "OK" },
  { x: 5, y: 5, code: "AR" },
  { x: 6, y: 5, code: "TN" },
  { x: 7, y: 5, code: "VA" },
  { x: 8, y: 5, code: "NC" },
  { x: 3, y: 6, code: "TX" },
  { x: 4, y: 6, code: "LA" },
  { x: 5, y: 6, code: "MS" },
  { x: 6, y: 6, code: "AL" },
  { x: 7, y: 6, code: "GA" },
  { x: 8, y: 6, code: "SC" },
  { x: 0, y: 7, code: "HI" },
  { x: 7, y: 7, code: "FL" },
  { x: 8, y: 7, code: "PR" },
];

const COLS = 12;
const ROWS = 8;

interface UsStatesMapProps {
  onSelect: (code: string) => void;
}

export function UsStatesMap({ onSelect }: UsStatesMapProps) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div
        className="grid gap-1 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(34px, 1fr))`,
          gridTemplateRows: `repeat(${ROWS}, minmax(34px, 1fr))`,
          minWidth: `${COLS * 34}px`,
          maxWidth: "560px",
        }}
      >
        {GRID.map((tile) => {
          const state = getStateByCode(tile.code);
          if (!state) return null;
          return (
            <button
              key={tile.code}
              type="button"
              onClick={() => onSelect(tile.code)}
              aria-label={state.name}
              title={state.name}
              style={{ gridColumnStart: tile.x + 1, gridRowStart: tile.y + 1 }}
              className="aspect-square rounded-md bg-bg-surface border border-border-card text-text-primary type-label flex items-center justify-center active:brightness-90 hover:border-border-focus hover:bg-bg-elevated"
            >
              {tile.code}
            </button>
          );
        })}
      </div>
    </div>
  );
}
