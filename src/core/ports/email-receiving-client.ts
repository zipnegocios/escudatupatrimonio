export interface ReceivedEmailContent {
  from: string;
  to: string[];
  subject: string;
  html: string | null;
  text: string | null;
}

export interface EmailReceivingClient {
  fetchReceivedEmail(emailId: string): Promise<ReceivedEmailContent>;
}
