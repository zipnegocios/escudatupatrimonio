export type WhatsAppSessionStatus = "DISCONNECTED" | "PAIRING_QR" | "CONNECTED" | "LOGGED_OUT";

export type WhatsAppMediaType = "IMAGE" | "AUDIO" | "VOICE_NOTE" | "VIDEO" | "DOCUMENT";

export interface IncomingWhatsAppMedia {
  buffer: Buffer;
  mimeType: string;
  type: WhatsAppMediaType;
}

export interface IncomingWhatsAppMessage {
  remoteJid: string;
  // Número real del contacto, sin el sufijo del JID. Con @lid, remoteJid
  // es un identificador opaco — este es el único campo con el teléfono
  // real, cuando WhatsApp lo expone (ver BaileysGateway.resolvePhoneNumber).
  phoneNumber: string | null;
  displayName: string | null;
  waMessageId: string;
  contentText: string | null;
  messageType: string;
  media: IncomingWhatsAppMedia | null;
  // true cuando el mensaje lo mandó la cuenta vinculada — no solo desde
  // este panel (sendMessage/sendMedia), también cuando el admin le
  // responde a alguien directo desde WhatsApp en su teléfono. Baileys
  // reporta ambos casos por el mismo evento.
  fromMe: boolean;
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
    mimeType: string,
    caption: string | null,
  ): Promise<{ waMessageId: string }>;
  logout(): Promise<void>;
  onMessage(handler: WhatsAppMessageHandler): void;
  onStatusChange(handler: WhatsAppStatusHandler): void;
  // URL directa del CDN de WhatsApp — undefined si el contacto no tiene
  // foto o la tiene restringida por privacidad. No hace falta bajarla ni
  // guardarla nosotros, solo cachear la URL.
  getProfilePictureUrl(jid: string): Promise<string | null>;
  // Resolución bajo demanda (botón "Resolver número" del panel) — para un
  // jid @lid solo puede consultar el mapeo LID↔teléfono que Baileys ya
  // tenga cacheado localmente, sin esperar un mensaje nuevo del contacto.
  resolvePhoneNumberForJid(jid: string): Promise<string | null>;
}
