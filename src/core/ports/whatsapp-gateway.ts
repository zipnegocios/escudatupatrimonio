export type WhatsAppSessionStatus = "DISCONNECTED" | "PAIRING_QR" | "CONNECTED" | "LOGGED_OUT";

export type WhatsAppMediaType = "IMAGE" | "AUDIO" | "VOICE_NOTE" | "VIDEO" | "DOCUMENT";

export interface IncomingWhatsAppMedia {
  buffer: Buffer;
  mimeType: string;
  type: WhatsAppMediaType;
}

export interface IncomingWhatsAppMessage {
  remoteJid: string;
  displayName: string | null;
  waMessageId: string;
  contentText: string | null;
  messageType: string;
  media: IncomingWhatsAppMedia | null;
}

export type WhatsAppMessageHandler = (message: IncomingWhatsAppMessage) => Promise<void>;
export type WhatsAppStatusHandler = (status: WhatsAppSessionStatus, phoneNumber: string | null) => Promise<void>;

export interface WhatsAppGateway {
  start(): Promise<void>;
  getQr(): string | null;
  getStatus(): WhatsAppSessionStatus;
  sendMessage(jid: string, text: string): Promise<{ waMessageId: string }>;
  // `url` es una URL firmada de R2 con vida corta — Baileys la descarga él
  // mismo, no hace falta bajar el archivo acá.
  sendMedia(
    jid: string,
    url: string,
    type: WhatsAppMediaType,
    caption: string | null,
  ): Promise<{ waMessageId: string }>;
  logout(): Promise<void>;
  onMessage(handler: WhatsAppMessageHandler): void;
  onStatusChange(handler: WhatsAppStatusHandler): void;
}
