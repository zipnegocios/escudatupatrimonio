"use client";

import { DecisionScreen } from "@/presentation/screens/DecisionScreen";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § Q_EDAD — Rango de edad
export function QEdad({ onChoice }: ScreenComponentProps) {
  return (
    <DecisionScreen
      progressStep={2}
      eyebrow="Pregunta 1 de 4"
      question="¿En qué rango está tu edad?"
      grid
      onSelect={onChoice}
      options={[
        { value: "18_35", label: "18 – 35 años" },
        { value: "36_50", label: "36 – 50 años" },
        { value: "51_60", label: "51 – 60 años" },
        { value: "61_70", label: "61 – 70 años" },
        { value: "MENOR_18", label: "Menos de 18", variant: "muted" },
        { value: "MAYOR_70", label: "Más de 70", variant: "muted" },
      ]}
    />
  );
}
