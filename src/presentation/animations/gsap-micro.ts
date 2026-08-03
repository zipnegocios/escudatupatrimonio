import gsap from "gsap";
import type { RefObject } from "react";

/**
 * Tap-scale compartido por OptionButton y CTAButton: 0.97 en 80ms, luego
 * rebote a 1 con back.out. Devuelve un handler para usar en onPointerDown.
 */
export function attachTapScale(ref: RefObject<HTMLElement | null>, onComplete?: () => void) {
  return () => {
    const el = ref.current;
    if (!el) {
      onComplete?.();
      return;
    }
    gsap.to(el, {
      scale: 0.97,
      duration: 0.08,
      ease: "power2.in",
      onComplete: () => {
        gsap.to(el, { scale: 1, duration: 0.15, ease: "back.out(1.5)" });
        if (onComplete) setTimeout(onComplete, 80);
      },
    });
  };
}

export function staggerIn(elements: Element[] | NodeListOf<Element> | HTMLCollection) {
  return gsap.fromTo(
    elements,
    { y: 16, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.4, stagger: 0.07, ease: "power2.out" }
  );
}

export function headerIn(elements: Element[] | NodeListOf<Element> | HTMLCollection) {
  return gsap.fromTo(
    elements,
    { y: 10, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
  );
}
