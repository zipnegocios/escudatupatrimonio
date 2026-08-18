import type { Lead, QualificationProfileRow } from "@/infrastructure/database/schema";
import type { QualificationProfile } from "@/core/entities/qualification-profile";

export type { Lead };

export interface LeadWithProfile {
  lead: Lead;
  profile: QualificationProfileRow | null;
}

export interface SaveLeadInput {
  sessionId: string;
  utmCampaign: string | null;
  profile: QualificationProfile;
  tags: string[];
}

export interface LeadListFilter {
  status?: string;
}

export interface LeadRepository {
  // Upsert por sessionId: reenviar el mismo formulario actualiza la misma
  // fila en vez de duplicarla.
  save(input: SaveLeadInput): Promise<Lead>;
  findById(id: string): Promise<LeadWithProfile | null>;
  list(filter?: LeadListFilter): Promise<Lead[]>;
  updateStatus(id: string, status: string): Promise<void>;
}
