import { Webhook } from "svix";
import type { WebhookSignatureVerifier } from "@/core/ports/webhook-signature-verifier";

export class SvixSignatureVerifier implements WebhookSignatureVerifier {
  private readonly secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  verify(rawBody: string, headers: Record<string, string>): unknown | null {
    try {
      return new Webhook(this.secret).verify(rawBody, headers);
    } catch {
      return null;
    }
  }
}
