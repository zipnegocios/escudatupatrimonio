"use client";

import { PreencuadreScreen } from "@/presentation/screens/preencuadre/PreencuadreScreen";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § PRE_1 — National Life Group: el proceso
export function Pre1({ onChoice }: ScreenComponentProps) {
  return (
    <PreencuadreScreen
      moduleLabel="Módulo 1 de 4"
      eyebrow="Sobre la compañía"
      title="National Life Group"
      paragraphs={[
        "Fundada en 1848 — 178 años de operación continua en los Estados Unidos.",
        "Es la actividad aseguradora más sólida y segura de la economía americana. El Estado audita constantemente sus reservas.",
        "La aprobación de tu póliza no la decide el agente — la decide National Life Group junto al MIB después de revisar tu perfil.",
      ]}
      link={{ label: "Verificar en nationallife.com →", href: "https://nationallife.com" }}
      ctaLabel="Entendido →"
      onContinue={() => onChoice("CONTINUE")}
    />
  );
}
