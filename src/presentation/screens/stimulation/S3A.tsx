"use client";

import { StimScreen } from "@/presentation/screens/stimulation/StimScreen";
import { dataStreamScene } from "@/presentation/webgl/scenes/dataStream";
import { SCREEN_REGISTRY } from "@/core/use-cases/screen-registry";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § S3A — Aprobación sin examen
export function S3A({ onChoice }: ScreenComponentProps) {
  const meta = SCREEN_REGISTRY.S3A;
  return (
    <StimScreen
      actionText="Preparando evaluación de requisitos para tu perfil..."
      fact="Este programa puede aprobarse sin examen médico gracias al sistema de verificación del MIB."
      minDurationMs={meta.minDurationMs!}
      tapAdvanceAfterMs={meta.tapAdvanceAfterMs}
      sceneSetup={dataStreamScene}
      onAdvance={() => onChoice("ADVANCE")}
    />
  );
}
