"use client";

import { DecisionScreen } from "@/presentation/screens/DecisionScreen";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § Q_B2 — ¿Qué te preocupa más? (Rama Familia)
export function QB2({ onChoice }: ScreenComponentProps) {
  return (
    <DecisionScreen
      progressStep={1}
      eyebrow="Tu mayor preocupación"
      question="Si algo te llegara a pasar, ¿qué te preocuparía más?"
      onSelect={onChoice}
      options={[
        { value: "INGRESOS", label: "Que no les falte dinero para vivir" },
        { value: "DEUDAS", label: "Las deudas o gastos que puedo dejar" },
        { value: "EDUCACION", label: "La educación de mis hijos" },
        { value: "ESTILO", label: "Que puedan mantener su estilo de vida" },
      ]}
    />
  );
}
