import { z } from "zod";
import { currentUser } from "@/infrastructure/auth/current-user";
import { whatsAppRepository } from "@/infrastructure/container";
import { sendViaWorker } from "@/infrastructure/whatsapp/worker-client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;
  const messages = await whatsAppRepository.listMessages(id);
  await whatsAppRepository.markRead(id);
  return Response.json({ ok: true, messages });
}

const sendMessageSchema = z.object({
  remoteJid: z.string().min(1),
  text: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  try {
    await sendViaWorker(id, parsed.data.remoteJid, parsed.data.text);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { ok: false, reason: "WORKER_UNAVAILABLE", message: (error as Error).message },
      { status: 503 },
    );
  }
}
