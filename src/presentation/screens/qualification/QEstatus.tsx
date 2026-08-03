"use client";

import { DecisionScreen } from "@/presentation/screens/DecisionScreen";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § Q_ESTATUS — Estatus legal en EE.UU.
export function QEstatus({ onChoice }: ScreenComponentProps) {
  return (
    <DecisionScreen
      progressStep={2}
      eyebrow="Pregunta 3 de 4"
      eyebrow2="Dependiendo de tu situación, hay diferentes programas disponibles"
      question="¿Cuál es tu estatus en los Estados Unidos?"
      onSelect={onChoice}
      options={[
        { value: "CIUDADANO", label: "Ciudadano americano" },
        { value: "RESIDENTE", label: "Residente permanente (Green Card)" },
        { value: "EN_PROCESO", label: "Residencia en proceso" },
        { value: "ITIN", label: "Tengo número de identificación fiscal (ITIN)" },
        { value: "OTRO", label: "Ninguna de las anteriores" },
      ]}
    />
  );
}
