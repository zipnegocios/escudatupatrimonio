"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { enterScreen } from "@/presentation/animations/gsap-transitions";

interface ScreenWrapperProps {
  children: ReactNode;
  className?: string;
}

/** Contenedor que envuelve cada pantalla y anima su entrada (slide + fade). */
export function ScreenWrapper({ children, className = "" }: ScreenWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) enterScreen(ref.current);
  }, []);

  return (
    <div
      ref={ref}
      // w-full + max-w tope el ancho a partir de ~560px de viewport — en
      // mobile (viewport < 560px) w-full nunca llega al tope, así que se ve
      // idéntico a antes. bg-bg-primary es a propósito (antes lo heredaba
      // transparente del fondo del padre): ahora el padre tiene un fondo
      // distinto para los márgenes de desktop, así que esta columna necesita
      // su propio fondo opaco para taparlo por completo donde corresponde.
      className={`absolute inset-y-0 left-1/2 w-full max-w-[560px] -translate-x-1/2 flex flex-col bg-bg-primary px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${className}`}
    >
      {children}
    </div>
  );
}
