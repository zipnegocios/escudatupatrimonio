export const SESSION_COOKIE_NAME = "session";

// 180 días — el usuario pidió no tener que loguearse seguido en ningún
// dispositivo. Sigue siendo revocable (logout, cambio de contraseña) porque
// la verificación real chequea la fila en `sessions`, no solo la firma del
// JWT — un valor largo acá no vuelve la sesión imposible de cortar.
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 180;
