"use client";

import { ExitScreen } from "@/presentation/screens/exits/ExitScreen";

// copy: mvp_arbol_decisiones_smart_form.md § D_ESTATUS — Salida: sin estatus legal
export function DEstatus() {
  return (
    <ExitScreen
      title="Gracias por tu tiempo"
      body="Este programa requiere cierto estatus legal en los Estados Unidos. Escribile directo a un agente por WhatsApp para conversar qué opciones existen para tu situación."
      whatsappReason="mi estatus migratorio actual"
    />
  );
}
