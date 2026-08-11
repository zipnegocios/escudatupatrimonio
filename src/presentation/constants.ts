/**
 * Constantes hardcodeadas para la fase fundacional (solo frontend, sin
 * backend). AGENT_INFO usa valores placeholder claramente ficticios —
 * reemplazar con los datos reales de Luis Moreno Rangel antes de producción.
 */
// NOTA: el logo real (BRAND_ICON_URL/BRAND_LOGO_URL) dice "ESCUDA tu
// Patrimonio", no "Escudo". Se corrige aquí para calzar con el asset de
// marca — confirmar con Gustavo si el logo tiene el error tipográfico en
// vez del código.
export const BRAND_NAME = "Escuda tu Patrimonio";

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

const ASSET_BASE = "https://pub-beb16d388e93409591cbfdda046059d6.r2.dev/vid";

/** Logo completo de marca (navy + oro) — usado en el Hero de la landing. */
export const BRAND_LOGO_URL = `${ASSET_BASE}/escuda-tu-patrimonio-logo.png`;
/** Ícono cuadrado de marca — usado como favicon (ver metadata.icons en src/app/layout.tsx). */
export const BRAND_ICON_URL = `${ASSET_BASE}/icono.png`;
/** Logo del MIB (Medical Information Bureau) — usado en la Sección 2.5 (reencuadre institucional). */
export const MIB_LOGO_URL = `${ASSET_BASE}/mib-logo.png`;

/**
 * Los 2 videos explicativos de Luis (Sección 2.7 — contenido de
 * autoridad, NO son testimonios). Formato vertical, subtítulos quemados
 * en el archivo (no requieren <track> adicional).
 */
export const AUTHORITY_VIDEOS: readonly string[] = [
  `${ASSET_BASE}/vid01.mp4`,
  `${ASSET_BASE}/vid02.mp4`,
];

export interface InsurancePartner {
  name: string;
  logoUrl: string;
}

/**
 * Las 9 aseguradoras con las que se trabaja. El documento fuente
 * (mvp_arbol_decisiones_smart_form.md / copy_guion) menciona solo a
 * National Life Group — es una de las 9, no la única opción. Solo se
 * refleja en la landing (Secciones 2.2, 2.5, 2.9); el resto del wizard
 * sigue centrado en NLG (ver docs/superpowers/specs/2026-08-06-landing-page-design.md).
 */
export const INSURANCE_PARTNERS: readonly InsurancePartner[] = [
  { name: "Ethos", logoUrl: `${ASSET_BASE}/ethos.png` },
  { name: "Americo", logoUrl: `${ASSET_BASE}/americo.png` },
  { name: "Mutual of Omaha", logoUrl: `${ASSET_BASE}/mutual.png` },
  { name: "National Life Group", logoUrl: `${ASSET_BASE}/nlf.png` },
  { name: "F&G (Annuities & Life)", logoUrl: `${ASSET_BASE}/FyG.png` },
  { name: "Corebridge Financial", logoUrl: `${ASSET_BASE}/corebridge.png` },
  { name: "Transamerica", logoUrl: `${ASSET_BASE}/transamerica.png` },
  { name: "Foresters Financial", logoUrl: `${ASSET_BASE}/forsterst.png` },
  { name: "Assure for Life", logoUrl: `${ASSET_BASE}/assure.png` },
];
