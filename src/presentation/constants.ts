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

/**
 * Las 8 aseguradoras con las que se trabaja. El documento fuente
 * (mvp_arbol_decisiones_smart_form.md / copy_guion) menciona solo a
 * National Life Group — es una de las 8, no la única opción para IUL. Solo
 * se refleja en la landing (Sección 6), el resto del wizard sigue
 * centrado en NLG (ver docs/superpowers/specs/2026-08-06-landing-page-design.md).
 */
export const INSURANCE_PARTNERS = [
  "Ethos",
  "Americo",
  "Mutual of Omaha",
  "National Life Group",
  "F&G (Annuities & Life)",
  "Corebridge Financial",
  "Transamerica",
  "Foresters Financial",
] as const;
