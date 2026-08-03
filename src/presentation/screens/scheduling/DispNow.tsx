"use client";

import { useEffect, useRef } from "react";
import { ScreenWrapper } from "@/presentation/components/ScreenWrapper";
import { ProgressBar } from "@/presentation/components/ProgressBar";
import { OptionButton } from "@/presentation/components/OptionButton";
import { headerIn, staggerIn } from "@/presentation/animations/gsap-micro";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § DISP_NOW — ¿Disponible ahora?
export function DispNow({ onChoice }: ScreenComponentProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) headerIn(headerRef.current.children);
    if (listRef.current) staggerIn(listRef.current.children);
  }, []);

  return (
    <ScreenWrapper>
      <div className="pt-4 pb-2">
        <ProgressBar current={5} total={5} />
      </div>
      <div ref={headerRef} className="pt-8 pb-6 flex flex-col gap-3">
        <p className="type-eyebrow">Tu disponibilidad</p>
        <h1 className="type-title">Tu agente puede contactarte en los próximos 20 minutos</h1>
        <p className="type-body">¿Puedes atender una llamada o mensaje de WhatsApp ahora mismo?</p>
      </div>
      <div ref={listRef} className="flex flex-col gap-3 flex-1">
        <OptionButton label="Sí, estoy disponible ahora" onClick={() => onChoice("AHORA")} />
        <OptionButton label="Prefiero en otro momento" onClick={() => onChoice("DESPUES")} />
      </div>
    </ScreenWrapper>
  );
}
