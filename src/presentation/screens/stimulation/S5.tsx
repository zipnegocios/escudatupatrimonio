"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { WebGLCanvas } from "@/presentation/webgl/WebGLCanvas";
import { profileBuildScene } from "@/presentation/webgl/scenes/profileBuild";
import { useStimAdvance } from "@/presentation/screens/stimulation/useStimAdvance";
import { SCREEN_REGISTRY } from "@/core/use-cases/screen-registry";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: mvp_arbol_decisiones_smart_form.md § S5 — Creando perfil
// No tiene tap-to-skip: "siempre completo — es el cierre del proceso".
export function S5({ onChoice }: ScreenComponentProps) {
  const meta = SCREEN_REGISTRY.S5;
  const actionRef = useRef<HTMLParagraphElement>(null);
  const factRef = useRef<HTMLParagraphElement>(null);
  const [showFact, setShowFact] = useState(false);
  useStimAdvance(meta.minDurationMs!, undefined, () => onChoice("ADVANCE"));

  useEffect(() => {
    if (actionRef.current) {
      gsap.fromTo(actionRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
    }
    const t = setTimeout(() => setShowFact(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (showFact && factRef.current) {
      gsap.fromTo(factRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
    }
  }, [showFact]);

  return (
    <div className="relative w-full h-full bg-bg-primary overflow-hidden">
      <WebGLCanvas sceneSetup={profileBuildScene} />
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 px-8">
        <p ref={actionRef} className="text-center type-label text-text-secondary mb-3 opacity-0">
          Creando tu perfil de evaluación...
        </p>
        {showFact && (
          <p ref={factRef} className="text-center type-body max-w-xs opacity-0">
            Tu información está protegida. Solo tu Agente Certificado y la aseguradora asignada tendrán acceso a tu perfil.
          </p>
        )}
      </div>
    </div>
  );
}
