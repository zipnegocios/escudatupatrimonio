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
      className={`absolute inset-0 flex flex-col px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${className}`}
    >
      {children}
    </div>
  );
}
