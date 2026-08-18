import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { verifySession } from "@/core/use-cases/auth/verify-session";
import { SESSION_COOKIE_NAME } from "@/infrastructure/auth/session-cookie";
import {
  sessionRepository,
  sessionTokenService,
  userRepository,
} from "@/infrastructure/container";
import type { User } from "@/infrastructure/database/schema";

/**
 * DAL de autenticación: la ÚNICA fuente de verdad sobre quién es el usuario
 * de este request. `src/proxy.ts` solo mira si la cookie existe (chequeo
 * optimista, ver la advertencia de la doc de Next); la verificación real
 * contra la DB pasa acá.
 *
 * `cache()` memoiza por render pass: el layout, la página y cualquier server
 * component anidado pueden llamar a currentUser() sin pegarle N veces a
 * Postgres en el mismo request.
 */
export const currentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (token === undefined) {
    return null;
  }

  const verified = await verifySession(
    { sessionRepository, sessionTokenService, userRepository },
    token,
  );

  return verified?.user ?? null;
});
