/**
 * Constantes hardcodeadas para la fase fundacional (solo frontend, sin
 * backend). AGENT_INFO usa valores placeholder claramente ficticios —
 * reemplazar con los datos reales de Luis Moreno Rangel antes de producción.
 */
export const BRAND_NAME = "Escudo tu Patrimonio";

export const AGENT_INFO = {
  name: "Luis Moreno Rangel",
  license: "LIC-000000", // PLACEHOLDER — reemplazar con la licencia real
  state: "FL", // PLACEHOLDER — estado principal de licencia
  phone: "+1-000-000-0000", // PLACEHOLDER
  whatsapp: "10000000000", // PLACEHOLDER (formato E.164 sin '+', para wa.me)
  photo: "/agent-placeholder.svg",
  company: "National Life Group",
} as const;

export const WHATSAPP_LINK = `https://wa.me/${AGENT_INFO.whatsapp}`;
