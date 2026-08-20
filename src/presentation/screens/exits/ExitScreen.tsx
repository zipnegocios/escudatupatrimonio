"use client";

import { useEffect, useRef } from "react";
import { ScreenWrapper } from "@/presentation/components/ScreenWrapper";
import { CTAButton } from "@/presentation/components/CTAButton";
import { headerIn } from "@/presentation/animations/gsap-micro";
import { AGENT_INFO } from "@/presentation/constants";

interface ExitScreenProps {
  title: string;
  body: string;
  /** Motivo breve (ej. "soy menor de 18 años") para prellenar el mensaje de
   * WhatsApp — Luis sabe de entrada por qué le escriben, sin que la persona
   * tenga que redactarlo. */
  whatsappReason: string;
}

/**
 * Base compartida por D_JOVEN, D_MAYOR, D_ESTATUS. Son pantallas
 * terminales del wizard (no navegan a ninguna otra pantalla): en vez de un
 * "Entendido" que solo reconoce el mensaje, ofrecen hablar directo con un
 * agente por WhatsApp para explorar alternativas según el caso — pedido de
 * Luis, ver reunión 2026-08-19.
 */
export function ExitScreen({ title, body, whatsappReason }: ExitScreenProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) headerIn(contentRef.current.children);
  }, []);

  const handleWhatsApp = (): void => {
    const message = `Hola, completé la evaluación pero mi perfil no calificó para el programa (${whatsappReason}). ¿Hay otras opciones para mí?`;
    window.open(
      `https://wa.me/${AGENT_INFO.whatsapp}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <ScreenWrapper>
      <div ref={contentRef} className="flex-1 flex flex-col justify-center gap-4">
        <h1 className="type-title">{title}</h1>
        <p className="type-body">{body}</p>
      </div>
      <div className="pb-6">
        <CTAButton label="Hablar con un agente por WhatsApp →" onClick={handleWhatsApp} />
      </div>
    </ScreenWrapper>
  );
}
