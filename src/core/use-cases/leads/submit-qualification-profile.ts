import type { QualificationProfile } from "@/core/entities/qualification-profile";
import type { Lead, LeadRepository } from "@/core/ports/lead-repository";
import { computeTags } from "@/core/use-cases/ghl-tags";

export interface SubmitQualificationProfileDeps {
  leadRepository: LeadRepository;
}

export interface SubmitQualificationProfileInput {
  sessionId: string;
  utmCampaign: string | null;
  profile: QualificationProfile;
}

export async function submitQualificationProfile(
  deps: SubmitQualificationProfileDeps,
  input: SubmitQualificationProfileInput
): Promise<Lead> {
  const tags = computeTags(input.profile);
  return deps.leadRepository.save({
    sessionId: input.sessionId,
    utmCampaign: input.utmCampaign,
    profile: input.profile,
    tags,
  });
}
