"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md § 4. El proceso
const PASOS = [
  "Completas una breve evaluación",
  "Un Agente Certificado revisa tu perfil",
  "El MIB (Buró Médico) verifica tu información según el proceso federal de aprobación",
  "De acuerdo a tu perfil, se te asigna la aseguradora que mejor se adapte a tu caso.",
];

const CIRCLE_INACTIVE = ["bg-bg-surface", "border-border-card", "text-text-muted"];
const CIRCLE_ACTIVE = ["bg-gold-subtle", "border-gold-primary", "text-gold-text"];

/**
 * Línea de tiempo controlada por scroll: una sola línea dorada global (no
 * una por paso, como antes) crece de 0% a 100% con `scrub`, y cada círculo
 * se "enciende" la primera vez que la línea alcanza su posición vertical
 * real — medida con getBoundingClientRect, no una fracción uniforme, ya
 * que los pasos tienen distinto alto de texto.
 *
 * El scroller no es `window`: LandingWrapper scrollea dentro de su propio
 * div `overflow-y-auto` (mismo problema ya resuelto en AuthorityBar.tsx,
 * donde ScrollTrigger con el scroller por defecto nunca disparaba), así
 * que aquí también hay que apuntar `scroller` explícitamente a ese div.
 */
export function Process() {
  const trackRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);
  const mibRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const line = lineRef.current;
    const mib = mibRef.current;
    if (!track || !line || !mib) return;

    const scroller = track.closest(".overflow-y-auto") as HTMLElement | null;
    const trackRect = track.getBoundingClientRect();
    const thresholds = stepRefs.current.map((li) => {
      const circle = li?.querySelector<HTMLElement>("[data-circle]");
      if (!circle) return 0;
      const circleRect = circle.getBoundingClientRect();
      const centerY = circleRect.top + circleRect.height / 2;
      return (centerY - trackRect.top) / trackRect.height;
    });
    const activated = thresholds.map(() => false);

    gsap.set(mib, { opacity: 0, y: 16 });

    const trigger = ScrollTrigger.create({
      trigger: track,
      scroller: scroller ?? undefined,
      start: "top 75%",
      end: "bottom 60%",
      scrub: 1,
      onUpdate: (self) => {
        gsap.set(line, { height: `${self.progress * 100}%` });
        stepRefs.current.forEach((li, i) => {
          if (!li || activated[i] || self.progress < thresholds[i]) return;
          activated[i] = true;

          const circle = li.querySelector<HTMLElement>("[data-circle]");
          const text = li.querySelector<HTMLElement>("[data-text]");
          if (circle) {
            circle.classList.remove(...CIRCLE_INACTIVE);
            circle.classList.add(...CIRCLE_ACTIVE);
            gsap.fromTo(
              circle,
              { scale: 1 },
              { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" }
            );
          }
          if (text) {
            gsap.to(text, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" });
          }
          if (i === PASOS.length - 1) {
            gsap.to(mib, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
          }
        });
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow">Así funciona el proceso</p>
      <ol className="relative flex flex-col">
        <div ref={trackRef} className="absolute left-[1.125rem] top-4 bottom-4 w-px bg-border-card" aria-hidden="true">
          <div ref={lineRef} className="w-full bg-gold-primary" style={{ height: "0%" }} />
        </div>
        {PASOS.map((text, i) => (
          <li
            key={text}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            <span
              data-circle
              className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center type-label transition-colors duration-300 bg-bg-surface border-border-card text-text-muted"
            >
              {i + 1}
            </span>
            <p data-text className="type-body pt-1 opacity-40 -translate-x-2.5">
              {text}
            </p>
          </li>
        ))}
      </ol>
      <div ref={mibRef} className="p-5 rounded-2xl bg-trust-bg border border-border-card">
        <p className="type-caption" style={{ color: "var(--trust-blue)" }}>
          Como parte del proceso federal de aprobación, el MIB requiere
          verificación de identidad. Tu Agente Certificado te explicará
          exactamente cómo funciona este paso durante la llamada.
        </p>
      </div>
    </div>
  );
}
