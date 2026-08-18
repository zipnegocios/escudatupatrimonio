import type { EmailLogRow } from "@/infrastructure/database/schema";

export type { EmailLogRow };

export interface RecordEmailInput {
  direction: "OUTBOUND" | "INBOUND";
  resendEmailId: string | null;
  fromAddress: string;
  toAddress: string;
  subject: string | null;
  status: string;
  bodyText: string | null;
  bodyHtml: string | null;
}

export interface EmailLogRepository {
  record(input: RecordEmailInput): Promise<EmailLogRow>;
  appendEvent(emailLogId: string, eventType: string, payload: unknown): Promise<void>;
  updateStatusByProviderId(resendEmailId: string, status: string): Promise<EmailLogRow | null>;
  findByProviderId(resendEmailId: string): Promise<EmailLogRow | null>;
  list(): Promise<EmailLogRow[]>;
}
