import { currentUser } from "@/infrastructure/auth/current-user";
import { whatsAppRepository } from "@/infrastructure/container";

export async function GET(): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  const session = await whatsAppRepository.getOrCreateSession("principal");
  const conversations = await whatsAppRepository.listConversations(session.id);
  return Response.json({ ok: true, conversations });
}
