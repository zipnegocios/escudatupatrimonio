"use client";

import { StimScreen } from "@/presentation/screens/stimulation/StimScreen";
import { growingBarsScene } from "@/presentation/webgl/scenes/growingBars";
import { SCREEN_REGISTRY } from "@/core/use-cases/screen-registry";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § S2A — Proyecciones de ahorro
export function S2A({ onChoice }: ScreenComponentProps) {
  const meta = SCREEN_REGISTRY.S2A;
  return (
    <StimScreen
      actionText="Calculando proyecciones de crecimiento para tu perfil..."
      fact="$200 mensuales con 10% de interés compuesto anual durante 20 años = más de $150,000 acumulados libres de impuestos."
      minDurationMs={meta.minDurationMs!}
      tapAdvanceAfterMs={meta.tapAdvanceAfterMs}
      sceneSetup={growingBarsScene}
      onAdvance={() => onChoice("ADVANCE")}
    />
  );
}
