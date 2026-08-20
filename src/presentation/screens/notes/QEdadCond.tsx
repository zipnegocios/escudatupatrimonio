"use client";

import { NoteScreen } from "@/presentation/screens/notes/NoteScreen";
import { particleNetworkScene } from "@/presentation/webgl/scenes/particleNetwork";
import { SCREEN_REGISTRY } from "@/core/use-cases/screen-registry";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § Q_EDAD_COND — Nota para 61–70 años
export function QEdadCond({ onChoice }: ScreenComponentProps) {
  const meta = SCREEN_REGISTRY.Q_EDAD_COND;
  return (
    <NoteScreen
      text="Hay opciones disponibles para tu rango de edad. Las condiciones varían según la compañía — el Agente Certificado te explicará los detalles específicos."
      minDurationMs={meta.minDurationMs!}
      tapAdvanceAfterMs={meta.tapAdvanceAfterMs}
      sceneSetup={particleNetworkScene}
      onAdvance={() => onChoice("ADVANCE")}
    />
  );
}
