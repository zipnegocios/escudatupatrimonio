"use client";

import { ExitScreen } from "@/presentation/screens/exits/ExitScreen";

// copy: mvp_arbol_decisiones_smart_form.md § D_ESTATUS — Salida: sin estatus legal
export function DEstatus() {
  return (
    <ExitScreen
      title="Gracias por tu tiempo"
      body="Actualmente el programa requiere algún tipo de estatus legal en los Estados Unidos. Anotamos tu información para mantenerte al tanto si tu situación cambia en el futuro."
    />
  );
}
