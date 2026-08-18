import type { NewSession, Session } from "@/infrastructure/database/schema";

export type NewSessionRecord = NewSession;
export type { Session };

export interface SessionRepository {
  create(session: NewSessionRecord): Promise<void>;
  findById(id: string): Promise<Session | null>;
  revoke(id: string): Promise<void>;
}
