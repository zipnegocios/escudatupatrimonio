"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useStimAdvance } from "@/presentation/screens/stimulation/useStimAdvance";

interface NoteScreenProps {
  text: string;
  icon?: ReactNode;
  minDurationMs: number;
  tapAdvanceAfterMs?: number;
  variant?: "default" | "caution" | "success";
  onAdvance: () => void;
}

const BORDER_BY_VARIANT: Record<NonNullable<NoteScreenProps["variant"]>, string> = {
  default: "border-border-card",
  caution: "border-caution",
  success: "border-success",
};

/** Base compartida por las 4 pantallas de nota informativa auto-advance. */
export function NoteScreen({
  text,
  icon,
  minDurationMs,
  tapAdvanceAfterMs,
  variant = "default",
  onAdvance,
}: NoteScreenProps) {
  const boxRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const { handleTap } = useStimAdvance(minDurationMs, tapAdvanceAfterMs, onAdvance);

  useEffect(() => {
    if (boxRef.current) {
      gsap.fromTo(boxRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
    }
    if (barRef.current) {
      gsap.to(barRef.current, { width: "100%", duration: minDurationMs / 1000, ease: "linear" });
    }
  }, [minDurationMs]);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-8 gap-6 h-full"
      onClick={handleTap}
    >
      {icon && <div className="text-text-secondary">{icon}</div>}
      <p
        ref={boxRef}
        className={`type-body text-center p-5 rounded-2xl border bg-bg-surface leading-relaxed ${BORDER_BY_VARIANT[variant]}`}
      >
        {text}
      </p>
      <div className="w-32 h-0.5 bg-bg-surface rounded-full overflow-hidden">
        <div ref={barRef} className="h-full bg-gold-primary rounded-full" style={{ width: "0%" }} />
      </div>
    </div>
  );
}
