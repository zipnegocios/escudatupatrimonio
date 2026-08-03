"use client";

import { DecisionScreen } from "@/presentation/screens/DecisionScreen";
import { IconChildren, IconFamily, IconPartner, IconHeart } from "@/presentation/components/icons";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § Q_B1 — ¿Quiénes dependen de ti? (Rama Familia)
export function QB1({ onChoice }: ScreenComponentProps) {
  return (
    <DecisionScreen
      progressStep={1}
      eyebrow="Tu familia"
      question="¿Quiénes dependen de ti económicamente?"
      onSelect={onChoice}
      options={[
        { value: "HIJOS_PEQ", label: "Mis hijos pequeños", icon: <IconChildren /> },
        { value: "HIJOS_ADULT", label: "Mis hijos adultos", icon: <IconFamily /> },
        { value: "PAREJA", label: "Mi pareja", icon: <IconPartner /> },
        { value: "AMBOS", label: "Hijos y pareja", icon: <IconFamily /> },
        { value: "OTROS", label: "Mis padres u otros familiares", icon: <IconHeart /> },
      ]}
    />
  );
}
