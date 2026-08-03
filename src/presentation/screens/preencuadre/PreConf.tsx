"use client";

import { useEffect, useRef } from "react";
import { ScreenWrapper } from "@/presentation/components/ScreenWrapper";
import { ProgressBar } from "@/presentation/components/ProgressBar";
import { CTAButton } from "@/presentation/components/CTAButton";
import { ChecklistItem } from "@/presentation/components/ChecklistItem";
import { headerIn } from "@/presentation/animations/gsap-micro";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § PRE_CONF — Confirmación de comprensión
export function PreConf({ onChoice }: ScreenComponentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) headerIn(contentRef.current.children);
  }, []);

  return (
    <ScreenWrapper>
      <div className="pt-4 pb-2">
        <ProgressBar current={4} total={5} />
      </div>
      <div ref={contentRef} className="flex-1 flex flex-col justify-center gap-5">
        <p className="type-eyebrow">Antes de continuar</p>
        <h1 className="type-title">He leído y entiendo que:</h1>
        <div className="flex flex-col gap-3">
          <ChecklistItem text="El SSN es requerido por el MIB por ley" />
          <ChecklistItem text="La cuenta bancaria es requisito de NLG" />
          <ChecklistItem text="Puedo verificar la licencia en nipr.com" />
        </div>
      </div>
      <div className="pb-6 flex flex-col gap-3">
        <CTAButton label="Confirmar y continuar →" onClick={() => onChoice("CONFIRM")} />
        <CTAButton label="Tengo una pregunta →" variant="secondary" onClick={() => onChoice("QUESTION")} />
      </div>
    </ScreenWrapper>
  );
}
