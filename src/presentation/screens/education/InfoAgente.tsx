"use client";

import { useEffect, useRef } from "react";
import { ScreenWrapper } from "@/presentation/components/ScreenWrapper";
import { CTAButton } from "@/presentation/components/CTAButton";
import { AgentCard } from "@/presentation/components/AgentCard";
import { headerIn } from "@/presentation/animations/gsap-micro";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § INFO_AGENTE — Asignación del agente
export function InfoAgente({ onChoice }: ScreenComponentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) headerIn(contentRef.current.children);
  }, []);

  return (
    <ScreenWrapper>
      <div ref={contentRef} className="flex-1 flex flex-col justify-center gap-5 py-10">
        <p className="type-eyebrow">Tu evaluación ha sido procesada</p>
        <h1 className="type-title">
          Hemos asignado un Agente Certificado para atender personalmente tu caso.
        </h1>
        <AgentCard size="large" />
        <p className="type-body">
          Luis atenderá tu caso de forma personal y guiará cada paso del
          proceso de aprobación contigo.
        </p>
      </div>
      <div className="pb-6">
        <CTAButton label="Conocer el proceso →" onClick={() => onChoice("CONTINUE")} />
      </div>
    </ScreenWrapper>
  );
}
