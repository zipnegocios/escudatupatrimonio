"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { headerIn } from "@/presentation/animations/gsap-micro";
import { IconShield } from "@/presentation/components/icons";
import { BRAND_LOGO_URL } from "@/presentation/constants";

/**
 * copy: spec de rediseño v1.0 § 2.1 Hero.
 *
 * Fondo claro (no bg-bg-trust-dark): el logo de marca tiene elementos en
 * navy que se camuflan contra un fondo oscuro — ver globals.css, el navy
 * del logo (~#0b1628) es casi idéntico a --bg-trust-dark. Grid de 2
 * columnas desde `lg:` (texto | visual), apilado en móvil.
 *
 * El CTA ya no vive aquí — es un botón flotante global (FloatingCTA, ver
 * LandingScreen.tsx) que coexiste con el botón de WhatsApp.
 */
export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (ref.current) headerIn(ref.current.children);

    const logo = logoRef.current;
    if (!logo) return;
    const tl = gsap.timeline();
    tl.fromTo(
      logo,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: "back.out(1.7)" }
    );
    tl.to(logo, { y: -5, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="relative min-h-dvh flex flex-col justify-center bg-bg-primary">
      <div className="relative mx-auto w-full max-w-[1120px] px-6 py-24 lg:py-0 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] lg:items-center gap-10 lg:gap-16">
        <div className="flex flex-col items-center text-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={logoRef}
            src={BRAND_LOGO_URL}
            alt="Protege tu Patrimonio"
            className="h-28 md:h-40 w-auto object-contain mx-auto mb-2 opacity-0"
          />
          <div ref={ref} className="flex flex-col items-center text-center gap-4">
            <p className="type-eyebrow" style={{ color: "var(--gold-text)" }}>
              Evaluación gratuita
            </p>
            <h1 className="type-title lg:!text-[42px]">
              ¿Calificas para el programa de ahorro y protección?
            </h1>
            <p className="type-subtitle max-w-[480px]">
              Descubre si tu perfil cumple los requisitos de este programa
              respaldado por aseguradoras líderes.
            </p>
            <p className="type-caption">Evaluación gratuita y sin compromiso</p>
          </div>
        </div>

        {/* Panel visual — solo desktop. */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative w-full aspect-square max-w-[380px] rounded-[32px] border border-border-card bg-bg-elevated flex items-center justify-center">
            <div className="opacity-90 w-28 h-28 [&_svg]:w-full [&_svg]:h-full" style={{ color: "var(--gold-text)" }}>
              <IconShield />
            </div>
            <div className="absolute -bottom-4 -right-4 px-4 py-3 rounded-2xl border border-border-card bg-bg-surface type-caption text-text-secondary">
              Respaldado por 9 aseguradoras líderes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
