import { Resend } from "resend";
import type { EmailSender, SendEmailInput } from "@/core/ports/email-sender";
import { env } from "@/infrastructure/config/env";

export class ResendEmailSender implements EmailSender {
  // Instanciar este adapter no debe explotar solo porque el módulo de email
  // no está configurado en este deploy — container.ts lo instancia siempre
  // al arrancar. El chequeo se hace recién en send(), que es cuando importa.
  async send(input: SendEmailInput): Promise<{ providerId: string }> {
    if (!env.RESEND_API_KEY || !env.EMAIL_FROM_ADDRESS) {
      throw new Error("Resend no está configurado (RESEND_API_KEY / EMAIL_FROM_ADDRESS).");
    }
    const client = new Resend(env.RESEND_API_KEY);

    const { data, error } = await client.emails.send({
      from: env.EMAIL_FROM_ADDRESS,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (error || !data) {
      throw new Error(`Resend rechazó el envío: ${error?.message ?? "sin detalle"}`);
    }

    return { providerId: data.id };
  }
}
