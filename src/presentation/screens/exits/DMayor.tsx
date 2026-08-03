"use client";

import { ExitScreen } from "@/presentation/screens/exits/ExitScreen";

// copy: mvp_arbol_decisiones_smart_form.md § D_MAYOR — Salida: mayor de 70
export function DMayor() {
  return (
    <ExitScreen
      title="Gracias por compartir eso"
      body="Las opciones de este programa se limitan significativamente a partir de cierta edad. Anotamos tu información y te mantendremos al tanto de opciones que puedan aplicar para tu situación."
    />
  );
}
