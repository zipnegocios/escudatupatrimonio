import { z } from "zod";
import { SCREEN_REGISTRY } from "@/core/use-cases/screen-registry";
import { funnelEventRepository } from "@/infrastructure/container";
import { isRateLimited } from "@/infrastructure/tracking/simple-rate-limiter";

// DISP_CHECK es una decisión de ruteo invisible (nunca se renderiza, ver
// screen-id.ts) — no debería llegar nunca, pero si llega no es un id válido
// de pantalla alcanzada.
const VALID_SCREEN_IDS = new Set(Object.keys(SCREEN_REGISTRY).filter((id) => id !== "DISP_CHECK"));

const trackSchema = z.object({
  sessionId: z.string().min(1).max(100),
  screenId: z.string().refine((id) => VALID_SCREEN_IDS.has(id)),
  utmCampaign: z.string().nullable(),
});

// Público (sin currentUser()) — lo llama el navegador del prospecto en cada
// pantalla del wizard. El cliente nunca espera ni revisa esta respuesta (ver
// funnel-tracking.ts): estos códigos son solo para observabilidad en logs.
export async function POST(request: Request): Promise<Response> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return Response.json({ ok: false, reason: "RATE_LIMITED" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  await funnelEventRepository.recordScreenReached(parsed.data);
  return Response.json({ ok: true }, { status: 202 });
}
