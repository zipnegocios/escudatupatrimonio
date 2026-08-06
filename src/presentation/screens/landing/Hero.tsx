"use client";

import { useEffect, useRef } from "react";
import { headerIn } from "@/presentation/animations/gsap-micro";

// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md § 1. Hero
export function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) headerIn(ref.current.children);
  }, []);

  return (
    <div ref={ref} className="min-h-dvh flex flex-col justify-center px-6 gap-4">
      <h1 className="type-title">¿Calificas para el programa de ahorro y protección?</h1>
      <p className="type-subtitle">
        Descubre en menos de 4 minutos si tu perfil cumple los requisitos de este programa.
      </p>
    </div>
  );
}
