import { z } from "zod";
import { changePassword } from "@/core/use-cases/auth/change-password";
import { currentSession } from "@/infrastructure/auth/current-user";
import { passwordHasher, sessionRepository, userRepository } from "@/infrastructure/container";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "mínimo 8 caracteres"),
});

export async function POST(request: Request): Promise<Response> {
  const session = await currentSession();
  if (!session) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const result = await changePassword(
    { userRepository, passwordHasher, sessionRepository },
    {
      userId: session.user.id,
      currentSessionId: session.jti,
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    },
  );

  if (!result.ok) {
    const status = result.reason === "INVALID_CURRENT_PASSWORD" ? 401 : 404;
    return Response.json({ ok: false, reason: result.reason }, { status });
  }

  return Response.json({ ok: true });
}
