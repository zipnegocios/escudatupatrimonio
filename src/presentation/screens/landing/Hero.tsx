"use client";

import { useEffect, useRef } from "react";
import { headerIn } from "@/presentation/animations/gsap-micro";
import { CTAButton } from "@/presentation/components/CTAButton";
import { IconShield } from "@/presentation/components/icons";
import { BRAND_LOGO_URL } from "@/presentation/constants";

interface HeroProps {
  onContinue: () => void;
}

/**
 * copy: spec de rediseño v1.0 § 2.1 Hero.
 *
 * Fondo claro (no bg-bg-trust-dark): el logo de marca tiene elementos en
 * navy que se camuflan contra un fondo oscuro — ver globals.css, el navy
 * del logo (~#0b1628) es casi idéntico a --bg-trust-dark. Grid de 2
 * columnas desde `lg:` (texto | visual), apilado en móvil.
 */
export function Hero({ onContinue }: HeroProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) headerIn(ref.current.children);
  }, []);

  return (
    <div className="relative min-h-dvh flex flex-col justify-center bg-bg-primary">
      <div className="relative mx-auto w-full max-w-[1120px] px-6 py-24 lg:py-0 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] lg:items-center gap-10 lg:gap-16">
        <div ref={ref} className="flex flex-col gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND_LOGO_URL} alt="Escuda tu Patrimonio" className="h-24 lg:h-32 w-auto self-start mb-2" />
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
          <div className="mt-2 max-w-[380px]">
            <CTAButton label="Verificar mi elegibilidad ahora →" onClick={onContinue} />
          </div>
          <p className="type-caption">Evaluación gratuita y sin compromiso</p>
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
