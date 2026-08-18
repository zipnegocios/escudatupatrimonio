import { Resend } from "resend";
import type {
  EmailReceivingClient,
  ReceivedEmailContent,
} from "@/core/ports/email-receiving-client";
import { env } from "@/infrastructure/config/env";

export class ResendReceivingClient implements EmailReceivingClient {
  // El webhook de email.received solo trae metadata — el cuerpo se busca
  // aparte con la Receiving API de Resend. Igual que ResendEmailSender, el
  // chequeo de configuración se hace acá adentro, no en el constructor.
  async fetchReceivedEmail(emailId: string): Promise<ReceivedEmailContent> {
    if (!env.RESEND_API_KEY) {
      throw new Error("Resend no está configurado (RESEND_API_KEY).");
    }
    const client = new Resend(env.RESEND_API_KEY);

    const { data, error } = await client.emails.receiving.get(emailId);

    if (error || !data) {
      throw new Error(`Resend rechazó la lectura del correo: ${error?.message ?? "sin detalle"}`);
    }

    return {
      from: data.from,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    };
  }
}
