import type { EmailLogRepository } from "@/core/ports/email-log-repository";
import type { EmailSender } from "@/core/ports/email-sender";

export interface SendLeadNotificationEmailDeps {
  emailSender: EmailSender;
  emailLogRepository: EmailLogRepository;
}

export interface LeadNotificationInput {
  fromAddress: string;
  toAddress: string;
  nombre: string | null;
  telefono: string | null;
  canal: string | null;
  priority: string | null;
}

// Fire-and-forget desde la ruta que guarda el lead: si Resend falla, se dejó
// el intento registrado (status FAILED) pero nunca se propaga el error — un
// problema de email jamás debe hacer fallar la creación del lead.
export async function sendLeadNotificationEmail(
  deps: SendLeadNotificationEmailDeps,
  input: LeadNotificationInput,
): Promise<void> {
  const subject = `Nuevo lead: ${input.nombre ?? "(sin nombre)"}`;
  const text = [
    `Nombre: ${input.nombre ?? "-"}`,
    `Teléfono: ${input.telefono ?? "-"}`,
    `Canal: ${input.canal ?? "-"}`,
    `Prioridad: ${input.priority ?? "-"}`,
  ].join("\n");
  const html = `<p><b>Nombre:</b> ${input.nombre ?? "-"}</p><p><b>Teléfono:</b> ${input.telefono ?? "-"}</p><p><b>Canal:</b> ${input.canal ?? "-"}</p><p><b>Prioridad:</b> ${input.priority ?? "-"}</p>`;

  try {
    const { providerId } = await deps.emailSender.send({
      to: input.toAddress,
      subject,
      html,
      text,
    });
    await deps.emailLogRepository.record({
      direction: "OUTBOUND",
      resendEmailId: providerId,
      fromAddress: input.fromAddress,
      toAddress: input.toAddress,
      subject,
      status: "SENT",
      bodyText: text,
      bodyHtml: html,
    });
  } catch {
    await deps.emailLogRepository.record({
      direction: "OUTBOUND",
      resendEmailId: null,
      fromAddress: input.fromAddress,
      toAddress: input.toAddress,
      subject,
      status: "FAILED",
      bodyText: text,
      bodyHtml: html,
    });
  }
}
