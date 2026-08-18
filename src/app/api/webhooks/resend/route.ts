import { handleResendWebhookEvent, type ResendWebhookEvent } from "@/core/use-cases/email/handle-resend-webhook-event";
import { env } from "@/infrastructure/config/env";
import { emailLogRepository, emailReceivingClient } from "@/infrastructure/container";
import { SvixSignatureVerifier } from "@/infrastructure/email/svix-signature-verifier";

// Resend firma sus webhooks al estilo Svix (svix-id/svix-timestamp/
// svix-signature) — la firma se calcula sobre el cuerpo crudo, por eso se
// lee como texto en vez de con request.json().
export async function POST(request: Request): Promise<Response> {
  if (!env.RESEND_WEBHOOK_SECRET) {
    return Response.json({ ok: false, reason: "WEBHOOK_NOT_CONFIGURED" }, { status: 503 });
  }

  const rawBody = await request.text();
  const headers = {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  };

  const verifier = new SvixSignatureVerifier(env.RESEND_WEBHOOK_SECRET);
  const payload = verifier.verify(rawBody, headers);

  if (payload === null || typeof payload !== "object") {
    return Response.json({ ok: false, reason: "INVALID_SIGNATURE" }, { status: 401 });
  }

  const event = payload as ResendWebhookEvent;
  await handleResendWebhookEvent({ emailLogRepository, emailReceivingClient }, event);

  return Response.json({ ok: true });
}
