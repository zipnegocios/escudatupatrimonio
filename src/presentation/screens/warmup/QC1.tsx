"use client";

import { DecisionScreen } from "@/presentation/screens/DecisionScreen";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § Q_C1 — ¿Tienes algún respaldo hoy? (Rama Salud)
export function QC1({ onChoice }: ScreenComponentProps) {
  return (
    <DecisionScreen
      progressStep={1}
      eyebrow="Tu situación actual"
      question="Si hoy te pasara algo inesperado, ¿tienes algún respaldo financiero?"
      onSelect={onChoice}
      options={[
        { value: "NINGUNO", label: "No, no tengo ningún respaldo" },
        { value: "PARCIAL", label: "Tengo algo, pero no sería suficiente" },
        { value: "MEJORAR", label: "Quiero mejorar lo que ya tengo" },
      ]}
    />
  );
}
