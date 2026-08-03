"use client";

import { DecisionScreen } from "@/presentation/screens/DecisionScreen";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";
import type { IntencionP } from "@/core/entities/qualification-profile";

// copy: mvp_arbol_decisiones_smart_form.md § Q_INT2 — Intención secundaria
const VARIANTS: Record<
  IntencionP,
  { question: string; yesLabel: string; noLabel: string }
> = {
  AHORRO_RETIRO: {
    question:
      "Además de construir tus ahorros, ¿te importa también dejarle un respaldo a tu familia si algo te llegara a pasar?",
    yesLabel: "Sí, ambas cosas me importan",
    noLabel: "Por ahora solo el ahorro",
  },
  PROTECCION_FAM: {
    question:
      "Además de proteger a tu familia, ¿te interesa también ir construyendo un ahorro para tu retiro?",
    yesLabel: "Sí, quiero las dos cosas",
    noLabel: "Solo la protección familiar",
  },
  SALUD_EMERGENCIA: {
    question:
      "Además del respaldo por emergencias, ¿te interesa que el programa también te genere ahorros para el futuro?",
    yesLabel: "Sí, me interesa generar ahorros",
    noLabel: "Por ahora solo el respaldo",
  },
};

export function QInt2({ vars, onChoice }: ScreenComponentProps) {
  const variant = VARIANTS[vars.intencionP ?? "AHORRO_RETIRO"];

  return (
    <DecisionScreen
      progressStep={1}
      eyebrow="Una pregunta más"
      question={variant.question}
      onSelect={onChoice}
      options={[
        { value: "YES", label: variant.yesLabel },
        { value: "NO", label: variant.noLabel },
      ]}
    />
  );
}
