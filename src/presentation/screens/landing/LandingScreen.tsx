"use client";

import { useEffect } from "react";
import { useFormStore } from "@/presentation/state/form-store";
import { LandingWrapper } from "@/presentation/screens/landing/LandingWrapper";
import { LandingSection } from "@/presentation/screens/landing/LandingSection";
import { Hero } from "@/presentation/screens/landing/Hero";
import { AuthorityBar } from "@/presentation/screens/landing/AuthorityBar";
import { Problem } from "@/presentation/screens/landing/Problem";
import { Solution } from "@/presentation/screens/landing/Solution";
import { InstitutionalReframe } from "@/presentation/screens/landing/InstitutionalReframe";
import { Process } from "@/presentation/screens/landing/Process";
import { AuthorityVideos } from "@/presentation/screens/landing/AuthorityVideos";
import { SocialProof } from "@/presentation/screens/landing/SocialProof";
import { FinalCTA } from "@/presentation/screens/landing/FinalCTA";
import type { ScreenComponentProps } from "@/presentation/screens/screen-registry";

// copy: spec de rediseño v1.0 "Escuda tu Patrimonio" — 9 secciones (§2.1-2.9)
export function LandingScreen({ onChoice }: ScreenComponentProps) {
  const setUtmCampaign = useFormStore((s) => s.setUtmCampaign);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtmCampaign(params.get("utm_campaign"));
  }, [setUtmCampaign]);

  const handleContinue = () => onChoice("CONTINUE");

  return (
    <LandingWrapper>
      <Hero onContinue={handleContinue} />
      <LandingSection>
        <AuthorityBar />
      </LandingSection>
      <LandingSection className="bg-bg-elevated">
        <Problem />
      </LandingSection>
      <LandingSection>
        <Solution />
      </LandingSection>
      <LandingSection className="bg-bg-elevated">
        <InstitutionalReframe />
      </LandingSection>
      <LandingSection>
        <Process />
      </LandingSection>
      <LandingSection className="bg-bg-trust-dark">
        <AuthorityVideos />
      </LandingSection>
      <LandingSection className="bg-bg-elevated">
        <SocialProof />
      </LandingSection>
      <LandingSection className="bg-bg-trust-dark">
        <FinalCTA onContinue={handleContinue} />
      </LandingSection>
    </LandingWrapper>
  );
}
