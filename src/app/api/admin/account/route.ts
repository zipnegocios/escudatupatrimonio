import { z } from "zod";
import { updateAccountProfile } from "@/core/use-cases/auth/update-account-profile";
import { currentUser } from "@/infrastructure/auth/current-user";
import { userRepository } from "@/infrastructure/container";

export async function GET(): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  // Nunca se devuelve passwordHash.
  return Response.json({
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
  });
}

const updateProfileSchema = z.object({
  username: z.string().trim().min(3, "mínimo 3 caracteres"),
  email: z.string().trim().email("email inválido"),
  displayName: z.string().trim().nullable(),
});

export async function PATCH(request: Request): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return Response.json({ ok: false, reason: "UNAUTHENTICATED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const result = await updateAccountProfile({ userRepository }, user.id, {
    username: parsed.data.username,
    email: parsed.data.email,
    displayName: parsed.data.displayName?.trim() || null,
  });

  if (!result.ok) {
    return Response.json({ ok: false, reason: result.reason }, { status: 409 });
  }

  return Response.json({
    ok: true,
    user: {
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
      displayName: result.user.displayName,
      role: result.user.role,
    },
  });
}
