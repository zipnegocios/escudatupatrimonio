"use client";

import { NoteScreen } from "@/presentation/screens/notes/NoteScreen";
import { SCREEN_REGISTRY } from "@/core/use-cases/screen-registry";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";
import type { SaludFlag } from "@/core/entities/qualification-profile";

// copy: mvp_arbol_decisiones_smart_form.md § Q_SALUD_FLAG — Nota post-salud (C, D o E)
const TEXT_BY_FLAG: Record<SaludFlag, string> = {
  MENOR: "Muchas condiciones menores son completamente compatibles con este programa. Continuemos.",
  TRATAMIENTO:
    "Muchas condiciones médicas son perfectamente compatibles con este programa. El Agente Certificado evaluará tu caso con confidencialidad.",
  NO_COMENTA:
    "No hay problema. Podrás hablar con el agente en privado sobre este punto cuando llegue el momento.",
};

export function QSaludFlag({ vars, onChoice }: ScreenComponentProps) {
  const meta = SCREEN_REGISTRY.Q_SALUD_FLAG;
  return (
    <NoteScreen
      text={TEXT_BY_FLAG[vars.saludFlag ?? "MENOR"]}
      minDurationMs={meta.minDurationMs!}
      tapAdvanceAfterMs={meta.tapAdvanceAfterMs}
      onAdvance={() => onChoice("ADVANCE")}
    />
  );
}
