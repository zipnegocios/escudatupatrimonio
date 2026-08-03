import gsap from "gsap";

/** Transición de entrada de pantalla: slide + fade, usada por ScreenWrapper. */
export function enterScreen(el: Element) {
  return gsap.fromTo(
    el,
    { x: 40, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.4, ease: "expo.out" }
  );
}

/** Transición de salida de pantalla (no usada aún: en esta fase no hay animación de salida entre unmounts). */
export function exitScreen(el: Element) {
  return gsap.to(el, { x: -40, opacity: 0, duration: 0.25, ease: "power3.in" });
}
