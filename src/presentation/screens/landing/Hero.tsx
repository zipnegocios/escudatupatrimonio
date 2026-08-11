"use client";

import { useEffect, useRef } from "react";
import { headerIn } from "@/presentation/animations/gsap-micro";
import { CTAButton } from "@/presentation/components/CTAButton";
import { WebGLCanvas } from "@/presentation/webgl/WebGLCanvas";
import { particleNetworkScene } from "@/presentation/webgl/scenes/particleNetwork";
import { IconShield } from "@/presentation/components/icons";
import { BRAND_LOGO_URL } from "@/presentation/constants";

interface HeroProps {
  onContinue: () => void;
}

/**
 * copy: spec de rediseño v1.0 § 2.1 Hero.
 *
 * Layout: apilado en móvil; grid de 2 columnas desde `lg:` (texto | visual),
 * como estaba previsto en el brainstorm original antes de simplificarse a
 * una sola columna. El fondo de partículas reutiliza `particleNetworkScene`
 * (la misma escena de S1) en vez de crear una nueva — es la única sección
 * de la landing que monta WebGL, así que el costo de un canvas activo es
 * aceptable incluso en gama baja.
 */
export function Hero({ onContinue }: HeroProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) headerIn(ref.current.children);
  }, []);

  return (
    <div className="relative min-h-dvh flex flex-col justify-center overflow-hidden bg-bg-trust-dark">
      <div className="absolute inset-0 opacity-40 lg:opacity-60">
        <WebGLCanvas sceneSetup={particleNetworkScene} />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,22,40,0.35) 0%, rgba(11,22,40,0.85) 65%, rgba(11,22,40,1) 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1120px] px-6 py-24 lg:py-0 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] lg:items-center gap-10 lg:gap-16">
        <div ref={ref} className="flex flex-col gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND_LOGO_URL} alt="Escuda tu Patrimonio" className="h-14 w-auto self-start mb-2" />
          <p className="type-eyebrow" style={{ color: "var(--gold-light)" }}>
            Evaluación gratuita · 4 minutos
          </p>
          <h1 className="type-title lg:!text-[42px]" style={{ color: "var(--text-ondark)" }}>
            ¿Calificas para el programa de ahorro y protección?
          </h1>
          <p className="type-subtitle max-w-[480px]" style={{ color: "var(--text-ondark-secondary)" }}>
            Descubre en menos de 4 minutos si tu perfil cumple los requisitos de
            este programa respaldado por aseguradoras líderes.
          </p>
          <div className="mt-2 max-w-[380px]">
            <CTAButton label="Verificar mi elegibilidad ahora →" onClick={onContinue} />
          </div>
          <p className="type-caption" style={{ color: "var(--text-ondark-muted)" }}>
            Evaluación gratuita y sin compromiso
          </p>
        </div>

        {/* Panel visual — solo desktop. En móvil el canvas de fondo ya cumple ese rol. */}
        <div className="hidden lg:flex items-center justify-center">
          <div
            className="relative w-full aspect-square max-w-[380px] rounded-[32px] border flex items-center justify-center"
            style={{ borderColor: "var(--border-ondark)", background: "var(--bg-trust-elevated)" }}
          >
            <div className="opacity-90 w-28 h-28 [&_svg]:w-full [&_svg]:h-full" style={{ color: "var(--gold-light)" }}>
              <IconShield />
            </div>
            <div
              className="absolute -bottom-4 -right-4 px-4 py-3 rounded-2xl border type-caption"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-card)",
                color: "var(--text-secondary)",
              }}
            >
              Respaldado por 9 aseguradoras líderes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
