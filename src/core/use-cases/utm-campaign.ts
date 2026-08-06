import type { IntencionP } from "@/core/entities/qualification-profile";

/**
 * Mapea el valor de ?utm_campaign= a una intención sugerida para Q_INT.
 * Pura, sin React ni acceso a window — recibe el string ya extraído.
 * Cualquier valor no reconocido (incluido "retargeting_600leads") o null
 * devuelve null: sin sugerencia visual.
 */
const UTM_TO_INTENCION: Record<string, IntencionP> = {
  ahorro_retiro: "AHORRO_RETIRO",
  proteccion_familiar: "PROTECCION_FAM",
  salud_emergencia: "SALUD_EMERGENCIA",
};

export function suggestIntencionFromUtm(utmCampaign: string | null): IntencionP | null {
  if (!utmCampaign) return null;
  return UTM_TO_INTENCION[utmCampaign] ?? null;
}
