import { currentUser } from "@/infrastructure/auth/current-user";
import { leadRepository } from "@/infrastructure/container";

export async function GET(): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  const leads = await leadRepository.list();
  return Response.json({ ok: true, leads });
}
