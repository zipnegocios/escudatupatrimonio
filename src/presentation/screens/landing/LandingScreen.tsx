"use client";

import { useEffect } from "react";
import { useFormStore } from "@/presentation/state/form-store";
import { LandingWrapper } from "@/presentation/screens/landing/LandingWrapper";
import { LandingSection } from "@/presentation/screens/landing/LandingSection";
import { Hero } from "@/presentation/screens/landing/Hero";
import { Problem } from "@/presentation/screens/landing/Problem";
import { Solution } from "@/presentation/screens/landing/Solution";
import { Process } from "@/presentation/screens/landing/Process";
import { Testimonials } from "@/presentation/screens/landing/Testimonials";
import { Credentials } from "@/presentation/screens/landing/Credentials";
import { CTAButton } from "@/presentation/components/CTAButton";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md
export function LandingScreen({ onChoice }: ScreenComponentProps) {
  const setUtmCampaign = useFormStore((s) => s.setUtmCampaign);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtmCampaign(params.get("utm_campaign"));
  }, [setUtmCampaign]);

  return (
    <LandingWrapper>
      <Hero />
      <LandingSection>
        <Problem />
      </LandingSection>
      <LandingSection>
        <Solution />
      </LandingSection>
      <LandingSection>
        <Process />
      </LandingSection>
      <LandingSection>
        <Testimonials />
      </LandingSection>
      <LandingSection>
        <Credentials />
      </LandingSection>
      <div className="px-6 pb-10 pt-4">
        <CTAButton label="Quiero verificar si califico →" onClick={() => onChoice("CONTINUE")} />
      </div>
    </LandingWrapper>
  );
}
