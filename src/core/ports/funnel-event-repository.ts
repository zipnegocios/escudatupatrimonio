import type { FunnelEventRow } from "@/infrastructure/database/schema";

export type { FunnelEventRow };

export interface RecordScreenReachedInput {
  sessionId: string;
  screenId: string;
  utmCampaign: string | null;
}

export interface FunnelScreenCount {
  screenId: string;
  sessionCount: number;
}

export interface FunnelEventRepository {
  recordScreenReached(input: RecordScreenReachedInput): Promise<void>;
  // Sin `range`, cuenta todo el histórico — dataset chico al día de hoy, no
  // hace falta filtrar por defecto. Agrega en SQL (GROUP BY), nunca trae
  // todas las filas a Node: es una tabla de escritura pública sin auth.
  countByScreen(range?: { from: Date; to: Date }): Promise<FunnelScreenCount[]>;
}
