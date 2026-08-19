import { randomUUID } from "node:crypto";
import { INITIAL_QUALIFICATION_PROFILE } from "@/core/entities/qualification-profile";
import type { Lead, LeadRepository } from "@/core/ports/lead-repository";

export interface CreateManualLeadDeps {
  leadRepository: LeadRepository;
}

export interface CreateManualLeadInput {
  nombre: string;
  telefono: string;
  canal: "WHATSAPP" | "LLAMADA" | "WA_PRIMERO";
}

// Lead creado a mano desde el panel (p.ej. alguien que escribió directo por
// WhatsApp, sin pasar por el Smart Form) — mismo shape que uno real, con el
// perfil de calificación vacío (se puede completar después desde el
// detalle del lead). `sessionId` no puede ser el de una sesión real del
// Smart Form, así que se genera uno con prefijo `manual-` para que nunca
// choque con uno del formulario público.
export async function createManualLead(
  deps: CreateManualLeadDeps,
  input: CreateManualLeadInput,
): Promise<Lead> {
  return deps.leadRepository.save({
    sessionId: `manual-${randomUUID()}`,
    utmCampaign: null,
    profile: {
      ...INITIAL_QUALIFICATION_PROFILE,
      nombre: input.nombre,
      telefono: input.telefono,
      canal: input.canal,
    },
    tags: [],
  });
}
