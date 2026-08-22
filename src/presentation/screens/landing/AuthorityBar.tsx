"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { INSURANCE_PARTNERS } from "@/presentation/constants";

/**
 * copy: spec de rediseño v1.0 § 2.2 Barra de autoridad.
 *
 * Cada logo vive en una caja de tamaño fijo (w-40/48 × h-16/20) con
 * object-contain — a `h-N w-auto` puro, un logo ancho como Americo (aspect
 * ratio 4.98) renderiza 4x más ancho que uno casi cuadrado como F&G (aspect
 * ratio 1.23) pese a compartir la misma altura, que era la causa real del
 * desequilibrio "gigante vs diminuto" reportado. La caja fija normaliza el
 * peso visual de los 9 logos sin importar su proporción nativa.
 *
 * El reveal usa IntersectionObserver (no GSAP ScrollTrigger) a propósito:
 * LandingWrapper scrollea dentro de un div `overflow-y-auto` propio, no en
 * `window` — ScrollTrigger por defecto escucha `window` y con ese scroller
 * nunca disparaba, dejando los logos en opacity:0 para siempre. Mismo
 * patrón que ya usa LandingSection, que sí funciona con este contenedor.
 */
export function AuthorityBar() {
  const logosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = logosRef.current;
    if (!container) return;
    const logos = container.querySelectorAll("img");
    gsap.set(logos, { scale: 4, opacity: 0 });
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(logos, {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: "back.out(1.2)",
            stagger: 0.25,
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <p className="type-subtitle font-medium text-center">
        Respaldado por aseguradoras con más de 100 años de solidez en el mercado
      </p>
      <div
        ref={logosRef}
        className="flex flex-col items-center gap-10 md:flex-row md:flex-wrap md:justify-center md:gap-x-10 md:gap-y-6"
      >
        {INSURANCE_PARTNERS.map((partner) => (
          <div key={partner.name} className="w-40 h-16 md:w-48 md:h-20 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={partner.logoUrl}
              alt={partner.name}
              className="max-w-full max-h-full object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
