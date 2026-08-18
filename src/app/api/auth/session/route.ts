import { cookies } from "next/headers";
import { verifySession } from "@/core/use-cases/auth/verify-session";
import { SESSION_COOKIE_NAME } from "@/infrastructure/auth/session-cookie";
import {
  sessionRepository,
  sessionTokenService,
  userRepository,
} from "@/infrastructure/container";

/**
 * Responde "¿quién soy?", no es un portón de auth: siempre 200, con
 * `user: null` cuando no hay sesión. El portón real vive en el layout de
 * /admin vía `currentUser()`.
 */
export async function GET(): Promise<Response> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (token === undefined) {
    return Response.json({ user: null });
  }

  const verified = await verifySession(
    { sessionRepository, sessionTokenService, userRepository },
    token,
  );

  if (verified === null) {
    return Response.json({ user: null });
  }

  return Response.json({
    user: {
      id: verified.user.id,
      username: verified.user.username,
      email: verified.user.email,
      role: verified.user.role,
      displayName: verified.user.displayName,
    },
  });
}
