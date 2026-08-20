"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useStimAdvance } from "@/presentation/screens/stimulation/useStimAdvance";
import { WebGLCanvas, type SceneSetup } from "@/presentation/webgl/WebGLCanvas";

interface NoteScreenProps {
  text: string;
  minDurationMs: number;
  tapAdvanceAfterMs?: number;
  sceneSetup: SceneSetup;
  onAdvance: () => void;
}

/**
 * Base compartida por las 4 pantallas de nota informativa auto-advance
 * (Q_EDAD_COND, Q_SALUD_FLAG, Q_ESTATUS_NOTA, Q_ESTADO_REF). Mismo
 * tratamiento visual que StimScreen (fondo WebGL a pantalla completa +
 * texto centrado abajo + barra de progreso) en vez de una tarjeta clara
 * flotando sobre fondo plano — antes se veía como un botón de opción más,
 * sin sensación de "momento" propio dentro del flujo.
 */
export function NoteScreen({
  text,
  minDurationMs,
  tapAdvanceAfterMs,
  sceneSetup,
  onAdvance,
}: NoteScreenProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const { handleTap } = useStimAdvance(minDurationMs, tapAdvanceAfterMs, onAdvance);

  useEffect(() => {
    if (textRef.current) {
      gsap.fromTo(textRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
    }
    if (barRef.current) {
      gsap.to(barRef.current, { width: "100%", duration: minDurationMs / 1000, ease: "linear" });
    }
  }, [minDurationMs]);

  return (
    <div
      className="relative mx-auto h-full w-full max-w-[560px] bg-bg-trust-dark overflow-hidden"
      onClick={handleTap}
    >
      <WebGLCanvas sceneSetup={sceneSetup} />
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 px-8">
        <p
          ref={textRef}
          className="text-center type-body max-w-xs opacity-0"
          style={{ color: "var(--text-ondark-secondary)" }}
        >
          {text}
        </p>
        <div className="w-32 mt-8 h-0.5 bg-bg-trust-elevated rounded-full overflow-hidden">
          <div ref={barRef} className="h-full bg-gold-primary rounded-full" style={{ width: "0%" }} />
        </div>
        {tapAdvanceAfterMs !== undefined && (
          <p className="mt-4 type-caption opacity-50" style={{ color: "var(--text-ondark-muted)" }}>
            Toca para continuar
          </p>
        )}
      </div>
    </div>
  );
}
