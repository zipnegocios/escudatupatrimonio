"use client";

import { PreencuadreScreen } from "@/presentation/screens/preencuadre/PreencuadreScreen";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: revisado con Luis y Gustavo (reunión 2026-08-19) — antes solo
// hablaba de débitos, ahora prioriza que la cuenta es donde se reciben los
// beneficios, y menciona el débito como algo adicional.
export function Pre3({ onChoice }: ScreenComponentProps) {
  return (
    <PreencuadreScreen
      moduleLabel="Módulo 3 de 4"
      eyebrow="Sobre la cuenta bancaria"
      title="Por qué se pedirá tu información bancaria"
      paragraphs={[
        "La cuenta que nos compartís es donde vas a recibir los beneficios de tu programa: el respaldo económico del seguro y tus retiros cuando estén disponibles.",
        "También se usa para procesar el débito mensual de tus aportes de ahorro — es un requisito de la industria aseguradora, para tener un único canal seguro tanto para acreditar como para descontar.",
        "Solo se necesita el número de cuenta y el número de ruta (routing number). Va directamente a la plataforma segura de la aseguradora.",
      ]}
      ctaLabel="Entendido →"
      onContinue={() => onChoice("CONTINUE")}
    />
  );
}
