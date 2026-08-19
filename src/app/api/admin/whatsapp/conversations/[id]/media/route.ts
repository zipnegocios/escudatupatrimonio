import { randomUUID } from "node:crypto";
import type { WhatsAppMediaType } from "@/core/ports/whatsapp-gateway";
import { currentUser } from "@/infrastructure/auth/current-user";
import { mediaStorage } from "@/infrastructure/container";
import { transcodeToOggOpus } from "@/infrastructure/media/transcode-to-opus-ogg";
import { sendMediaViaWorker } from "@/infrastructure/whatsapp/worker-client";

const MAX_BYTES = 25 * 1024 * 1024; // 25MB — límite razonable para R2 + WhatsApp

function inferMediaType(mimeType: string, asVoiceNote: boolean): WhatsAppMediaType | null {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType.startsWith("audio/")) return asVoiceNote ? "VOICE_NOTE" : "AUDIO";
  return "DOCUMENT";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const file = formData.get("file");
  const remoteJid = formData.get("remoteJid");
  const caption = formData.get("caption");
  const asVoiceNote = formData.get("asVoiceNote") === "true";

  if (!(file instanceof File) || typeof remoteJid !== "string" || remoteJid.length === 0) {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return Response.json({ ok: false, reason: "FILE_TOO_LARGE" }, { status: 413 });
  }

  const mediaType = inferMediaType(file.type, asVoiceNote);
  if (!mediaType) {
    return Response.json({ ok: false, reason: "UNSUPPORTED_TYPE" }, { status: 400 });
  }

  let buffer: Buffer = Buffer.from(await file.arrayBuffer());
  let mediaMimeType = file.type;
  const mediaKey = `whatsapp/${id}/${randomUUID()}`;

  // Una nota de voz TIENE que ser OGG/Opus real o WhatsApp la muestra como
  // "audio no disponible" del lado del receptor, sin importar qué mimetype
  // declaremos — ver el comentario en transcodeToOggOpus.
  if (mediaType === "VOICE_NOTE") {
    try {
      buffer = await transcodeToOggOpus(buffer);
      mediaMimeType = "audio/ogg; codecs=opus";
    } catch (error) {
      return Response.json(
        { ok: false, reason: "TRANSCODE_FAILED", message: (error as Error).message },
        { status: 502 },
      );
    }
  }

  try {
    await mediaStorage.upload(mediaKey, buffer, mediaMimeType);
    const mediaUrl = await mediaStorage.getSignedDownloadUrl(mediaKey, 600);

    await sendMediaViaWorker({
      conversationId: id,
      remoteJid,
      mediaUrl,
      mediaKey,
      mediaMimeType,
      mediaType,
      caption: typeof caption === "string" && caption.length > 0 ? caption : null,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { ok: false, reason: "SEND_FAILED", message: (error as Error).message },
      { status: 502 },
    );
  }
}
