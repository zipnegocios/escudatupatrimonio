import type { LeadRepository } from "@/core/ports/lead-repository";

export interface MatchLeadByPhoneDeps {
  leadRepository: LeadRepository;
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

// Compara los últimos 8 dígitos en vez de exigir coincidencia exacta: el
// prospecto puede haber tipeado su teléfono en el Smart Form sin código de
// país, y el remoteJid de WhatsApp siempre lo trae completo.
function phonesMatch(a: string, b: string): boolean {
  const digitsA = normalizePhone(a);
  const digitsB = normalizePhone(b);
  if (digitsA.length === 0 || digitsB.length === 0) return false;
  if (digitsA.length < 8 || digitsB.length < 8) return digitsA === digitsB;
  return digitsA.slice(-8) === digitsB.slice(-8);
}

// Best-effort: QualificationProfile no tiene email, solo teléfono, así que
// este es el único vínculo automático posible entre una conversación de
// WhatsApp y un lead del Smart Form.
export async function matchLeadByPhone(
  deps: MatchLeadByPhoneDeps,
  remoteJid: string,
): Promise<string | null> {
  const phoneDigits = remoteJid.split("@")[0];
  if (!phoneDigits) return null;

  const leads = await deps.leadRepository.list();
  const match = leads.find((lead) => lead.telefono && phonesMatch(lead.telefono, phoneDigits));
  return match?.id ?? null;
}
