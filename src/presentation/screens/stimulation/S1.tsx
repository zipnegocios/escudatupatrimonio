"use client";

import { StimScreen } from "@/presentation/screens/stimulation/StimScreen";
import { particleNetworkScene } from "@/presentation/webgl/scenes/particleNetwork";
import { SCREEN_REGISTRY } from "@/core/use-cases/screen-registry";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § S1 — Verificación inicial
export function S1({ onChoice }: ScreenComponentProps) {
  const meta = SCREEN_REGISTRY.S1;
  return (
    <StimScreen
      actionText="Verificando disponibilidad de programas..."
      fact="Este programa opera en los 50 estados con agentes certificados y registrados."
      minDurationMs={meta.minDurationMs!}
      tapAdvanceAfterMs={meta.tapAdvanceAfterMs}
      sceneSetup={particleNetworkScene}
      onAdvance={() => onChoice("ADVANCE")}
    />
  );
}
