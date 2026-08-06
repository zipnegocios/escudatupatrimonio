/**
 * Slot inerte para el script base de Meta Pixel. No renderiza nada ni hace
 * ninguna request de red — intencional mientras el proyecto esté en fase
 * fundacional sin integraciones (ver
 * docs/superpowers/specs/2026-08-06-landing-page-design.md).
 *
 * Cuando exista un Pixel ID real:
 * 1. Reemplazar el cuerpo de este componente por un <Script
 *    strategy="afterInteractive"> (de next/script) con el snippet base de
 *    Meta Pixel: fbq('init', PIXEL_ID) + fbq('track', 'PageView').
 *    Ver: https://developers.facebook.com/docs/meta-pixel/get-started
 * 2. Ya está montado en src/app/layout.tsx — no hace falta moverlo.
 * 3. Disparar fbq('track', 'Lead') en src/presentation/screens/E5Final.tsx
 *    al confirmar la evaluación (pantalla de cierre del wizard).
 */
export function MetaPixelSlot() {
  return null;
}
