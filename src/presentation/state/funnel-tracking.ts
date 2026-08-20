import type { ScreenId } from "@/core/entities/screen-id";

export interface TrackScreenReachedInput {
  sessionId: string;
  screenId: ScreenId;
  utmCampaign: string | null;
}

// No lanza y no espera nada de la respuesta: un evento de tracking perdido
// nunca debe afectar la experiencia del wizard, a diferencia de submitLead()
// (que sí necesita saber si el lead se guardó).
export function trackScreenReached(input: TrackScreenReachedInput): void {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).catch(() => undefined);
}
