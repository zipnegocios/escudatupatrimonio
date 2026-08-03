"use client";

import { DecisionScreen } from "@/presentation/screens/DecisionScreen";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § DISP_SCHED — Selector de disponibilidad
export function DispSched({ onChoice }: ScreenComponentProps) {
  return (
    <DecisionScreen
      progressStep={5}
      eyebrow="Tu disponibilidad"
      question="¿Cuándo podemos contactarte?"
      onSelect={onChoice}
      options={[
        { value: "Mañana en la mañana (9am – 12pm)", label: "Mañana en la mañana (9am – 12pm)" },
        { value: "Mañana en la tarde (12pm – 5pm)", label: "Mañana en la tarde (12pm – 5pm)" },
        { value: "Mañana en la noche (5pm – 9pm)", label: "Mañana en la noche (5pm – 9pm)" },
        { value: "Cualquier día entre semana — mañana", label: "Cualquier día entre semana — mañana" },
        { value: "Cualquier día entre semana — tarde", label: "Cualquier día entre semana — tarde" },
        { value: "Cualquier día entre semana — noche", label: "Cualquier día entre semana — noche" },
        { value: "Escríbeme por WhatsApp primero", label: "Escríbeme por WhatsApp primero" },
      ]}
    />
  );
}
