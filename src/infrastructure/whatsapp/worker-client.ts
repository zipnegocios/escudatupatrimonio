import "server-only";
import type { WhatsAppMediaType } from "@/core/ports/whatsapp-gateway";
import { env } from "@/infrastructure/config/env";

interface WorkerStatusResponse {
  status: string;
  qr: string | null;
}

function requireWorkerConfig(): { url: string; secret: string } {
  if (!env.WHATSAPP_WORKER_URL || !env.WHATSAPP_WORKER_SECRET) {
    throw new Error(
      "El worker de WhatsApp no está configurado (WHATSAPP_WORKER_URL / WHATSAPP_WORKER_SECRET).",
    );
  }
  // Tolera una barra final en la variable de entorno (WHATSAPP_WORKER_URL=
  // http://host:4001/) para no depender de que quede escrita sin ella.
  return {
    url: env.WHATSAPP_WORKER_URL.replace(/\/+$/, ""),
    secret: env.WHATSAPP_WORKER_SECRET,
  };
}

export async function fetchWorkerStatus(): Promise<WorkerStatusResponse> {
  const { url, secret } = requireWorkerConfig();
  const response = await fetch(`${url}/internal/status`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`El worker de WhatsApp respondió ${response.status}`);
  return response.json() as Promise<WorkerStatusResponse>;
}

export async function sendViaWorker(
  conversationId: string,
  remoteJid: string,
  text: string,
): Promise<void> {
  const { url, secret } = requireWorkerConfig();
  const response = await fetch(`${url}/internal/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, remoteJid, text }),
  });
  if (!response.ok) throw new Error(`El worker de WhatsApp respondió ${response.status}`);
}

export async function sendMediaViaWorker(input: {
  conversationId: string;
  remoteJid: string;
  mediaUrl: string;
  mediaKey: string;
  mediaMimeType: string;
  mediaType: WhatsAppMediaType;
  caption: string | null;
}): Promise<void> {
  const { url, secret } = requireWorkerConfig();
  const response = await fetch(`${url}/internal/send-media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(`El worker de WhatsApp respondió ${response.status}`);
}

export async function relinkViaWorker(): Promise<void> {
  const { url, secret } = requireWorkerConfig();
  const response = await fetch(`${url}/internal/relink`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!response.ok) throw new Error(`El worker de WhatsApp respondió ${response.status}`);
}
