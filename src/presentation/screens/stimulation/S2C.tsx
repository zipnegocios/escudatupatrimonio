"use client";

import { StimScreen } from "@/presentation/screens/stimulation/StimScreen";
import { medicalCrossScene } from "@/presentation/webgl/scenes/medicalCross";
import { SCREEN_REGISTRY } from "@/core/use-cases/screen-registry";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § S2C — Gastos médicos
export function S2C({ onChoice }: ScreenComponentProps) {
  const meta = SCREEN_REGISTRY.S2C;
  return (
    <StimScreen
      actionText="Revisando opciones de cobertura en vida disponibles para tu caso..."
      fact="La quiebra por gastos médicos es la causa #1 de bancarrota personal en los Estados Unidos."
      minDurationMs={meta.minDurationMs!}
      tapAdvanceAfterMs={meta.tapAdvanceAfterMs}
      sceneSetup={medicalCrossScene}
      onAdvance={() => onChoice("ADVANCE")}
    />
  );
}
