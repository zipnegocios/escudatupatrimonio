import { z } from "zod";
import { currentUser } from "@/infrastructure/auth/current-user";
import { whatsAppRepository } from "@/infrastructure/container";

const patchSchema = z.object({
  kind: z.enum(["LEAD", "DIRECT_CLIENT", "IGNORED", "UNCLASSIFIED"]),
  leadId: z.string().nullable().optional(),
});

export async function PATCH(
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

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const conversation = await whatsAppRepository.updateConversationClassification(
    id,
    parsed.data.kind,
    parsed.data.leadId ?? null,
  );

  if (!conversation) {
    return Response.json({ ok: false, reason: "NOT_FOUND" }, { status: 404 });
  }

  return Response.json({ ok: true, conversation });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;
  await whatsAppRepository.deleteConversation(id);
  return Response.json({ ok: true });
}
