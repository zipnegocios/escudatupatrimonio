"use client";

import { StimScreen } from "@/presentation/screens/stimulation/StimScreen";
import { dataStreamScene } from "@/presentation/webgl/scenes/dataStream";
import { SCREEN_REGISTRY } from "@/core/use-cases/screen-registry";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § S3B — MIB 1902
export function S3B({ onChoice }: ScreenComponentProps) {
  const meta = SCREEN_REGISTRY.S3B;
  return (
    <StimScreen
      actionText="Consultando programas elegibles para tu perfil de salud..."
      fact="El Medical Information Bureau (MIB) fue fundado en 1902 para garantizar la integridad del proceso de aprobación de seguros de vida en los EE.UU."
      minDurationMs={meta.minDurationMs!}
      tapAdvanceAfterMs={meta.tapAdvanceAfterMs}
      sceneSetup={dataStreamScene}
      onAdvance={() => onChoice("ADVANCE")}
    />
  );
}
