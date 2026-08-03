"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const pct = Math.min(100, Math.max(0, (current / total) * 100));

  useEffect(() => {
    if (barRef.current) {
      gsap.to(barRef.current, { width: `${pct}%`, duration: 0.6, ease: "power2.out" });
    }
  }, [pct]);

  return (
    <div className="w-full h-1 bg-bg-surface rounded-full overflow-hidden">
      <div ref={barRef} className="h-full bg-gold-primary rounded-full" style={{ width: "0%" }} />
    </div>
  );
}
