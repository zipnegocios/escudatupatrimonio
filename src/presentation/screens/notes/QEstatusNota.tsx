"use client";

import { NoteScreen } from "@/presentation/screens/notes/NoteScreen";
import { dataStreamScene } from "@/presentation/webgl/scenes/dataStream";
import { SCREEN_REGISTRY } from "@/core/use-cases/screen-registry";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";
import type { EstatusFlag } from "@/core/entities/qualification-profile";

// copy: mvp_arbol_decisiones_smart_form.md § Q_ESTATUS_NOTA — Nota post-estatus (C o D)
const TEXT_BY_FLAG: Record<EstatusFlag, string> = {
  EN_PROCESO:
    "Hay opciones disponibles para quienes están en proceso de residencia. El Agente Certificado revisará los detalles para tu situación. Continuemos.",
  ITIN: "Hay compañías que trabajan con número ITIN. El Agente Certificado evaluará las opciones disponibles para tu caso. Continuemos.",
};

export function QEstatusNota({ vars, onChoice }: ScreenComponentProps) {
  const meta = SCREEN_REGISTRY.Q_ESTATUS_NOTA;
  return (
    <NoteScreen
      text={TEXT_BY_FLAG[vars.estatusFlag ?? "EN_PROCESO"]}
      minDurationMs={meta.minDurationMs!}
      tapAdvanceAfterMs={meta.tapAdvanceAfterMs}
      sceneSetup={dataStreamScene}
      onAdvance={() => onChoice("ADVANCE")}
    />
  );
}
