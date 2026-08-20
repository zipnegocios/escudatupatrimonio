"use client";

import { ExitScreen } from "@/presentation/screens/exits/ExitScreen";

// copy: mvp_arbol_decisiones_smart_form.md § D_JOVEN — Salida: menor de 18
export function DJoven() {
  return (
    <ExitScreen
      title="Gracias por tu interés"
      body="Este programa está diseñado para personas mayores de 18 años. Si querés, podés escribirle directo a un agente para conversar qué otras opciones existen para tu caso."
      whatsappReason="soy menor de 18 años"
    />
  );
}
