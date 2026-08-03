"use client";

import { useRef, type ReactNode } from "react";
import clsx from "clsx";
import { attachTapScale } from "@/presentation/animations/gsap-micro";

interface OptionButtonProps {
  icon?: ReactNode;
  label: string;
  sublabel?: string;
  onClick: () => void;
  selected?: boolean;
  /** Variante "muted" para opciones descalificantes que igual deben ser tappables (ej. Q_EDAD: <18, >70). */
  variant?: "default" | "muted";
}

export function OptionButton({
  icon,
  label,
  sublabel,
  onClick,
  selected = false,
  variant = "default",
}: OptionButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const handlePress = attachTapScale(ref, onClick);

  return (
    <button
      ref={ref}
      onClick={handlePress}
      type="button"
      className={clsx(
        "w-full min-h-[56px] px-5 py-4 rounded-2xl border text-left",
        "flex items-center gap-4 transition-colors duration-150 active:brightness-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus",
        selected
          ? "bg-gold-subtle border-gold-border text-gold-light"
          : "bg-bg-surface border-border-card text-text-primary",
        variant === "muted" && !selected && "opacity-60"
      )}
    >
      {icon && (
        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-text-secondary">
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="type-label leading-tight">{label}</p>
        {sublabel && <p className="type-caption mt-0.5">{sublabel}</p>}
      </div>
      {selected && (
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold-primary flex items-center justify-center">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="#0B1628"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </button>
  );
}
