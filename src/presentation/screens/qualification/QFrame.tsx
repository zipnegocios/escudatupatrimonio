"use client";

import { useEffect, useRef } from "react";
import { ScreenWrapper } from "@/presentation/components/ScreenWrapper";
import { ProgressBar } from "@/presentation/components/ProgressBar";
import { CTAButton } from "@/presentation/components/CTAButton";
import { headerIn } from "@/presentation/animations/gsap-micro";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § Q_FRAME — Este programa no es para todos
export function QFrame({ onChoice }: ScreenComponentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) headerIn(contentRef.current.children);
  }, []);

  return (
    <ScreenWrapper>
      <div className="pt-4 pb-2">
        <ProgressBar current={2} total={5} />
      </div>
      <div ref={contentRef} className="flex-1 flex flex-col justify-center gap-4">
        <p className="type-eyebrow">Proceso de evaluación</p>
        <h1 className="type-title">Este programa tiene requisitos específicos</h1>
        <p className="type-body">
          No todos los perfiles pueden ser aprobados. Vamos a verificar los
          tuyos con 4 preguntas rápidas.
        </p>
      </div>
      <div className="pb-6">
        <CTAButton label="Verificar si califico →" onClick={() => onChoice("CONTINUE")} />
      </div>
    </ScreenWrapper>
  );
}
