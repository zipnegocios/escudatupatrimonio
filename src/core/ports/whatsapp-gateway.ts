export type WhatsAppSessionStatus = "DISCONNECTED" | "PAIRING_QR" | "CONNECTED" | "LOGGED_OUT";

export interface IncomingWhatsAppMessage {
  remoteJid: string;
  displayName: string | null;
  waMessageId: string;
  contentText: string | null;
  messageType: string;
}

export type WhatsAppMessageHandler = (message: IncomingWhatsAppMessage) => Promise<void>;
export type WhatsAppStatusHandler = (status: WhatsAppSessionStatus, phoneNumber: string | null) => Promise<void>;

export interface WhatsAppGateway {
  start(): Promise<void>;
  getQr(): string | null;
  getStatus(): WhatsAppSessionStatus;
  sendMessage(jid: string, text: string): Promise<{ waMessageId: string }>;
  logout(): Promise<void>;
  onMessage(handler: WhatsAppMessageHandler): void;
  onStatusChange(handler: WhatsAppStatusHandler): void;
}
