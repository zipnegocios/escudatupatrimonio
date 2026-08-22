"use client";

import { useRef } from "react";
import clsx from "clsx";
import gsap from "gsap";

interface CTAButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  /** Barrido de luz metalizado en bucle — solo para el CTA flotante de la landing. */
  shine?: boolean;
}

/** Botón de avance principal, siempre al fondo de la pantalla. */
export function CTAButton({ label, onClick, disabled = false, variant = "primary", shine = false }: CTAButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handlePress = () => {
    if (disabled || !ref.current) return;
    gsap.fromTo(
      ref.current,
      { scale: 0.97 },
      {
        scale: 1,
        duration: 0.2,
        ease: "back.out(2)",
        onStart: onClick,
      }
    );
  };

  return (
    <button
      ref={ref}
      onClick={handlePress}
      type="button"
      disabled={disabled}
      className={clsx(
        "w-full h-[56px] rounded-2xl font-semibold tracking-wide",
        "flex items-center justify-center gap-2 transition-opacity duration-200",
        variant === "primary"
          ? "bg-gold-primary text-text-inverse text-[15px]"
          : "bg-bg-surface text-text-secondary text-[14px] border border-border-card",
        disabled ? "opacity-40 cursor-not-allowed" : "opacity-100",
        shine && "cta-shine"
      )}
    >
      {label}
      {variant === "primary" && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
