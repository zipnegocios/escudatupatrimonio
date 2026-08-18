import type { EmailLogRepository } from "@/core/ports/email-log-repository";
import type { EmailReceivingClient } from "@/core/ports/email-receiving-client";

export interface HandleResendWebhookEventDeps {
  emailLogRepository: EmailLogRepository;
  emailReceivingClient: EmailReceivingClient;
}

export interface ResendWebhookEvent {
  type: string;
  data: Record<string, unknown>;
}

// Estado que le corresponde a cada evento de entrega — un correo saliente
// puede pasar por varios de estos a lo largo de su vida.
const DELIVERY_STATUS_BY_EVENT: Record<string, string> = {
  "email.sent": "SENT",
  "email.delivered": "DELIVERED",
  "email.opened": "OPENED",
  "email.clicked": "CLICKED",
  "email.bounced": "BOUNCED",
  "email.complained": "COMPLAINED",
  "email.failed": "FAILED",
};

export async function handleResendWebhookEvent(
  deps: HandleResendWebhookEventDeps,
  event: ResendWebhookEvent,
): Promise<void> {
  if (event.type === "email.received") {
    const emailId = event.data.email_id;
    if (typeof emailId !== "string") return;

    // El webhook solo trae metadata — el cuerpo se busca aparte.
    const content = await deps.emailReceivingClient.fetchReceivedEmail(emailId);
    const row = await deps.emailLogRepository.record({
      direction: "INBOUND",
      resendEmailId: emailId,
      fromAddress: content.from,
      toAddress: content.to.join(", "),
      subject: content.subject,
      status: "RECEIVED",
      bodyText: content.text,
      bodyHtml: content.html,
    });
    await deps.emailLogRepository.appendEvent(row.id, event.type, event.data);
    return;
  }

  const status = DELIVERY_STATUS_BY_EVENT[event.type];
  const emailId = event.data.email_id;
  if (!status || typeof emailId !== "string") return;

  const row = await deps.emailLogRepository.updateStatusByProviderId(emailId, status);
  if (row) {
    await deps.emailLogRepository.appendEvent(row.id, event.type, event.data);
  }
}
