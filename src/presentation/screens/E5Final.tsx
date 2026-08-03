"use client";

import { useEffect, useRef } from "react";
import { ScreenWrapper } from "@/presentation/components/ScreenWrapper";
import { AgentCard } from "@/presentation/components/AgentCard";
import { headerIn } from "@/presentation/animations/gsap-micro";
import { WHATSAPP_LINK } from "@/presentation/constants";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";
import type { Canal } from "@/core/entities/qualification-profile";

const CANAL_LABEL: Record<Canal, string> = {
  WHATSAPP: "WhatsApp",
  LLAMADA: "llamada telefónica",
  WA_PRIMERO: "WhatsApp primero, luego llamada",
};

// copy: mvp_arbol_decisiones_smart_form.md § E5_FINAL — Confirmación final
export function E5Final({ vars }: ScreenComponentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const isInmediato = vars.priority === "INMEDIATO";

  useEffect(() => {
    if (contentRef.current) headerIn(contentRef.current.children);
  }, []);

  return (
    <ScreenWrapper>
      <div ref={contentRef} className="flex-1 flex flex-col justify-center gap-4 py-10 overflow-y-auto">
        <p className="type-eyebrow text-success">
          {isInmediato ? "Tu agente te contactará en los próximos 20 minutos" : "Tu evaluación está confirmada"}
        </p>
        <h1 className="type-title">¡Listo, {vars.nombre ?? ""}!</h1>
        <p className="type-body">
          {isInmediato
            ? `Tu agente te contactará en los próximos 20 a 30 minutos al número ${vars.telefono} vía ${CANAL_LABEL[vars.canal]}.`
            : `Tu agente te contactará ${vars.ventanaDisp ?? "pronto"} al número ${vars.telefono} vía ${CANAL_LABEL[vars.canal]}.`}
        </p>

        <AgentCard size="large" />

        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-12 rounded-2xl bg-success-bg border border-success text-success flex items-center justify-center type-label"
        >
          ¿Tienes alguna duda? Escríbele ahora →
        </a>

        <p className="type-caption">
          En la llamada, tu agente solicitará tu Número de Seguro Social para
          iniciar el proceso con el MIB. Ya sabes por qué y para qué.
        </p>
      </div>
    </ScreenWrapper>
  );
}
