"use client";

import { useEffect, useRef } from "react";
import { headerIn } from "@/presentation/animations/gsap-micro";
import { CTAButton } from "@/presentation/components/CTAButton";
import { BRAND_LOGO_URL } from "@/presentation/constants";

interface HeroProps {
  onContinue: () => void;
}

// copy: spec de rediseño v1.0 § 2.1 Hero
export function Hero({ onContinue }: HeroProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) headerIn(ref.current.children);
  }, []);

  return (
    <div ref={ref} className="min-h-dvh flex flex-col justify-center px-6 gap-4 bg-bg-trust-dark">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={BRAND_LOGO_URL} alt="Escuda tu Patrimonio" className="h-14 w-auto self-start mb-2" />
      <p className="type-eyebrow" style={{ color: "var(--gold-light)" }}>
        Evaluación gratuita · 4 minutos
      </p>
      <h1 className="type-title" style={{ color: "var(--text-ondark)" }}>
        ¿Calificas para el programa de ahorro y protección?
      </h1>
      <p className="type-subtitle" style={{ color: "var(--text-ondark-secondary)" }}>
        Descubre en menos de 4 minutos si tu perfil cumple los requisitos de
        este programa respaldado por aseguradoras líderes.
      </p>
      <div className="mt-2">
        <CTAButton label="Verificar mi elegibilidad ahora →" onClick={onContinue} />
      </div>
      <p className="type-caption text-center" style={{ color: "var(--text-ondark-muted)" }}>
        Evaluación gratuita y sin compromiso
      </p>
    </div>
  );
}
