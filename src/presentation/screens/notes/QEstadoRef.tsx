"use client";

import { NoteScreen } from "@/presentation/screens/notes/NoteScreen";
import { SCREEN_REGISTRY } from "@/core/use-cases/screen-registry";
import { getStateByCode } from "@/core/entities/us-states";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § Q_ESTADO_REF — Nota: referido a otro agente
export function QEstadoRef({ vars, onChoice }: ScreenComponentProps) {
  const meta = SCREEN_REGISTRY.Q_ESTADO_REF;
  const stateName = vars.estado ? getStateByCode(vars.estado)?.name ?? vars.estado : "tu estado";
  return (
    <NoteScreen
      text={`Estamos coordinando cobertura en ${stateName}. Te conectaremos con un Agente Certificado disponible en tu área para que recibas la misma atención personalizada.`}
      minDurationMs={meta.minDurationMs!}
      tapAdvanceAfterMs={meta.tapAdvanceAfterMs}
      onAdvance={() => onChoice("ADVANCE")}
    />
  );
}
