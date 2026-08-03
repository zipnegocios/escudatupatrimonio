import type { QualificationProfile } from "@/core/entities/qualification-profile";

/**
 * Réplica de la tabla "TAGS DE GOHIGHLEVEL" del documento fuente. Función
 * pura, sin efectos secundarios — en esta fase fundacional nada la invoca
 * hacia una API real (no hay integración con GHL todavía), pero queda lista
 * y testeable para cuando se conecte el backend.
 */
export function computeTags(profile: QualificationProfile): string[] {
  const tags: string[] = ["smart-form-mvp"];

  if (profile.intencionP === "AHORRO_RETIRO") tags.push("intencion-ahorro");
  if (profile.intencionP === "PROTECCION_FAM") tags.push("intencion-familia");
  if (profile.intencionP === "SALUD_EMERGENCIA") tags.push("intencion-salud");
  if (profile.intencionS !== null) tags.push("intencion-doble");

  if (profile.horizonte === "CORTO") tags.push("horizonte-corto");
  if (profile.horizonte === "LARGO" || profile.horizonte === "MEDIO") {
    tags.push("horizonte-largo");
  }

  if (profile.saludFlag !== null) tags.push("salud-flag");
  if (profile.estatusFlag !== null) tags.push("estatus-condicional");
  if (profile.referido) tags.push("referido-estado");
  if (profile.edadCond) tags.push("edad-condicional");
  if (profile.priority === "INMEDIATO") tags.push("priority-inmediato");

  return tags;
}

export function nurtureTagForExit(exitScreen: "D_JOVEN" | "D_MAYOR" | "D_ESTATUS"): string {
  switch (exitScreen) {
    case "D_JOVEN":
      return "nurture-edad-joven";
    case "D_MAYOR":
      return "nurture-edad-mayor";
    case "D_ESTATUS":
      return "nurture-estatus";
  }
}
