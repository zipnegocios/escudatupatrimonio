"use client";

import { useEffect, useRef } from "react";
import { ScreenWrapper } from "@/presentation/components/ScreenWrapper";
import { CTAButton } from "@/presentation/components/CTAButton";
import { headerIn } from "@/presentation/animations/gsap-micro";
import { BRAND_NAME } from "@/presentation/constants";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § E1.0 — Pantalla de entrada
export function E1Entry({ onChoice }: ScreenComponentProps) {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) headerIn(headerRef.current.children);
  }, []);

  return (
    <ScreenWrapper>
      <div ref={headerRef} className="flex-1 flex flex-col justify-center gap-4">
        <p className="type-eyebrow text-gold-primary">{BRAND_NAME}</p>
        <p className="type-eyebrow">Evaluación de programas de ahorro y protección</p>
        <h1 className="type-title">Verifica si calificas</h1>
        <p className="type-body">
          Solo necesitas tocar botones — no hay que escribir.
        </p>
        <p className="type-caption">
          Vas a completar algunos datos personales, incluido tu Número de
          Seguro Social — más adelante te explicamos exactamente para qué se
          usa y cómo se protege.
        </p>
      </div>
      <div className="pb-6">
        <CTAButton label="Comenzar →" onClick={() => onChoice("START")} />
      </div>
    </ScreenWrapper>
  );
}
