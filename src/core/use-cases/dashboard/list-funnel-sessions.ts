import { DISQUALIFICATION_SCREENS, stageForScreen } from "@/core/use-cases/dashboard/funnel-stages";
import type { FunnelEventRepository, FunnelEventRow } from "@/core/ports/funnel-event-repository";

export interface ListFunnelSessionsDeps {
  funnelEventRepository: FunnelEventRepository;
}

export interface FunnelSessionScreen {
  screenId: string;
  label: string;
  enteredAt: string;
  // null en la última pantalla de la sesión: no hay evento siguiente que
  // marque cuándo la dejó (sigue ahí, o abandonó sin avanzar más).
  durationMs: number | null;
}

export interface FunnelSessionDetail {
  sessionId: string;
  startedAt: string;
  screens: FunnelSessionScreen[];
  // Desde la primera pantalla hasta la última alcanzada — null si la sesión
  // solo tiene un evento (no hay tiempo transcurrido que medir).
  totalDurationMs: number | null;
  lastScreenId: string;
  completed: boolean;
  disqualified: boolean;
}

function labelForScreen(screenId: string): string {
  return DISQUALIFICATION_SCREENS[screenId] ?? stageForScreen(screenId)?.label ?? screenId;
}

export async function listFunnelSessions(
  deps: ListFunnelSessionsDeps,
  range: { from: Date; to: Date },
): Promise<FunnelSessionDetail[]> {
  const rows = await deps.funnelEventRepository.listSessionsInRange(range);

  const bySession = new Map<string, FunnelEventRow[]>();
  for (const row of rows) {
    const existing = bySession.get(row.sessionId);
    if (existing) {
      existing.push(row);
    } else {
      bySession.set(row.sessionId, [row]);
    }
  }

  const sessions: FunnelSessionDetail[] = [];
  for (const [sessionId, events] of bySession) {
    // Ya vienen ordenados por occurredAt desde el repositorio, pero no cuesta
    // nada blindarse acá por si algún día cambia esa garantía.
    const sorted = [...events].sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());

    const screens: FunnelSessionScreen[] = sorted.map((event, index) => {
      const next = sorted[index + 1];
      return {
        screenId: event.screenId,
        label: labelForScreen(event.screenId),
        enteredAt: event.occurredAt.toISOString(),
        durationMs: next ? next.occurredAt.getTime() - event.occurredAt.getTime() : null,
      };
    });

    const last = sorted[sorted.length - 1];
    sessions.push({
      sessionId,
      startedAt: sorted[0].occurredAt.toISOString(),
      screens,
      totalDurationMs:
        sorted.length >= 2 ? last.occurredAt.getTime() - sorted[0].occurredAt.getTime() : null,
      lastScreenId: last.screenId,
      completed: last.screenId === "E5_FINAL",
      disqualified: last.screenId in DISQUALIFICATION_SCREENS,
    });
  }

  sessions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  return sessions;
}
