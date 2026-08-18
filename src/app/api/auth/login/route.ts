import { cookies } from "next/headers";
import { z } from "zod";
import { authenticateUser } from "@/core/use-cases/auth/authenticate-user";
import { createSession } from "@/core/use-cases/auth/create-session";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from "@/infrastructure/auth/session-cookie";
import { env } from "@/infrastructure/config/env";
import {
  passwordHasher,
  sessionRepository,
  sessionTokenService,
  userRepository,
} from "@/infrastructure/container";

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, reason: "INVALID_BODY" }, { status: 400 });
  }

  const result = await authenticateUser(
    { userRepository, passwordHasher },
    { identifier: parsed.data.identifier, password: parsed.data.password },
  );

  if (!result.ok) {
    return Response.json({ ok: false, reason: result.reason }, { status: 401 });
  }

  const { token, expiresAt } = await createSession(
    { sessionRepository, sessionTokenService },
    {
      userId: result.user.id,
      userAgent: request.headers.get("user-agent"),
      ip: request.headers.get("x-forwarded-for"),
      ttlSeconds: SESSION_TTL_SECONDS,
    },
  );

  await userRepository.updateLastLogin(result.user.id, new Date());

  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    // En dev el servidor es http://localhost, donde `secure` haría que el
    // navegador descarte la cookie.
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  // Nunca se devuelve passwordHash.
  return Response.json({
    ok: true,
    user: {
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
      role: result.user.role,
    },
  });
}
