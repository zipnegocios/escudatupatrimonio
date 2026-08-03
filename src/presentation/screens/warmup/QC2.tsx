"use client";

import { DecisionScreen } from "@/presentation/screens/DecisionScreen";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § Q_C2 — ¿Qué te preocupa más? (Rama Salud)
export function QC2({ onChoice }: ScreenComponentProps) {
  return (
    <DecisionScreen
      progressStep={1}
      eyebrow="Tu mayor preocupación"
      question="¿Qué te preocupa más en caso de una emergencia de salud?"
      onSelect={onChoice}
      options={[
        { value: "HOSPITAL", label: "Los gastos de hospitalización" },
        { value: "INGRESOS_S", label: "Perder mis ingresos si no puedo trabajar" },
        { value: "GASTOS", label: "Gastos médicos que no puedo pagar" },
        { value: "CARGA", label: "Ser una carga económica para mi familia" },
      ]}
    />
  );
}
