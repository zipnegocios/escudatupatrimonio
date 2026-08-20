/**
 * Constantes hardcodeadas para la fase fundacional (solo frontend, sin
 * backend). `state` no se usa en ningún lado (queda como placeholder sin
 * impacto). El resto de AGENT_INFO ya son datos reales de Luis Moreno Rangel.
 */
// NOTA: el logo real (BRAND_ICON_URL/BRAND_LOGO_URL) dice "ESCUDA tu
// Patrimonio", no "Escudo". Se corrige aquí para calzar con el asset de
// marca — confirmar con Gustavo si el logo tiene el error tipográfico en
// vez del código.
export const BRAND_NAME = "Escuda tu Patrimonio";

export const AGENT_INFO = {
  name: "Luis Moreno Rangel",
  license: "19655234", // NPN real (National Producer Number, verificable en nipr.com)
  state: "FL", // PLACEHOLDER — estado principal de licencia
  phone: "+1-305-505-2886",
  whatsapp: "13055052886", // formato E.164 sin '+', para wa.me
  photo: "/brand/luis.png",
  company: "National Life Group",
} as const;

export const WHATSAPP_LINK = `https://wa.me/${AGENT_INFO.whatsapp}`;

const ASSET_BASE = "https://pub-beb16d388e93409591cbfdda046059d6.r2.dev/vid";

/**
 * Logos servidos localmente desde /public/brand, recortados a su bounding
 * box real (+6% de padding) — los originales en R2 venían en un lienzo
 * uniforme de 600x300 sin recortar, lo que hacía que cada logo se viera con
 * una proporción distinta e inconsistente al escalar con `h-N w-auto`
 * (algunos ocupaban 37% del lienzo, otros 76%). Si se reemplaza cualquiera
 * de estos archivos, volver a correr el recorte antes de subirlo — un logo
 * sin recortar rompe la alineación de toda la fila.
 */
const BRAND_BASE = "/brand";

/** Logo completo de marca (navy + oro) — usado en el Hero de la landing. */
export const BRAND_LOGO_URL = `${BRAND_BASE}/escuda-tu-patrimonio-logo.png`;
/** Ícono cuadrado de marca — usado como favicon (ver metadata.icons en src/app/layout.tsx). */
export const BRAND_ICON_URL = `${BRAND_BASE}/icono.png`;
/** Logo del MIB (Medical Information Bureau) — usado en la Sección 2.5 (reencuadre institucional). */
export const MIB_LOGO_URL = `${BRAND_BASE}/mib-logo.png`;

/**
 * Los 2 videos explicativos de Luis (Sección 2.7 — contenido de
 * autoridad, NO son testimonios). Formato vertical, subtítulos quemados
 * en el archivo (no requieren <track> adicional).
 */
export interface AuthorityVideo {
  src: string;
  /** Frame estático servido localmente — se ve de inmediato mientras el mp4 (pesado, servido desde R2) termina de cargar en redes móviles lentas. */
  poster: string;
}

export const AUTHORITY_VIDEOS: readonly AuthorityVideo[] = [
  { src: `${ASSET_BASE}/vid01.mp4`, poster: `${BRAND_BASE}/video-poster-1.jpg` },
  { src: `${ASSET_BASE}/vid02.mp4`, poster: `${BRAND_BASE}/video-poster-2.jpg` },
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
  { name: "Ethos", logoUrl: `${BRAND_BASE}/ethos.png` },
  { name: "Americo", logoUrl: `${BRAND_BASE}/americo.png` },
  { name: "Mutual of Omaha", logoUrl: `${BRAND_BASE}/mutual.png` },
  { name: "National Life Group", logoUrl: `${BRAND_BASE}/nlf.png` },
  { name: "F&G (Annuities & Life)", logoUrl: `${BRAND_BASE}/FyG.png` },
  { name: "Corebridge Financial", logoUrl: `${BRAND_BASE}/corebridge.png` },
  { name: "Transamerica", logoUrl: `${BRAND_BASE}/transamerica.png` },
  { name: "Foresters Financial", logoUrl: `${BRAND_BASE}/forsterst.png` },
  { name: "Assure for Life", logoUrl: `${BRAND_BASE}/assure.png` },
];
