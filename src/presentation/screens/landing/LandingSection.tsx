"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

interface LandingSectionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Envuelve una sección de la landing (Problem, Solution, Process,
 * Testimonials, Credentials) y dispara un fade-up GSAP la primera vez que
 * la sección entra en el viewport, vía IntersectionObserver. Distinto de
 * ScreenWrapper/enterScreen (que animan al montar, no al hacer scroll).
 */
export function LandingSection({ children, className = "" }: LandingSectionProps) {
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
    <div ref={ref} className={`px-6 py-12 ${className}`}>
      {children}
    </div>
  );
}
