"use client";

import { StimScreen } from "@/presentation/screens/stimulation/StimScreen";
import { shieldBuildScene } from "@/presentation/webgl/scenes/shieldBuild";
import { SCREEN_REGISTRY } from "@/core/use-cases/screen-registry";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § S2B — Beneficios familiares
export function S2B({ onChoice }: ScreenComponentProps) {
  const meta = SCREEN_REGISTRY.S2B;
  return (
    <StimScreen
      actionText="Evaluando coberturas familiares disponibles para tu perfil..."
      fact="Los beneficiarios de un seguro de vida reciben los fondos en 24 a 48 horas, sin pasar por herencia ni trámites."
      minDurationMs={meta.minDurationMs!}
      tapAdvanceAfterMs={meta.tapAdvanceAfterMs}
      sceneSetup={shieldBuildScene}
      onAdvance={() => onChoice("ADVANCE")}
    />
  );
}
