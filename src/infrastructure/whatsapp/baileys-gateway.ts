import { randomUUID } from "node:crypto";
import { Boom } from "@hapi/boom";
import makeWASocket, {
  DisconnectReason,
  downloadMediaMessage,
  fetchLatestBaileysVersion,
  type WAMessage,
  type WASocket,
} from "@whiskeysockets/baileys";
import pino from "pino";
import type {
  IncomingWhatsAppMedia,
  WhatsAppGateway,
  WhatsAppMediaType,
  WhatsAppMessageHandler,
  WhatsAppSessionStatus,
  WhatsAppStatusHandler,
} from "@/core/ports/whatsapp-gateway";
import { clearAuthState, loadPostgresAuthState } from "@/infrastructure/whatsapp/postgres-auth-state";

const logger = pino({ level: "silent" });

// Extrae el texto plano de un WAMessage: WhatsApp usa `conversation` para
// texto simple y `extendedTextMessage.text` cuando el mensaje cita algo o
// tiene formato — no hay un único campo, hay que probar ambos.
function extractText(message: unknown): string | null {
  const content = message as {
    conversation?: string;
    extendedTextMessage?: { text?: string };
  } | null;
  return content?.conversation ?? content?.extendedTextMessage?.text ?? null;
}

interface MediaContent {
  imageMessage?: { mimetype?: string | null } | null;
  audioMessage?: { mimetype?: string | null; ptt?: boolean | null } | null;
  videoMessage?: { mimetype?: string | null } | null;
  documentMessage?: { mimetype?: string | null } | null;
}

function detectMedia(message: unknown): { type: WhatsAppMediaType; mimeType: string } | null {
  const content = message as MediaContent | null;
  if (!content) return null;
  if (content.imageMessage) {
    return { type: "IMAGE", mimeType: content.imageMessage.mimetype ?? "image/jpeg" };
  }
  if (content.audioMessage) {
    return {
      type: content.audioMessage.ptt ? "VOICE_NOTE" : "AUDIO",
      mimeType: content.audioMessage.mimetype ?? "audio/ogg",
    };
  }
  if (content.videoMessage) {
    return { type: "VIDEO", mimeType: content.videoMessage.mimetype ?? "video/mp4" };
  }
  if (content.documentMessage) {
    return {
      type: "DOCUMENT",
      mimeType: content.documentMessage.mimetype ?? "application/octet-stream",
    };
  }
  return null;
}

export class BaileysGateway implements WhatsAppGateway {
  private readonly sessionId: string;
  private socket: WASocket | null = null;
  private currentQr: string | null = null;
  private status: WhatsAppSessionStatus = "DISCONNECTED";
  private messageHandler: WhatsAppMessageHandler | null = null;
  private statusHandler: WhatsAppStatusHandler | null = null;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  onMessage(handler: WhatsAppMessageHandler): void {
    this.messageHandler = handler;
  }

  onStatusChange(handler: WhatsAppStatusHandler): void {
    this.statusHandler = handler;
  }

  getQr(): string | null {
    return this.currentQr;
  }

  getStatus(): WhatsAppSessionStatus {
    return this.status;
  }

  async start(): Promise<void> {
    const { state, saveCreds } = await loadPostgresAuthState(this.sessionId);
    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
      auth: state,
      version,
      logger,
      printQRInTerminal: false,
    });
    this.socket = socket;

    socket.ev.on("creds.update", saveCreds);

    socket.ev.on("connection.update", async (update) => {
      if (update.qr) {
        this.currentQr = update.qr;
        await this.setStatus("PAIRING_QR");
      }

      if (update.connection === "open") {
        this.currentQr = null;
        const phoneNumber = socket.user?.id?.split(":")[0] ?? null;
        await this.setStatus("CONNECTED", phoneNumber);
      }

      if (update.connection === "close") {
        const statusCode = (update.lastDisconnect?.error as Boom | undefined)?.output
          ?.statusCode;
        const loggedOut = statusCode === DisconnectReason.loggedOut;

        if (loggedOut) {
          await this.setStatus("LOGGED_OUT");
          return;
        }

        // Cualquier otro cierre (caída de red, reinicio del lado de
        // WhatsApp) se reintenta — no es un logout real.
        await this.setStatus("DISCONNECTED");
        setTimeout(() => {
          this.start().catch(() => undefined);
        }, 3000);
      }
    });

    socket.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify" || !this.messageHandler) return;

      for (const message of messages) {
        // Los mensajes propios (fromMe) también llegan por este evento —
        // ya se registran al enviarlos desde sendMessage(), no de nuevo acá.
        if (message.key.fromMe || !message.key.remoteJid) continue;

        const text = extractText(message.message);
        const media = await this.downloadIncomingMedia(message);

        await this.messageHandler({
          remoteJid: message.key.remoteJid,
          displayName: message.pushName ?? null,
          waMessageId: message.key.id ?? randomUUID(),
          contentText: text,
          messageType: media?.type ?? (text ? "TEXT" : "OTHER"),
          media,
        });
      }
    });
  }

  // Devuelve null tanto si el mensaje no es de medios como si la descarga
  // falla (p.ej. el media ya expiró del lado de WhatsApp) — un mensaje que
  // no se puede bajar igual se registra, solo que sin adjunto.
  private async downloadIncomingMedia(message: WAMessage): Promise<IncomingWhatsAppMedia | null> {
    const detected = detectMedia(message.message);
    if (!detected || !this.socket) return null;

    try {
      const buffer = await downloadMediaMessage(
        message,
        "buffer",
        {},
        { logger, reuploadRequest: this.socket.updateMediaMessage },
      );
      return { buffer, mimeType: detected.mimeType, type: detected.type };
    } catch {
      return null;
    }
  }

  async sendMessage(jid: string, text: string): Promise<{ waMessageId: string }> {
    if (!this.socket) throw new Error("WhatsApp gateway no está iniciado");
    const result = await this.socket.sendMessage(jid, { text });
    return { waMessageId: result?.key.id ?? randomUUID() };
  }

  // `url` es una URL firmada de R2 con vida corta — el propio socket la
  // descarga, no hace falta bajar el archivo en este proceso.
  async sendMedia(
    jid: string,
    url: string,
    type: WhatsAppMediaType,
    mimeType: string,
    caption: string | null,
  ): Promise<{ waMessageId: string }> {
    if (!this.socket) throw new Error("WhatsApp gateway no está iniciado");

    const content =
      type === "IMAGE"
        ? { image: { url }, caption: caption ?? undefined }
        : type === "VIDEO"
          ? { video: { url }, caption: caption ?? undefined }
          : type === "VOICE_NOTE"
            ? { audio: { url }, ptt: true, mimetype: mimeType }
            : type === "AUDIO"
              ? { audio: { url }, mimetype: mimeType }
              : { document: { url }, mimetype: mimeType, fileName: "archivo" };

    const result = await this.socket.sendMessage(jid, content);
    return { waMessageId: result?.key.id ?? randomUUID() };
  }

  // undefined tanto si no hay socket como si WhatsApp no la expone (sin
  // foto, o el contacto restringe quién puede verla) — en ambos casos el
  // llamador cae al avatar de iniciales.
  async getProfilePictureUrl(jid: string): Promise<string | null> {
    if (!this.socket) return null;
    try {
      const url = await this.socket.profilePictureUrl(jid, "image");
      return url ?? null;
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    // socket.logout() puede lanzar si el socket ya está caído (p.ej. tras un
    // fallo de red) — igual hay que limpiar el estado guardado para poder
    // re-vincular, así que el error no debe cortar el flujo acá.
    try {
      await this.socket?.logout();
    } catch {
      // ignorado a propósito — ver comentario arriba
    }
    await clearAuthState(this.sessionId);
    this.socket = null;
    this.currentQr = null;
  }

  private async setStatus(status: WhatsAppSessionStatus, phoneNumber?: string | null): Promise<void> {
    this.status = status;
    if (this.statusHandler) {
      await this.statusHandler(status, phoneNumber ?? null);
    }
  }
}
