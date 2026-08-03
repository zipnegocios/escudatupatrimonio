"use client";

import { PreencuadreScreen } from "@/presentation/screens/preencuadre/PreencuadreScreen";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § PRE_2 — MIB y el Número de Seguro Social
export function Pre2({ onChoice }: ScreenComponentProps) {
  return (
    <PreencuadreScreen
      moduleLabel="Módulo 2 de 4"
      eyebrow="Sobre el proceso de aprobación"
      title="Por qué se pedirá tu Número de Seguro Social"
      paragraphs={[
        "Para que National Life Group consulte al MIB y verifique tu perfil, necesita identificarte de manera única.",
        "Para eso usa tu Número de Seguro Social — el mismo mecanismo que usan los bancos cuando abres una cuenta.",
        "El agente no guarda tu SSN. Lo ingresa directamente en el sistema seguro de la compañía.",
        "No existe otra manera legal. Es un requisito federal, no una opción personal del agente.",
      ]}
      ctaLabel="Entendido →"
      onContinue={() => onChoice("CONTINUE")}
    />
  );
}
