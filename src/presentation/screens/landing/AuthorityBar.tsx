"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { INSURANCE_PARTNERS, TRAYECTORIA_URL } from "@/presentation/constants";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * copy: spec de rediseño v1.0 § 2.2 Barra de autoridad.
 *
 * Cada logo vive en una caja de tamaño fijo (w-32/36 × h-14/16) con
 * object-contain — a `h-14 w-auto` puro, un logo ancho como Americo
 * (aspect ratio 4.98) renderiza 4x más ancho que uno casi cuadrado como
 * F&G (aspect ratio 1.23) pese a compartir la misma altura, que era la
 * causa real del desequilibrio "gigante vs diminuto" reportado. La caja
 * fija normaliza el peso visual de los 9 logos sin importar su proporción
 * nativa.
 */
export function AuthorityBar() {
  const logosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = logosRef.current;
    if (!container) return;
    const logos = container.querySelectorAll("img");
    const tween = gsap.fromTo(
      logos,
      { scale: 4, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "back.out(1.5)",
        stagger: 0.15,
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
        },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={TRAYECTORIA_URL}
        alt="Más de 100 años de trayectoria"
        className="w-40 md:w-48 mx-auto mb-2 object-contain"
      />
      <p className="type-body text-center">
        Respaldado por aseguradoras con más de 100 años de solidez en el mercado
      </p>
      <div
        ref={logosRef}
        className="flex flex-col items-center gap-10 md:flex-row md:flex-wrap md:justify-center md:gap-x-10 md:gap-y-6"
      >
        {INSURANCE_PARTNERS.map((partner) => (
          <div key={partner.name} className="w-32 h-14 md:w-36 md:h-16 flex items-center justify-center">
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
