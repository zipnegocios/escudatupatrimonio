"use client";

import { StimScreen } from "@/presentation/screens/stimulation/StimScreen";
import { locationPulseScene } from "@/presentation/webgl/scenes/locationPulse";
import { getStateByCode } from "@/core/entities/us-states";
import { SCREEN_REGISTRY } from "@/core/use-cases/screen-registry";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § S4 — Verificando agentes
export function S4({ vars, onChoice }: ScreenComponentProps) {
  const meta = SCREEN_REGISTRY.S4;
  const stateName = vars.estado ? getStateByCode(vars.estado)?.name ?? vars.estado : "tu estado";
  return (
    <StimScreen
      actionText={`Verificando agentes certificados disponibles en ${stateName}...`}
      fact="Cada agente certificado tiene licencia activa registrada en el NIPR — el Registro Nacional de Productores de Seguros de los EE.UU."
      minDurationMs={meta.minDurationMs!}
      tapAdvanceAfterMs={meta.tapAdvanceAfterMs}
      sceneSetup={locationPulseScene}
      onAdvance={() => onChoice("ADVANCE")}
    />
  );
}
