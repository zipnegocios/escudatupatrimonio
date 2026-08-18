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

export interface UpdateLeadFieldsInput {
  nombre: string | null;
  telefono: string | null;
  canal: string | null;
  priority: string | null;
  status: string;
}

// Mismo shape que QualificationProfile menos nombre/telefono/canal (esos
// viven en `leads`, no acá) — todo editable a mano desde el detalle del
// lead, por eso no reutiliza SaveLeadInput (que viene del Smart Form).
export interface UpdateQualificationProfileInput {
  intencionP: string | null;
  intencionS: string | null;
  horizonte: string | null;
  planRetiro: string | null;
  familiaTipo: string | null;
  preocFamilia: string | null;
  cobActual: string | null;
  preocSalud: string | null;
  edadRango: string | null;
  edadCond: boolean;
  salud: string | null;
  saludFlag: string | null;
  estatus: string | null;
  estatusFlag: string | null;
  estado: string | null;
  timezone: string | null;
  referido: boolean;
  ventanaDisp: string | null;
}

export interface LeadRepository {
  // Upsert por sessionId: reenviar el mismo formulario actualiza la misma
  // fila en vez de duplicarla.
  save(input: SaveLeadInput): Promise<Lead>;
  findById(id: string): Promise<LeadWithProfile | null>;
  list(filter?: LeadListFilter): Promise<Lead[]>;
  updateStatus(id: string, status: string): Promise<void>;
  updateLeadFields(id: string, input: UpdateLeadFieldsInput): Promise<Lead>;
  updateQualificationProfile(
    leadId: string,
    input: UpdateQualificationProfileInput,
  ): Promise<QualificationProfileRow>;
}
