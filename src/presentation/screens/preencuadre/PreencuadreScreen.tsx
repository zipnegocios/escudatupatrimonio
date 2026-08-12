"use client";

import { useEffect, useRef } from "react";
import { ScreenWrapper } from "@/presentation/components/ScreenWrapper";
import { ProgressBar } from "@/presentation/components/ProgressBar";
import { CTAButton } from "@/presentation/components/CTAButton";
import { headerIn } from "@/presentation/animations/gsap-micro";
import { INSURANCE_PARTNERS } from "@/presentation/constants";

interface PreencuadreScreenProps {
  moduleLabel: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
  link?: { label: string; href: string };
  /** Fila de logos de las 9 aseguradoras — usado en PRE_1 para reforzar que el programa no está atado a una sola compañía. */
  logos?: boolean;
  ctaLabel: string;
  onContinue: () => void;
}

/** Layout compartido por PRE_1, PRE_2, PRE_3 (módulos informativos con CTA único). */
export function PreencuadreScreen({
  moduleLabel,
  eyebrow,
  title,
  paragraphs,
  link,
  logos = false,
  ctaLabel,
  onContinue,
}: PreencuadreScreenProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) headerIn(contentRef.current.children);
  }, []);

  return (
    <ScreenWrapper>
      <div className="pt-4 pb-2 flex flex-col gap-2">
        <ProgressBar current={4} total={5} />
        <p className="type-caption">{moduleLabel}</p>
      </div>
      <div ref={contentRef} className="flex-1 flex flex-col justify-center gap-4 py-6 overflow-y-auto">
        <p className="type-eyebrow">{eyebrow}</p>
        <h1 className="type-title">{title}</h1>
        {paragraphs.map((p, i) => (
          <p key={i} className="type-body">
            {p}
          </p>
        ))}
        {logos && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {INSURANCE_PARTNERS.map((partner) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={partner.name} src={partner.logoUrl} alt={partner.name} className="h-7 w-auto" loading="lazy" />
            ))}
          </div>
        )}
        {link && (
          <a href={link.href} target="_blank" rel="noopener noreferrer" className="type-caption text-trust">
            {link.label}
          </a>
        )}
      </div>
      <div className="pb-6">
        <CTAButton label={ctaLabel} onClick={onContinue} />
      </div>
    </ScreenWrapper>
  );
}
