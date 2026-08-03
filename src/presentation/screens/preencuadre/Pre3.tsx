"use client";

import { PreencuadreScreen } from "@/presentation/screens/preencuadre/PreencuadreScreen";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § PRE_3 — Información bancaria: por qué
export function Pre3({ onChoice }: ScreenComponentProps) {
  return (
    <PreencuadreScreen
      moduleLabel="Módulo 3 de 4"
      eyebrow="Sobre la cuenta bancaria"
      title="Por qué se pedirá tu información bancaria"
      paragraphs={[
        "National Life Group requiere confirmar que tienes una cuenta bancaria activa en los Estados Unidos.",
        "Es un requisito de la industria aseguradora: necesitan un canal para procesar el débito mensual de tu programa.",
        "Solo se necesita el número de cuenta y el número de ruta (routing number). Va directamente a la plataforma segura de National Life Group.",
      ]}
      ctaLabel="Entendido →"
      onContinue={() => onChoice("CONTINUE")}
    />
  );
}
