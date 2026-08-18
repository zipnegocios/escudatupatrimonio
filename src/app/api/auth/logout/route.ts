import { cookies } from "next/headers";
import { revokeSession } from "@/core/use-cases/auth/revoke-session";
import { verifySession } from "@/core/use-cases/auth/verify-session";
import { SESSION_COOKIE_NAME } from "@/infrastructure/auth/session-cookie";
import {
  sessionRepository,
  sessionTokenService,
  userRepository,
} from "@/infrastructure/container";

export async function POST(): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token !== undefined) {
    // Se verifica en vez de solo decodificar: el `jti` a revocar tiene que
    // venir de un token con firma válida, no de un claim que cualquiera
    // podría inventar para revocar la sesión de otro.
    const verified = await verifySession(
      { sessionRepository, sessionTokenService, userRepository },
      token,
    );

    if (verified !== null) {
      await revokeSession({ sessionRepository }, verified.jti);
    }
  }

  // La cookie se borra pase lo que pase: si el token ya era inválido igual
  // queremos que el navegador deje de mandarlo.
  cookieStore.delete(SESSION_COOKIE_NAME);

  return Response.json({ ok: true });
}
