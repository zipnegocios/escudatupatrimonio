"use client";

import { useEffect, useRef } from "react";
import { ScreenWrapper } from "@/presentation/components/ScreenWrapper";
import { ProgressBar } from "@/presentation/components/ProgressBar";
import { UsStatesMap } from "@/presentation/components/UsStatesMap";
import { headerIn } from "@/presentation/animations/gsap-micro";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § Q_ESTADO — Estado de residencia
export function QEstado({ onChoice }: ScreenComponentProps) {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) headerIn(headerRef.current.children);
  }, []);

  return (
    <ScreenWrapper>
      <div className="pt-4 pb-2">
        <ProgressBar current={2} total={5} />
      </div>
      <div ref={headerRef} className="pt-8 pb-4 flex flex-col gap-2">
        <p className="type-eyebrow">Pregunta 4 de 4</p>
        <p className="type-caption">Cada estado tiene diferentes opciones y regulaciones</p>
        <h1 className="type-title">¿En qué estado de EE.UU. resides actualmente?</h1>
      </div>
      <div className="flex-1 min-h-0 flex flex-col pb-4">
        <UsStatesMap onSelect={onChoice} />
      </div>
    </ScreenWrapper>
  );
}
