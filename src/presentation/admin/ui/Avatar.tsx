"use client";

import { useState } from "react";

// Paleta acotada (no cualquier HSL random) para que los colores de fondo
// combinen con el resto del panel en vez de verse ruidosos.
const PALETTE = [
  "#2563a8", // trust
  "#17824f", // success
  "#8a6b1f", // gold-text
  "#128c7e", // wa-accent-dark
  "#8a5c0c", // caution
  "#475569", // text-secondary
];

function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({
  name,
  avatarUrl,
  size = 44,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (avatarUrl && !imageFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-medium text-white"
      style={{ width: size, height: size, backgroundColor: colorFor(name), fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initialsFor(name)}
    </div>
  );
}
