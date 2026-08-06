"use client";

import { useFormStore } from "@/presentation/state/form-store";
import { DecisionScreen } from "@/presentation/screens/DecisionScreen";
import { IconSavings, IconFamily, IconHealth } from "@/presentation/components/icons";
import { suggestIntencionFromUtm } from "@/core/use-cases/utm-campaign";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § Q_INT
export function QInt({ onChoice }: ScreenComponentProps) {
  const utmCampaign = useFormStore((s) => s.utmCampaign);
  const suggested = suggestIntencionFromUtm(utmCampaign);

  return (
    <DecisionScreen
      progressStep={1}
      eyebrow="Para comenzar"
      question="¿Qué fue lo que más te llamó la atención de este programa?"
      onSelect={onChoice}
      options={[
        {
          value: "AHORRO_RETIRO",
          label: "Ahorrar dinero / prepararme para el retiro",
          icon: <IconSavings />,
          badge: suggested === "AHORRO_RETIRO" ? "Sugerido para ti" : undefined,
        },
        {
          value: "PROTECCION_FAM",
          label: "Proteger a mi familia si me llega a pasar algo",
          icon: <IconFamily />,
          badge: suggested === "PROTECCION_FAM" ? "Sugerido para ti" : undefined,
        },
        {
          value: "SALUD_EMERGENCIA",
          label: "Tener un respaldo si sufro una enfermedad o accidente",
          icon: <IconHealth />,
          badge: suggested === "SALUD_EMERGENCIA" ? "Sugerido para ti" : undefined,
        },
      ]}
    />
  );
}
