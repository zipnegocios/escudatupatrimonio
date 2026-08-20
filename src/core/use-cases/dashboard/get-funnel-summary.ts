import { DISQUALIFICATION_SCREENS, STAGE_GROUPS } from "@/core/use-cases/dashboard/funnel-stages";
import type { FunnelEventRepository, FunnelScreenCount } from "@/core/ports/funnel-event-repository";

export interface GetFunnelSummaryDeps {
  funnelEventRepository: FunnelEventRepository;
}

export interface FunnelStageSummary {
  key: string;
  label: string;
  sessionCount: number;
}

export interface FunnelDisqualificationSummary {
  screenId: string;
  label: string;
  sessionCount: number;
}

export interface FunnelSummary {
  sessionsStarted: number;
  completedSessions: number;
  byStage: FunnelStageSummary[];
  byScreen: FunnelScreenCount[];
  disqualified: FunnelDisqualificationSummary[];
  // sesiones que ni completaron ni cayeron en una pantalla de descalificación
  // conocida — abandono silencioso a medio camino.
  silentDropoff: number;
}

export async function getFunnelSummary(deps: GetFunnelSummaryDeps): Promise<FunnelSummary> {
  const byScreen = await deps.funnelEventRepository.countByScreen();
  const countFor = (screenId: string): number =>
    byScreen.find((row) => row.screenId === screenId)?.sessionCount ?? 0;

  const sessionsStarted = countFor("LANDING");
  const completedSessions = countFor("E5_FINAL");

  // Dentro de una etapa, algunas pantallas son ramas mutuamente excluyentes
  // (ej. Q_A1 solo para la ruta de ahorro) — el máximo entre las pantallas de
  // la etapa representa "sesiones que alcanzaron al menos una pantalla de
  // esta etapa", que es monótonamente no-creciente a lo largo del embudo.
  const byStage: FunnelStageSummary[] = STAGE_GROUPS.map((stage) => ({
    key: stage.key,
    label: stage.label,
    sessionCount: Math.max(0, ...stage.screens.map((screenId) => countFor(screenId))),
  }));

  const disqualified: FunnelDisqualificationSummary[] = Object.entries(DISQUALIFICATION_SCREENS).map(
    ([screenId, label]) => ({ screenId, label, sessionCount: countFor(screenId) }),
  );

  const disqualifiedTotal = disqualified.reduce((sum, row) => sum + row.sessionCount, 0);
  const silentDropoff = Math.max(0, sessionsStarted - completedSessions - disqualifiedTotal);

  return { sessionsStarted, completedSessions, byStage, byScreen, disqualified, silentDropoff };
}
