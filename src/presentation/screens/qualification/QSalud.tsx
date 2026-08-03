"use client";

import { DecisionScreen } from "@/presentation/screens/DecisionScreen";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § Q_SALUD — Estado de salud general
export function QSalud({ onChoice }: ScreenComponentProps) {
  return (
    <DecisionScreen
      progressStep={2}
      eyebrow="Pregunta 2 de 4"
      eyebrow2="Esta información ayuda a identificar las mejores condiciones para ti"
      question="¿Cómo describes tu estado de salud general en este momento?"
      onSelect={onChoice}
      options={[
        { value: "EXCELENTE", label: "Excelente — sin ninguna condición" },
        { value: "MUY_BIEN", label: "Muy bien — en general me siento bien" },
        { value: "COND_MENOR", label: "Bien, tengo algo menor bajo control" },
        { value: "EN_TRATAMIENTO", label: "Tengo una condición médica en tratamiento" },
        { value: "NO_COMENTA", label: "Prefiero hablarlo con el agente" },
      ]}
    />
  );
}
