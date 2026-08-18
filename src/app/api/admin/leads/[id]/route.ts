import { currentUser } from "@/infrastructure/auth/current-user";
import { leadRepository } from "@/infrastructure/container";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;
  const result = await leadRepository.findById(id);
  if (!result) {
    return Response.json({ ok: false, reason: "NOT_FOUND" }, { status: 404 });
  }

  return Response.json({ ok: true, lead: result.lead, profile: result.profile });
}
