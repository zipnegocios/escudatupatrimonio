"use client";

import { PreencuadreScreen } from "@/presentation/screens/preencuadre/PreencuadreScreen";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § PRE_1, corregido a multi-aseguradora
// (el documento fuente solo mencionaba a National Life Group — Luis trabaja con
// las 9 aseguradoras de INSURANCE_PARTNERS, ver constants.ts).
export function Pre1({ onChoice }: ScreenComponentProps) {
  return (
    <PreencuadreScreen
      moduleLabel="Módulo 1 de 4"
      eyebrow="Sobre las aseguradoras"
      title="Trabajamos con 9 aseguradoras líderes"
      paragraphs={[
        "Son aseguradoras reguladas, con décadas de trayectoria en Estados Unidos. El Estado audita constantemente sus reservas para garantizar que puedan cumplir cada promesa hecha a sus clientes.",
        "Tu perfil se revisa según el proceso federal de aprobación: el MIB (Buró Médico) verifica tu información, y se te asigna la aseguradora que mejor se adapte a tu caso.",
      ]}
      logos
      ctaLabel="Entendido →"
      onContinue={() => onChoice("CONTINUE")}
    />
  );
}
