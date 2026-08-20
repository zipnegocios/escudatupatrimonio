"use client";

import { useEffect, useRef } from "react";
import { ScreenWrapper } from "@/presentation/components/ScreenWrapper";
import { ProgressBar } from "@/presentation/components/ProgressBar";
import { CTAButton } from "@/presentation/components/CTAButton";
import { AgentCard } from "@/presentation/components/AgentCard";
import { headerIn } from "@/presentation/animations/gsap-micro";
import { AGENT_INFO, WHATSAPP_LINK } from "@/presentation/constants";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § PRE_4 — Identidad del agente
export function Pre4({ onChoice }: ScreenComponentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) headerIn(contentRef.current.children);
  }, []);

  return (
    <ScreenWrapper>
      <div className="pt-4 pb-2 flex flex-col gap-2">
        <ProgressBar current={4} total={5} />
        <p className="type-caption">Módulo 4 de 4</p>
      </div>
      <div ref={contentRef} className="flex-1 flex flex-col justify-center gap-4 py-6">
        <p className="type-eyebrow">Tu Agente Certificado</p>
        <AgentCard size="large" />
        <p className="type-body">
          Su NPN (número de agente a nivel federal) es verificable en
          NIPR.com — el registro oficial de agentes de seguros de los
          Estados Unidos, independiente de cualquier aseguradora.
        </p>
        <a
          href="https://nipr.com"
          target="_blank"
          rel="noopener noreferrer"
          className="type-caption text-trust"
        >
          Ir a nipr.com →
        </a>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="type-caption text-trust"
        >
          Escribirle ahora por WhatsApp →
        </a>
        <p className="type-caption">NPN {AGENT_INFO.license}</p>
      </div>
      <div className="pb-6">
        <CTAButton label="Continuar →" onClick={() => onChoice("CONTINUE")} />
      </div>
    </ScreenWrapper>
  );
}
