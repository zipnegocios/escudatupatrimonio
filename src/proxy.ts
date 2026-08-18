import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/infrastructure/auth/session-cookie";

/**
 * Chequeo OPTIMISTA: solo mira si la cookie de sesión está presente, sin
 * verificar el JWT ni tocar la DB. La doc de Next es explícita en que el
 * proxy no debe ser el único portón de auth — el portón real es
 * `currentUser()` en el layout de /admin. Acá solo evitamos el parpadeo de
 * cargar el shell del admin para alguien que ni siquiera tiene sesión.
 *
 * Por eso este archivo importa `session-cookie.ts`, que no tiene imports
 * propios: meter el container acá arrastraría pg y argon2 al proxy.
 */
export function proxy(request: NextRequest): NextResponse {
  // Sin esta salida temprana el propio /admin/login redirigiría a sí mismo.
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (!request.cookies.has(SESSION_COOKIE_NAME)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
