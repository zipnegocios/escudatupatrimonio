"use client";

import { ExitScreen } from "@/presentation/screens/exits/ExitScreen";

// copy: mvp_arbol_decisiones_smart_form.md § D_MAYOR — Salida: mayor de 70
export function DMayor() {
  return (
    <ExitScreen
      title="Gracias por compartir eso"
      body="Las opciones de este programa se limitan a partir de cierta edad. Escribile directo a un agente por WhatsApp para conversar qué alternativas pueden aplicar a tu situación."
      whatsappReason="tengo más de 70 años"
    />
  );
}
