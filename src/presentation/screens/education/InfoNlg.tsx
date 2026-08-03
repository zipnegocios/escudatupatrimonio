"use client";

import { useEffect, useRef } from "react";
import { ScreenWrapper } from "@/presentation/components/ScreenWrapper";
import { CTAButton } from "@/presentation/components/CTAButton";
import { headerIn } from "@/presentation/animations/gsap-micro";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § INFO_NLG — National Life Group
export function InfoNlg({ onChoice }: ScreenComponentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) headerIn(contentRef.current.children);
  }, []);

  return (
    <ScreenWrapper>
      <div ref={contentRef} className="flex-1 flex flex-col justify-center gap-5 py-10">
        <p className="type-eyebrow">La compañía que respalda este programa</p>
        <h1 className="type-title">National Life Group</h1>
        <p className="type-body">
          Fundada en 1848 — 178 años de operación continua en los Estados
          Unidos.
        </p>
        <p className="type-body">
          El sector asegurador es el más regulado de la economía americana:
          el Estado audita constantemente sus reservas para garantizar que
          puedan cumplir cada promesa hecha a sus clientes.
        </p>
        <p className="type-body">National Life Group no puede desaparecer ni dejar de pagar.</p>
        <a
          href="https://nationallife.com"
          target="_blank"
          rel="noopener noreferrer"
          className="type-caption text-trust"
        >
          nationallife.com →
        </a>
      </div>
      <div className="pb-6">
        <CTAButton label="Entendido, continuemos →" onClick={() => onChoice("CONTINUE")} />
      </div>
    </ScreenWrapper>
  );
}
