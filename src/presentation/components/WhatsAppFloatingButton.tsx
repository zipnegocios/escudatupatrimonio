"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { WHATSAPP_LINK } from "@/presentation/constants";

/**
 * Botón flotante persistente sobre la landing (no sobre el wizard — ahí el
 * CTA de avance ya es la única acción que queremos que el usuario tome).
 * El pulso GSAP es sutil y se detiene tras unos ciclos para no competir con
 * el CTA dorado principal, que sigue siendo la acción primaria.
 */
export function WhatsAppFloatingButton() {
  const ringRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ringRef.current;
    if (!el) return;
    const tween = gsap.to(el, {
      scale: 1.9,
      opacity: 0,
      duration: 1.6,
      ease: "power2.out",
      repeat: 4,
      repeatDelay: 0.4,
    });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="fixed z-40 bottom-[calc(env(safe-area-inset-bottom)+20px)] right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform duration-150 active:scale-90"
      style={{ background: "#25D366" }}
    >
      <span
        ref={ringRef}
        className="absolute inset-0 rounded-full"
        style={{ background: "#25D366", opacity: 0.6 }}
        aria-hidden="true"
      />
      <svg width="26" height="26" viewBox="0 0 24 24" fill="white" className="relative">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 004.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91S17.5 2 12.04 2zm0 18.15h-.01a8.2 8.2 0 01-4.19-1.15l-.3-.18-3.14.82.84-3.06-.2-.31a8.18 8.18 0 01-1.26-4.36c0-4.54 3.7-8.24 8.26-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 012.42 5.83c0 4.55-3.7 8.23-8.25 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.36-.77-1.86-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z" />
      </svg>
    </a>
  );
}
