import { currentUser } from "@/infrastructure/auth/current-user";
import { emailLogRepository } from "@/infrastructure/container";

export async function GET(): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  const emails = await emailLogRepository.list();
  return Response.json({ ok: true, emails });
}
