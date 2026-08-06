"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ScreenWrapper } from "@/presentation/components/ScreenWrapper";
import { ProgressBar } from "@/presentation/components/ProgressBar";
import { OptionButton } from "@/presentation/components/OptionButton";
import { staggerIn, headerIn } from "@/presentation/animations/gsap-micro";

export interface DecisionOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: ReactNode;
  variant?: "default" | "muted";
  badge?: string;
}

interface DecisionScreenProps {
  progressStep?: number;
  progressTotal?: number;
  eyebrow?: string;
  eyebrow2?: string;
  question: string;
  options: DecisionOption[];
  /** Grid 2 columnas para preguntas con muchas opciones cortas (ej. Q_EDAD). */
  grid?: boolean;
  onSelect: (value: string) => void;
}

/**
 * Layout compartido por todas las pantallas de tipo "decisión" (Q_INT,
 * Q_A1, Q_EDAD, Q_ESTATUS, ...): progreso + eyebrow + pregunta + lista/grid
 * de OptionButton. Cada pantalla concreta solo aporta su copy y sus
 * opciones — el ruteo lo resuelve routing-table.ts vía onChoice.
 */
export function DecisionScreen({
  progressStep,
  progressTotal = 5,
  eyebrow,
  eyebrow2,
  question,
  options,
  grid = false,
  onSelect,
}: DecisionScreenProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) headerIn(headerRef.current.children);
    if (listRef.current) staggerIn(listRef.current.children);
  }, []);

  return (
    <ScreenWrapper>
      {progressStep !== undefined && (
        <div className="pt-4 pb-2">
          <ProgressBar current={progressStep} total={progressTotal} />
        </div>
      )}

      <div ref={headerRef} className="pt-8 pb-6 flex flex-col gap-2">
        {eyebrow && <p className="type-eyebrow">{eyebrow}</p>}
        {eyebrow2 && <p className="type-caption">{eyebrow2}</p>}
        <h1 className="type-title">{question}</h1>
      </div>

      <div
        ref={listRef}
        className={grid ? "grid grid-cols-2 gap-3 flex-1 content-start" : "flex flex-col gap-3 flex-1"}
      >
        {options.map((opt) => (
          <OptionButton
            key={opt.value}
            icon={opt.icon}
            label={opt.label}
            sublabel={opt.sublabel}
            variant={opt.variant}
            badge={opt.badge}
            onClick={() => onSelect(opt.value)}
          />
        ))}
      </div>
    </ScreenWrapper>
  );
}
