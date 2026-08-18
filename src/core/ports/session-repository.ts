import type { NewSession, Session } from "@/infrastructure/database/schema";

export type NewSessionRecord = NewSession;
export type { Session };

export interface SessionRepository {
  create(session: NewSessionRecord): Promise<void>;
  findById(id: string): Promise<Session | null>;
  revoke(id: string): Promise<void>;
  // Cambiar la contraseña invalida todas las demás sesiones activas del
  // usuario — si alguien más (o un atacante con la sesión vieja) la tenía
  // abierta, queda afuera. `exceptSessionId` deja viva la sesión actual del
  // que hizo el cambio, para no desloguearlo a sí mismo.
  revokeAllForUser(userId: string, exceptSessionId?: string): Promise<void>;
}
