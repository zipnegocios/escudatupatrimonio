"use client";

import { useState } from "react";
import { ScreenWrapper } from "@/presentation/components/ScreenWrapper";
import { CTAButton } from "@/presentation/components/CTAButton";
import { AGENT_INFO } from "@/presentation/constants";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § PRE_FAQ — Preguntas frecuentes
const FAQ = [
  {
    q: "¿En este formulario me piden el SSN?",
    a: "No. Tu SSN lo solicitará el Agente Certificado directamente en la llamada, ingresándolo en el sistema seguro de la aseguradora asignada. Tú nunca lo escribes en ninguna pantalla de este formulario.",
  },
  {
    q: "¿Qué pasa con mis datos si no me apruebo?",
    a: "Tu información está protegida. Si no cumples con los requisitos del programa, no se realiza ningún cargo ni se comparten tus datos con terceros. Solo el Agente Certificado y la aseguradora asignada tienen acceso.",
  },
  {
    q: "¿Cómo puedo verificar que Luis es un agente real?",
    a: `Ve a nipr.com e ingresa el número de licencia ${AGENT_INFO.license}. Verás el nombre del agente, su estatus activo y los estados donde tiene autorización. Es el registro oficial de agentes de seguros de los Estados Unidos.`,
  },
  {
    q: "¿Cuánto cuesta este proceso de evaluación?",
    a: "La evaluación es completamente gratuita. No se realiza ningún cargo hasta que decidas participar en el programa. La llamada con el agente tampoco tiene costo.",
  },
  {
    q: "¿Qué pasa si no califico?",
    a: "Si después de la evaluación formal tu perfil no cumple los requisitos de aprobación, el agente te lo explicará y, si aplica, te presentará otras opciones disponibles para tu situación.",
  },
];

export function PreFaq({ onChoice }: ScreenComponentProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ScreenWrapper>
      <div className="pt-8 pb-4">
        <h1 className="type-title">Preguntas frecuentes</h1>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-4">
        {FAQ.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={i} className="rounded-2xl bg-bg-surface border border-border-card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
              >
                <span className="type-label">{item.q}</span>
                <span className="type-label text-text-muted">{open ? "−" : "+"}</span>
              </button>
              {open && <p className="type-body px-5 pb-4">{item.a}</p>}
            </div>
          );
        })}
      </div>
      <div className="pb-6">
        <CTAButton label="Ya tengo todo claro →" onClick={() => onChoice("CONTINUE")} />
      </div>
    </ScreenWrapper>
  );
}
