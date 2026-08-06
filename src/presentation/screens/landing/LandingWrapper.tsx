"use client";

import type { ReactNode } from "react";

interface LandingWrapperProps {
  children: ReactNode;
}

/**
 * Contenedor raíz de la landing. A diferencia de ScreenWrapper (una sola
 * vista, sin scroll, usada por las otras 41 pantallas), la landing tiene 6
 * secciones apiladas más altas que el viewport. Reactiva scroll vertical
 * localmente sin tocar el reset global de `body` en globals.css — mismo
 * patrón de "opt-out local" que ya usan StateSelector y PreFaq en un div
 * hijo, aquí aplicado a toda la pantalla.
 */
export function LandingWrapper({ children }: LandingWrapperProps) {
  return (
    <div className="absolute inset-0 overflow-y-auto overscroll-y-contain">
      {children}
    </div>
  );
}
