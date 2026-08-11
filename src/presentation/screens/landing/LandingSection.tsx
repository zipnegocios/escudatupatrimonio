"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

interface LandingSectionProps {
  children: ReactNode;
  className?: string;
  /**
   * Ancho máximo del contenido interno. "default" (1120px) sirve para
   * texto/grids de 3 columnas; "narrow" (720px) para bloques centrados de
   * lectura (InstitutionalReframe). Ninguna sección debe quedar sin
   * contenedor — es la causa raíz del "se ve roto en desktop": sin esto,
   * el contenido se estira borde a borde en pantallas anchas.
   */
  width?: "default" | "narrow";
}

/**
 * Envuelve una sección de la landing (Problem, Solution, Process,
 * Testimonials, Credentials) y dispara un fade-up GSAP la primera vez que
 * la sección entra en el viewport, vía IntersectionObserver. Distinto de
 * ScreenWrapper/enterScreen (que animan al montar, no al hacer scroll).
 */
export function LandingSection({ children, className = "", width = "default" }: LandingSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.set(el, { y: 24, opacity: 0 });
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(el, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`px-6 py-12 md:py-16 lg:py-20 ${className}`}>
      <div className={`mx-auto w-full ${width === "narrow" ? "max-w-[640px]" : "max-w-[1120px]"}`}>
        {children}
      </div>
    </div>
  );
}
