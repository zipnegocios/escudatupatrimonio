"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useStimAdvance } from "@/presentation/screens/stimulation/useStimAdvance";
import { WebGLCanvas, type SceneSetup } from "@/presentation/webgl/WebGLCanvas";

interface StimScreenProps {
  actionText: string;
  fact: string;
  minDurationMs: number;
  tapAdvanceAfterMs?: number;
  onAdvance: () => void;
  /** Escena Three.js de fondo. Si se omite, cae al placeholder CSS de puntos. */
  sceneSetup?: SceneSetup;
}

/** Base compartida por las pantallas de estimulación (fondo WebGL + auto-advance + tap-to-skip). */
export function StimScreen({
  actionText,
  fact,
  minDurationMs,
  tapAdvanceAfterMs,
  onAdvance,
  sceneSetup,
}: StimScreenProps) {
  const actionRef = useRef<HTMLParagraphElement>(null);
  const factRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const { handleTap } = useStimAdvance(minDurationMs, tapAdvanceAfterMs, onAdvance);

  useEffect(() => {
    if (actionRef.current && factRef.current) {
      gsap.fromTo(
        [actionRef.current, factRef.current],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: "power3.out", delay: 0.3 }
      );
    }
    if (barRef.current) {
      gsap.to(barRef.current, { width: "100%", duration: minDurationMs / 1000, ease: "linear" });
    }
  }, [minDurationMs]);

  return (
    <div className="relative w-full h-full bg-bg-trust-dark overflow-hidden" onClick={handleTap}>
      {sceneSetup ? (
        <WebGLCanvas sceneSetup={sceneSetup} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center gap-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-gold-primary animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 px-8">
        <p
          ref={actionRef}
          className="text-center type-label mb-3 opacity-0"
          style={{ color: "var(--text-ondark-secondary)" }}
        >
          {actionText}
        </p>
        <p
          ref={factRef}
          className="text-center type-body max-w-xs opacity-0"
          style={{ color: "var(--text-ondark-secondary)" }}
        >
          {fact}
        </p>
        <div className="w-full max-w-xs mt-8 h-0.5 bg-bg-trust-elevated rounded-full overflow-hidden">
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
