"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface ConfirmExitModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Se muestra únicamente cuando `goBack()` está a punto de aterrizar en
 * LANDING (ver BackButton.tsx) — es decir, cuando el usuario está a punto
 * de salir de la evaluación por completo, no cuando retrocede entre dos
 * pantallas del wizard. Retroceder entre pantallas del wizard es
 * navegación normal y no necesita confirmación.
 */
export function ConfirmExitModal({ onConfirm, onCancel }: ConfirmExitModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    if (cardRef.current) gsap.fromTo(cardRef.current, { y: 16, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.6)" });
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(11,22,40,0.55)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-exit-title"
      onClick={onCancel}
    >
      <div
        ref={cardRef}
        className="w-full sm:max-w-[380px] rounded-3xl bg-bg-surface p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "var(--caution-bg)", color: "var(--caution)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
        </div>
        <div>
          <p id="confirm-exit-title" className="type-title !text-[19px] mb-1.5">
            ¿Salir de la evaluación?
          </p>
          <p className="type-body">
            Vas a volver a la página informativa y vas a salir del programa de
            calificación. Puedes retomarlo cuando quieras.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 mt-1">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full h-[50px] rounded-2xl font-semibold text-[14px] border border-border-card text-text-secondary"
          >
            Sí, volver a la página informativa
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full h-[50px] rounded-2xl font-semibold text-[15px] bg-gold-primary text-text-inverse"
          >
            No, continuar aquí
          </button>
        </div>
      </div>
    </div>
  );
}
