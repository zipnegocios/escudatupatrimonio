"use client";

import { useEffect, useRef } from "react";
import { ScreenWrapper } from "@/presentation/components/ScreenWrapper";
import { CTAButton } from "@/presentation/components/CTAButton";
import { headerIn } from "@/presentation/animations/gsap-micro";
import { INSURANCE_PARTNERS, MIB_LOGO_URL } from "@/presentation/constants";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

/**
 * copy: mvp_arbol_decisiones_smart_form.md § INFO_NLG, corregido a
 * multi-aseguradora — el documento fuente solo mencionaba a National Life
 * Group, pero Luis trabaja con las 9 aseguradoras de INSURANCE_PARTNERS
 * (ver constants.ts). El agente certificado presenta el programa; la
 * aseguradora que evalúa y aprueba se asigna después de revisar el
 * perfil, junto al MIB.
 */
export function InfoNlg({ onChoice }: ScreenComponentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) headerIn(contentRef.current.children);
  }, []);

  return (
    <ScreenWrapper>
      <div ref={contentRef} className="flex-1 flex flex-col justify-center gap-5 py-10 overflow-y-auto">
        <p className="type-eyebrow">Las aseguradoras que respaldan este programa</p>
        <h1 className="type-title">Trabajamos con 9 aseguradoras líderes</h1>
        <p className="type-body">
          El sector asegurador es el más regulado de la economía americana:
          el Estado audita constantemente sus reservas para garantizar que
          puedan cumplir cada promesa hecha a sus clientes.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {INSURANCE_PARTNERS.map((partner) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={partner.name} src={partner.logoUrl} alt={partner.name} className="h-8 w-auto" loading="lazy" />
          ))}
        </div>
        <p className="type-body">
          El MIB (Buró Médico) verifica tu información como parte del
          proceso de aprobación, y de acuerdo a tu perfil se te asigna la
          aseguradora que mejor se adapte a tu caso — ninguna de estas
          compañías puede desaparecer ni dejar de pagar.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MIB_LOGO_URL} alt="MIB — Medical Information Bureau" className="h-8 w-auto" loading="lazy" />
      </div>
      <div className="pb-6">
        <CTAButton label="Entendido, continuemos →" onClick={() => onChoice("CONTINUE")} />
      </div>
    </ScreenWrapper>
  );
}
