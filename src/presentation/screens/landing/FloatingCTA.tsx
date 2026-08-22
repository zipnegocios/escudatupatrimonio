"use client";

import { CTAButton } from "@/presentation/components/CTAButton";

interface FloatingCTAProps {
  onContinue: () => void;
}

/**
 * CTA dorado flotante de la landing (antes vivía dentro de Hero.tsx). Mismo
 * z-index que WhatsAppFloatingButton para quedar en la misma capa: en móvil
 * ocupa el ancho restante a la izquierda del botón de WhatsApp (56px + margen
 * en la esquina inferior derecha); desde `lg:` se centra en la parte inferior
 * de la pantalla, lejos de esa esquina.
 */
export function FloatingCTA({ onContinue }: FloatingCTAProps) {
  return (
    <div className="fixed z-40 bottom-[calc(env(safe-area-inset-bottom)+20px)] left-4 right-[92px] lg:left-1/2 lg:right-auto lg:w-full lg:max-w-[360px] lg:-translate-x-1/2">
      <CTAButton label="Verificar elegibilidad →" onClick={onContinue} shine />
    </div>
  );
}
