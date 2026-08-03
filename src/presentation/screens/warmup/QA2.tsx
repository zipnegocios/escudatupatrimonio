"use client";

import { DecisionScreen } from "@/presentation/screens/DecisionScreen";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § Q_A2 — ¿Tienes plan de retiro? (Rama Ahorro)
export function QA2({ onChoice }: ScreenComponentProps) {
  return (
    <DecisionScreen
      progressStep={1}
      eyebrow="Tu situación actual"
      question="¿Ya tienes algún plan de ahorro para el retiro?"
      onSelect={onChoice}
      options={[
        { value: "TIENE", label: "Sí, ya tengo algo" },
        { value: "INICIANDO", label: "Estoy empezando, es lo primero que hago" },
        { value: "NINGUNO", label: "No tengo nada todavía" },
      ]}
    />
  );
}
