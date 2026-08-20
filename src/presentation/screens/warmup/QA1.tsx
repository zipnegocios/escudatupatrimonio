"use client";

import { DecisionScreen } from "@/presentation/screens/DecisionScreen";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § Q_A1 — ¿Cuándo quieres el dinero? (Rama Ahorro)
export function QA1({ onChoice }: ScreenComponentProps) {
  return (
    <DecisionScreen
      progressStep={1}
      eyebrow="Tu ahorro"
      question="¿En cuánto tiempo te gustaría poder acceder a ese dinero?"
      onSelect={onChoice}
      options={[
        { value: "CORTO", label: "En los próximos 5 años" },
        { value: "MEDIO", label: "Entre 5 y 15 años" },
        { value: "LARGO", label: "En más de 15 años" },
      ]}
    />
  );
}
